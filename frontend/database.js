const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db;

function initDatabase() {
  // Store database in user data directory
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'portfolio.db');

  console.log('Database path:', dbPath);

  db = new Database(dbPath);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      shares REAL NOT NULL,
      average_cost REAL NOT NULL,
      current_price REAL DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      shares REAL NOT NULL,
      price REAL NOT NULL,
      transaction_date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS dividends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      amount REAL NOT NULL,
      dividend_date TEXT NOT NULL,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
    )
  `);

  // Migrate existing data if needed
  try {
    const columns = db.prepare("PRAGMA table_info(holdings)").all();
    const hasAverageCost = columns.some(col => col.name === 'average_cost');

    if (!hasAverageCost) {
      console.log('Migrating holdings table to new schema...');
      db.exec(`
        ALTER TABLE holdings RENAME TO holdings_old;

        CREATE TABLE holdings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          portfolio_id INTEGER NOT NULL,
          symbol TEXT NOT NULL,
          shares REAL NOT NULL,
          average_cost REAL NOT NULL,
          current_price REAL DEFAULT 0,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
        );

        INSERT INTO holdings (id, portfolio_id, symbol, shares, average_cost, current_price)
        SELECT id, portfolio_id, symbol, shares, purchase_price, 0
        FROM holdings_old;

        DROP TABLE holdings_old;
      `);
      console.log('Migration complete!');
    }
  } catch (error) {
    console.log('Migration not needed or already completed');
  }

  // Add sector and asset_class columns if they don't exist
  try {
    const columns = db.prepare("PRAGMA table_info(holdings)").all();
    const hasSector = columns.some(col => col.name === 'sector');
    const hasAssetClass = columns.some(col => col.name === 'asset_class');

    if (!hasSector) {
      console.log('Adding sector column to holdings table...');
      db.exec('ALTER TABLE holdings ADD COLUMN sector TEXT');
      console.log('Sector column added!');
    }

    if (!hasAssetClass) {
      console.log('Adding asset_class column to holdings table...');
      db.exec('ALTER TABLE holdings ADD COLUMN asset_class TEXT');
      console.log('Asset class column added!');
    }
  } catch (error) {
    console.error('Error adding metadata columns:', error);
  }

  console.log('Database initialized successfully!');

  return db;
}

function getPortfolios() {
  const stmt = db.prepare('SELECT * FROM portfolios');
  return stmt.all();
}

function createPortfolio(name) {
  const stmt = db.prepare('INSERT INTO portfolios (name) VALUES (?)');
  const info = stmt.run(name);
  return { id: info.lastInsertRowid, name };
}

function getPortfolio(portfolioId) {
  const portfolioStmt = db.prepare('SELECT * FROM portfolios WHERE id = ?');
  const portfolio = portfolioStmt.get(portfolioId);

  if (!portfolio) {
    return null;
  }

  const holdingsStmt = db.prepare('SELECT * FROM holdings WHERE portfolio_id = ?');
  const holdings = holdingsStmt.all(portfolioId);

  // Calculate performance metrics for each holding
  const enrichedHoldings = holdings.map(holding => {
    const marketValue = holding.shares * holding.current_price;
    const costBasis = holding.shares * holding.average_cost;
    const gainLoss = marketValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    return {
      ...holding,
      market_value: marketValue,
      cost_basis: costBasis,
      gain_loss: gainLoss,
      gain_loss_percent: gainLossPercent
    };
  });

  return {
    portfolio,
    holdings: enrichedHoldings
  };
}

function addHolding(portfolioId, symbol, shares, purchasePrice, purchaseDate) {
  // Check if holding already exists for this symbol
  const existingStmt = db.prepare('SELECT * FROM holdings WHERE portfolio_id = ? AND symbol = ?');
  const existing = existingStmt.get(portfolioId, symbol);

  if (existing) {
    // Update existing holding - calculate new average cost
    const totalShares = existing.shares + shares;
    const totalCost = (existing.shares * existing.average_cost) + (shares * purchasePrice);
    const newAverageCost = totalCost / totalShares;

    const updateStmt = db.prepare(`
      UPDATE holdings
      SET shares = ?, average_cost = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateStmt.run(totalShares, newAverageCost, existing.id);

    // Record the buy transaction
    const transactionStmt = db.prepare(`
      INSERT INTO transactions (portfolio_id, symbol, transaction_type, shares, price, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    transactionStmt.run(portfolioId, symbol, 'BUY', shares, purchasePrice, purchaseDate);

    return {
      id: existing.id,
      portfolio_id: portfolioId,
      symbol,
      shares: totalShares,
      average_cost: newAverageCost,
      current_price: existing.current_price
    };
  } else {
    // Create new holding
    const holdingStmt = db.prepare(`
      INSERT INTO holdings (portfolio_id, symbol, shares, average_cost, current_price)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transactionStmt = db.prepare(`
      INSERT INTO transactions (portfolio_id, symbol, transaction_type, shares, price, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const info = holdingStmt.run(portfolioId, symbol, shares, purchasePrice, 0);
    transactionStmt.run(portfolioId, symbol, 'BUY', shares, purchasePrice, purchaseDate);

    return {
      id: info.lastInsertRowid,
      portfolio_id: portfolioId,
      symbol,
      shares,
      average_cost: purchasePrice,
      current_price: 0
    };
  }
}

function sellHolding(portfolioId, symbol, shares, sellPrice, sellDate) {
  const holdingStmt = db.prepare('SELECT * FROM holdings WHERE portfolio_id = ? AND symbol = ?');
  const holding = holdingStmt.get(portfolioId, symbol);

  if (!holding) {
    throw new Error('Holding not found');
  }

  if (holding.shares < shares) {
    throw new Error('Insufficient shares to sell');
  }

  const newShares = holding.shares - shares;

  if (newShares === 0) {
    // Delete holding if all shares sold
    const deleteStmt = db.prepare('DELETE FROM holdings WHERE id = ?');
    deleteStmt.run(holding.id);
  } else {
    // Update share count
    const updateStmt = db.prepare(`
      UPDATE holdings
      SET shares = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateStmt.run(newShares, holding.id);
  }

  // Record the sell transaction
  const transactionStmt = db.prepare(`
    INSERT INTO transactions (portfolio_id, symbol, transaction_type, shares, price, transaction_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  transactionStmt.run(portfolioId, symbol, 'SELL', shares, sellPrice, sellDate);

  return {
    success: true,
    remaining_shares: newShares
  };
}

function addDividend(portfolioId, symbol, amount, dividendDate) {
  const stmt = db.prepare(`
    INSERT INTO dividends (portfolio_id, symbol, amount, dividend_date)
    VALUES (?, ?, ?, ?)
  `);

  const info = stmt.run(portfolioId, symbol, amount, dividendDate);

  return {
    id: info.lastInsertRowid,
    portfolio_id: portfolioId,
    symbol,
    amount,
    dividend_date: dividendDate
  };
}

function getDividends(portfolioId) {
  const stmt = db.prepare('SELECT * FROM dividends WHERE portfolio_id = ? ORDER BY dividend_date DESC');
  return stmt.all(portfolioId);
}

function updatePrice(portfolioId, symbol, currentPrice) {
  const stmt = db.prepare(`
    UPDATE holdings
    SET current_price = ?, last_updated = CURRENT_TIMESTAMP
    WHERE portfolio_id = ? AND symbol = ?
  `);

  stmt.run(currentPrice, portfolioId, symbol);

  return { success: true };
}

function deleteHolding(portfolioId, holdingId) {
  const stmt = db.prepare('DELETE FROM holdings WHERE id = ? AND portfolio_id = ?');
  stmt.run(holdingId, portfolioId);
  return { success: true };
}

function getTransactions(portfolioId) {
  const stmt = db.prepare('SELECT * FROM transactions WHERE portfolio_id = ? ORDER BY transaction_date DESC');
  return stmt.all(portfolioId);
}

function getPortfolioPerformance(portfolioId) {
  const holdingsStmt = db.prepare('SELECT * FROM holdings WHERE portfolio_id = ?');
  const holdings = holdingsStmt.all(portfolioId);

  const dividendsStmt = db.prepare('SELECT SUM(amount) as total FROM dividends WHERE portfolio_id = ?');
  const dividendResult = dividendsStmt.get(portfolioId);

  let totalMarketValue = 0;
  let totalCostBasis = 0;
  let totalDividends = dividendResult.total || 0;

  holdings.forEach(holding => {
    totalMarketValue += holding.shares * holding.current_price;
    totalCostBasis += holding.shares * holding.average_cost;
  });

  const unrealizedGain = totalMarketValue - totalCostBasis;
  const totalReturn = unrealizedGain + totalDividends;
  const totalReturnPercent = totalCostBasis > 0 ? (totalReturn / totalCostBasis) * 100 : 0;

  return {
    total_market_value: totalMarketValue,
    total_cost_basis: totalCostBasis,
    unrealized_gain_loss: unrealizedGain,
    total_dividends: totalDividends,
    total_return: totalReturn,
    total_return_percent: totalReturnPercent
  };
}

function getHolding(portfolioId, symbol) {
  const stmt = db.prepare('SELECT * FROM holdings WHERE portfolio_id = ? AND symbol = ?');
  return stmt.get(portfolioId, symbol);
}

function updateHoldingMetadata(portfolioId, symbol, sector, assetClass) {
  // Build update query dynamically to only update non-null values
  const updates = [];
  const params = [];
  
  if (sector !== null && sector !== undefined) {
    updates.push('sector = ?');
    params.push(sector);
  }
  
  if (assetClass !== null && assetClass !== undefined) {
    updates.push('asset_class = ?');
    params.push(assetClass);
  }
  
  if (updates.length === 0) {
    return { success: false, message: 'No metadata to update' };
  }
  
  // Always update the last_updated timestamp
  updates.push('last_updated = CURRENT_TIMESTAMP');
  
  // Add WHERE clause parameters
  params.push(portfolioId, symbol);
  
  const query = `UPDATE holdings SET ${updates.join(', ')} WHERE portfolio_id = ? AND symbol = ?`;
  const stmt = db.prepare(query);
  
  try {
    stmt.run(...params);
    return { success: true };
  } catch (error) {
    console.error('Error updating holding metadata:', error);
    return { success: false, error: error.message };
  }
}

function closeDatabase() {
  if (db) {
    db.close();
  }
}

module.exports = {
  initDatabase,
  getPortfolios,
  createPortfolio,
  getPortfolio,
  addHolding,
  sellHolding,
  addDividend,
  getDividends,
  updatePrice,
  deleteHolding,
  getTransactions,
  getPortfolioPerformance,
  getHolding,
  updateHoldingMetadata,
  closeDatabase
};

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
      purchase_price REAL NOT NULL,
      purchase_date TEXT NOT NULL,
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
      FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
    )
  `);

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

  return {
    portfolio,
    holdings
  };
}

function addHolding(portfolioId, symbol, shares, purchasePrice, purchaseDate) {
  const holdingStmt = db.prepare(`
    INSERT INTO holdings (portfolio_id, symbol, shares, purchase_price, purchase_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transactionStmt = db.prepare(`
    INSERT INTO transactions (portfolio_id, symbol, transaction_type, shares, price, transaction_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const info = holdingStmt.run(portfolioId, symbol, shares, purchasePrice, purchaseDate);
  transactionStmt.run(portfolioId, symbol, 'BUY', shares, purchasePrice, purchaseDate);

  return {
    id: info.lastInsertRowid,
    portfolio_id: portfolioId,
    symbol,
    shares,
    purchase_price: purchasePrice,
    purchase_date: purchaseDate
  };
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
  deleteHolding,
  getTransactions,
  closeDatabase
};

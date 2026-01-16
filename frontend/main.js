const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const db = require('./database');

let mainWindow;

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Portfolio',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-portfolio');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/odds-get-evened/investo');
          }
        },
        { type: 'separator' },
        {
          label: 'About Investo',
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 400,
              height: 300,
              resizable: false,
              minimizable: false,
              maximizable: false,
              title: 'About Investo'
            });
            aboutWindow.setMenu(null);
            aboutWindow.loadURL(`data:text/html;charset=utf-8,
              <html>
                <head>
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      height: 100vh;
                      margin: 0;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      text-align: center;
                    }
                    h1 { margin: 10px 0; }
                    p { margin: 5px 0; }
                  </style>
                </head>
                <body>
                  <h1>Investo</h1>
                  <p>Version 1.0.0</p>
                  <p>Your Personal Stock Portfolio Manager</p>
                  <br>
                  <p style="font-size: 12px; opacity: 0.8;">Built with Electron, React, and SQLite</p>
                  <p style="font-size: 12px; opacity: 0.8;">© 2026 Investo Contributors</p>
                </body>
              </html>
            `);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Investo - Stock Portfolio Manager',
    backgroundColor: '#f5f5f5',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public', 'icon.png')
  });

  // Create application menu
  createMenu();

  // In development, load from Vite dev server
  // In production, load from built files
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Setup IPC handlers for database operations
function setupIPCHandlers() {
  ipcMain.handle('get-portfolios', async () => {
    try {
      return { success: true, data: db.getPortfolios() };
    } catch (error) {
      console.error('Error getting portfolios:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('create-portfolio', async (event, name) => {
    try {
      const portfolio = db.createPortfolio(name);
      return { success: true, data: portfolio };
    } catch (error) {
      console.error('Error creating portfolio:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-portfolio', async (event, portfolioId) => {
    try {
      const portfolio = db.getPortfolio(portfolioId);
      if (!portfolio) {
        return { success: false, error: 'Portfolio not found' };
      }
      return { success: true, data: portfolio };
    } catch (error) {
      console.error('Error getting portfolio:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('add-holding', async (event, portfolioId, holding) => {
    try {
      const result = db.addHolding(
        portfolioId,
        holding.symbol,
        holding.shares,
        holding.purchase_price,
        holding.purchase_date
      );
      return { success: true, data: result };
    } catch (error) {
      console.error('Error adding holding:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-holding', async (event, portfolioId, holdingId) => {
    try {
      db.deleteHolding(portfolioId, holdingId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting holding:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-transactions', async (event, portfolioId) => {
    try {
      const transactions = db.getTransactions(portfolioId);
      return { success: true, data: transactions };
    } catch (error) {
      console.error('Error getting transactions:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('sell-holding', async (event, portfolioId, symbol, shares, sellPrice, sellDate) => {
    try {
      const result = db.sellHolding(portfolioId, symbol, shares, sellPrice, sellDate);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error selling holding:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('add-dividend', async (event, portfolioId, symbol, amount, dividendDate) => {
    try {
      const result = db.addDividend(portfolioId, symbol, amount, dividendDate);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error adding dividend:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-dividends', async (event, portfolioId) => {
    try {
      const dividends = db.getDividends(portfolioId);
      return { success: true, data: dividends };
    } catch (error) {
      console.error('Error getting dividends:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update-price', async (event, portfolioId, symbol, currentPrice) => {
    try {
      db.updatePrice(portfolioId, symbol, currentPrice);
      return { success: true };
    } catch (error) {
      console.error('Error updating price:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-portfolio-performance', async (event, portfolioId) => {
    try {
      const performance = db.getPortfolioPerformance(portfolioId);
      return { success: true, data: performance };
    } catch (error) {
      console.error('Error getting portfolio performance:', error);
      return { success: false, error: error.message };
    }
  });
}

app.on('ready', () => {
  console.log('Initializing database...');
  db.initDatabase();

  console.log('Setting up IPC handlers...');
  setupIPCHandlers();

  console.log('Creating window...');
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', () => {
  console.log('Closing database...');
  db.closeDatabase();
});

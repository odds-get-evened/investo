const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  getPortfolios: () => ipcRenderer.invoke('get-portfolios'),
  createPortfolio: (name) => ipcRenderer.invoke('create-portfolio', name),
  getPortfolio: (portfolioId) => ipcRenderer.invoke('get-portfolio', portfolioId),
  addHolding: (portfolioId, holding) => ipcRenderer.invoke('add-holding', portfolioId, holding),
  sellHolding: (portfolioId, symbol, shares, sellPrice, sellDate) =>
    ipcRenderer.invoke('sell-holding', portfolioId, symbol, shares, sellPrice, sellDate),
  addDividend: (portfolioId, symbol, amount, dividendDate) =>
    ipcRenderer.invoke('add-dividend', portfolioId, symbol, amount, dividendDate),
  getDividends: (portfolioId) => ipcRenderer.invoke('get-dividends', portfolioId),
  updatePrice: (portfolioId, symbol, currentPrice) =>
    ipcRenderer.invoke('update-price', portfolioId, symbol, currentPrice),
  deleteHolding: (portfolioId, holdingId) => ipcRenderer.invoke('delete-holding', portfolioId, holdingId),
  getTransactions: (portfolioId) => ipcRenderer.invoke('get-transactions', portfolioId),
  getPortfolioPerformance: (portfolioId) => ipcRenderer.invoke('get-portfolio-performance', portfolioId)
});

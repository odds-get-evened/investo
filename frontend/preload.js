const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  getPortfolios: () => ipcRenderer.invoke('get-portfolios'),
  createPortfolio: (name) => ipcRenderer.invoke('create-portfolio', name),
  getPortfolio: (portfolioId) => ipcRenderer.invoke('get-portfolio', portfolioId),
  addHolding: (portfolioId, holding) => ipcRenderer.invoke('add-holding', portfolioId, holding),
  deleteHolding: (portfolioId, holdingId) => ipcRenderer.invoke('delete-holding', portfolioId, holdingId),
  getTransactions: (portfolioId) => ipcRenderer.invoke('get-transactions', portfolioId)
});

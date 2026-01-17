import React, { useState, useEffect } from 'react';
import PortfolioChart from './components/PortfolioChart';
import HoldingsTable from './components/HoldingsTable';
import PerformanceDashboard from './components/PerformanceDashboard';
import PerformanceChart from './components/PerformanceChart';
import DividendForm from './components/DividendForm';
import SellForm from './components/SellForm';
import TransactionHistory from './components/TransactionHistory';
import PriceUpdateButton from './components/PriceUpdateButton';
import Settings from './components/Settings';

/*
  App.jsx - compact mode support and responsive views
  - Adds a persistent compactMode toggle stored in localStorage ('investo-compact-mode').
  - When compactMode is enabled the app adds the 'compact-mode' class to the document root
    so CSS can apply denser rules.
  - Sidebar-driven views: Overview, Holdings, Charts, Transactions.
  - All localStorage access is guarded to avoid runtime errors in restricted environments.
  - Concise inline comments explain logic blocks.
*/

function App() {
  // Top-level state
  const [portfolios, setPortfolios] = useState([]); // list of portfolios
  const [selectedPortfolio, setSelectedPortfolio] = useState(null); // currently selected portfolio meta
  const [portfolioDetails, setPortfolioDetails] = useState(null); // portfolio + enriched holdings
  const [portfolioPerformance, setPortfolioPerformance] = useState(null); // aggregated metrics
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Theme state (persisted)
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('investo-theme') === 'dark'; } catch { return false; }
  });

  // Compact mode state (persisted). When true we add 'compact-mode' to the document root.
  const [compactMode, setCompactMode] = useState(() => {
    try { return localStorage.getItem('investo-compact-mode') === 'true'; } catch { return false; }
  });

  // Add-holding form state (used in the Holdings view)
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    shares: '',
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  // Which view is visible: 'overview' | 'holdings' | 'charts' | 'transactions'
  const [activeView, setActiveView] = useState('overview');

  // Keep theme and compactMode classes on the document root so CSS can react globally.
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
      localStorage.setItem('investo-theme', darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [darkMode]);

  useEffect(() => {
    // Add/remove the global 'compact-mode' class on the root element.
    try {
      if (compactMode) {
        document.documentElement.classList.add('compact-mode');
        localStorage.setItem('investo-compact-mode', 'true');
      } else {
        document.documentElement.classList.remove('compact-mode');
        localStorage.setItem('investo-compact-mode', 'false');
      }
    } catch {
      // ignore storage/dom errors; ensure we don't throw
    }
  }, [compactMode]);

  // On mount load portfolios
  useEffect(() => { fetchPortfolios(); }, []);

  // When a portfolio is selected, fetch its details and performance and default to overview
  useEffect(() => {
    if (selectedPortfolio) {
      fetchPortfolioDetails(selectedPortfolio.id);
      fetchPortfolioPerformance(selectedPortfolio.id);
      setActiveView('overview');
    } else {
      setPortfolioDetails(null);
      setPortfolioPerformance(null);
    }
  }, [selectedPortfolio]);

  /* ---------------------------
     IPC / data helpers
     --------------------------- */

  // Fetch portfolios list
  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await window.api.getPortfolios();
      if (response.success) {
        setPortfolios(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch portfolios');
      }
    } catch (err) {
      setError('Failed to fetch portfolios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full portfolio details (includes holdings)
  const fetchPortfolioDetails = async (portfolioId) => {
    try {
      setLoading(true);
      const response = await window.api.getPortfolio(portfolioId);
      if (response.success) {
        setPortfolioDetails(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch portfolio details');
      }
    } catch (err) {
      setError('Failed to fetch portfolio details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new portfolio
  const createPortfolio = async () => {
    if (!newPortfolioName.trim()) { setError('Portfolio name is required'); return; }
    try {
      const response = await window.api.createPortfolio(newPortfolioName);
      if (response.success) {
        setPortfolios((p) => [...p, response.data]);
        setNewPortfolioName('');
        setError(null);
      } else {
        setError(response.error || 'Failed to create portfolio');
      }
    } catch (err) {
      setError('Failed to create portfolio');
      console.error(err);
    }
  };

  // Add holding (validates input, inserts and refreshes)
  const addHolding = async () => {
    if (!selectedPortfolio) { setError('Please select a portfolio first'); return; }
    if (!newHolding.symbol || !newHolding.shares || !newHolding.purchase_price) { setError('All fields are required'); return; }
    try {
      const response = await window.api.addHolding(selectedPortfolio.id, newHolding);
      if (response.success) {
        setNewHolding({ symbol: '', shares: '', purchase_price: '', purchase_date: new Date().toISOString().split('T')[0] });
        fetchPortfolioDetails(selectedPortfolio.id);
        fetchPortfolioPerformance(selectedPortfolio.id);
        setActiveView('holdings');
        setError(null);
      } else {
        setError(response.error || 'Failed to add holding');
      }
    } catch (err) { setError('Failed to add holding'); console.error(err); }
  };

  // Delete a holding
  const deleteHolding = async (holdingId) => {
    if (!selectedPortfolio) return;
    try {
      const response = await window.api.deleteHolding(selectedPortfolio.id, holdingId);
      if (response.success) {
        fetchPortfolioDetails(selectedPortfolio.id);
        fetchPortfolioPerformance(selectedPortfolio.id);
        setError(null);
      } else {
        setError(response.error || 'Failed to delete holding');
      }
    } catch (err) { setError('Failed to delete holding'); console.error(err); }
  };

  // Update a single holding price
  const updatePrice = async (symbol, currentPrice) => {
    if (!selectedPortfolio) return;
    try {
      const response = await window.api.updatePrice(selectedPortfolio.id, symbol, currentPrice);
      if (response.success) {
        fetchPortfolioDetails(selectedPortfolio.id);
        fetchPortfolioPerformance(selectedPortfolio.id);
        setError(null);
      } else {
        setError(response.error || 'Failed to update price');
      }
    } catch (err) { setError('Failed to update price'); console.error(err); }
  };

  // Fetch portfolio performance metrics
  const fetchPortfolioPerformance = async (portfolioId) => {
    try {
      const response = await window.api.getPortfolioPerformance(portfolioId);
      if (response.success) { setPortfolioPerformance(response.data); setError(null); } else { setError(response.error || 'Failed to fetch portfolio performance'); }
    } catch (err) { setError('Failed to fetch portfolio performance'); console.error(err); }
  };

  // Add dividend
  const addDividend = async (symbol, amount, dividendDate) => {
    if (!selectedPortfolio) return;
    try { const response = await window.api.addDividend(selectedPortfolio.id, symbol, amount, dividendDate); if (response.success) { fetchPortfolioPerformance(selectedPortfolio.id); setError(null); } else { setError(response.error || 'Failed to add dividend'); } } catch (err) { setError('Failed to add dividend'); console.error(err); }
  };

  // Sell shares
  const sellShares = async (symbol, shares, sellPrice, sellDate) => {
    if (!selectedPortfolio) return;
    try { const response = await window.api.sellHolding(selectedPortfolio.id, symbol, shares, sellPrice, sellDate); if (response.success) { fetchPortfolioDetails(selectedPortfolio.id); fetchPortfolioPerformance(selectedPortfolio.id); setError(null); } else { setError(response.error || 'Failed to sell shares'); } } catch (err) { setError('Failed to sell shares'); console.error(err); }
  };

  // Bulk price updates (used by PriceUpdateButton)
  const updateMultiplePrices = async (priceUpdates) => { if (!selectedPortfolio) return; for (const update of priceUpdates) { try { await window.api.updatePrice(selectedPortfolio.id, update.symbol, update.price); } catch (err) { console.error(`Failed to update ${update.symbol}:`, err); } } fetchPortfolioDetails(selectedPortfolio.id); fetchPortfolioPerformance(selectedPortfolio.id); };

  // Navigate views from sidebar (validates selection when necessary)
  const navigateTo = (view) => { if (!selectedPortfolio && view !== 'overview') { setError('Please select a portfolio from the sidebar first'); return; } setError(null); setActiveView(view); };

  // Compact add-holding form used in Holdings view
  const renderAddHoldingForm = () => (
    <div className="add-holding-form compact">
      <input type="text" placeholder="Symbol (e.g., AAPL)" value={newHolding.symbol} onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value.toUpperCase() })} />
      <input type="number" placeholder="Shares" value={newHolding.shares} onChange={(e) => setNewHolding({ ...newHolding, shares: e.target.value })} />
      <input type="number" placeholder="Purchase Price" step="0.01" value={newHolding.purchase_price} onChange={(e) => setNewHolding({ ...newHolding, purchase_price: e.target.value })} />
      <input type="date" value={newHolding.purchase_date} onChange={(e) => setNewHolding({ ...newHolding, purchase_date: e.target.value })} />
      <button className="btn" onClick={addHolding}>Add</button>
    </div>
  );

  return (
    <div className={`app compact-root ${compactMode ? 'compact-mode' : ''}`}>
      <div className="sidebar compact-sidebar">
        <div className="sidebar-header compact">
          <h1>Investo</h1>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>{darkMode ? '☀️' : '🌙'}</button>
            <button className="theme-toggle" onClick={() => setCompactMode(!compactMode)} title={compactMode ? 'Disable Compact Mode' : 'Enable Compact Mode'} aria-pressed={compactMode}>{compactMode ? '🧩' : '🔳'}</button>
          </div>
        </div>
        <div className="sidebar-nav compact">
          <button className={`nav-btn ${activeView === 'overview' ? 'active' : ''}`} onClick={() => navigateTo('overview')}>Overview</button>
          <button className={`nav-btn ${activeView === 'holdings' ? 'active' : ''}`} onClick={() => navigateTo('holdings')}>Holdings</button>
          <button className={`nav-btn ${activeView === 'charts' ? 'active' : ''}`} onClick={() => navigateTo('charts')}>Charts</button>
          <button className={`nav-btn ${activeView === 'transactions' ? 'active' : ''}`} onClick={() => navigateTo('transactions')}>Transactions</button>
        </div>
        <div className="portfolio-selector compact">
          <h2>Portfolios</h2>
          {loading && portfolios.length === 0 ? (
            <div className="loading">Loading portfolios...</div>
          ) : (
            <>
              <div className="portfolio-list compact-list">
                {portfolios.map((portfolio) => (
                  <button key={portfolio.id} className={`portfolio-btn ${selectedPortfolio?.id === portfolio.id ? 'active' : ''}`} onClick={() => setSelectedPortfolio(portfolio)}>{portfolio.name}</button>
                ))}
              </div>
              <div className="create-portfolio compact-create">
                <input type="text" placeholder="New portfolio" value={newPortfolioName} onChange={(e) => setNewPortfolioName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && createPortfolio()} />
                <button className="btn" onClick={createPortfolio}>Create</button>
              </div>
            </>
          )}
        </div>
        <div className="sidebar-footer compact">
          <button className="settings-btn" onClick={() => { setSelectedPortfolio(null); setActiveView('overview'); setError(null); setTimeout(()=>{},0); }}>⚙️ Settings</button>
        </div>
      </div>
      <div className="main-content compact-main">
        {error && <div className="error compact-error">{error}</div>}
        {!selectedPortfolio && portfolios.length === 0 && !loading && (<div className="empty-state compact-empty"><p>Create your first portfolio to get started!</p></div>)}
        {!selectedPortfolio && portfolios.length > 0 && (<div className="empty-state compact-empty"><p>Select a portfolio to view details. Use the sidebar to switch views (Overview / Holdings / Charts / Transactions).</p></div>)}
        {selectedPortfolio && portfolioDetails && (
          <div className="portfolio-details compact-details">
            <div className="details-header compact">
              <h2>{selectedPortfolio.name}</h2>
              <div className="details-actions">
                <PriceUpdateButton holdings={portfolioDetails.holdings} onUpdatePrices={updateMultiplePrices} />
                <button className="btn" onClick={() => setActiveView('overview')}>Overview</button>
              </div>
            </div>
            {activeView === 'overview' && (<>{portfolioPerformance && <PerformanceDashboard performance={portfolioPerformance} />}<div className="compact-summary" style={{ marginTop: 8 }}><strong>Total Value: {portfolioPerformance?.total_market_value ? `$${portfolioPerformance.total_market_value.toFixed(2)}` : '$0.00'}</strong><span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: '0.9em' }}>Use the sidebar to access other screens</span></div><HoldingsTable holdings={portfolioDetails.holdings} onDelete={deleteHolding} onUpdatePrice={updatePrice} /></>)}
            {activeView === 'holdings' && (<>{renderAddHoldingForm()}<HoldingsTable holdings={portfolioDetails.holdings} onDelete={deleteHolding} onUpdatePrice={updatePrice} /></>)}
            {activeView === 'charts' && (<><PerformanceChart holdings={portfolioDetails.holdings} /><PortfolioChart holdings={portfolioDetails.holdings} /></>)}
            {activeView === 'transactions' && (<><div className="transaction-forms compact"><DividendForm holdings={portfolioDetails.holdings} onAddDividend={addDividend} /><SellForm holdings={portfolioDetails.holdings} onSell={sellShares} /></div><TransactionHistory portfolioId={selectedPortfolio.id} /></>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

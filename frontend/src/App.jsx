import React, { useState, useEffect } from 'react';
import PortfolioChart from './components/PortfolioChart';
import HoldingsTable from './components/HoldingsTable';
import PerformanceDashboard from './components/PerformanceDashboard';
import PerformanceChart from './components/PerformanceChart';
import DividendForm from './components/DividendForm';
import SellForm from './components/SellForm';
import TransactionHistory from './components/TransactionHistory';
import PriceUpdateButton from './components/PriceUpdateButton';

function App() {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolioDetails, setPortfolioDetails] = useState(null);
  const [portfolioPerformance, setPortfolioPerformance] = useState(null);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('investo-theme');
    return saved ? saved === 'dark' : false;
  });

  const [newHolding, setNewHolding] = useState({
    symbol: '',
    shares: '',
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('investo-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (selectedPortfolio) {
      fetchPortfolioDetails(selectedPortfolio.id);
      fetchPortfolioPerformance(selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

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

  const createPortfolio = async () => {
    if (!newPortfolioName.trim()) {
      setError('Portfolio name is required');
      return;
    }

    try {
      const response = await window.api.createPortfolio(newPortfolioName);
      if (response.success) {
        setPortfolios([...portfolios, response.data]);
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

  const addHolding = async () => {
    if (!selectedPortfolio) {
      setError('Please select a portfolio first');
      return;
    }

    if (!newHolding.symbol || !newHolding.shares || !newHolding.purchase_price) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await window.api.addHolding(selectedPortfolio.id, newHolding);
      if (response.success) {
        setNewHolding({
          symbol: '',
          shares: '',
          purchase_price: '',
          purchase_date: new Date().toISOString().split('T')[0]
        });
        fetchPortfolioDetails(selectedPortfolio.id);
        fetchPortfolioPerformance(selectedPortfolio.id);
        setError(null);
      } else {
        setError(response.error || 'Failed to add holding');
      }
    } catch (err) {
      setError('Failed to add holding');
      console.error(err);
    }
  };

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
    } catch (err) {
      setError('Failed to delete holding');
      console.error(err);
    }
  };

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
    } catch (err) {
      setError('Failed to update price');
      console.error(err);
    }
  };

  const fetchPortfolioPerformance = async (portfolioId) => {
    try {
      const response = await window.api.getPortfolioPerformance(portfolioId);
      if (response.success) {
        setPortfolioPerformance(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch portfolio performance');
      }
    } catch (err) {
      setError('Failed to fetch portfolio performance');
      console.error(err);
    }
  };

  const addDividend = async (symbol, amount, dividendDate) => {
    if (!selectedPortfolio) return;

    try {
      const response = await window.api.addDividend(
        selectedPortfolio.id,
        symbol,
        amount,
        dividendDate
      );
      if (response.success) {
        fetchPortfolioPerformance(selectedPortfolio.id);
        setError(null);
      } else {
        setError(response.error || 'Failed to add dividend');
      }
    } catch (err) {
      setError('Failed to add dividend');
      console.error(err);
    }
  };

  const sellShares = async (symbol, shares, sellPrice, sellDate) => {
    if (!selectedPortfolio) return;

    try {
      const response = await window.api.sellHolding(
        selectedPortfolio.id,
        symbol,
        shares,
        sellPrice,
        sellDate
      );
      if (response.success) {
        fetchPortfolioDetails(selectedPortfolio.id);
        fetchPortfolioPerformance(selectedPortfolio.id);
        setError(null);
      } else {
        setError(response.error || 'Failed to sell shares');
      }
    } catch (err) {
      setError('Failed to sell shares');
      console.error(err);
    }
  };

  const updateMultiplePrices = async (priceUpdates) => {
    if (!selectedPortfolio) return;

    for (const update of priceUpdates) {
      try {
        await window.api.updatePrice(
          selectedPortfolio.id,
          update.symbol,
          update.price
        );
      } catch (err) {
        console.error(`Failed to update price for ${update.symbol}:`, err);
      }
    }

    // Refresh data after all updates
    fetchPortfolioDetails(selectedPortfolio.id);
    fetchPortfolioPerformance(selectedPortfolio.id);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Investo</h1>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="portfolio-selector">
          <h2>Portfolios</h2>
          {loading && portfolios.length === 0 ? (
            <div className="loading">Loading portfolios...</div>
          ) : (
            <>
              <div className="portfolio-list">
                {portfolios.map((portfolio) => (
                  <button
                    key={portfolio.id}
                    className={`portfolio-btn ${
                      selectedPortfolio?.id === portfolio.id ? 'active' : ''
                    }`}
                    onClick={() => setSelectedPortfolio(portfolio)}
                  >
                    {portfolio.name}
                  </button>
                ))}
              </div>
              <div className="create-portfolio">
                <input
                  type="text"
                  placeholder="New portfolio name"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createPortfolio()}
                />
                <button className="btn" onClick={createPortfolio}>
                  Create Portfolio
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="main-content">
        {error && <div className="error">{error}</div>}

        {selectedPortfolio && portfolioDetails && (
          <div className="portfolio-details">
            <h2>{selectedPortfolio.name}</h2>

            <div className="add-holding-form">
              <input
                type="text"
                placeholder="Symbol (e.g., AAPL)"
                value={newHolding.symbol}
                onChange={(e) =>
                  setNewHolding({ ...newHolding, symbol: e.target.value.toUpperCase() })
                }
              />
              <input
                type="number"
                placeholder="Shares"
                value={newHolding.shares}
                onChange={(e) =>
                  setNewHolding({ ...newHolding, shares: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Purchase Price"
                step="0.01"
                value={newHolding.purchase_price}
                onChange={(e) =>
                  setNewHolding({ ...newHolding, purchase_price: e.target.value })
                }
              />
              <input
                type="date"
                value={newHolding.purchase_date}
                onChange={(e) =>
                  setNewHolding({ ...newHolding, purchase_date: e.target.value })
                }
              />
              <button className="btn" onClick={addHolding}>
                Add Holding
              </button>
            </div>

            {portfolioDetails.holdings && portfolioDetails.holdings.length > 0 ? (
              <>
                {portfolioPerformance && (
                  <PerformanceDashboard performance={portfolioPerformance} />
                )}

                <PriceUpdateButton
                  holdings={portfolioDetails.holdings}
                  onUpdatePrices={updateMultiplePrices}
                />

                <HoldingsTable
                  holdings={portfolioDetails.holdings}
                  onDelete={deleteHolding}
                  onUpdatePrice={updatePrice}
                />

                <div className="charts-section">
                  <PerformanceChart holdings={portfolioDetails.holdings} />
                  <PortfolioChart holdings={portfolioDetails.holdings} />
                </div>

                <div className="transactions-section">
                  <h2>Transactions</h2>
                  <div className="transaction-forms">
                    <DividendForm
                      holdings={portfolioDetails.holdings}
                      onAddDividend={addDividend}
                    />
                    <SellForm
                      holdings={portfolioDetails.holdings}
                      onSell={sellShares}
                    />
                  </div>

                  <TransactionHistory portfolioId={selectedPortfolio.id} />
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No holdings yet. Add your first stock above!</p>
              </div>
            )}
          </div>
        )}

        {!selectedPortfolio && portfolios.length > 0 && (
          <div className="empty-state">
            <p>Select a portfolio to view your holdings</p>
          </div>
        )}

        {!selectedPortfolio && portfolios.length === 0 && !loading && (
          <div className="empty-state">
            <p>Create your first portfolio to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

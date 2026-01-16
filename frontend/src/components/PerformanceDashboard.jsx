import React from 'react';

function PerformanceDashboard({ performance }) {
  if (!performance) {
    return null;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getColorClass = (value) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="performance-dashboard">
      <div className="performance-grid">
        <div className="metric-card">
          <h3>Market Value</h3>
          <div className="value">
            {formatCurrency(performance.total_market_value)}
          </div>
        </div>

        <div className="metric-card">
          <h3>Cost Basis</h3>
          <div className="value">
            {formatCurrency(performance.total_cost_basis)}
          </div>
        </div>

        <div className="metric-card">
          <h3>Unrealized Gain/Loss</h3>
          <div className={`value ${getColorClass(performance.unrealized_gain_loss)}`}>
            {formatCurrency(performance.unrealized_gain_loss)}
          </div>
        </div>

        <div className="metric-card">
          <h3>Total Dividends</h3>
          <div className="value positive">
            {formatCurrency(performance.total_dividends)}
          </div>
        </div>

        <div className="metric-card">
          <h3>Total Return</h3>
          <div className={`value ${getColorClass(performance.total_return)}`}>
            {formatCurrency(performance.total_return)}
          </div>
          <div className={`subtitle ${getColorClass(performance.total_return_percent)}`}>
            {formatPercent(performance.total_return_percent)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceDashboard;

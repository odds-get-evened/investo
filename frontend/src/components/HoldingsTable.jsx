import React, { useState } from 'react';

/*
  HoldingsTable.jsx - Responsive table component
  - Displays holdings in a traditional table on desktop (>900px)
  - Collapses to stacked card layout on mobile (<900px) to avoid horizontal scroll
  - Uses data-label attributes for responsive labels in card mode
  - Maintains all functionality: price updates, delete actions
*/

function HoldingsTable({ holdings, onDelete, onUpdatePrice, onSell }) {
  const [editingPrice, setEditingPrice] = useState({});
  const [sellingShares, setSellingShares] = useState({});

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

  const handleUpdatePrice = (holding) => {
    const newPrice = editingPrice[holding.id];
    if (newPrice && parseFloat(newPrice) > 0) {
      onUpdatePrice(holding.symbol, parseFloat(newPrice));
      setEditingPrice({ ...editingPrice, [holding.id]: '' });
    }
  };

  const handleSell = (holding) => {
    const sharesToSell = sellingShares[holding.id];
    if (sharesToSell && parseFloat(sharesToSell) > 0) {
      onSell(holding, parseFloat(sharesToSell));
      setSellingShares({ ...sellingShares, [holding.id]: '' });
    }
  };

  return (
    <div>
      <table className="holdings-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Shares</th>
            <th>Avg Cost</th>
            <th>Current Price</th>
            <th>Market Value</th>
            <th>Cost Basis</th>
            <th>Gain/Loss</th>
            <th>Return %</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.id}>
              <td data-label="Symbol"><strong>{holding.symbol}</strong></td>
              <td data-label="Shares">{parseFloat(holding.shares).toFixed(2)}</td>
              <td data-label="Avg Cost">{formatCurrency(holding.average_cost)}</td>
              <td data-label="Current Price">
                <div className="price-update">
                  <input
                    type="number"
                    step="0.01"
                    placeholder={holding.current_price > 0 ? formatCurrency(holding.current_price) : 'Set price'}
                    value={editingPrice[holding.id] || ''}
                    onChange={(e) => setEditingPrice({ ...editingPrice, [holding.id]: e.target.value })}
                    className="price-input"
                  />
                  <button
                    className="btn-small"
                    onClick={() => handleUpdatePrice(holding)}
                    disabled={!editingPrice[holding.id]}
                  >
                    Update
                  </button>
                </div>
              </td>
              <td data-label="Market Value">{formatCurrency(holding.market_value)}</td>
              <td data-label="Cost Basis">{formatCurrency(holding.cost_basis)}</td>
              <td data-label="Gain/Loss" className={getColorClass(holding.gain_loss)}>
                <strong>{formatCurrency(holding.gain_loss)}</strong>
              </td>
              <td data-label="Return %" className={getColorClass(holding.gain_loss_percent)}>
                <strong>{formatPercent(holding.gain_loss_percent)}</strong>
              </td>
              <td data-label="Actions">
                <div className="action-buttons">
                  <button
                    className="btn-small btn-danger"
                    onClick={() => onDelete(holding.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HoldingsTable;

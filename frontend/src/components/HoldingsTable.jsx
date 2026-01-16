import React, { useState } from 'react';

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
              <td><strong>{holding.symbol}</strong></td>
              <td>{parseFloat(holding.shares).toFixed(2)}</td>
              <td>{formatCurrency(holding.average_cost)}</td>
              <td>
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
              <td>{formatCurrency(holding.market_value)}</td>
              <td>{formatCurrency(holding.cost_basis)}</td>
              <td className={getColorClass(holding.gain_loss)}>
                <strong>{formatCurrency(holding.gain_loss)}</strong>
              </td>
              <td className={getColorClass(holding.gain_loss_percent)}>
                <strong>{formatPercent(holding.gain_loss_percent)}</strong>
              </td>
              <td>
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

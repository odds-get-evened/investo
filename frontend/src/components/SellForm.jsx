import React, { useState } from 'react';

function SellForm({ holdings, onSell }) {
  const [sellData, setSellData] = useState({
    symbol: '',
    shares: '',
    sell_price: '',
    sell_date: new Date().toISOString().split('T')[0]
  });

  const selectedHolding = holdings.find(h => h.symbol === sellData.symbol);
  const maxShares = selectedHolding ? selectedHolding.shares : 0;

  const handleSubmit = () => {
    if (!sellData.symbol || !sellData.shares || !sellData.sell_price) {
      return;
    }

    const sharesToSell = parseFloat(sellData.shares);
    if (sharesToSell > maxShares) {
      alert(`Cannot sell more than ${maxShares} shares`);
      return;
    }

    onSell(
      sellData.symbol,
      sharesToSell,
      parseFloat(sellData.sell_price),
      sellData.sell_date
    );

    setSellData({
      symbol: '',
      shares: '',
      sell_price: '',
      sell_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="transaction-form">
      <h3>Sell Shares</h3>
      <div className="form-grid">
        <select
          value={sellData.symbol}
          onChange={(e) => setSellData({ ...sellData, symbol: e.target.value, shares: '' })}
          className="form-select"
        >
          <option value="">Select Symbol</option>
          {holdings.map((holding) => (
            <option key={holding.id} value={holding.symbol}>
              {holding.symbol} ({parseFloat(holding.shares).toFixed(2)} shares)
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder={`Shares to Sell${selectedHolding ? ` (max: ${maxShares.toFixed(2)})` : ''}`}
          value={sellData.shares}
          onChange={(e) => setSellData({ ...sellData, shares: e.target.value })}
          className="form-input"
          max={maxShares}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Sell Price"
          value={sellData.sell_price}
          onChange={(e) => setSellData({ ...sellData, sell_price: e.target.value })}
          className="form-input"
        />
        <input
          type="date"
          value={sellData.sell_date}
          onChange={(e) => setSellData({ ...sellData, sell_date: e.target.value })}
          className="form-input"
        />
        <button
          className="btn"
          onClick={handleSubmit}
          disabled={!sellData.symbol || !sellData.shares || !sellData.sell_price}
        >
          Sell Shares
        </button>
      </div>
    </div>
  );
}

export default SellForm;

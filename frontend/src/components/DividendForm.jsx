import React, { useState } from 'react';

function DividendForm({ holdings, onAddDividend }) {
  const [dividend, setDividend] = useState({
    symbol: '',
    amount: '',
    dividend_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = () => {
    if (!dividend.symbol || !dividend.amount) {
      return;
    }

    onAddDividend(
      dividend.symbol,
      parseFloat(dividend.amount),
      dividend.dividend_date
    );

    setDividend({
      symbol: '',
      amount: '',
      dividend_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="transaction-form">
      <h3>Record Dividend</h3>
      <div className="form-grid">
        <select
          value={dividend.symbol}
          onChange={(e) => setDividend({ ...dividend, symbol: e.target.value })}
          className="form-select"
        >
          <option value="">Select Symbol</option>
          {holdings.map((holding) => (
            <option key={holding.id} value={holding.symbol}>
              {holding.symbol}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Dividend Amount"
          value={dividend.amount}
          onChange={(e) => setDividend({ ...dividend, amount: e.target.value })}
          className="form-input"
        />
        <input
          type="date"
          value={dividend.dividend_date}
          onChange={(e) => setDividend({ ...dividend, dividend_date: e.target.value })}
          className="form-input"
        />
        <button
          className="btn"
          onClick={handleSubmit}
          disabled={!dividend.symbol || !dividend.amount}
        >
          Add Dividend
        </button>
      </div>
    </div>
  );
}

export default DividendForm;

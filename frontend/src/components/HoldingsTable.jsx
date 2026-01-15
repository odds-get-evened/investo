import React from 'react';

function HoldingsTable({ holdings, onDelete }) {
  const calculateTotalValue = (shares, price) => {
    return (parseFloat(shares) * parseFloat(price)).toFixed(2);
  };

  const calculateTotalPortfolioValue = () => {
    return holdings.reduce((total, holding) => {
      return total + parseFloat(shares) * parseFloat(holding.purchase_price);
    }, 0).toFixed(2);
  };

  return (
    <div>
      <table className="holdings-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Shares</th>
            <th>Purchase Price</th>
            <th>Total Value</th>
            <th>Purchase Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.id}>
              <td><strong>{holding.symbol}</strong></td>
              <td>{parseFloat(holding.shares).toFixed(2)}</td>
              <td>${parseFloat(holding.purchase_price).toFixed(2)}</td>
              <td>
                <strong>
                  ${calculateTotalValue(holding.shares, holding.purchase_price)}
                </strong>
              </td>
              <td>{holding.purchase_date}</td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => onDelete(holding.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HoldingsTable;

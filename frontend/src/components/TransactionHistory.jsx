import React, { useState, useEffect } from 'react';

function TransactionHistory({ portfolioId }) {
  const [transactions, setTransactions] = useState([]);
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (portfolioId) {
      fetchTransactions();
      fetchDividends();
    }
  }, [portfolioId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await window.api.getTransactions(portfolioId);
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDividends = async () => {
    try {
      const response = await window.api.getDividends(portfolioId);
      if (response.success) {
        setDividends(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch dividends:', err);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Combine transactions and dividends
  const allTransactions = [
    ...transactions.map(t => ({
      ...t,
      type: t.transaction_type,
      date: t.transaction_date,
      amount: t.shares * t.price
    })),
    ...dividends.map(d => ({
      ...d,
      type: 'DIVIDEND',
      date: d.dividend_date,
      shares: null,
      price: null
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const getTypeClass = (type) => {
    switch (type) {
      case 'BUY':
        return 'transaction-buy';
      case 'SELL':
        return 'transaction-sell';
      case 'DIVIDEND':
        return 'transaction-dividend';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  if (allTransactions.length === 0) {
    return (
      <div className="empty-state">
        <p>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Symbol</th>
            <th>Shares</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {allTransactions.map((transaction, index) => (
            <tr key={index} className={getTypeClass(transaction.type)}>
              <td>{formatDate(transaction.date)}</td>
              <td>
                <span className={`transaction-badge ${getTypeClass(transaction.type)}`}>
                  {transaction.type}
                </span>
              </td>
              <td><strong>{transaction.symbol}</strong></td>
              <td>
                {transaction.shares !== null
                  ? parseFloat(transaction.shares).toFixed(2)
                  : '-'}
              </td>
              <td>
                {transaction.price !== null
                  ? formatCurrency(transaction.price)
                  : '-'}
              </td>
              <td>
                <strong>
                  {transaction.type === 'DIVIDEND'
                    ? formatCurrency(transaction.amount)
                    : formatCurrency(transaction.amount)}
                </strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionHistory;

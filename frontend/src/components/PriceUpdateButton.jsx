import React, { useState } from 'react';
import { fetchMultipleStockPrices } from '../services/stockPriceService';

function PriceUpdateButton({ holdings, onUpdatePrices }) {
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  const updateAllPrices = async () => {
    if (holdings.length === 0) return;

    setUpdating(true);
    setError(null);
    setProgress({ current: 0, total: holdings.length, symbol: '' });

    try {
      const symbols = holdings.map(h => h.symbol);

      const prices = await fetchMultipleStockPrices(
        symbols,
        (symbol, price, current, total) => {
          setProgress({ current, total, symbol, price });
        }
      );

      // Update all prices that were successfully fetched
      const updates = Object.entries(prices).map(([symbol, price]) => ({
        symbol,
        price
      }));

      if (updates.length > 0) {
        onUpdatePrices(updates);
      }

      if (updates.length < symbols.length) {
        setError(`Updated ${updates.length} of ${symbols.length} symbols. Some prices could not be fetched.`);
      }
    } catch (err) {
      setError('Failed to update prices. Please try again.');
      console.error(err);
    } finally {
      setUpdating(false);
      setProgress(null);
    }
  };

  return (
    <div className="price-update-container">
      <button
        className="btn btn-update-prices"
        onClick={updateAllPrices}
        disabled={updating || holdings.length === 0}
      >
        {updating ? '⏳ Updating...' : '🔄 Auto-Update Prices'}
      </button>

      {progress && (
        <div className="update-progress">
          Updating {progress.symbol}... ({progress.current}/{progress.total})
        </div>
      )}

      {error && (
        <div className="update-warning">{error}</div>
      )}

      {!updating && holdings.length > 0 && (
        <div className="update-note">
          Using Yahoo Finance API (no key required). Updates ~1 symbol/second.
        </div>
      )}
    </div>
  );
}

export default PriceUpdateButton;

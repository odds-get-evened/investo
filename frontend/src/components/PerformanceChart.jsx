import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

function PerformanceChart({ holdings }) {
  if (!holdings || holdings.length === 0) {
    return null;
  }

  // Calculate gains/losses for each holding
  const chartData = holdings.map(holding => {
    const shares = parseFloat(holding.shares);
    const avgCost = parseFloat(holding.average_cost);
    const currentPrice = parseFloat(holding.current_price);

    const costBasis = shares * avgCost;
    const marketValue = shares * currentPrice;
    const gainLoss = marketValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    return {
      symbol: holding.symbol,
      gainLoss: gainLoss,
      gainLossPercent: gainLossPercent,
      costBasis: costBasis,
      marketValue: marketValue
    };
  });

  // Sort by gain/loss amount
  chartData.sort((a, b) => b.gainLoss - a.gainLoss);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-symbol"><strong>{data.symbol}</strong></p>
          <p className="tooltip-value">
            Gain/Loss: {formatCurrency(data.gainLoss)} ({formatPercent(data.gainLossPercent)})
          </p>
          <p className="tooltip-detail">Cost: {formatCurrency(data.costBasis)}</p>
          <p className="tooltip-detail">Value: {formatCurrency(data.marketValue)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="performance-chart-container">
      <h3>Holdings Performance</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="symbol"
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#888"
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#888"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="gainLoss" name="Gain/Loss">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.gainLoss >= 0 ? '#27ae60' : '#e74c3c'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PerformanceChart;

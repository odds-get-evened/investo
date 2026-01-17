import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Treemap,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ZAxis
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fbc531', '#e056fd', '#00d2ff'];

// Custom tooltip for candlestick chart
function CandlestickTooltip({ active, payload }) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="candlestick-tooltip">
        <p className="tooltip-date"><strong>Date:</strong> {data.date}</p>
        <p className="tooltip-detail">Open: ${data.open?.toFixed(2) || 'N/A'}</p>
        <p className="tooltip-detail">High: ${data.high?.toFixed(2) || 'N/A'}</p>
        <p className="tooltip-detail">Low: ${data.low?.toFixed(2) || 'N/A'}</p>
        <p className="tooltip-detail">Close: ${data.close?.toFixed(2) || 'N/A'}</p>
      </div>
    );
  }
  return null;
}

// Generate synthetic demo candlestick data when real history is not available
function generateSyntheticHistory(basePrice = 100, points = 30) {
  const history = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < points; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (points - i));
    
    // Random walk with volatility
    const change = (Math.random() - 0.5) * 4;
    currentPrice = Math.max(currentPrice + change, basePrice * 0.7);
    
    const open = currentPrice;
    const close = currentPrice + (Math.random() - 0.5) * 3;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    
    history.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2))
    });
    
    currentPrice = close;
  }
  
  return history;
}

function PortfolioChart({ holdings }) {
  const [activeTab, setActiveTab] = useState('sectors'); // 'sectors', 'treemap', 'candlestick'
  const [groupBy, setGroupBy] = useState('sector'); // 'sector' or 'asset_class' for sectors tab
  const [selectedSymbol, setSelectedSymbol] = useState('');

  // Initialize selected symbol when switching to candlestick tab or when holdings change
  React.useEffect(() => {
    if (activeTab === 'candlestick' && !selectedSymbol && holdings && holdings.length > 0) {
      setSelectedSymbol(holdings[0].symbol);
    }
  }, [activeTab, selectedSymbol, holdings]);

  // Defensive check for empty or invalid holdings
  if (!holdings || holdings.length === 0) {
    return (
      <div className="chart-container">
        <h3>Portfolio Insights</h3>
        <div className="empty-state">
          <p>No holdings available to display insights.</p>
        </div>
      </div>
    );
  }

  // Prepare data for Sectors & Classes tab
  const getSectorsData = () => {
    const grouped = {};
    
    holdings.forEach((holding) => {
      const shares = parseFloat(holding.shares) || 0;
      const price = parseFloat(holding.current_price) || 0;
      const value = shares * price;
      
      // Get the grouping key (sector or asset_class)
      const key = groupBy === 'sector' 
        ? (holding.sector || 'Unknown')
        : (holding.asset_class || 'Unknown');
      
      if (grouped[key]) {
        grouped[key] += value;
      } else {
        grouped[key] = value;
      }
    });
    
    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key]
    }));
  };

  // Prepare data for Treemap tab
  const getTreemapData = () => {
    return holdings
      .map((holding) => {
        const shares = parseFloat(holding.shares) || 0;
        const price = parseFloat(holding.current_price) || 0;
        const value = shares * price;
        
        return {
          name: `${holding.symbol} (${shares.toFixed(2)} shares)`,
          size: value,
          fill: COLORS[holdings.indexOf(holding) % COLORS.length]
        };
      })
      .filter(item => item.size > 0); // Only show holdings with value
  };

  // Prepare data for Candlestick tab
  const getCandlestickData = () => {
    if (!selectedSymbol) return [];
    
    const holding = holdings.find(h => h.symbol === selectedSymbol);
    if (!holding) return [];
    
    // Check if holding has history data
    if (holding.history && Array.isArray(holding.history) && holding.history.length > 0) {
      // Use real history, limit to last 60 points for performance
      return holding.history.slice(-60);
    } else {
      // Generate synthetic demo data
      const basePrice = parseFloat(holding.current_price) || 100;
      return generateSyntheticHistory(basePrice, 30);
    }
  };

  // Format candlestick data for ScatterChart (approximates candlesticks)
  const formatCandlestickForScatter = (data) => {
    return data.map((point, index) => ({
      x: index,
      date: point.date,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      // Use open/close for main body
      y: (point.open + point.close) / 2,
      // Size represents the range
      z: Math.abs(point.high - point.low) * 10
    }));
  };

  const sectorsData = getSectorsData();
  const treemapData = getTreemapData();
  const candlestickRawData = getCandlestickData();
  const candlestickData = formatCandlestickForScatter(candlestickRawData);

  // Calculate total value for display
  const totalValue = holdings.reduce((sum, holding) => {
    const shares = parseFloat(holding.shares) || 0;
    const price = parseFloat(holding.current_price) || 0;
    return sum + (shares * price);
  }, 0);

  // Custom label renderer for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Hide labels for small slices
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom content for treemap cells
  const TreemapContent = ({ x, y, width, height, name, size }) => {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{ stroke: '#fff', strokeWidth: 2 }}
        />
        {width > 60 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
              fontWeight="bold"
            >
              {name.length > 20 ? name.substring(0, 18) + '...' : name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 8}
              textAnchor="middle"
              fill="#fff"
              fontSize={11}
            >
              ${size.toFixed(2)}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="chart-container">
      <h3>Portfolio Insights</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>Total Portfolio Value: ${totalValue.toFixed(2)}</strong>
      </div>

      {/* Tab buttons */}
      <div className="insights-tabs">
        <button
          className={`tab-btn ${activeTab === 'sectors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sectors')}
        >
          Sectors & Classes
        </button>
        <button
          className={`tab-btn ${activeTab === 'treemap' ? 'active' : ''}`}
          onClick={() => setActiveTab('treemap')}
        >
          Treemap
        </button>
        <button
          className={`tab-btn ${activeTab === 'candlestick' ? 'active' : ''}`}
          onClick={() => setActiveTab('candlestick')}
        >
          Candlestick
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {/* Sectors & Classes Tab */}
        {activeTab === 'sectors' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ marginRight: '8px', fontSize: '0.9em' }}>Group by:</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9em',
                  border: '1px solid var(--border-secondary)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  borderRadius: '0'
                }}
              >
                <option value="sector">By Sector</option>
                <option value="asset_class">By Asset Class</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={sectorsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Treemap Tab */}
        {activeTab === 'treemap' && (
          <div>
            <ResponsiveContainer width="100%" height={350}>
              <Treemap
                data={treemapData}
                dataKey="size"
                ratio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                content={<TreemapContent />}
              >
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}

        {/* Candlestick Tab */}
        {activeTab === 'candlestick' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ marginRight: '8px', fontSize: '0.9em' }}>Symbol:</label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.9em',
                  border: '1px solid var(--border-secondary)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  borderRadius: '0'
                }}
              >
                {holdings.map((holding) => (
                  <option key={holding.symbol} value={holding.symbol}>
                    {holding.symbol}
                  </option>
                ))}
              </select>
            </div>
            {candlestickData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart
                  margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Index"
                    tick={false}
                    label={{ value: 'Time', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Price"
                    label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} />
                  <Tooltip content={<CandlestickTooltip />} />
                  <Scatter
                    data={candlestickData}
                    fill="#3498db"
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}>
                <p>No price history available for {selectedSymbol}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioChart;

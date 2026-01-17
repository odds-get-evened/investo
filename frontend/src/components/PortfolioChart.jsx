import React, { useState, useEffect } from 'react';
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

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

function PortfolioChart({ holdings }) {
  // State management for tabs and grouping mode
  const [activeTab, setActiveTab] = useState('sectors');
  const [groupBy, setGroupBy] = useState('sector'); // 'sector' or 'asset_class'
  const [selectedSymbol, setSelectedSymbol] = useState('');

  // Guard against missing or empty holdings
  if (!holdings || holdings.length === 0) {
    return (
      <div className="chart-container">
        <h3>Portfolio Insights</h3>
        <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>
          No holdings available to display charts.
        </p>
      </div>
    );
  }

  // Helper function to safely parse numbers with fallback
  const safeParseFloat = (value, fallback = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  };

  // Prepare data for Sectors & Classes pie chart
  const getPieData = () => {
    const grouped = {};
    
    holdings.forEach((holding) => {
      // Calculate position value (shares * current_price)
      const shares = safeParseFloat(holding.shares);
      const currentPrice = safeParseFloat(holding.current_price);
      const value = shares * currentPrice;
      
      // Get grouping key with fallback to 'Unknown'
      const key = groupBy === 'sector' 
        ? (holding.sector || 'Unknown')
        : (holding.asset_class || 'Unknown');
      
      // Aggregate values by grouping key
      if (!grouped[key]) {
        grouped[key] = 0;
      }
      grouped[key] += value;
    });

    // Convert to array format for Recharts
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepare data for Treemap
  const getTreemapData = () => {
    return holdings.map((holding, index) => {
      const shares = safeParseFloat(holding.shares);
      const currentPrice = safeParseFloat(holding.current_price);
      const value = shares * currentPrice;
      
      return {
        name: holding.symbol,
        size: value,
        shares: shares.toFixed(2),
        index: index
      };
    }).filter(item => item.size > 0); // Filter out zero-value positions
  };

  // Generate synthetic candlestick history for demonstration
  const generateSyntheticHistory = (symbol, points = 30) => {
    const history = [];
    const today = new Date();
    let basePrice = 100 + Math.random() * 100; // Random starting price between 100-200
    
    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic OHLC data
      const open = basePrice + (Math.random() - 0.5) * 5;
      const close = open + (Math.random() - 0.5) * 10;
      const high = Math.max(open, close) + Math.random() * 3;
      const low = Math.min(open, close) - Math.random() * 3;
      
      history.push({
        date: date.toISOString().split('T')[0],
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2))
      });
      
      // Trend the base price for next iteration
      basePrice = close;
    }
    
    return history;
  };

  // Get candlestick data for selected symbol
  const getCandlestickData = () => {
    if (!selectedSymbol) return [];
    
    const holding = holdings.find(h => h.symbol === selectedSymbol);
    if (!holding) return [];
    
    // Use holding.history if available, otherwise generate synthetic data
    let history = holding.history && Array.isArray(holding.history) && holding.history.length > 0
      ? holding.history
      : generateSyntheticHistory(selectedSymbol, 30);
    
    // Limit to last 60 points for performance
    if (history.length > 60) {
      history = history.slice(-60);
    }
    
    // Transform to format suitable for ScatterChart approximation
    return history.map((point, index) => ({
      index,
      date: point.date,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      // Use close as the primary y-value for scatter point
      y: point.close
    }));
  };

  // Custom label renderer for pie chart
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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

  // Custom content renderer for Treemap cells
  const TreemapContent = (props) => {
    const { x, y, width, height, name, shares, index } = props;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[index % COLORS.length],
            stroke: '#fff',
            strokeWidth: 2
          }}
        />
        {/* Only show label if cell is large enough */}
        {width > 50 && height > 30 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 8}
              textAnchor="middle"
              fill="#fff"
              fontSize={11}
            >
              {shares} shares
            </text>
          </>
        )}
      </g>
    );
  };

  // Custom tooltip for candlestick chart
  const CandlestickTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="candle-tooltip">
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.date}</p>
          <p>Open: ${data.open?.toFixed(2)}</p>
          <p>High: ${data.high?.toFixed(2)}</p>
          <p>Low: ${data.low?.toFixed(2)}</p>
          <p>Close: ${data.close?.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  // Initialize selected symbol when switching to candlestick tab
  useEffect(() => {
    if (activeTab === 'candlestick' && !selectedSymbol && holdings.length > 0) {
      setSelectedSymbol(holdings[0].symbol);
    }
  }, [activeTab, selectedSymbol, holdings]);

  const pieData = getPieData();
  const treemapData = getTreemapData();
  const candlestickData = getCandlestickData();

  return (
    <div className="chart-container">
      <h3>Portfolio Insights</h3>
      
      {/* Tab navigation buttons */}
      <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-primary)' }}>
        <button
          className={`tab-btn ${activeTab === 'sectors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sectors')}
        >
          Sectors &amp; Classes
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

      {/* Sectors & Classes Tab */}
      {activeTab === 'sectors' && (
        <div className="tab-content">
          {/* Toggle between sector and asset class grouping */}
          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
            <button
              className="btn-small"
              style={{
                background: groupBy === 'sector' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: groupBy === 'sector' ? 'white' : 'var(--text-primary)'
              }}
              onClick={() => setGroupBy('sector')}
            >
              By Sector
            </button>
            <button
              className="btn-small"
              style={{
                background: groupBy === 'asset_class' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: groupBy === 'asset_class' ? 'white' : 'var(--text-primary)'
              }}
              onClick={() => setGroupBy('asset_class')}
            >
              By Asset Class
            </button>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderPieLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
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
        <div className="tab-content">
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
              content={<TreemapContent />}
            />
          </ResponsiveContainer>
        </div>
      )}

      {/* Candlestick Tab */}
      {activeTab === 'candlestick' && (
        <div className="tab-content">
          {/* Symbol selector dropdown */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ marginRight: '8px', fontWeight: '600' }}>Select Symbol:</label>
            <select
              className="form-select"
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              {holdings.map((holding) => (
                <option key={holding.id} value={holding.symbol}>
                  {holding.symbol}
                </option>
              ))}
            </select>
          </div>
          
          {/* Candlestick approximation using ScatterChart */}
          {candlestickData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="index"
                  type="number"
                  name="Day"
                  tickFormatter={(index) => {
                    const point = candlestickData[index];
                    return point ? point.date.substring(5) : index;
                  }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  name="Price"
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip content={<CandlestickTooltip />} />
                {/* Scatter points represent candlesticks (approximation) */}
                <Scatter
                  data={candlestickData}
                  fill="#667eea"
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    if (!payload) return null;
                    
                    // Calculate y-positions for OHLC
                    const yScale = props.yAxis.scale;
                    const highY = yScale(payload.high);
                    const lowY = yScale(payload.low);
                    const openY = yScale(payload.open);
                    const closeY = yScale(payload.close);
                    
                    // Determine candle color (green if close > open, red otherwise)
                    const isGreen = payload.close >= payload.open;
                    const color = isGreen ? '#27ae60' : '#e74c3c';
                    
                    return (
                      <g>
                        {/* High-low line (wick) */}
                        <line
                          x1={cx}
                          y1={highY}
                          x2={cx}
                          y2={lowY}
                          stroke={color}
                          strokeWidth={1}
                        />
                        {/* Open-close rectangle (body) */}
                        <rect
                          x={cx - 4}
                          y={Math.min(openY, closeY)}
                          width={8}
                          height={Math.abs(closeY - openY) || 1}
                          fill={color}
                          stroke={color}
                        />
                      </g>
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>
              No price history available for {selectedSymbol}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PortfolioChart;

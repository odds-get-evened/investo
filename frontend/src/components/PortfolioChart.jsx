// frontend/src/components/PortfolioChart.jsx
// Replaces the old single "Portfolio Distribution" pie with a tabbed insights panel.
// Tabs: "Sectors & Classes" (pie), "Treemap" (with Bar fallback), "Candlestick" (approx. OHLC).
// Defensive programming, ErrorBoundary, and concise inline comments included.

import React, { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Treemap,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

// Shared palette for charts
const COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe',
  '#43e97b', '#fa709a', '#f6d365', '#fda085'
];

/**
 * ErrorBoundary - prevents a rendering error in a child chart from blanking the whole app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Required for proper error boundary behavior
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Capture render errors from child components
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Friendly fallback UI for the failing panel
      return (
        <div style={{ padding: 12, background: '#fff6e6', border: '1px solid #ffd7a8', color: '#6a3b00' }}>
          <strong>Rendering error:</strong> a chart failed to render in this panel. Open DevTools → Console for details.
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * CustomTreemapContent - safe tile renderer; avoids drawing when width/height are invalid.
 */
function CustomTreemapContent({ x, y, width, height, name, value }) {
  // Defensive guard: return nothing when tile size is invalid
  if (!width || !height || width <= 0 || height <= 0) return null;

  const MIN_FONT = 10;
  const fontSize = Math.max(MIN_FONT, Math.min(14, Math.floor(Math.min(width, height) / 6)));

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#4facfe" stroke="#fff" />
      {width > 60 && height > 36 && (
        <>
          <text x={x + 6} y={y + 18} fill="#fff" style={{ fontSize }} fontWeight={700}>{name}</text>
          <text x={x + 6} y={y + 18 + fontSize + 2} fill="#fff" style={{ fontSize: fontSize - 1 }}>{`$${(value || 0).toFixed(2)}`}</text>
        </>
      )}
    </g>
  );
}

/**
 * PortfolioChart - main exported component.
 * Props: holdings = [{ symbol, shares, current_price, sector?, asset_class?, history? }]
 */
function PortfolioChart({ holdings = [] }) {
  // Active tab state: 'pie' | 'treemap' | 'candle'
  const [activeTab, setActiveTab] = useState('pie');

  // Pie grouping mode: 'sector' or 'class'
  const [pieMode, setPieMode] = useState('sector');

  // Symbol selector for candlestick tab (default to first symbol)
  const symbolOptions = holdings.map((h) => h.symbol).filter(Boolean);
  const [selectedSymbol, setSelectedSymbol] = useState(symbolOptions[0] || null);

  // Memoized aggregation to prepare data for charts
  const { totalValue, sectorData, classData, treemapData, holdingsBySymbol } = useMemo(() => {
    let total = 0;
    const sectorMap = {};
    const classMap = {};
    const bySymbol = {};

    // Aggregate holdings defensively
    holdings.forEach((h) => {
      const shares = parseFloat(h.shares) || 0; // parse shares to number (fallback 0)
      const price = parseFloat(h.current_price) || 0; // parse price to number (fallback 0)
      const value = shares * price; // position value
      total += value;

      const sector = h.sector || 'Unknown';
      sectorMap[sector] = (sectorMap[sector] || 0) + value;

      const assetClass = h.asset_class || 'Unknown';
      classMap[assetClass] = (classMap[assetClass] || 0) + value;

      // store enriched holding for quick lookup
      bySymbol[h.symbol] = { ...h, value };
    });

    const sectorArr = Object.entries(sectorMap).map(([name, value]) => ({ name, value }));
    const classArr = Object.entries(classMap).map(([name, value]) => ({ name, value }));
    const treemapArr = Object.entries(bySymbol).map(([sym, obj]) => ({ name: `${sym} (${obj.shares} sh)`, value: Math.max(0, obj.value || 0), symbol: sym }));

    // Filter out zero/invalid values for Treemap (Treemap can misbehave with zeros/NaN)
    const treemapFiltered = treemapArr.filter((t) => Number.isFinite(t.value) && t.value > 0);

    return { totalValue: total, sectorData: sectorArr, classData: classArr, treemapData: treemapFiltered, holdingsBySymbol: bySymbol };
  }, [holdings]);

  // Helper: format currency values
  const fmtMoney = (v) => `$${(v || 0).toFixed(2)}`;

  // Render a Pie chart for provided data
  const renderPie = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <div style={{ padding: 12, color: '#666' }}>No data available for this view.</div>;
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={(entry) => `${entry.name}: ${(entry.value / (totalValue || 1) * 100).toFixed(1)}%`}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => fmtMoney(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Attempt to render Treemap; on error, fall back to a simple BarChart to avoid blank app.
  const renderTreemapOrFallback = () => {
    if (!treemapData || treemapData.length === 0) {
      return <div style={{ padding: 12, color: '#666' }}>No holdings with positive value to display.</div>;
    }

    try {
      return (
        <ResponsiveContainer width="100%" height={420}>
          <Treemap data={treemapData} dataKey="value" ratio={4 / 3} stroke="#fff" fill="#8884d8" content={CustomTreemapContent} />
        </ResponsiveContainer>
      );
    } catch (err) {
      // Log the error and render a more robust BarChart fallback
      console.error('Treemap render error, falling back to BarChart:', err);
      const sorted = [...treemapData].sort((a, b) => b.value - a.value).slice(0, 12); // top 12 holdings
      return (
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={sorted} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={70} />
            <YAxis tickFormatter={(v) => `$${v.toFixed(0)}`} />
            <Tooltip formatter={(value) => fmtMoney(value)} />
            <Bar dataKey="value" fill="#4facfe" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  // Candlestick history retrieval: prefer provided history, otherwise generate synthetic demo data
  const getHistoryForSymbol = (symbol) => {
    if (!symbol) return [];
    const holding = holdingsBySymbol[symbol];
    if (!holding) return [];

    // Use real history if present, cap to last 60 points
    if (Array.isArray(holding.history) && holding.history.length > 0) {
      return holding.history.map((d) => ({ ...d, date: String(d.date) })).slice(-60);
    }

    // Synthesize 30-day demo history centered on current_price for UX
    const center = parseFloat(holding.current_price) || 20;
    const days = 30;
    const result = [];
    let prevClose = center;
    // Constants for realistic synthetic price movements
    const WAVE_FREQUENCY = 0.5; // Controls the period of the sinusoidal trend
    const TREND_AMPLITUDE = 0.01; // 1% trend variation
    const RANDOM_VOLATILITY = 0.02; // 2% random daily volatility
    const HIGH_LOW_SPREAD = 0.02; // 2% intraday high/low spread
    
    for (let i = days - 1; i >= 0; i--) {
      const variation = (Math.sin(i * WAVE_FREQUENCY) * TREND_AMPLITUDE + (Math.random() * RANDOM_VOLATILITY - RANDOM_VOLATILITY / 2)) * center;
      const open = prevClose;
      const close = Math.max(0.01, open + variation);
      const high = Math.max(open, close) + Math.random() * center * HIGH_LOW_SPREAD;
      const low = Math.min(open, close) - Math.random() * center * HIGH_LOW_SPREAD;
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push({ date: date.toISOString().split('T')[0], open, high, low, close });
      prevClose = close;
    }
    return result;
  };

  // Numeric mapping for candlestick scatter plotting
  const candleData = useMemo(() => {
    const hist = getHistoryForSymbol(selectedSymbol);
    return hist.map((d) => ({ date: d.date, open: +d.open, high: +d.high, low: +d.low, close: +d.close }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol, holdingsBySymbol]);

  // Visual approximation of a candlestick using pixel coords provided by Recharts' Scatter
  const CandleShape = ({ cx, cy, payload }) => {
    if (typeof cx !== 'number' || typeof cy !== 'number') return null; // safety check
    const CANDLE_WIDTH = 10; // Width of candlestick body in pixels
    const PRICE_SCALE = 2; // Visual scaling factor to convert price differences to pixel heights
    const { open, close, high, low } = payload;
    const up = close >= open;
    const fill = up ? '#26a69a' : '#ef5350';
    return (
      <g>
        <line x1={cx} x2={cx} y1={cy - Math.abs(high - close) * PRICE_SCALE} y2={cy + Math.abs(close - low) * PRICE_SCALE} stroke={fill} strokeWidth={1} />
        <rect x={cx - CANDLE_WIDTH / 2} y={cy - Math.abs(close - open) * PRICE_SCALE} width={CANDLE_WIDTH} height={Math.max(2, Math.abs(close - open) * (PRICE_SCALE * 2))} fill={fill} stroke="#222" />
      </g>
    );
  };

  // Tooltip for candlestick points showing OHLC values
  const CandleTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const p = payload[0].payload;
    return (
      <div className="candle-tooltip" style={{ background: '#222', color: '#fff', padding: 8, borderRadius: 4 }}>
        <div style={{ fontWeight: 700 }}>{p.date}</div>
        <div>Open: {fmtMoney(p.open)}</div>
        <div>High: {fmtMoney(p.high)}</div>
        <div>Low: {fmtMoney(p.low)}</div>
        <div>Close: {fmtMoney(p.close)}</div>
      </div>
    );
  };

  // Component JSX: tab controls and conditional tab content wrapped in ErrorBoundary
  return (
    <div className="chart-container">
      <h3>Portfolio Insights</h3>

      {/* Summary: total portfolio value */}
      <div style={{ marginBottom: 8 }}>
        <strong>Total Portfolio Value: {fmtMoney(totalValue)}</strong>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={`tab-btn ${activeTab === 'pie' ? 'active' : ''}`} onClick={() => setActiveTab('pie')}>Sectors & Classes</button>
        <button className={`tab-btn ${activeTab === 'treemap' ? 'active' : ''}`} onClick={() => setActiveTab('treemap')}>Treemap</button>
        <button className={`tab-btn ${activeTab === 'candle' ? 'active' : ''}`} onClick={() => setActiveTab('candle')}>Candlestick</button>
      </div>

      {/* ErrorBoundary prevents single-panel failures from blanking the app */}
      <ErrorBoundary>
        <div className="tab-content" style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
          {activeTab === 'pie' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div>
                  <label style={{ marginRight: 8 }}>
                    <input type="radio" name="pieMode" checked={pieMode === 'sector'} onChange={() => setPieMode('sector')} /> By Sector
                  </label>
                  <label>
                    <input type="radio" name="pieMode" checked={pieMode === 'class'} onChange={() => setPieMode('class')} /> By Asset Class
                  </label>
                </div>
                <div style={{ marginLeft: 'auto', color: '#666' }}>{pieMode === 'sector' ? `Groups: ${sectorData.length}` : `Groups: ${classData.length}`}</div>
              </div>

              {pieMode === 'sector' ? renderPie(sectorData) : renderPie(classData)}
            </>
          )}

          {activeTab === 'treemap' && (
            <>
              <div style={{ marginBottom: 8, color: '#666' }}>Treemap shows proportional position sizes (area = value). If Treemap can't render a fallback bar chart will be shown.</div>
              {renderTreemapOrFallback()}
            </>
          )}

          {activeTab === 'candle' && (
            <>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                <label style={{ color: '#666' }}>Symbol:</label>
                <select value={selectedSymbol || ''} onChange={(e) => setSelectedSymbol(e.target.value)} className="form-select" style={{ minWidth: 120 }}>
                  {symbolOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  {symbolOptions.length === 0 && <option value="">No symbols</option>}
                </select>
                <div style={{ marginLeft: 'auto', color: '#666' }}>{selectedSymbol ? `Showing ${selectedSymbol} (${candleData.length} points)` : 'Select a symbol'}</div>
              </div>

              {selectedSymbol ? (
                candleData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="category" dataKey="date" name="Date" interval={Math.max(0, Math.floor(candleData.length / 10))} tick={{ fontSize: 12 }} />
                      <YAxis type="number" dataKey="close" name="Price" tickFormatter={(val) => `$${val.toFixed(2)}`} />
                      <Tooltip content={<CandleTooltip />} />
                      <Scatter name={selectedSymbol} data={candleData} shape={(props) => { const { cx, cy, payload } = props; const pixelX = typeof cx === 'number' ? cx : props.x || 0; const pixelY = typeof cy === 'number' ? cy : props.y || 0; return <CandleShape cx={pixelX} cy={pixelY} payload={payload} />; }} />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div>No history available for {selectedSymbol}.</div>
                )
              ) : (
                <div>Select a symbol to view candlestick analysis.</div>
              )}
            </>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}

export default PortfolioChart;

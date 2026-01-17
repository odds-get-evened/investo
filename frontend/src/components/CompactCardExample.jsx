import React from 'react';
import CompactCard from './CompactCard';

/**
 * Example usage of CompactCard component
 * This demonstrates various ways to use the CompactCard
 */
function CompactCardExample() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1>CompactCard Examples</h1>
      
      {/* Example 1: Basic card with title only */}
      <CompactCard title="Portfolio Summary">
        <p>Total Value: $50,000</p>
        <p>Daily Change: +2.5%</p>
        <p>Holdings: 8 stocks</p>
      </CompactCard>

      {/* Example 2: Card with title and actions */}
      <CompactCard 
        title="Holdings" 
        actions={
          <>
            <button className="compact-button-small">Edit</button>
            <button className="compact-button-small">Refresh</button>
          </>
        }
      >
        <ul>
          <li>AAPL - 10 shares ($1,500)</li>
          <li>GOOGL - 5 shares ($750)</li>
          <li>MSFT - 15 shares ($4,200)</li>
        </ul>
      </CompactCard>

      {/* Example 3: Card without title */}
      <CompactCard>
        <p>This is a card without a title.</p>
        <p>It still maintains compact styling.</p>
      </CompactCard>

      {/* Example 4: Card with custom className */}
      <CompactCard title="Custom Styled Card" className="my-custom-class">
        <p>You can add custom classes for additional styling.</p>
      </CompactCard>

      {/* Example 5: Card with icon button actions */}
      <CompactCard 
        title="Quick Actions" 
        actions={
          <>
            <button className="compact-icon-button">⚙️</button>
            <button className="compact-icon-button">📊</button>
            <button className="compact-icon-button">🔄</button>
          </>
        }
      >
        <p>Click the icons above for quick actions.</p>
      </CompactCard>
    </div>
  );
}

export default CompactCardExample;

import React from 'react';
import '../styles/compact.css';

/**
 * CompactCard Component
 * 
 * A compact, reusable card component with optional header and actions.
 * Uses compact CSS classes for a condensed, information-dense UI.
 * 
 * Props:
 * - title (string, optional): The title displayed in the card header
 * - actions (node, optional): Action buttons or elements to display in the card header
 * - children (node, required): The main content of the card
 * - className (string, optional): Additional CSS classes to apply to the card
 * 
 * @component
 * @example
 * // Basic usage
 * <CompactCard title="Card Title">
 *   <p>Card content goes here</p>
 * </CompactCard>
 * 
 * @example
 * // With actions
 * <CompactCard 
 *   title="Portfolio Summary" 
 *   actions={
 *     <>
 *       <button className="compact-button-small">Edit</button>
 *       <button className="compact-button-small">Delete</button>
 *     </>
 *   }
 * >
 *   <p>Total Value: $10,000</p>
 * </CompactCard>
 * 
 * @example
 * // With custom className
 * <CompactCard title="Holdings" className="custom-card">
 *   <ul>
 *     <li>AAPL - 10 shares</li>
 *     <li>GOOGL - 5 shares</li>
 *   </ul>
 * </CompactCard>
 */
function CompactCard({ title, actions, children, className = '' }) {
  return (
    <div className={`compact-card ${className}`}>
      {/* Card header - only rendered if title or actions are provided */}
      {(title || actions) && (
        <div className="card-header">
          {/* Card title */}
          {title && <h3 className="card-title">{title}</h3>}
          
          {/* Action buttons or custom action elements */}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      
      {/* Card content - main content area */}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}

export default CompactCard;

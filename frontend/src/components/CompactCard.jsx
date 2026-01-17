import React from 'react';

/**
 * CompactCard Component
 * 
 * A reusable card component that uses compact CSS classes for denser UI.
 * Provides a consistent card layout with optional header, actions, and content.
 * 
 * Props:
 * @param {React.ReactNode} title - Optional title displayed in the card header
 * @param {React.ReactNode} actions - Optional action buttons/elements shown in the header
 * @param {React.ReactNode} children - Main content of the card
 * @param {string} className - Optional additional CSS classes to apply
 * 
 * Example usage:
 * <CompactCard 
 *   title="Portfolio Summary" 
 *   actions={<button>Edit</button>}
 * >
 *   <p>Card content goes here</p>
 * </CompactCard>
 */
const CompactCard = ({ title, actions, children, className = '' }) => {
  return (
    <div className={`compact-card ${className}`}>
      {/* Card header - only rendered if title or actions are provided */}
      {(title || actions) && (
        <div className="card-header">
          {title && (
            <h3 className="card-title">
              {title}
            </h3>
          )}
          {actions && (
            <div className="card-actions">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Card content - main body of the card */}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default CompactCard;

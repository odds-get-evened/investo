import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/compact.css';

/**
 * Import compact CSS styles (opt-in)
 * To enable compact mode globally, add className="compact-root" to the root div below
 * Or use individual compact classes (compact-card, compact-button, etc.) on specific components
 * Example: <div id="root" className="compact-root">
 */
import './styles/compact.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

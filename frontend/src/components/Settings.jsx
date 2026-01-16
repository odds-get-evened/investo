import React, { useState, useEffect } from 'react';

function Settings({ onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    // Load existing API key
    const existingKey = localStorage.getItem('finnhub-api-key') || '';
    setApiKey(existingKey);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('finnhub-api-key', apiKey.trim());
      setSavedMessage('Settings saved successfully!');
    } else {
      localStorage.removeItem('finnhub-api-key');
      setSavedMessage('API key cleared. Using Yahoo Finance only.');
    }

    setTimeout(() => {
      setSavedMessage('');
    }, 3000);
  };

  const handleGetApiKey = () => {
    window.open('https://finnhub.io/register', '_blank');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        {onClose && (
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>Stock Price API</h3>
          <p className="settings-description">
            By default, the app uses Yahoo Finance (no API key required).
            Add a Finnhub API key for backup data source.
          </p>

          <div className="settings-field">
            <label>Finnhub API Key (Optional)</label>
            <input
              type="text"
              placeholder="Enter your Finnhub API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="settings-input"
            />
            <div className="settings-help">
              <button className="btn-link" onClick={handleGetApiKey}>
                Get free API key from Finnhub
              </button>
              <span className="help-text">
                (60 requests/minute free tier)
              </span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>About</h3>
          <div className="about-info">
            <p><strong>Investo</strong></p>
            <p>Personal Stock Portfolio Manager</p>
            <p className="version">Version 1.0.0</p>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="btn btn-primary" onClick={handleSave}>
          Save Settings
        </button>
        {savedMessage && (
          <span className="save-message">{savedMessage}</span>
        )}
      </div>
    </div>
  );
}

export default Settings;

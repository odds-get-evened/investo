# Architecture Documentation

## Overview

Investo is a desktop application built using a client-server architecture where:
- The **frontend** is an Electron application with React for the UI
- The **backend** is a Python Flask REST API
- **Data** is stored in an embedded SQLite database

## Technology Stack

### Frontend
- **Electron**: Desktop application framework
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Recharts**: Data visualization library
- **Axios**: HTTP client for API requests

### Backend
- **Flask**: Lightweight web framework
- **SQLite**: Embedded SQL database
- **Flask-CORS**: Cross-Origin Resource Sharing support

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Electron Main Process           │
│  - Window management                    │
│  - Python process lifecycle             │
│  - System integration                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Electron Renderer Process          │
│  ┌───────────────────────────────────┐  │
│  │         React Application          │  │
│  │  - Portfolio Management            │  │
│  │  - Holdings Table                  │  │
│  │  - Visualization Charts            │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼──────────────────────┘
                   │
                   │ HTTP/REST
                   │
                   ▼
┌─────────────────────────────────────────┐
│         Flask REST API Server           │
│  - Portfolio endpoints                  │
│  - Holdings management                  │
│  - Transaction tracking                 │
└───────────────┬─────────────────────────┘
                │
                │ SQL
                │
                ▼
┌─────────────────────────────────────────┐
│         SQLite Database                 │
│  - portfolios table                     │
│  - holdings table                       │
│  - transactions table                   │
└─────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App.jsx (Root Component)
  ├── Portfolio Selector
  │   ├── Portfolio List
  │   └── Create Portfolio Form
  │
  └── Portfolio Details
      ├── Add Holding Form
      ├── HoldingsTable
      │   └── Holding Rows with Actions
      └── PortfolioChart
          └── Pie Chart Visualization
```

### API Layer

The frontend communicates with the backend using Axios:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Example API calls
GET    /api/portfolios           → List all portfolios
POST   /api/portfolios           → Create portfolio
GET    /api/portfolios/:id       → Get portfolio details
POST   /api/portfolios/:id/holdings → Add holding
DELETE /api/portfolios/:id/holdings/:holdingId → Delete holding
```

### Database Schema

```sql
portfolios
  ├── id (INTEGER PRIMARY KEY)
  ├── name (TEXT)
  └── created_at (TIMESTAMP)

holdings
  ├── id (INTEGER PRIMARY KEY)
  ├── portfolio_id (FK → portfolios.id)
  ├── symbol (TEXT)
  ├── shares (REAL)
  ├── purchase_price (REAL)
  └── purchase_date (TEXT)

transactions
  ├── id (INTEGER PRIMARY KEY)
  ├── portfolio_id (FK → portfolios.id)
  ├── symbol (TEXT)
  ├── transaction_type (TEXT)
  ├── shares (REAL)
  ├── price (REAL)
  └── transaction_date (TEXT)
```

## Data Flow

### Creating a Portfolio

1. User enters portfolio name in UI
2. React state updates with new name
3. User clicks "Create Portfolio"
4. Axios sends POST to `/api/portfolios`
5. Flask validates and inserts into database
6. Returns portfolio object with ID
7. React updates state and UI shows new portfolio

### Adding a Holding

1. User selects a portfolio
2. Enters stock symbol, shares, price, date
3. React validates input
4. Axios sends POST to `/api/portfolios/:id/holdings`
5. Flask creates holding record
6. Flask also creates transaction record (BUY)
7. Returns holding object
8. React refreshes portfolio details
9. UI updates table and chart

## Process Management

### Electron Main Process

The main process handles:
- Creating the browser window
- Starting the Python backend subprocess
- Managing application lifecycle
- Cleaning up Python process on exit

```javascript
// Python process lifecycle
app.on('ready', () => {
  startPythonBackend();  // Spawn python3 app.py
  setTimeout(createWindow, 2000);  // Wait for API to start
});

app.on('quit', () => {
  pythonProcess.kill();  // Clean shutdown
});
```

## Security Considerations

### Current Implementation

- Local-only API (localhost:5000)
- No authentication required (single-user desktop app)
- CORS enabled for local development
- SQLite database stored locally

### Future Improvements

- Encrypt sensitive data at rest
- Add user authentication if multi-user support needed
- Implement data backup/restore
- Add export encryption options

## Performance Considerations

### Database

- SQLite is lightweight and suitable for local storage
- Indexed on primary keys by default
- Consider adding indexes on portfolio_id for large datasets

### Frontend

- React components use hooks for efficient rendering
- Charts only re-render when holdings change
- API calls are made on-demand, not polling

### Backend

- Flask development server suitable for local use
- For production, consider using gunicorn or waitress
- Connection pooling not needed for SQLite

## Extension Points

### Adding New Features

1. **Real-time Stock Prices**: Add API integration in backend
2. **Portfolio Analytics**: Create new API endpoints and components
3. **Data Export**: Add new endpoint returning CSV/JSON
4. **Multiple Visualizations**: Create new chart components
5. **Settings/Preferences**: Add user preferences table and UI

### Integrating External APIs

To add stock price lookups:

1. Add API client in backend (e.g., yfinance, Alpha Vantage)
2. Create endpoint: `GET /api/stocks/:symbol/price`
3. Call from frontend when displaying holdings
4. Cache prices with TTL to avoid rate limiting

## Development Workflow

1. Make changes to backend: Restart Flask server
2. Make changes to frontend: Vite hot-reloads automatically
3. Database schema changes: Migrations can be added using Alembic
4. Building for distribution: Use electron-builder

## Testing Strategy

### Backend Testing
- Unit tests for API endpoints
- Database integration tests
- Mock SQLite for isolated tests

### Frontend Testing
- Component tests with React Testing Library
- Integration tests for API communication
- E2E tests with Electron testing framework

## Deployment

### Building the Application

```bash
# Build frontend
cd frontend
npm run build

# Package Electron app
npm run package  # (requires electron-builder)
```

### Distribution

- macOS: .dmg or .app bundle
- Windows: .exe installer
- Linux: .AppImage or .deb package

The SQLite database will be created in the user's application data directory on first run.

# Investo

A self-contained desktop application for consumer investors to visualize and manage their stock portfolios. Built with Electron, React, and SQLite.

## Features

- Create and manage multiple portfolios
- Track stock holdings with purchase price and date
- Visualize portfolio distribution with interactive pie charts
- Add, view, and delete holdings
- Embedded SQLite database for local data storage
- Clean, modern user interface

## Architecture

- **Frontend**: Electron + React + Vite
  - Modern React components with hooks
  - Recharts for data visualization
  - Responsive design
  - IPC communication with main process

- **Backend**: Electron Main Process
  - SQLite database via better-sqlite3
  - IPC handlers for all operations
  - Fully self-contained (no external server needed)

- **Data Storage**: SQLite database (embedded)
  - Portfolios, holdings, and transactions tables
  - Automatic schema initialization
  - Stored in user data directory

## Prerequisites

- Node.js (v16 or higher)

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd investo
```

### 2. Run setup (one time only)

**Linux/macOS:**
```bash
./setup.sh
```

**Windows:**
```batch
setup.bat
```

This will install all Python and Node.js dependencies automatically.

### 3. Start the application

**Linux/macOS:**
```bash
./run.sh
```

**Windows:**
```batch
run.bat
```

That's it! The application will build the frontend and launch automatically. Everything runs in a single process - no separate backend needed!

## Development Mode

For developers who want to work on the code with hot-reloading:

**Terminal 1 - Start Vite dev server:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Start Electron in development mode:**
```bash
cd frontend
NODE_ENV=development npm start
```

The SQLite database is managed by the Electron main process. The frontend will hot-reload on changes.

## Building Installers

To create distributable installers for end users:

**Windows Installer (.exe):**
```batch
build-installer.bat
```

**Linux/macOS Installers:**
```bash
./build-installer.sh
```

The build script will create installers in `frontend/release/`:
- **Windows**: NSIS installer (.exe)
- **macOS**: DMG file (.dmg)
- **Linux**: AppImage and DEB package

**Manual build commands:**
```bash
cd frontend
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
npm run dist        # Current platform
```

Note: Building for macOS requires a Mac, and code signing requires an Apple Developer account.

## IPC API

The application uses Electron IPC for communication between the renderer and main process:

### Available Operations

- `getPortfolios()` - Get all portfolios
- `createPortfolio(name)` - Create a new portfolio
- `getPortfolio(portfolioId)` - Get portfolio details with holdings
- `addHolding(portfolioId, holding)` - Add a holding to a portfolio
- `deleteHolding(portfolioId, holdingId)` - Delete a holding
- `getTransactions(portfolioId)` - Get transaction history

## Project Structure

```
investo/
├── setup.sh               # One-time setup script (Linux/macOS)
├── setup.bat              # One-time setup script (Windows)
├── run.sh                 # Application launcher (Linux/macOS)
├── run.bat                # Application launcher (Windows)
├── build-installer.sh     # Build installers (Linux/macOS)
├── build-installer.bat    # Build Windows installer
├── LICENSE                # BSD 3-Clause license
├── README.md              # This file
├── ARCHITECTURE.md        # Technical documentation
├── .gitignore             # Git ignore rules
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── HoldingsTable.jsx    # Holdings table component
    │   │   └── PortfolioChart.jsx   # Chart visualization
    │   ├── App.jsx          # Main React component
    │   ├── main.jsx         # React entry point
    │   └── index.css        # Global styles
    ├── main.js              # Electron main process
    ├── preload.js           # Preload script for IPC
    ├── database.js          # SQLite database operations
    ├── index.html           # HTML template
    ├── vite.config.js       # Vite configuration
    ├── package.json         # Node dependencies & build config
    └── release/             # Built installers (after build)
```

## Usage

1. **Create a Portfolio**: Enter a name and click "Create Portfolio"
2. **Add Holdings**: Select a portfolio, then fill in stock symbol, shares, purchase price, and date
3. **View Visualizations**: See your portfolio distribution in the pie chart
4. **Manage Holdings**: Delete holdings as needed using the action buttons

## Database Schema

### Portfolios Table
- `id`: Primary key
- `name`: Portfolio name
- `created_at`: Creation timestamp

### Holdings Table
- `id`: Primary key
- `portfolio_id`: Foreign key to portfolios
- `symbol`: Stock ticker symbol
- `shares`: Number of shares
- `purchase_price`: Price per share at purchase
- `purchase_date`: Date of purchase

### Transactions Table
- `id`: Primary key
- `portfolio_id`: Foreign key to portfolios
- `symbol`: Stock ticker symbol
- `transaction_type`: BUY or SELL
- `shares`: Number of shares
- `price`: Price per share
- `transaction_date`: Date of transaction

## Future Enhancements

- Real-time stock price updates via external API
- Profit/loss calculations
- Historical performance tracking
- Export portfolio data to CSV
- Dark mode support
- Multiple chart types (line charts, bar charts)
- Portfolio comparison features

## License

BSD 3-Clause License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# Investo

A desktop application for consumer investors to visualize and manage their stock portfolios. Built with Electron, React, and Python Flask.

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

- **Backend**: Python Flask REST API
  - RESTful API endpoints
  - SQLite embedded database
  - CORS enabled for local development

- **Data Storage**: SQLite database (embedded)
  - Portfolios, holdings, and transactions tables
  - Automatic schema initialization

## Prerequisites

- Node.js (v16 or higher)
- Python 3.7 or higher
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd investo
```

### 2. Set up the Python backend

```bash
cd backend
pip install -r requirements.txt
```

### 3. Set up the Electron frontend

```bash
cd ../frontend
npm install
```

## Running the Application

### Option 1: Development Mode

You'll need to run both the backend and frontend separately:

**Terminal 1 - Start Python Backend:**
```bash
cd backend
python3 app.py
```

The API will be available at `http://localhost:5000`

**Terminal 2 - Start Electron App (Development):**
```bash
cd frontend
npm run dev
```

Then in another terminal:
```bash
cd frontend
NODE_ENV=development npm start
```

### Option 2: Production Mode

The Electron app will automatically start the Python backend:

```bash
cd frontend
npm run build
npm start
```

## API Endpoints

### Portfolios

- `GET /api/health` - Health check
- `GET /api/portfolios` - Get all portfolios
- `POST /api/portfolios` - Create a new portfolio
- `GET /api/portfolios/:id` - Get portfolio details with holdings
- `GET /api/portfolios/:id/transactions` - Get transaction history

### Holdings

- `POST /api/portfolios/:id/holdings` - Add a holding to a portfolio
- `DELETE /api/portfolios/:id/holdings/:holdingId` - Delete a holding

## Project Structure

```
investo/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variables template
│   └── portfolio.db        # SQLite database (created automatically)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HoldingsTable.jsx
│   │   │   └── PortfolioChart.jsx
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── main.js             # Electron main process
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite configuration
│   └── package.json        # Node dependencies
│
└── README.md
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

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

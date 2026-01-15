from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE = 'portfolio.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create portfolios table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create holdings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS holdings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            portfolio_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            shares REAL NOT NULL,
            purchase_price REAL NOT NULL,
            purchase_date TEXT NOT NULL,
            FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
        )
    ''')

    # Create transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            portfolio_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            shares REAL NOT NULL,
            price REAL NOT NULL,
            transaction_date TEXT NOT NULL,
            FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
        )
    ''')

    conn.commit()
    conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'API is running'})

@app.route('/api/portfolios', methods=['GET'])
def get_portfolios():
    conn = get_db_connection()
    portfolios = conn.execute('SELECT * FROM portfolios').fetchall()
    conn.close()
    return jsonify([dict(row) for row in portfolios])

@app.route('/api/portfolios', methods=['POST'])
def create_portfolio():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Portfolio name is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO portfolios (name) VALUES (?)', (name,))
    portfolio_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({'id': portfolio_id, 'name': name}), 201

@app.route('/api/portfolios/<int:portfolio_id>', methods=['GET'])
def get_portfolio(portfolio_id):
    conn = get_db_connection()
    portfolio = conn.execute('SELECT * FROM portfolios WHERE id = ?', (portfolio_id,)).fetchone()

    if portfolio is None:
        conn.close()
        return jsonify({'error': 'Portfolio not found'}), 404

    holdings = conn.execute('SELECT * FROM holdings WHERE portfolio_id = ?', (portfolio_id,)).fetchall()
    conn.close()

    return jsonify({
        'portfolio': dict(portfolio),
        'holdings': [dict(row) for row in holdings]
    })

@app.route('/api/portfolios/<int:portfolio_id>/holdings', methods=['POST'])
def add_holding(portfolio_id):
    data = request.get_json()
    symbol = data.get('symbol')
    shares = data.get('shares')
    purchase_price = data.get('purchase_price')
    purchase_date = data.get('purchase_date', datetime.now().strftime('%Y-%m-%d'))

    if not all([symbol, shares, purchase_price]):
        return jsonify({'error': 'Symbol, shares, and purchase_price are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Add holding
    cursor.execute('''
        INSERT INTO holdings (portfolio_id, symbol, shares, purchase_price, purchase_date)
        VALUES (?, ?, ?, ?, ?)
    ''', (portfolio_id, symbol, shares, purchase_price, purchase_date))

    # Record transaction
    cursor.execute('''
        INSERT INTO transactions (portfolio_id, symbol, transaction_type, shares, price, transaction_date)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (portfolio_id, symbol, 'BUY', shares, purchase_price, purchase_date))

    holding_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'id': holding_id,
        'portfolio_id': portfolio_id,
        'symbol': symbol,
        'shares': shares,
        'purchase_price': purchase_price,
        'purchase_date': purchase_date
    }), 201

@app.route('/api/portfolios/<int:portfolio_id>/holdings/<int:holding_id>', methods=['DELETE'])
def delete_holding(portfolio_id, holding_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM holdings WHERE id = ? AND portfolio_id = ?', (holding_id, portfolio_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Holding deleted successfully'})

@app.route('/api/portfolios/<int:portfolio_id>/transactions', methods=['GET'])
def get_transactions(portfolio_id):
    conn = get_db_connection()
    transactions = conn.execute(
        'SELECT * FROM transactions WHERE portfolio_id = ? ORDER BY transaction_date DESC',
        (portfolio_id,)
    ).fetchall()
    conn.close()

    return jsonify([dict(row) for row in transactions])

if __name__ == '__main__':
    print("Initializing database...")
    init_db()
    print("Database initialized successfully!")
    print("Starting Flask server on http://localhost:5000")
    print("Press Ctrl+C to stop the server")

    # Disable reloader on Windows to avoid subprocess issues
    # Set host to localhost explicitly for security
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=False,
        use_reloader=False
    )

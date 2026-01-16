// Stock Price Service
// Uses Finnhub API (free tier: 60 requests/minute)
// Get your free API key at: https://finnhub.io/register
// Alternative fallback: Yahoo Finance (no key required but less reliable)

const DEFAULT_API_KEY = 'demo'; // Users should replace this with their own Finnhub key
const CACHE_DURATION = 60 * 1000; // 1 minute cache

const priceCache = new Map();

/**
 * Get configured API key
 * @returns {string} API key
 */
function getConfiguredApiKey() {
  return localStorage.getItem('finnhub-api-key') || DEFAULT_API_KEY;
}

/**
 * Fetch stock price from Finnhub
 * @param {string} symbol - Stock symbol (e.g., 'AAPL')
 * @returns {Promise<number|null>} Current price or null if failed
 */
async function fetchFromFinnhub(symbol) {
  try {
    const apiKey = getConfiguredApiKey();
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    // Finnhub returns current price in 'c' field
    if (data.c && data.c > 0) {
      return data.c;
    }

    return null;
  } catch (error) {
    console.error(`Finnhub error for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch stock price from Yahoo Finance (fallback, no API key needed)
 * @param {string} symbol - Stock symbol (e.g., 'AAPL')
 * @returns {Promise<number|null>} Current price or null if failed
 */
async function fetchFromYahoo(symbol) {
  try {
    // Using Yahoo Finance v8 API endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.chart && data.chart.result && data.chart.result[0]) {
      const result = data.chart.result[0];
      const price = result.meta?.regularMarketPrice;

      if (price && price > 0) {
        return price;
      }
    }

    return null;
  } catch (error) {
    console.error(`Yahoo Finance error for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch current stock price with fallback support
 * @param {string} symbol - Stock symbol (e.g., 'AAPL')
 * @returns {Promise<number|null>} Current price or null if failed
 */
export async function fetchStockPrice(symbol) {
  // Check cache first
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  // Try Yahoo Finance first (no API key required)
  let price = await fetchFromYahoo(symbol);

  // If Yahoo fails, try Finnhub
  if (price === null) {
    price = await fetchFromFinnhub(symbol);
  }

  // Cache the result if successful
  if (price !== null) {
    priceCache.set(symbol, {
      price,
      timestamp: Date.now()
    });
  }

  return price;
}

/**
 * Fetch prices for multiple symbols with rate limiting
 * @param {string[]} symbols - Array of stock symbols
 * @param {function} onProgress - Callback for progress updates (symbol, price, index, total)
 * @returns {Promise<Object>} Map of symbol to price
 */
export async function fetchMultipleStockPrices(symbols, onProgress = null) {
  const results = {};
  const uniqueSymbols = [...new Set(symbols)];

  for (let i = 0; i < uniqueSymbols.length; i++) {
    const symbol = uniqueSymbols[i];
    const price = await fetchStockPrice(symbol);

    if (price !== null) {
      results[symbol] = price;
    }

    if (onProgress) {
      onProgress(symbol, price, i + 1, uniqueSymbols.length);
    }

    // Rate limiting: wait 1 second between requests to be respectful
    // Yahoo Finance can handle this, Finnhub allows 60/min
    if (i < uniqueSymbols.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Set custom Finnhub API key
 * @param {string} apiKey - Finnhub API key
 */
export function setApiKey(apiKey) {
  if (apiKey && apiKey.trim().length > 0) {
    localStorage.setItem('finnhub-api-key', apiKey);
  }
}

/**
 * Get configured API key
 * @returns {string} API key
 */
export function getApiKey() {
  return getConfiguredApiKey();
}

/**
 * Clear price cache
 */
export function clearCache() {
  priceCache.clear();
}

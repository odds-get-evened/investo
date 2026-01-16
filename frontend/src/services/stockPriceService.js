// Stock Price Service
// Uses Alpha Vantage API (free tier: 25 requests/day)
// Get your free API key at: https://www.alphavantage.co/support/#api-key

const DEFAULT_API_KEY = 'demo'; // Users should replace this with their own key
const CACHE_DURATION = 60 * 1000; // 1 minute cache

const priceCache = new Map();

/**
 * Get configured API key
 * @returns {string} API key
 */
function getConfiguredApiKey() {
  return localStorage.getItem('alpha-vantage-key') || DEFAULT_API_KEY;
}

/**
 * Fetch current stock price from Alpha Vantage
 * @param {string} symbol - Stock symbol (e.g., 'AAPL')
 * @returns {Promise<number|null>} Current price or null if failed
 */
export async function fetchStockPrice(symbol) {
  // Check cache first
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    const apiKey = getConfiguredApiKey();
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const price = parseFloat(data['Global Quote']['05. price']);

      // Cache the result
      priceCache.set(symbol, {
        price,
        timestamp: Date.now()
      });

      return price;
    }

    // If API limit reached or error, return null
    if (data.Note || data['Error Message']) {
      console.warn(`API limit or error for ${symbol}:`, data.Note || data['Error Message']);
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
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

    // Rate limiting: wait 12 seconds between requests (5 per minute for free tier)
    if (i < uniqueSymbols.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 12000));
    }
  }

  return results;
}

/**
 * Set custom API key
 * @param {string} apiKey - Alpha Vantage API key
 */
export function setApiKey(apiKey) {
  if (apiKey && apiKey.trim().length > 0) {
    localStorage.setItem('alpha-vantage-key', apiKey);
  }
}

/**
 * Get configured API key
 * @returns {string} API key
 */
export function getApiKey() {
  return localStorage.getItem('alpha-vantage-key') || ALPHA_VANTAGE_KEY;
}

/**
 * Clear price cache
 */
export function clearCache() {
  priceCache.clear();
}

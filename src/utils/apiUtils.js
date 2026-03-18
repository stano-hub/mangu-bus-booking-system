// Utility functions for API optimization

// Debounce function to prevent rapid API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Cache for API responses
const apiCache = new Map();

// Cache wrapper for GET requests
export const withCache = async (key, apiCall, ttl = 300000) => { // 5 minutes default TTL
  const cached = apiCache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < ttl) {
    return cached.data;
  }
  
  try {
    const result = await apiCall();
    apiCache.set(key, {
      data: result,
      timestamp: now
    });
    return result;
  } catch (error) {
    // Return cached data if available on error
    if (cached) {
      console.warn('API call failed, returning cached data:', error);
      return cached.data;
    }
    throw error;
  }
};

// Clear cache for specific key or all cache
export const clearCache = (key) => {
  if (key) {
    apiCache.delete(key);
  } else {
    apiCache.clear();
  }
};

// Network status helper
export const getNetworkStatus = () => {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine ? 'online' : 'offline';
  }
  return 'unknown';
};

// Retry wrapper for API calls
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, i);
      console.log(`API call failed, retrying in ${waitTime}ms... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

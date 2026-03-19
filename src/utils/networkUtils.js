// src/utils/networkUtils.js
// Network status utilities for poor connectivity handling

export const getNetworkStatus = () => {
  if (typeof navigator === 'undefined') return 'unknown';
  return navigator.onLine ? 'online' : 'offline';
};

export const getConnectionInfo = () => {
  if (typeof navigator === 'undefined' || !navigator.connection) {
    return { effectiveType: 'unknown', downlink: null, rtt: null };
  }
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || null,
    rtt: connection.rtt || null,
    saveData: connection.saveData || false,
  };
};

export const isSlowConnection = () => {
  const info = getConnectionInfo();
  return info.effectiveType === '2g' || info.effectiveType === 'slow-2g' || info.saveData;
};

export const shouldOptimizeForBandwidth = () => {
  const info = getConnectionInfo();
  return isSlowConnection() || info.effectiveType === '3g';
};

export class NetworkMonitor {
  constructor(callback) {
    this.callback = callback;
    this.listeners = [];
    this.setup();
  }

  setup() {
    const handleChange = () => {
      const status = {
        online: navigator.onLine,
        connection: getConnectionInfo(),
        slow: isSlowConnection(),
        bandwidthOptimized: shouldOptimizeForBandwidth(),
      };
      this.callback(status);
    };

    window.addEventListener('online', handleChange);
    window.addEventListener('offline', handleChange);
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleChange);
      this.listeners.push(() => navigator.connection.removeEventListener('change', handleChange));
    }

    this.listeners.push(() => {
      window.removeEventListener('online', handleChange);
      window.removeEventListener('offline', handleChange);
    });
  }

  destroy() {
    this.listeners.forEach(unsub => unsub());
  }
}

export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

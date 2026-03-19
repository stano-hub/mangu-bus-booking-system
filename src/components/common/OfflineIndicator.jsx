// src/components/common/OfflineIndicator.jsx
import React, { useState, useEffect } from 'react';
import './OfflineIndicator.css';

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-indicator offline">
      <span>Offline</span>
    </div>
  );
};

export default OfflineIndicator;

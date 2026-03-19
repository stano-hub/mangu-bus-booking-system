// src/services/offlineQueue.js
// Request queue for offline mutation handling with deduplication

import axiosInstance from '../services/api/axiosInstance';
import { offlineStorage } from '../utils/offlineStorage';

const generateRequestFingerprint = (config) => {
  const data = typeof config.data === 'string' ? config.data : JSON.stringify(config.data || {});
  return `${config.method || 'POST'}:${config.url}:${data}`;
};

class OfflineQueue {
  constructor() {
    this.isProcessing = false;
    this.isOnline = navigator.onLine;
    this.processedFingerprints = new Set();
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Back online, processing queue...');
      this.isOnline = true;
      this.processQueue();
    });
    window.addEventListener('offline', () => {
      console.log('[OfflineQueue] Gone offline');
      this.isOnline = false;
    });
  }

  isRequestDuplicate(config) {
    const fingerprint = generateRequestFingerprint(config);
    return this.processedFingerprints.has(fingerprint);
  }

  markAsProcessed(config) {
    const fingerprint = generateRequestFingerprint(config);
    this.processedFingerprints.add(fingerprint);
    setTimeout(() => {
      this.processedFingerprints.delete(fingerprint);
    }, 5 * 60 * 1000);
  }

  async addRequest(config) {
    const fingerprint = generateRequestFingerprint(config);
    
    const existingQueue = await offlineStorage.getQueue();
    const isDuplicate = existingQueue.some(item => {
      const existingFp = generateRequestFingerprint(item);
      return existingFp === fingerprint;
    });

    if (isDuplicate) {
      console.log('[OfflineQueue] Duplicate request detected, skipping:', config.url);
      return { queued: false, duplicate: true };
    }

    const requestConfig = {
      method: config.method || 'POST',
      url: config.url,
      data: config.data,
      headers: config.headers,
      fingerprint,
      timestamp: Date.now(),
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await offlineStorage.addToQueue(requestConfig);
    console.log('[OfflineQueue] Request queued:', config.url);
    
    if (this.isOnline) {
      this.processQueue();
    }

    return { queued: true, offline: !this.isOnline };
  }

  async processQueue() {
    if (this.isProcessing || !this.isOnline) return;
    
    this.isProcessing = true;
    const queue = await offlineStorage.getQueue();

    if (queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    console.log(`[OfflineQueue] Processing ${queue.length} queued requests`);

    for (const request of queue) {
      try {
        await axiosInstance({
          method: request.method,
          url: request.url,
          data: request.data,
          headers: {
            ...request.headers,
            'X-Queue-Retry': 'true',
          },
        });
        
        await offlineStorage.removeFromQueue(request.id);
        this.markAsProcessed(request);
        console.log(`[OfflineQueue] Processed: ${request.url}`);
      } catch (error) {
        console.error(`[OfflineQueue] Failed: ${request.url}`, error);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          await offlineStorage.removeFromQueue(request.id);
          console.log('[OfflineQueue] Auth error, removing request:', request.id);
        }
        
        if (error.response?.status === 409) {
          await offlineStorage.removeFromQueue(request.id);
          this.markAsProcessed(request);
          console.log('[OfflineQueue] Conflict (duplicate), marking as processed:', request.id);
        }
      }
    }

    this.isProcessing = false;
    
    const remaining = await offlineStorage.getQueue();
    console.log(`[OfflineQueue] Queue processing complete. Remaining: ${remaining.length}`);
  }

  async getQueueStatus() {
    const queue = await offlineStorage.getQueue();
    return {
      count: queue.length,
      isProcessing: this.isProcessing,
      isOnline: this.isOnline,
      items: queue.map(q => ({
        id: q.id,
        url: q.url,
        method: q.method,
        timestamp: q.timestamp,
      })),
    };
  }

  async clearQueue() {
    await offlineStorage.clearQueue();
    this.processedFingerprints.clear();
  }

  async hasPendingFor(url, method = 'POST') {
    const queue = await offlineStorage.getQueue();
    return queue.some(item => item.url === url && item.method === method);
  }
}

export const offlineQueue = new OfflineQueue();

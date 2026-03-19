// src/utils/offlineStorage.js
// IndexedDB wrapper for offline data persistence

const DB_NAME = 'mangu_bus_offline';
const DB_VERSION = 1;
const STORES = {
  BOOKINGS: 'bookings_cache',
  USERS: 'users_cache',
  BUSES: 'buses_cache',
  QUEUE: 'pending_requests',
};

class OfflineStorage {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported');
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(STORES.BOOKINGS)) {
          db.createObjectStore(STORES.BOOKINGS, { keyPath: '_id', autoIncrement: false });
        }
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          db.createObjectStore(STORES.USERS, { keyPath: '_id', autoIncrement: false });
        }
        if (!db.objectStoreNames.contains(STORES.BUSES)) {
          db.createObjectStore(STORES.BUSES, { keyPath: '_id', autoIncrement: false });
        }
        if (!db.objectStoreNames.contains(STORES.QUEUE)) {
          const queueStore = db.createObjectStore(STORES.QUEUE, { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async ensureReady() {
    await this.initPromise;
    return this.db !== null;
  }

  async get(storeName, key) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async set(storeName, data) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async setMany(storeName, items) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      items.forEach(item => store.put(item));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async delete(storeName, key) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addToQueue(request) {
    const queueItem = {
      ...request,
      timestamp: Date.now(),
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    await this.set(STORES.QUEUE, queueItem);
    return queueItem.id;
  }

  async getQueue() {
    return this.getAll(STORES.QUEUE);
  }

  async removeFromQueue(id) {
    return this.delete(STORES.QUEUE, id);
  }

  async clearQueue() {
    return this.clear(STORES.QUEUE);
  }

  async cacheBookings(bookings) {
    await this.clear(STORES.BOOKINGS);
    const items = bookings.map(b => ({ ...b, cachedAt: Date.now() }));
    await this.setMany(STORES.BOOKINGS, items);
  }

  async getCachedBookings() {
    const bookings = await this.getAll(STORES.BOOKINGS);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return bookings.filter(b => !b.cachedAt || b.cachedAt > oneHourAgo);
  }

  async cacheUsers(users) {
    await this.clear(STORES.USERS);
    const items = users.map(u => ({ ...u, cachedAt: Date.now() }));
    await this.setMany(STORES.USERS, items);
  }

  async getCachedUsers() {
    const users = await this.getAll(STORES.USERS);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return users.filter(u => !u.cachedAt || u.cachedAt > oneHourAgo);
  }

  async cacheBuses(buses) {
    await this.clear(STORES.BUSES);
    const items = buses.map(b => ({ ...b, cachedAt: Date.now() }));
    await this.setMany(STORES.BUSES, items);
  }

  async getCachedBuses() {
    const buses = await this.getAll(STORES.BUSES);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return buses.filter(b => !b.cachedAt || b.cachedAt > oneHourAgo);
  }
}

export const offlineStorage = new OfflineStorage();
export { STORES };

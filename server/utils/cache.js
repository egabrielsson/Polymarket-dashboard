// Simple in-memory cache with TTL support, we can use this for caching API responses
// and avoid redundant external API calls.
// TODO: Replace with Redis for production if we want persistence/shared cache
// Redis allows multiple server instances to share the same cache
// which in practice would be better for scalability.

class Cache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Get a value from cache
   * @param {string} key
   * @returns {any} cached value or null if expired/missing
   */
  get(key) {
    if (!this.store.has(key)) return null;
    const { value, expiry } = this.store.get(key); // if expiry is set and passed, check if expired
    if (expiry && Date.now() > expiry) {
      this.store.delete(key); // remove expired entry
      return null;
    }
    return value;
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds - time to live in seconds (optional)
   */
  set(key, value, ttlSeconds = null) {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiry });
  }

  /**
   * Clear a specific key or all cache
   * @param {string} key - if provided, clear only this key; otherwise clear all
   */
  clear(key = null) {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}

module.exports = new Cache();

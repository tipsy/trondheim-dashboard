// Cache Client for Trondheim Dashboard
// Centralized caching with TTL support

import { CacheConfig } from './cache-config.js';
import storage from './storage.js';

export class CacheClient {
    // Cache API accepts a single options object: { key, ttl, data }
    // The codebase uses object-style calls; we enforce that here for simplicity.

    /**
     * Generate a cache key from a URL or arbitrary key string
     */
    static getCacheKey(key) {
        // Use a simple hash function to create a unique key
        // This ensures different keys get different cache keys
        let s = String(key || '');
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            const char = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        // Convert to base36 for a shorter string and make it positive
        const hashStr = Math.abs(hash).toString(36);
        return `${storage.CACHE_KEY_PREFIX}${hashStr}`;
    }

    /**
     * Get cached data for a key
     * Accepts either (key, ttl) for backward compatibility or ({ key, ttl })
     * Returns null if cache doesn't exist or is expired
     */
    static get(arg1, arg2 = null) {
        try {
            const key = arg1.key || '';
            const ttl = arg1.ttl === undefined ? null : arg1.ttl;

            if (ttl === 0) return null; // explicit "no cache"

            const cacheKey = this.getCacheKey(key);
            const cached = storage.loadResponse(cacheKey);
            if (!cached) return null;

            if (ttl !== null && ttl !== undefined) {
                const age = Date.now() - cached.timestamp;
                if (age > ttl) return null;
            }

            return cached.data;
        } catch (error) {
            console.error('[Cache] GET error:', error);
            return null;
        }
    }

    /**
     * Get cache age in milliseconds
     * Accepts either (key) or ({ key })
     * Returns null if cache doesn't exist
     */
    static getAge(arg) {
        try {
            const key = arg.key || '';
            const cacheKey = this.getCacheKey(key);
            const cached = storage.loadResponse(cacheKey);
            if (!cached) return null;
            return Date.now() - cached.timestamp;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if cache is stale (older than TTL)
     * Accepts either (key, ttl) or ({ key, ttl })
     */
    static isStale(arg1, arg2) {
        const key = arg1.key || '';
        const ttl = arg1.ttl === undefined ? null : arg1.ttl;
        const age = this.getAge(key);
        if (age === null) return true;
        return age > ttl;
    }

    /**
     * Set cached data for a key
     * Accepts either (key, data) or ({ key, data })
     */
    static set(arg1, arg2) {
        try {
            const key = arg1.key || '';
            const data = arg1.data;

            if (!key) return;

            const cacheKey = this.getCacheKey(key);
            storage.saveResponse(cacheKey, data);
        } catch (error) {
            console.error('[Cache] SET error:', error);
        }
    }

}

// Cache Client for Trondheim Dashboard
// Centralized caching with TTL support

import { CacheConfig } from './cache-config.js';

export class CacheClient {
    static CACHE_KEY_PREFIX = 'trondheim-cache-';

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
        return `${this.CACHE_KEY_PREFIX}${hashStr}`;
    }

    /**
     * Get cached data for a key
     * Accepts either (key, ttl) for backward compatibility or ({ key, ttl })
     * Returns null if cache doesn't exist or is expired
     */
    static get(arg1, arg2 = null) {
        try {
            // Backwards compatibility: get(key, ttl)
            let key;
            let ttl;
            if (typeof arg1 === 'string') {
                key = arg1;
                ttl = arg2 === undefined ? null : arg2;
            } else if (arg1 && typeof arg1 === 'object') {
                // New signature: get({ key, ttl })
                key = arg1.key || arg1.url || '';
                ttl = arg1.hasOwnProperty('ttl') ? arg1.ttl : null;
            } else {
                return null;
            }

            // If ttl is explicitly 0, treat this as "no cache" and return null immediately.
            // Do NOT treat null as "no cache"; null means "use cached value even if stale" (dynamic background-refresh semantics handled by caller).
            if (ttl === 0) return null;

            const cacheKey = this.getCacheKey(key);
            const cached = localStorage.getItem(cacheKey);

            if (!cached) return null;

            const cachedData = JSON.parse(cached);

            // If TTL is specified (number), check if cache is still valid
            if (ttl !== null && ttl !== undefined) {
                const now = Date.now();
                const age = now - cachedData.timestamp;

                if (age > ttl) {
                    return null;
                }
            }

            return cachedData.data;
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
            const key = (typeof arg === 'string') ? arg : (arg && (arg.key || arg.url)) || '';
            const cacheKey = this.getCacheKey(key);
            const cached = localStorage.getItem(cacheKey);
            
            if (!cached) return null;
            
            const cachedData = JSON.parse(cached);
            return Date.now() - cachedData.timestamp;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if cache is stale (older than TTL)
     * Accepts either (key, ttl) or ({ key, ttl })
     */
    static isStale(arg1, arg2) {
        let key;
        let ttl;
        if (typeof arg1 === 'string') {
            key = arg1;
            ttl = arg2;
        } else if (arg1 && typeof arg1 === 'object') {
            key = arg1.key || arg1.url || '';
            ttl = arg1.ttl;
        }

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
            let key;
            let data;
            if (typeof arg1 === 'string') {
                key = arg1;
                data = arg2;
            } else if (arg1 && typeof arg1 === 'object') {
                key = arg1.key || arg1.url || '';
                data = arg1.data;
            } else {
                return;
            }

            const cacheKey = this.getCacheKey(key);
            const cacheData = {
                timestamp: Date.now(),
                key: key,
                data: data
            };

            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('[Cache] SET error:', error);
        }
    }

}

// Cache Client for Trondheim Dashboard
// Centralized caching with TTL support

class CacheClient {
    static CACHE_KEY_PREFIX = 'trondheim-cache-';

    /**
     * Generate a cache key from a URL
     */
    static getCacheKey(url) {
        // Use a simple hash function to create a unique key
        // This ensures different URLs get different cache keys
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        // Convert to base36 for a shorter string and make it positive
        const hashStr = Math.abs(hash).toString(36);
        return `${this.CACHE_KEY_PREFIX}${hashStr}`;
    }

    /**
     * Get cached data for a URL
     * Returns null if cache doesn't exist or is expired
     */
    static get(url, ttl = null) {
        try {
            // If ttl is falsey, treat this as "no cache" and return null immediately.
            // This avoids touching localStorage when callers explicitly request fresh data.
            if (!ttl) return null;

            const cacheKey = this.getCacheKey(url);
            const cached = localStorage.getItem(cacheKey);

            if (!cached) return null;

            const cachedData = JSON.parse(cached);

            // If TTL is specified, check if cache is still valid
            if (ttl !== null) {
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
     * Returns null if cache doesn't exist
     */
    static getAge(url) {
        try {
            const cacheKey = this.getCacheKey(url);
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
     */
    static isStale(url, ttl) {
        const age = this.getAge(url);
        if (age === null) return true;
        return age > ttl;
    }

    /**
     * Set cached data for a URL
     */
    static set(url, data) {
        try {
            const cacheKey = this.getCacheKey(url);
            const cacheData = {
                timestamp: Date.now(),
                url: url,
                data: data
            };

            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('[Cache] SET error:', error);
        }
    }

}

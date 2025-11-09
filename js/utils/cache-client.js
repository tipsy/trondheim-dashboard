// Cache Client for Trondheim Dashboard
// Centralized caching with TTL support

class CacheClient {
    static CACHE_KEY_PREFIX = 'trondheim-cache-';

    /**
     * Generate a cache key from a URL
     */
    static getCacheKey(url) {
        // Create a simple hash of the URL for the cache key
        return `${this.CACHE_KEY_PREFIX}${btoa(url).substring(0, 50)}`;
    }

    /**
     * Get cached data for a URL
     * Returns null if cache doesn't exist or is expired
     */
    static get(url, ttl = null) {
        try {
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
     * Check if cached data exists and is valid
     */
    static has(url, ttl = null) {
        return this.get(url, ttl) !== null;
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

    /**
     * Remove cached data for a URL
     */
    static remove(url) {
        try {
            const cacheKey = this.getCacheKey(url);
            localStorage.removeItem(cacheKey);
            console.log(`Cache removed for ${url}`);
        } catch (error) {
            console.error('Cache remove error:', error);
        }
    }

    /**
     * Clear all cache entries
     */
    static clearAll() {
        try {
            const keys = Object.keys(localStorage);
            const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
            
            cacheKeys.forEach(key => localStorage.removeItem(key));
            console.log(`Cleared ${cacheKeys.length} cache entries`);
        } catch (error) {
            console.error('Cache clear error:', error);
        }
    }

    /**
     * Get cache statistics
     */
    static getStats() {
        try {
            const keys = Object.keys(localStorage);
            const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
            
            let totalSize = 0;
            const entries = cacheKeys.map(key => {
                const value = localStorage.getItem(key);
                const size = value ? value.length : 0;
                totalSize += size;
                
                try {
                    const data = JSON.parse(value);
                    return {
                        key: key,
                        url: data.url,
                        age: Date.now() - data.timestamp,
                        size: size
                    };
                } catch (e) {
                    return null;
                }
            }).filter(e => e !== null);
            
            return {
                count: cacheKeys.length,
                totalSize: totalSize,
                entries: entries
            };
        } catch (error) {
            console.error('Cache stats error:', error);
            return { count: 0, totalSize: 0, entries: [] };
        }
    }
}


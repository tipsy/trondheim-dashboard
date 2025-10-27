// API Base Class - Centralized API utilities for Trondheim Dashboard
// Provides common functionality for all API classes

class APIBase {
    // Rate limiting: track last request time per API
    static lastRequestTimes = new Map();
    static minRequestInterval = 1000; // Minimum 1 second between requests

    /**
     * Fetch with timeout to prevent hanging on slow connections
     * @param {string} url - URL to fetch
     * @param {object} options - Fetch options
     * @param {number} timeout - Timeout in milliseconds (default: 10000)
     * @returns {Promise<Response>} Fetch response
     */
    static async fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please check your internet connection');
            }
            throw error;
        }
    }

    /**
     * Rate-limited fetch - ensures minimum time between requests
     * @param {string} apiName - Name of the API (for rate limiting tracking)
     * @param {string} url - URL to fetch
     * @param {object} options - Fetch options
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Response>} Fetch response
     */
    static async rateLimitedFetch(apiName, url, options = {}, timeout = 10000) {
        // Rate limiting: ensure minimum time between requests
        const now = Date.now();
        const lastRequestTime = this.lastRequestTimes.get(apiName) || 0;
        const timeSinceLastRequest = now - lastRequestTime;
        
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Update last request time
        this.lastRequestTimes.set(apiName, Date.now());

        return this.fetchWithTimeout(url, options, timeout);
    }

    /**
     * Handle common API errors and provide user-friendly messages
     * @param {Error} error - Error object
     * @param {string} defaultMessage - Default error message
     * @returns {Error} Error with user-friendly message
     */
    static handleError(error, defaultMessage = 'An error occurred') {
        console.error('API Error:', error);

        // Handle specific error types with user-friendly messages
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
            return new Error('Request timed out. Please check your internet connection and try again.');
        }

        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
            return new Error('Network error. Please check your internet connection.');
        }

        if (error.message.includes('404')) {
            return new Error('Resource not found. Please try again.');
        }

        if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
            return new Error('Server error. Please try again later.');
        }

        // Return original error message or default
        return new Error(error.message || defaultMessage);
    }

    /**
     * Fetch JSON data with error handling
     * @param {string} apiName - Name of the API (for rate limiting)
     * @param {string} url - URL to fetch
     * @param {object} options - Fetch options
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<any>} JSON response data
     */
    static async fetchJSON(apiName, url, options = {}, timeout = 10000) {
        try {
            const response = await this.rateLimitedFetch(apiName, url, options, timeout);

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch data');
        }
    }

    /**
     * Fetch GraphQL data with error handling
     * @param {string} apiName - Name of the API (for rate limiting)
     * @param {string} url - GraphQL endpoint URL
     * @param {string} query - GraphQL query
     * @param {object} variables - GraphQL variables
     * @param {object} headers - Additional headers
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<any>} GraphQL response data
     */
    static async fetchGraphQL(apiName, url, query, variables = {}, headers = {}, timeout = 10000) {
        try {
            const response = await this.rateLimitedFetch(
                apiName,
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    body: JSON.stringify({ query, variables })
                },
                timeout
            );

            if (!response.ok) {
                throw new Error(`GraphQL API returned ${response.status}`);
            }

            const data = await response.json();

            if (data.errors) {
                console.error('GraphQL errors:', data.errors);
                throw new Error('GraphQL query failed');
            }

            return data;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch GraphQL data');
        }
    }
}


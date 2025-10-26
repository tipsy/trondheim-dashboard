// Geocoding API utilities for Trondheim Dashboard
// Using Nominatim (OpenStreetMap) for geocoding

class GeocodingAPI {
    /**
     * Fetch with timeout to prevent hanging on slow connections
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
     * Geocoding utility using Nominatim (OpenStreetMap)
     * Returns multiple results for better address matching
     */
    static async geocodeAddress(address, limit = 5) {
        try {
            // Try with Trondheim context first
            let encodedAddress = encodeURIComponent(`${address}, Trondheim, Norway`);
            let response = await this.fetchWithTimeout(
                `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=${limit}&countrycodes=no`,
                {
                    headers: {
                        'User-Agent': 'TrondheimDashboard/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Geocoding API returned ${response.status}`);
            }

            let data = await response.json();

            // If no results with Trondheim context, try without it
            if (!data || data.length === 0) {
                encodedAddress = encodeURIComponent(`${address}, Norway`);
                response = await this.fetchWithTimeout(
                    `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=${limit}&countrycodes=no`,
                    {
                        headers: {
                            'User-Agent': 'TrondheimDashboard/1.0'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`Geocoding API returned ${response.status}`);
                }

                data = await response.json();
            }

            if (!data || data.length === 0) {
                throw new Error('No results found. Try a different address or use "Use Location" button.');
            }

            // Transform results to consistent format
            return data.map(result => ({
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                displayName: result.display_name,
                type: result.type,
                importance: result.importance
            }));
        } catch (error) {
            console.error('Error geocoding address:', error);

            // Handle specific error types with user-friendly messages
            if (error.name === 'AbortError' || error.message.includes('timeout')) {
                throw new Error('Request timed out. Please check your internet connection and try again.');
            }

            if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
                throw new Error('Network error. Please check your internet connection.');
            }

            if (error.message.includes('No results found')) {
                throw error; // Pass through our custom message
            }

            // For API errors, provide helpful message
            if (error.message.includes('Geocoding API returned')) {
                throw new Error('Geocoding service is temporarily unavailable. Please try again later.');
            }

            // Generic fallback
            throw new Error('Could not find address. Please try a different search term.');
        }
    }

    /**
     * Reverse geocoding - get address from coordinates
     */
    static async reverseGeocode(lat, lon) {
        try {
            const response = await this.fetchWithTimeout(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
                {
                    headers: {
                        'User-Agent': 'TrondheimDashboard/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Reverse geocoding API returned ${response.status}`);
            }

            const data = await response.json();

            if (data && data.display_name) {
                return data.display_name;
            }

            // Fallback to coordinates if no address found
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            // Return coordinates as fallback
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
    }

    /**
     * Get user's current location with timeout
     */
    static async getCurrentLocation(timeout = 10000) {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            const timeoutId = setTimeout(() => {
                reject(new Error('Location request timeout - please try again'));
            }, timeout);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    clearTimeout(timeoutId);
                    let errorMessage = 'Could not get your location';

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied - please enable in browser settings';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timeout';
                            break;
                    }

                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: timeout - 1000, // Slightly less than our timeout
                    maximumAge: 30000 // Accept cached position up to 30 seconds old
                }
            );
        });
    }
}


// Geocoding API utilities for Trondheim Dashboard
// Using Nominatim (OpenStreetMap) for geocoding

class GeocodingAPI extends APIBase {

    /**
     * Check if address is in Trøndelag county
     */
    static isInTrondelag(displayName) {
        const lowerName = displayName.toLowerCase();
        return lowerName.includes('trøndelag') ||
               lowerName.includes('trondelag') ||
               lowerName.includes('trondheim');
    }

    /**
     * Check if result has a street number (is a specific address)
     */
    static hasStreetNumber(result) {
        // Check if the address has a house number in the address object
        if (result.address && result.address.house_number) {
            return true;
        }

        // Also check the display name for patterns like "Street 123"
        // Match patterns like "1C," or "123," at the start of the display name
        const displayName = result.display_name;
        const hasNumberPattern = /^\d+[A-Za-z]?,\s/.test(displayName);

        return hasNumberPattern;
    }

    /**
     * Geocoding utility using Nominatim (OpenStreetMap)
     * Returns multiple results for better address matching
     * Filters to only show addresses in Trøndelag with street numbers
     */
    static async geocodeAddress(address, limit = 20) {
        try {
            // Only add region if not already present in the address
            let searchAddress = address;
            const lowerAddress = address.toLowerCase();
            if (!lowerAddress.includes('trøndelag') &&
                !lowerAddress.includes('trondelag') &&
                !lowerAddress.includes('norway') &&
                !lowerAddress.includes('norge')) {
                searchAddress = `${address}, Trøndelag, Norway`;
            }

            // Request more results since we'll filter them
            const encodedAddress = encodeURIComponent(searchAddress);
            const data = await this.fetchJSON(
                'geocoding',
                `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=${limit}&countrycodes=no&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'TrondheimDashboard/1.0'
                    }
                }
            );

            if (!data || data.length === 0) {
                throw new Error('No results found. Try a different address or use "Use Location" button.');
            }

            // Filter results to only include:
            // 1. Addresses in Trøndelag
            // 2. Addresses with street numbers (specific addresses)
            const filteredResults = data.filter(result => {
                const inTrondelag = this.isInTrondelag(result.display_name);
                const hasNumber = this.hasStreetNumber(result);
                return inTrondelag && hasNumber;
            });

            if (filteredResults.length === 0) {
                throw new Error('No specific addresses found in Trøndelag. Please include a street number.');
            }

            // Transform results to consistent format and limit to 5
            return filteredResults.slice(0, 5).map(result => ({
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                displayName: this.formatNorwegianAddress(result.display_name, result.address),
                type: result.type,
                importance: result.importance,
                address: result.address
            }));
        } catch (error) {
            // Pass through our custom messages
            if (error.message.includes('No results found') || error.message.includes('No specific addresses')) {
                throw error;
            }

            // Use base class error handling for other errors
            throw this.handleError(error, 'Could not find address. Please try a different search term.');
        }
    }

    /**
     * Format address in Norwegian style: "Street Number, Postcode City"
     * Example: "Persaunvegen 1C, 7045 Trondheim"
     */
    static formatNorwegianAddress(displayName, addressDetails) {
        try {
            // If we have address details from the API, use them
            if (addressDetails) {
                const road = addressDetails.road || '';
                const houseNumber = addressDetails.house_number || '';
                const postcode = addressDetails.postcode || '';
                const city = addressDetails.city || addressDetails.town || addressDetails.municipality || '';

                if (road && houseNumber && postcode && city) {
                    return `${road} ${houseNumber}, ${postcode} ${city}`;
                }
            }

            // Fallback: parse from display_name
            // Format: "1C, Persaunvegen, Dalen, Lerkehaug, Østbyen, Trondheim, Trøndelag, 7045, Norway"
            const parts = displayName.split(',').map(p => p.trim());

            // Try to find postcode (5 digits)
            const postcodeIndex = parts.findIndex(p => /^\d{4,5}$/.test(p));

            if (postcodeIndex >= 0 && parts.length > postcodeIndex + 1) {
                const postcode = parts[postcodeIndex];
                // City is usually after postcode, or before it
                const city = parts[postcodeIndex + 1] || parts[postcodeIndex - 1] || '';

                // Street is usually early in the list
                // Look for the first part that looks like a street name (not a number)
                let street = '';
                let houseNumber = '';

                for (let i = 0; i < Math.min(3, parts.length); i++) {
                    const part = parts[i];
                    // If it's just a number or number+letter, it's likely the house number
                    if (/^[\d]+[A-Za-z]?$/.test(part)) {
                        houseNumber = part;
                    } else if (!street && part.length > 2) {
                        // First non-number part is likely the street
                        street = part;
                    }
                }

                if (street && houseNumber && postcode && city) {
                    return `${street} ${houseNumber}, ${postcode} ${city}`;
                }
            }

            // If parsing failed, return original
            return displayName;
        } catch (error) {
            console.error('Error formatting Norwegian address:', error);
            return displayName;
        }
    }

    /**
     * Reverse geocoding - get address from coordinates
     */
    static async reverseGeocode(lat, lon) {
        try {
            const data = await this.fetchJSON(
                'reverse-geocoding',
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
                {
                    headers: {
                        'User-Agent': 'TrondheimDashboard/1.0'
                    }
                }
            );

            if (data && data.display_name) {
                return this.formatNorwegianAddress(data.display_name, data.address);
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
                            errorMessage = 'Location unavailable - check that Location Services are enabled in System Preferences/Settings';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timeout - please try again';
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


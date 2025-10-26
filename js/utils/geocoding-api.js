// Geocoding API utilities for Trondheim Dashboard
// Using Nominatim (OpenStreetMap) for geocoding

class GeocodingAPI {
    /**
     * Geocoding utility using Nominatim (OpenStreetMap)
     */
    static async geocodeAddress(address) {
        try {
            const encodedAddress = encodeURIComponent(`${address}, Trondheim, Norway`);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
                {
                    headers: {
                        'User-Agent': 'TrondheimDashboard/1.0'
                    }
                }
            );

            const data = await response.json();
            if (data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    displayName: data[0].display_name
                };
            }
            throw new Error('Address not found');
        } catch (error) {
            console.error('Error geocoding address:', error);
            throw error;
        }
    }

    /**
     * Get user's current location
     */
    static async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }
}


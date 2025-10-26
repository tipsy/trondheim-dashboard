// Weather API utilities for Trondheim Dashboard
// Using MET Norway Locationforecast API

class WeatherAPI {
    static async getWeatherForecast(lat, lon) {
        try {
            const response = await fetch(
                `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
                {
                    headers: {
                        'User-Agent': 'TrondheimDashboard/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching weather:', error);
            throw error;
        }
    }
}


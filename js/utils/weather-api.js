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

    static async getSunriseSunset(lat, lon) {
        try {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

            const response = await fetch(
                `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${dateStr}&formatted=0`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch sunrise/sunset data');
            }

            const data = await response.json();
            if (data.status !== 'OK') {
                throw new Error('Invalid sunrise/sunset response');
            }

            return {
                sunrise: new Date(data.results.sunrise),
                sunset: new Date(data.results.sunset),
                dayLength: data.results.day_length
            };
        } catch (error) {
            console.error('Error fetching sunrise/sunset:', error);
            throw error;
        }
    }
}


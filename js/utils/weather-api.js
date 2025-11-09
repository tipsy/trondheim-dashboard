// Weather API utilities for Trondheim Dashboard
// Using MET Norway Locationforecast API

class WeatherAPI extends APIBase {
    static async getWeatherForecast(lat, lon) {
        const apiUrl = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lon}`;

        return await this.fetchJSON(
            'weather',
            {
                url: apiUrl,
                options: { headers: { 'User-Agent': 'TrondheimDashboard/1.0' } },
                timeout: 10000,
                ttl: CacheConfig.WEATHER_TTL,
                useCorsProxy: true
            }
        );
    }

    static async getSunriseSunset(lat, lon) {
        try {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

            const data = await this.fetchJSON(
                'sunrise-sunset',
                {
                    url: `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${dateStr}&formatted=0`,
                    timeout: 10000,
                    ttl: CacheConfig.SUN_TTL
                }
            );

            if (data.status !== 'OK') {
                throw new Error('Invalid sunrise/sunset response');
            }

            return {
                sunrise: new Date(data.results.sunrise),
                sunset: new Date(data.results.sunset),
                dayLength: data.results.day_length
            };
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch sunrise/sunset data');
        }
    }
}

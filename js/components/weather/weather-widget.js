class WeatherWidget extends BaseWidget {
    constructor() {
        super();
        this.location = null;
    }

    async updateLocation(lat, lon) {
        this.location = { lat, lon };
        await this.loadWeather();
    }

    async loadWeather() {
        if (!this.location) return;

        this.showLoading(true);
        this.hideError();

        try {
            const [weatherData, sunData] = await Promise.all([
                WeatherAPI.getWeatherForecast(this.location.lat, this.location.lon),
                WeatherAPI.getSunriseSunset(this.location.lat, this.location.lon)
            ]);
            this.renderWeather(weatherData, sunData);
        } catch (error) {
            this.showError('Could not load weather data');
        } finally {
            this.showLoading(false);
        }
    }

    renderWeather(data, sunData) {
        const content = this.shadowRoot.getElementById('content');
        if (!content) return;

        if (!data || !data.properties || !data.properties.timeseries) {
            content.innerHTML = '<error-message message="No weather data available"></error-message>';
            return;
        }

        const timeseries = data.properties.timeseries;
        const currentData = timeseries[0];

        const currentTemp = currentData.data.instant.details.air_temperature;
        const currentSymbol = currentData.data.next_1_hours?.summary?.symbol_code || 'clearsky';
        const precipitation = currentData.data.next_1_hours?.details?.precipitation_amount || 0;
        const windSpeed = currentData.data.instant.details.wind_speed;

        // Format sunrise/sunset times
        const sunriseTime = sunData ? DateFormatter.formatTime24(sunData.sunrise) : '--:--';
        const sunsetTime = sunData ? DateFormatter.formatTime24(sunData.sunset) : '--:--';

        // Calculate daylight duration
        let daylightHours = '';
        if (sunData && sunData.dayLength) {
            daylightHours = DateFormatter.formatDuration(sunData.dayLength);
        }

        // Get next 24 hours (skip current hour)
        const next24Hours = timeseries.slice(1, 25);

        content.innerHTML = `
            <weather-current
                temperature="${currentTemp}"
                symbol-code="${currentSymbol}"
                precipitation="${precipitation}"
                wind-speed="${windSpeed}"
                ${sunData ? `sunrise="${sunriseTime}"` : ''}
                ${sunData ? `sunset="${sunsetTime}"` : ''}
                ${daylightHours ? `daylight="${daylightHours}"` : ''}>
            </weather-current>
            <div class="hourly-forecast">
                <h4>Next 24h</h4>
                <div class="hourly-container" id="forecast-container"></div>
            </div>
        `;

        // Create weather-hour components for all 24 hours
        const container = content.querySelector('#forecast-container');
        if (container) {
            next24Hours.forEach(hour => {
                const weatherHour = document.createElement('weather-hour');
                weatherHour.setAttribute('time', hour.time);
                weatherHour.setAttribute('temperature', hour.data.instant.details.air_temperature);
                weatherHour.setAttribute('symbol-code', hour.data.next_1_hours?.summary?.symbol_code || 'clearsky');
                container.appendChild(weatherHour);
            });
        }
    }

    // Override BaseWidget methods
    getTitle() {
        return 'Weather';
    }

    getIcon() {
        return IconLibrary.getIcon('weather');
    }

    getPlaceholderText() {
        return 'Enter address to see weather forecast';
    }

    afterRender() {
        // Add weather-specific styles to the shadow DOM
        const style = document.createElement('style');
        style.textContent = `
            .hourly-container {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: var(--spacing-sm);
                padding: var(--spacing-sm) 0;
            }

            /* Tablet: 6 columns */
            @media (min-width: 768px) and (max-width: 1024px) {
                .hourly-container {
                    grid-template-columns: repeat(6, 1fr);
                }
            }

            /* Desktop: 8 columns */
            @media (min-width: 1025px) {
                .hourly-container {
                    grid-template-columns: repeat(8, 1fr);
                }
            }
        `;
        this.shadowRoot.appendChild(style);
    }
}

customElements.define('weather-widget', WeatherWidget);


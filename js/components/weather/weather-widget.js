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

        // Get next 4 hours for detailed view (skip current hour)
        const next4Hours = timeseries.slice(1, 5);

        // Get remaining hours for period summary
        // Use hours 5-24 (next 20 hours after the first 4)
        const periodHours = timeseries.slice(5, 25);

        // Calculate aggregated data for the period
        let periodData = null;
        let periodLabel = 'Rest of day';

        if (periodHours.length > 0) {
            const temps = periodHours.map(h => h.data.instant.details.air_temperature);
            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);

            // Get most common weather symbol
            const symbols = periodHours
                .map(h => h.data.next_1_hours?.summary?.symbol_code)
                .filter(s => s);

            let mostCommonSymbol = 'clearsky';
            if (symbols.length > 0) {
                const symbolCounts = {};
                symbols.forEach(s => {
                    symbolCounts[s] = (symbolCounts[s] || 0) + 1;
                });
                mostCommonSymbol = Object.keys(symbolCounts).reduce((a, b) =>
                    symbolCounts[a] > symbolCounts[b] ? a : b
                );
            }

            // Sum precipitation
            const totalPrecipitation = periodHours.reduce((sum, h) => {
                return sum + (h.data.next_1_hours?.details?.precipitation_amount || 0);
            }, 0);

            // Determine the label based on time range
            const firstHour = new Date(periodHours[0].time);
            const lastHour = new Date(periodHours[periodHours.length - 1].time);
            const now = new Date();

            // Check if period extends to tomorrow
            if (firstHour.getDate() !== lastHour.getDate()) {
                periodLabel = 'Next 20 hours';
            } else if (firstHour.getDate() === now.getDate()) {
                periodLabel = `Rest of day (until ${lastHour.getHours()}:00)`;
            } else {
                periodLabel = 'Tomorrow';
            }

            periodData = {
                minTemp,
                maxTemp,
                symbolCode: mostCommonSymbol,
                precipitation: totalPrecipitation.toFixed(1),
                label: periodLabel
            };
        }

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
                <div class="hourly-container" id="forecast-container"></div>
            </div>
            ${periodData ? `
                <div class="period-forecast">
                    <div id="period-container"></div>
                </div>
            ` : ''}
        `;

        // Create weather-hour components for next 4 hours
        const container = content.querySelector('#forecast-container');
        if (container) {
            next4Hours.forEach(hour => {
                const weatherHour = document.createElement('weather-hour');
                weatherHour.setAttribute('time', hour.time);
                weatherHour.setAttribute('temperature', hour.data.instant.details.air_temperature);
                weatherHour.setAttribute('symbol-code', hour.data.next_1_hours?.summary?.symbol_code || 'clearsky');
                container.appendChild(weatherHour);
            });
        }

        // Create weather-period component
        if (periodData) {
            const periodContainer = content.querySelector('#period-container');
            if (periodContainer) {
                const weatherPeriod = document.createElement('weather-period');
                weatherPeriod.setAttribute('label', `${periodHours.length} hours`);
                weatherPeriod.setAttribute('min-temp', periodData.minTemp);
                weatherPeriod.setAttribute('max-temp', periodData.maxTemp);
                weatherPeriod.setAttribute('symbol-code', periodData.symbolCode);
                weatherPeriod.setAttribute('precipitation', periodData.precipitation);
                periodContainer.appendChild(weatherPeriod);
            }
        }
    }

    // Override BaseWidget methods
    getTitle() {
        return 'Weather';
    }

    getIcon() {
        return '<i class="mdi mdi-weather-partly-cloudy"></i>';
    }

    getPlaceholderText() {
        return 'Enter address to see weather forecast';
    }

    afterRender() {
        // Add weather-specific styles to the shadow DOM
        const style = document.createElement('style');
        style.textContent = `
            .hourly-forecast,
            .period-forecast {
                margin-top: var(--spacing-md);
            }

            .hourly-container {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: var(--spacing-sm);
            }

            /* Tablet and up: 4 columns for 4 hours */
            @media (min-width: 768px) {
                .hourly-container {
                    grid-template-columns: repeat(4, 1fr);
                }
            }
        `;
        this.shadowRoot.appendChild(style);
    }
}

customElements.define('weather-widget', WeatherWidget);


// Weather Today Widget - shows overall weather for the day

class WeatherToday extends BaseWidget {
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
            console.error('Weather Today error:', error);
            this.showError(`Could not load weather data: ${error.message || error}`);
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

        // Get next 24 hours of data for full day overview
        const next24Hours = timeseries.slice(0, 24);

        // Calculate min/max from hourly data (MET API doesn't provide full day aggregates)
        const temps = next24Hours.map(h => h.data.instant.details.air_temperature);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);

        // Get the most common weather symbol for the day
        const symbols = next24Hours
            .map(h => h.data.next_1_hours?.summary?.symbol_code || h.data.next_6_hours?.summary?.symbol_code)
            .filter(s => s);

        let symbolCode = 'clearsky';
        if (symbols.length > 0) {
            const symbolCounts = {};
            symbols.forEach(s => {
                symbolCounts[s] = (symbolCounts[s] || 0) + 1;
            });
            symbolCode = Object.keys(symbolCounts).reduce((a, b) =>
                symbolCounts[a] > symbolCounts[b] ? a : b
            );
        }

        // Sum precipitation for the day
        const totalPrecipitation = next24Hours.reduce((sum, h) => {
            return sum + (h.data.next_1_hours?.details?.precipitation_amount || 0);
        }, 0);

        const todayData = {
            minTemp,
            maxTemp,
            symbolCode,
            totalPrecipitation
        };

        // Format sunrise/sunset times
        const sunriseTime = sunData ? DateFormatter.formatTime24(sunData.sunrise) : '--:--';
        const sunsetTime = sunData ? DateFormatter.formatTime24(sunData.sunset) : '--:--';

        // Calculate daylight duration
        let daylightHours = '';
        if (sunData && sunData.dayLength) {
            daylightHours = DateFormatter.formatDuration(sunData.dayLength);
        }

        content.innerHTML = `
            <div class="today-overview">
                <div class="today-icon">${IconLibrary.getWeatherIcon(todayData.symbolCode, 80)}</div>
                <div class="today-temps">
                    <div class="temp-high">${Math.round(todayData.maxTemp)}°</div>
                    <div class="temp-low">${Math.round(todayData.minTemp)}°</div>
                </div>
            </div>
            <div class="today-details">
                <div class="detail-row">
                    <i class="mdi mdi-weather-rainy"></i>
                    <span class="detail-label">Precipitation</span>
                    <span class="detail-value">${todayData.totalPrecipitation.toFixed(1)} mm</span>
                </div>
                ${sunData ? `
                    <div class="detail-row">
                        <i class="mdi mdi-weather-sunset-up"></i>
                        <span class="detail-label">Sunrise</span>
                        <span class="detail-value">${sunriseTime}</span>
                    </div>
                    <div class="detail-row">
                        <i class="mdi mdi-weather-sunset-down"></i>
                        <span class="detail-label">Sunset</span>
                        <span class="detail-value">${sunsetTime}</span>
                    </div>
                ` : ''}
                ${daylightHours ? `
                    <div class="detail-row">
                        <i class="mdi mdi-white-balance-sunny"></i>
                        <span class="detail-label">Daylight</span>
                        <span class="detail-value">${daylightHours}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Override BaseWidget methods
    getTitle() {
        return 'Today';
    }

    getIcon() {
        return '<i class="mdi mdi-calendar-today"></i>';
    }

    getPlaceholderText() {
        return 'Enter address to see today\'s weather';
    }

    afterRender() {
        // Add weather-specific styles to the shadow DOM
        const style = document.createElement('style');
        style.textContent = `
            .today-overview {
                display: flex;
                align-items: center;
                gap: var(--spacing-lg);
                padding: var(--spacing-md) 0;
                border-bottom: 1px solid var(--border-color);
            }

            .today-icon {
                display: inline-flex;
                font-size: 80px;
                color: var(--text-alt, var(--text-color));
            }

            .today-temps {
                display: flex;
                align-items: baseline;
                gap: var(--spacing-md);
            }

            .temp-high {
                font-size: 48px;
                font-weight: bold;
                color: var(--text-alt, var(--text-color));
            }

            .temp-low {
                font-size: 32px;
                font-weight: normal;
                color: var(--text-light);
            }

            .today-details {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
                padding: var(--spacing-md) 0;
            }

            .detail-row {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                font-size: var(--font-size-base);
            }

            .detail-row i {
                font-size: 24px;
                color: var(--text-light);
                width: 24px;
                flex-shrink: 0;
            }

            .detail-label {
                color: var(--text-light);
                flex: 1;
            }

            .detail-value {
                color: var(--text-alt, var(--text-color));
                font-weight: 500;
            }
        `;
        this.shadowRoot.appendChild(style);
    }
}

customElements.define('weather-today', WeatherToday);

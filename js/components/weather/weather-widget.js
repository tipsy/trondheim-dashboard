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
            const weatherData = await WeatherAPI.getWeatherForecast(
                this.location.lat,
                this.location.lon
            );
            this.renderWeather(weatherData);
        } catch (error) {
            this.showError('Could not load weather data');
        } finally {
            this.showLoading(false);
        }
    }

    getWeatherIcon(symbolCode) {
        const iconMap = {
            'clearsky': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>`,
            'fair': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>`,
            'partlycloudy': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
            </svg>`,
            'cloudy': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
            </svg>`,
            'rain': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M12 17v5m-4-3v3m8-3v3"/>
            </svg>`,
            'lightrain': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M12 17v3m-4-2v2m8-2v2"/>
            </svg>`,
            'heavyrain': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M12 17v5m-4-3v5m8-3v5"/>
            </svg>`,
            'snow': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M12 17l-2 2m2-2l2 2m-2-2v4m-4-4l-1 1m1-1l1 1m-1-1v2m8-2l1 1m-1-1l-1 1m1-1v2"/>
            </svg>`,
            'sleet': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M12 17v3m-4-2l-1 1m9-1l1 1"/>
            </svg>`,
            'fog': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 15h18M3 19h18M3 11h18" opacity="0.5"/>
            </svg>`,
            'thunder': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M13 11l-4 6h3l-1 4 4-6h-3l1-4z"/>
            </svg>`
        };

        for (const [key, icon] of Object.entries(iconMap)) {
            if (symbolCode && symbolCode.includes(key)) {
                return icon;
            }
        }
        return iconMap['fair'];
    }

    renderWeather(data) {
        const content = this.shadowRoot.getElementById('content');
        if (!content) return;

        if (!data || !data.properties || !data.properties.timeseries) {
            content.innerHTML = '<p class="no-data">No weather data available</p>';
            return;
        }

        const timeseries = data.properties.timeseries;
        const currentData = timeseries[0];

        const currentTemp = currentData.data.instant.details.air_temperature;
        const currentSymbol = currentData.data.next_1_hours?.summary?.symbol_code || 'clearsky';
        const precipitation = currentData.data.next_1_hours?.details?.precipitation_amount || 0;
        const windSpeed = currentData.data.instant.details.wind_speed;

        // Split next 24 hours into 3 groups of 8 hours each
        const next24Hours = timeseries.slice(1, 25); // Skip current hour, get next 24

        const groups = [];
        for (let i = 0; i < 3; i++) {
            const groupData = next24Hours.slice(i * 8, (i + 1) * 8);
            if (groupData.length > 0) {
                groups.push(groupData);
            }
        }

        // Helper function to format group label
        const formatGroupLabel = (groupData) => {
            if (groupData.length === 0) return '';
            const firstHour = new Date(groupData[0].time);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[firstHour.getDay()];
            const date = firstHour.getDate();
            const month = firstHour.getMonth() + 1;
            return `${dayName} ${month}/${date}`;
        };

        content.innerHTML = `
            <div class="current-weather">
                <div class="current-icon">${this.getWeatherIcon(currentSymbol)}</div>
                <div class="current-temp">${Math.round(currentTemp)}°C</div>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
                        </svg>
                        Precipitation:
                    </span>
                    <span class="detail-value">${precipitation} mm</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/>
                        </svg>
                        Wind:
                    </span>
                    <span class="detail-value">${windSpeed} m/s</span>
                </div>
            </div>
            ${groups.map((groupData, index) => `
                <div class="hourly-forecast">
                    <h4>${formatGroupLabel(groupData)}</h4>
                    <div class="hourly-container" id="group-container-${index}"></div>
                </div>
            `).join('')}
        `;

        // Create weather-hour components for each group
        groups.forEach((groupData, index) => {
            const container = content.querySelector(`#group-container-${index}`);
            if (container) {
                groupData.forEach(hour => {
                    const weatherHour = document.createElement('weather-hour');
                    weatherHour.setAttribute('time', hour.time);
                    weatherHour.setAttribute('temperature', hour.data.instant.details.air_temperature);
                    weatherHour.setAttribute('symbol-code', hour.data.next_1_hours?.summary?.symbol_code || 'clearsky');
                    container.appendChild(weatherHour);
                });
            }
        });
    }

    // Override BaseWidget methods
    getTitle() {
        return 'Weather';
    }

    getIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>`;
    }

    getPlaceholderText() {
        return 'Enter address to see weather forecast';
    }

    afterRender() {
        // Add weather-specific styles to the shadow DOM
        const style = document.createElement('style');
        style.textContent = `
            .current-weather {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-md);
                padding: var(--spacing-lg) 0;
            }

            .current-icon {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .current-temp {
                font-size: var(--font-size-xxl);
                font-weight: bold;
                color: var(--text-color);
            }

            .weather-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--spacing-md);
                padding: var(--spacing-md);
                background-color: var(--alt-background);
                border-radius: var(--border-radius);
                margin-bottom: var(--spacing-md);
            }

            .detail-item {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
            }

            .detail-label {
                font-size: var(--font-size-xs);
                color: var(--text-light);
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
            }

            .detail-value {
                font-size: var(--font-size-md);
                font-weight: bold;
                color: var(--text-color);
            }

            .hourly-container {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: var(--spacing-sm);
                padding: var(--spacing-sm) 0;
            }
        `;
        this.shadowRoot.appendChild(style);
    }
}

customElements.define('weather-widget', WeatherWidget);


// Weather Right Now Widget - shows current weather and next 4 hours

import { BaseWidget } from '../common/base-widget.js';
import { html } from 'lit';
import { WeatherAPI } from '../../utils/weather-api.js';
import { IconLibrary } from '../../utils/icon-library.js';

class WeatherRightNow extends BaseWidget {
    constructor() {
        super();
        this._usesInnerHTML = true; // This widget uses innerHTML for rendering
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
            const weatherData = await WeatherAPI.getWeatherForecast(this.location.lat, this.location.lon);
            this.renderWeather(weatherData);
        } catch (error) {
            console.error('Weather Right Now error:', error);
            this.showError(`Could not load weather data: ${error.message || error}`);
        } finally {
            this.showLoading(false);
        }
    }

    renderWeather(data) {
        const content = this.getContentElement();
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

        // Get next 4 hours for detailed view (skip current hour)
        const next4Hours = timeseries.slice(1, 5);

        content.innerHTML = `
            <div class="current-weather">
                <div class="current-icon">${IconLibrary.getWeatherIcon(currentSymbol, 80)}</div>
                <div class="current-temp">${Math.round(parseFloat(currentTemp))}°C</div>
            </div>
            <div class="current-details">
                <div class="detail-item">
                    <i class="mdi mdi-weather-rainy"></i>
                    <span>${precipitation} mm</span>
                </div>
                <div class="detail-item">
                    <i class="mdi mdi-weather-windy"></i>
                    <span>${windSpeed} m/s</span>
                </div>
            </div>
            <div class="hourly-forecast">
                <div class="hourly-container" id="forecast-container"></div>
            </div>
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
    }

    // Override BaseWidget methods
    getTitle() {
        return 'Right Now';
    }

    getIcon() {
        return html`<i class="mdi mdi-weather-partly-cloudy"></i>`;
    }

    getPlaceholderText() {
        return 'Enter address to see current weather';
    }

    afterRender() {
        // Add weather-specific styles to the shadow DOM
        const style = document.createElement('style');
        style.textContent = `
            .current-weather {
                display: flex;
                align-items: center;
                gap: var(--spacing-lg);
                padding: var(--spacing-md) 0;
            }

            .current-icon {
                display: inline-flex;
                font-size: 80px;
                color: var(--text-alt, var(--text-color));
            }

            .current-temp {
                font-size: 64px;
                font-weight: bold;
                color: var(--text-alt, var(--text-color));
            }

            .current-details {
                display: flex;
                gap: var(--spacing-lg);
                padding: var(--spacing-md) 0;
                border-bottom: 1px solid var(--border-color);
            }

            .detail-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-size: var(--font-size-base);
                color: var(--text-light);
            }

            .detail-item i {
                font-size: 24px;
            }

            .hourly-forecast {
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

customElements.define('weather-right-now', WeatherRightNow);

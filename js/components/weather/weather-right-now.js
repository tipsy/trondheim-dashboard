// Weather Right Now Widget - shows current weather and next 4 hours

import { BaseWidget } from '../common/base-widget.js';
import { html, css } from 'lit';
import { WeatherAPI } from '../../utils/weather-api.js';
import { IconLibrary } from '../../utils/icon-library.js';
import './weather-hour.js';

class WeatherRightNow extends BaseWidget {
    static properties = {
        ...BaseWidget.properties,
        currentWeather: { type: Object, state: true },
        hourlyForecast: { type: Array, state: true }
    };

    constructor() {
        super();
        this.currentWeather = null;
        this.hourlyForecast = [];
        this.location = null;
    }

    static styles = [
        ...BaseWidget.styles,
        css`
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
                font-weight: 700;
                color: var(--text-color);
            }

            .current-details {
                display: flex;
                gap: var(--spacing-md);
                padding: var(--spacing-md) 0;
                border-bottom: 1px solid var(--border-color);
            }

            .detail-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                color: var(--text-light);
                font-weight: 400;
            }

            .detail-item i {
                font-size: 24px;
                color: var(--text-light);
            }

            .hourly-forecast {
                margin-top: var(--spacing-md);
            }

            .hourly-container {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: var(--spacing-sm);
            }
        `
    ];

    async updateLocation(lat, lon) {
        this.location = { lat, lon };
        await this.loadWeather();
    }

    async loadWeather() {
        if (!this.location) return;

        this.showLoading(true);

        try {
            const weatherData = await WeatherAPI.getWeatherForecast(this.location.lat, this.location.lon);
            this.processWeather(weatherData);
        } catch (error) {
            console.error('Weather Right Now error:', error);
            this.showError(`Could not load weather data: ${error.message || error}`);
        } finally {
            this.showLoading(false);
        }
    }

    processWeather(data) {
        if (!data || !data.properties || !data.properties.timeseries) {
            this.currentWeather = null;
            this.hourlyForecast = [];
            return;
        }

        const timeseries = data.properties.timeseries;
        const currentData = timeseries[0];

        this.currentWeather = {
            temperature: currentData.data.instant.details.air_temperature,
            symbolCode: currentData.data.next_1_hours?.summary?.symbol_code || 'clearsky',
            precipitation: currentData.data.next_1_hours?.details?.precipitation_amount || 0,
            windSpeed: currentData.data.instant.details.wind_speed
        };

        // Get next 4 hours for detailed view (skip current hour)
        this.hourlyForecast = timeseries.slice(1, 5).map(hour => ({
            time: hour.time,
            temperature: hour.data.instant.details.air_temperature,
            symbolCode: hour.data.next_1_hours?.summary?.symbol_code || 'clearsky'
        }));
    }

    renderContent() {
        if (!this.currentWeather) {
            return html`<p class="no-data">No weather data available</p>`;
        }

        const iconClass = IconLibrary.getWeatherIconClass(this.currentWeather.symbolCode);

        return html`
            <div class="current-weather">
                <div class="current-icon">
                    <i class="mdi ${iconClass}" style="font-size: 80px;"></i>
                </div>
                <div class="current-temp">${Math.round(parseFloat(this.currentWeather.temperature))}°C</div>
            </div>
            <div class="current-details">
                <div class="detail-item">
                    <i class="mdi mdi-weather-rainy"></i>
                    <span>${this.currentWeather.precipitation} mm</span>
                </div>
                <div class="detail-item">
                    <i class="mdi mdi-weather-windy"></i>
                    <span>${this.currentWeather.windSpeed} m/s</span>
                </div>
            </div>
            <div class="hourly-forecast">
                <div class="hourly-container">
                    ${this.hourlyForecast.map(hour => html`
                        <weather-hour
                            time="${hour.time}"
                            temperature="${hour.temperature}"
                            symbol-code="${hour.symbolCode}">
                        </weather-hour>
                    `)}
                </div>
            </div>
        `;
    }

    // Override BaseWidget methods
    getTitle() {
        return 'Weather Now';
    }

    getIcon() {
        return html`<i class="mdi mdi-weather-partly-cloudy"></i>`;
    }

    getPlaceholderText() {
        return 'Enter address to see current weather';
    }
}

customElements.define('weather-right-now', WeatherRightNow);


// Weather Right Now Widget - shows current weather and next 4 hours

import { BaseWidget } from "../common/base-widget.js";
import { html, css } from "lit";
import { t } from "../../utils/localization.js";
import { WeatherAPI } from "../../utils/api/weather-api.js";
import { IconLibrary } from "../../utils/icon-library.js";
import "./weather-hour.js";

class WeatherRightNow extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    currentWeather: { type: Object, state: true },
    hourlyForecast: { type: Array, state: true },
  };

  constructor() {
    super();
    this.title = "Weather Now";
    this.icon = "mdi-weather-partly-cloudy";
    this.collapsible = true;
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
        color: var(--text-color);
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
        color: var(--text-muted);
        font-weight: 400;
      }

      .detail-item i {
        font-size: 24px;
        color: var(--text-muted);
      }

      .hourly-forecast {
        margin-top: var(--spacing-md);
      }

      .hourly-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--spacing-sm);
      }
    `,
  ];

  async updateLocation(lat, lon) {
    if (!lat || !lon) {
      this.location = null;
      this.currentWeather = null;
      return;
    }
    this.location = { lat, lon };
    await this.loadWeather();
  }

  async loadWeather() {
    if (!this.location?.lat || !this.location?.lon) return;

    const weatherData = await this.fetchData(
      () => WeatherAPI.getWeatherForecast(this.location.lat, this.location.lon),
      t("Could not load weather data"),
    );

    if (weatherData) {
      this.processWeather(weatherData);
    }
  }

  processWeather(data) {
    const timeseries = data?.properties?.timeseries;

    if (!timeseries?.length) {
      this.currentWeather = null;
      this.hourlyForecast = [];
      return;
    }

    const currentData = timeseries[0];

    this.currentWeather = {
      temperature: currentData.data.instant.details.air_temperature,
      symbolCode:
        currentData.data.next_1_hours?.summary?.symbol_code || "clearsky",
      precipitation:
        currentData.data.next_1_hours?.details?.precipitation_amount || 0,
      windSpeed: currentData.data.instant.details.wind_speed,
    };

    // Get next 4 hours (skip current hour)
    this.hourlyForecast = timeseries.slice(1, 5).map((hour) => ({
      time: hour.time,
      temperature: hour.data.instant.details.air_temperature,
      symbolCode: hour.data.next_1_hours?.summary?.symbol_code || "clearsky",
    }));
  }

  renderContent() {
    // If no location, return null to trigger BaseWidget placeholder
    if (!this.location?.lat || !this.location?.lon) {
      return null;
    }

    if (!this.currentWeather) {
      return html`<p class="no-data">${t("No weather data available")}</p>`;
    }

    const iconClass = IconLibrary.getWeatherIconClass(
      this.currentWeather.symbolCode,
    );

    return html`
      <div class="current-weather">
        <div class="current-icon">
          <i class="mdi ${iconClass}"></i>
        </div>
        <div class="current-temp">
          ${Math.round(this.currentWeather.temperature)}°C
        </div>
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
          ${this.hourlyForecast.map(
      (hour) => html`
              <weather-hour
                time="${hour.time}"
                temperature="${hour.temperature}"
                symbol-code="${hour.symbolCode}"
              >
              </weather-hour>
            `,
    )}
        </div>
      </div>
    `;
  }

  getPlaceholderText() {
    return t("Enter address to see current weather");
  }
}

customElements.define("weather-right-now", WeatherRightNow);

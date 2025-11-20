// Weather Today Widget - shows overall weather for the day

import { BaseWidget } from "../common/base-widget.js";
import { html, css } from "lit";
import { t } from '../../utils/localization.js';
import { WeatherAPI } from "../../utils/api/weather-api.js";
import { IconLibrary } from "../../utils/icon-library.js";
import { DateFormatter } from "../../utils/date-formatter.js";

class WeatherToday extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    todayData: { type: Object, state: true },
    sunData: { type: Object, state: true },
  };

  constructor() {
    super();
    this.title = "Weather Today";
    this.icon = "mdi-calendar-today";
    this.todayData = null;
    this.sunData = null;
    this.location = null;
  }


  static styles = [
    ...BaseWidget.styles,
    css`
      .today-overview {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        padding: var(--spacing-md) 0;
      }

      .today-icon {
        display: inline-flex;
        font-size: 80px;
        color: var(--text-alt, var(--text-color));
      }

      .today-temps {
        display: flex;
        gap: var(--spacing-md);
        align-items: center;
      }

      .temp-high {
        font-size: 48px;
        font-weight: 700;
        color: var(--text-color);
      }

      .temp-low {
        font-size: 32px;
        font-weight: 400;
        color: var(--text-light);
      }

      .today-details {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        padding: var(--spacing-md) 0;
        border-top: 1px solid var(--border-color);
      }

      .detail-row {
        display: grid;
        grid-template-columns: 24px 1fr auto;
        gap: var(--spacing-sm);
        align-items: center;
      }

      .detail-row i {
        font-size: 24px;
        color: var(--text-light);
      }

      .detail-label {
        color: var(--text-light);
      }

      .detail-value {
        font-weight: 400;
        color: var(--text-light);
      }
    `,
  ];

  async updateLocation(lat, lon) {
    this.location = { lat, lon };
    await this.loadWeather();
  }

  async loadWeather() {
    if (!this.location) return;

    const result = await this.fetchData(async () => {
      return await Promise.all([
        WeatherAPI.getWeatherForecast(this.location.lat, this.location.lon),
        WeatherAPI.getSunriseSunset(this.location.lat, this.location.lon),
      ]);
    }, t("Could not load weather data"));

    if (result) {
      const [weatherData, sunData] = result;
      this.processWeather(weatherData, sunData);
    }
  }

  processWeather(data, sunData) {
    const timeseries = data?.properties?.timeseries;

    if (!timeseries?.length) {
      this.todayData = null;
      this.sunData = null;
      return;
    }

    // Get next 24 hours of data for full day overview
    const next24Hours = timeseries.slice(0, 24);

    // Calculate min/max from hourly data
    const temps = next24Hours.map((h) => h.data.instant.details.air_temperature);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);

    // Get the most common weather symbol for the day
    const symbols = next24Hours
      .map((h) => h.data.next_1_hours?.summary?.symbol_code || h.data.next_6_hours?.summary?.symbol_code)
      .filter(Boolean);

    const symbolCode = this.getMostCommonSymbol(symbols) || "clearsky";

    // Sum precipitation for the day
    const totalPrecipitation = next24Hours.reduce(
      (sum, h) => sum + (h.data.next_1_hours?.details?.precipitation_amount || 0),
      0
    );

    this.todayData = {
      minTemp,
      maxTemp,
      symbolCode,
      totalPrecipitation,
    };

    this.sunData = sunData;
  }

  getMostCommonSymbol(symbols) {
    if (!symbols.length) return null;

    const counts = symbols.reduce((acc, symbol) => {
      acc[symbol] = (acc[symbol] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  }

  renderContent() {
    if (!this.todayData) {
      return html`<p class="no-data">${t("No weather data available")}</p>`;
    }

    const iconClass = IconLibrary.getWeatherIconClass(
      this.todayData.symbolCode,
    );
    const sunriseTime = this.sunData
      ? DateFormatter.formatTime24(this.sunData.sunrise)
      : "--:--";
    const sunsetTime = this.sunData
      ? DateFormatter.formatTime24(this.sunData.sunset)
      : "--:--";
    const daylightHours =
      this.sunData && this.sunData.dayLength
        ? DateFormatter.formatDuration(this.sunData.dayLength)
        : "";

    return html`
      <div class="today-overview">
        <div class="today-icon">
          <i class="mdi ${iconClass}"></i>
        </div>
        <div class="today-temps">
          <div class="temp-high">${Math.round(this.todayData.maxTemp)}°</div>
          <div class="temp-low">${Math.round(this.todayData.minTemp)}°</div>
        </div>
      </div>
      <div class="today-details">
        <div class="detail-row">
          <i class="mdi mdi-weather-rainy"></i>
          <span class="detail-label">Precipitation</span>
          <span class="detail-value">${this.todayData.totalPrecipitation.toFixed(1)} mm</span>
        </div>
        ${this.sunData
          ? html`
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
            `
          : ""}
        ${daylightHours
          ? html`
              <div class="detail-row">
                <i class="mdi mdi-white-balance-sunny"></i>
                <span class="detail-label">Daylight</span>
                <span class="detail-value">${daylightHours}</span>
              </div>
            `
          : ""}
      </div>
    `;
  }

  getPlaceholderText() {
    return "Enter address to see today's weather";
  }
}

customElements.define("weather-today", WeatherToday);

import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";
import { IconLibrary } from "../../utils/icon-library.js";

class WeatherCurrent extends LitElement {
  static properties = {
    temperature: { type: Number },
    symbolCode: { type: String, attribute: "symbol-code" },
    precipitation: { type: Number },
    windSpeed: { type: Number, attribute: "wind-speed" },
    sunrise: { type: String },
    sunset: { type: String },
    daylight: { type: String },
  };

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .current-weather {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md, 16px);
        padding: var(--spacing-lg, 24px) 0;
      }

      .current-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 96px;
      }

      .current-temp {
        font-size: var(--font-size-xxl, 64px);
        font-weight: bold;
        color: var(--text-color);
      }

      .weather-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--spacing-md, 16px);
        padding: var(--spacing-md, 16px);
        background-color: var(--alt-background, #f9f9f9);
        border-radius: var(--border-radius, 8px);
        margin-bottom: var(--spacing-md, 16px);
      }
    `,
  ];

  firstUpdated() {
    adoptMDIStyles(this.shadowRoot);
  }

  render() {
    const iconClass = IconLibrary.getWeatherIconClass(this.symbolCode);

    return html`
      <div class="current-weather">
        <div class="current-icon">
          <i class="mdi ${iconClass}"></i>
        </div>
        <div class="current-temp">${Math.round(this.temperature)}°C</div>
      </div>
      <div class="weather-details">
        <weather-detail
          icon="precipitation"
          label="Precipitation"
          value="${this.precipitation} mm"
        >
        </weather-detail>
        <weather-detail icon="wind" label="Wind" value="${this.windSpeed} m/s">
        </weather-detail>
        ${this.sunrise
          ? html`
              <weather-detail
                icon="sunrise"
                label="Sunrise"
                value="${this.sunrise}"
              >
              </weather-detail>
            `
          : ""}
        ${this.sunset
          ? html`
              <weather-detail
                icon="sunset"
                label="Sunset"
                value="${this.sunset}"
              >
              </weather-detail>
            `
          : ""}
        ${this.daylight
          ? html`
              <weather-detail
                icon="daylight"
                label="Daylight"
                value="${this.daylight}"
              >
              </weather-detail>
            `
          : ""}
      </div>
    `;
  }
}

customElements.define("weather-current", WeatherCurrent);

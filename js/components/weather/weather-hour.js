// Weather Hour Component - displays hourly weather forecast

import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";
import { IconLibrary } from "../../utils/icon-library.js";

class WeatherHour extends LitElement {
  static properties = {
    time: { type: String },
    temperature: { type: Number },
    symbolCode: { type: String, attribute: "symbol-code" },
  };

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .hour-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm);
        background-color: var(--alt-background);
        border-radius: var(--border-radius);
      }

      .hour-time {
        font-size: var(--font-size-sm);
        color: var(--text-light);
      }

      .hour-icon {
        display: inline-flex;
        font-size: 32px;
      }

      .hour-temp {
        font-size: var(--font-size-lg);
        font-weight: bold;
        color: var(--text-alt, var(--text-color));
      }
    `,
  ];

  firstUpdated() {
    adoptMDIStyles(this.shadowRoot);
  }

  formatTime(isoString) {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    return `${hours}:00`;
  }

  render() {
    const timeDisplay = this.formatTime(this.time);
    const iconClass = IconLibrary.getWeatherIconClass(this.symbolCode);

    return html`
      <div class="hour-item">
        <div class="hour-time">${timeDisplay}</div>
        <div class="hour-icon">
          <i class="mdi ${iconClass}"></i>
        </div>
        <div class="hour-temp">${Math.round(this.temperature)}°</div>
      </div>
    `;
  }
}

customElements.define("weather-hour", WeatherHour);

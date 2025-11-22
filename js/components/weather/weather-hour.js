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
        background-color: var(--widget-subpart-background);
        border-radius: var(--border-radius);
      }

      .hour-time {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
      }

      .hour-icon {
        display: inline-flex;
        font-size: 32px;
      }

      .hour-temp {
        font-size: var(--font-size-lg);
        font-weight: bold;
        color: var(--text-color);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    adoptMDIStyles(this.shadowRoot);
  }

  formatTime(isoString) {
    return new Date(isoString).toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

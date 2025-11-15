import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";

class WeatherDetail extends LitElement {
  static properties = {
    icon: { type: String },
    label: { type: String },
    value: { type: String },
  };

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs, 4px);
      }

      .detail-label {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs, 4px);
        font-size: 16px;
        color: var(--text-light, #666666);
        line-height: 1;
      }

      .detail-label i.mdi {
        font-size: 24px;
      }

      .detail-value {
        font-size: var(--font-size-md, 16px);
        font-weight: 600;
        color: var(--text-color, #333333);
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    adoptMDIStyles(this.shadowRoot);
  }

  getIconClass(iconName) {
    const icons = {
      precipitation: "mdi-water-outline",
      wind: "mdi-weather-windy",
      temperature: "mdi-thermometer",
      humidity: "mdi-water-percent",
      pressure: "mdi-gauge",
      sunrise: "mdi-weather-sunset-up",
      sunset: "mdi-weather-sunset-down",
      daylight: "mdi-clock-outline",
    };
    return icons[iconName] || "";
  }

  render() {
    return html`
      <div class="detail-item">
        <span class="detail-label">
          ${this.icon ? html`<i class="mdi ${this.getIconClass(this.icon)}"></i>` : ""}
          ${this.label}
        </span>
        <span class="detail-value">${this.value}</span>
      </div>
    `;
  }
}

customElements.define("weather-detail", WeatherDetail);

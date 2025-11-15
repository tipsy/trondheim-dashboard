import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../utils/shared-styles.js';

class WeatherDetail extends LitElement {
    static properties = {
        icon: { type: String },
        label: { type: String },
        value: { type: String }
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
    `];

    constructor() {
        super();
        this.icon = '';
        this.label = '';
        this.value = '';
    }

    getIcon(iconName) {
        const icons = {
            'precipitation': html`<i class="mdi mdi-water-outline"></i>`,
            'wind': html`<i class="mdi mdi-weather-windy"></i>`,
            'temperature': html`<i class="mdi mdi-thermometer"></i>`,
            'humidity': html`<i class="mdi mdi-water-percent"></i>`,
            'pressure': html`<i class="mdi mdi-gauge"></i>`,
            'sunrise': html`<i class="mdi mdi-weather-sunset-up"></i>`,
            'sunset': html`<i class="mdi mdi-weather-sunset-down"></i>`,
            'daylight': html`<i class="mdi mdi-clock-outline"></i>`
        };
        return icons[iconName] || '';
    }

    render() {
        return html`
            <div class="detail-item">
                <span class="detail-label">
                    ${this.icon ? html`<span class="icon">${this.getIcon(this.icon)}</span>` : ''}
                    ${this.label}
                </span>
                <span class="detail-value">${this.value}</span>
            </div>
        `;
    }
}

customElements.define('weather-detail', WeatherDetail);


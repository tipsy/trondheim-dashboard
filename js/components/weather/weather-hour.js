// Weather Hour Component - displays hourly weather forecast

class WeatherHour extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['time', 'temperature', 'symbol-code'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    get time() {
        return this.getAttribute('time') || '';
    }

    get temperature() {
        return this.getAttribute('temperature') || '';
    }

    get symbolCode() {
        return this.getAttribute('symbol-code') || '';
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        const hours = date.getHours().toString().padStart(2, '0');
        return `${hours}:00`;
    }

    render() {
        const timeDisplay = this.formatTime(this.time);
        const icon = IconLibrary.getWeatherIcon(this.symbolCode, 32);

        this.shadowRoot.innerHTML = `
            <style>
                ${IconLibrary.importCss}
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
            </style>

            <div class="hour-item">
                <div class="hour-time">${timeDisplay}</div>
                <div class="hour-icon">${icon}</div>
                <div class="hour-temp">${Math.round(this.temperature)}°</div>
            </div>
        `;
    }
}

customElements.define('weather-hour', WeatherHour);

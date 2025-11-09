class WeatherCurrent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['temperature', 'symbol-code', 'precipitation', 'wind-speed', 'sunrise', 'sunset', 'daylight'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const temperature = this.getAttribute('temperature') || '0';
        const symbolCode = this.getAttribute('symbol-code') || 'clearsky';
        const precipitation = this.getAttribute('precipitation') || '0';
        const windSpeed = this.getAttribute('wind-speed') || '0';
        const sunrise = this.getAttribute('sunrise') || '';
        const sunset = this.getAttribute('sunset') || '';
        const daylight = this.getAttribute('daylight') || '';

        this.shadowRoot.innerHTML = `
            <style>
                ${IconLibrary.importCss}
                * {
                    box-sizing: border-box;
                }

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
            </style>

            <div class="current-weather">
                <div class="current-icon">${IconLibrary.getWeatherIcon(symbolCode, 96)}</div>
                <div class="current-temp">${Math.round(parseFloat(temperature))}°C</div>
            </div>
            <div class="weather-details">
                <detail-item
                    icon="precipitation"
                    label="Precipitation"
                    value="${precipitation} mm">
                </detail-item>
                <detail-item
                    icon="wind"
                    label="Wind"
                    value="${windSpeed} m/s">
                </detail-item>
                ${sunrise ? `
                    <detail-item
                        icon="sunrise"
                        label="Sunrise"
                        value="${sunrise}">
                    </detail-item>
                ` : ''}
                ${sunset ? `
                    <detail-item
                        icon="sunset"
                        label="Sunset"
                        value="${sunset}">
                    </detail-item>
                ` : ''}
                ${daylight ? `
                    <detail-item
                        icon="daylight"
                        label="Daylight"
                        value="${daylight}">
                    </detail-item>
                ` : ''}
            </div>
        `;
    }
}

customElements.define('weather-current', WeatherCurrent);

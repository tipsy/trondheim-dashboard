class WeatherCurrent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['temperature', 'symbol-code', 'precipitation', 'wind-speed'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    getWeatherIcon(symbolCode) {
        const iconMap = {
            'clearsky': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>`,
            'fair': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>`,
            'partlycloudy': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
            </svg>`,
            'cloudy': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
            </svg>`,
            'rain': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M12 17v5m-4-3v3m8-3v3"/>
            </svg>`,
            'lightrain': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M12 17v3m-4-2v2m8-2v2"/>
            </svg>`,
            'heavyrain': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M12 17v5m-4-3v5m8-3v5"/>
            </svg>`,
            'snow': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M12 17l-2 2m2-2l2 2m-2-2v4m-4-4l-1 1m1-1l1 1m-1-1v2m8-2l1 1m-1-1l-1 1m1-1v2"/>
            </svg>`,
            'sleet': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M12 17v3m-4-2l-1 1m9-1l1 1"/>
            </svg>`,
            'fog': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 15h18M3 19h18M3 11h18" opacity="0.5"/>
            </svg>`,
            'thunder': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <path d="M13 11l-4 6h3l-1 4 4-6h-3l1-4z"/>
            </svg>`
        };

        for (const [key, icon] of Object.entries(iconMap)) {
            if (symbolCode && symbolCode.includes(key)) {
                return icon;
            }
        }
        return iconMap['fair'];
    }

    render() {
        const temperature = this.getAttribute('temperature') || '0';
        const symbolCode = this.getAttribute('symbol-code') || 'clearsky';
        const precipitation = this.getAttribute('precipitation') || '0';
        const windSpeed = this.getAttribute('wind-speed') || '0';

        this.shadowRoot.innerHTML = `
            <style>
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
                    color: var(--text-color, #333333);
                }

                .weather-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-md, 16px);
                    padding: var(--spacing-md, 16px);
                    background-color: var(--alt-background, #f9f9f9);
                    border-radius: var(--border-radius, 8px);
                    margin-bottom: var(--spacing-md, 16px);
                }
            </style>

            <div class="current-weather">
                <div class="current-icon">${this.getWeatherIcon(symbolCode)}</div>
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
            </div>
        `;
    }
}

customElements.define('weather-current', WeatherCurrent);


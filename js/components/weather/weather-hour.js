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

    getWeatherIcon(symbolCode) {
        const code = symbolCode.replace(/_night|_day|_polartwilight/g, '');
        
        const icons = {
            clearsky: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>`,
            cloudy: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
            </svg>`,
            partlycloudy: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                <line x1="8" y1="2" x2="8" y2="4"/>
                <line x1="3" y1="7" x2="5" y2="7"/>
                <line x1="13" y1="2" x2="13" y2="4"/>
            </svg>`,
            rain: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 13v8m-8-8v8m4-10v8"/>
                <path d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25"/>
            </svg>`,
            snow: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="2" x2="12" y2="22"/>
                <path d="M17 5L7 19M7 5l10 14"/>
                <circle cx="12" cy="12" r="2"/>
            </svg>`,
            fog: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 15h18M3 9h18M3 21h18"/>
            </svg>`
        };

        if (code.includes('clearsky')) return icons.clearsky;
        if (code.includes('fair')) return icons.partlycloudy;
        if (code.includes('partlycloudy')) return icons.partlycloudy;
        if (code.includes('cloudy')) return icons.cloudy;
        if (code.includes('rain') || code.includes('drizzle') || code.includes('sleet')) return icons.rain;
        if (code.includes('snow')) return icons.snow;
        if (code.includes('fog')) return icons.fog;
        
        return icons.cloudy;
    }

    render() {
        const timeDisplay = this.formatTime(this.time);
        const icon = this.getWeatherIcon(this.symbolCode);

        this.shadowRoot.innerHTML = `
            <style>
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
                    font-size: var(--font-size-xs);
                    color: var(--text-light);
                }

                .hour-icon {
                    font-size: 24px;
                }

                .hour-temp {
                    font-size: var(--font-size-sm);
                    font-weight: bold;
                    color: var(--text-color);
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


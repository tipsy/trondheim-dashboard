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

        // Material Design Icons weather icons
        const icons = {
            clearsky: '<i class="mdi mdi-weather-sunny"></i>',
            partlycloudy: '<i class="mdi mdi-weather-partly-cloudy"></i>',
            cloudy: '<i class="mdi mdi-weather-cloudy"></i>',
            rain: '<i class="mdi mdi-weather-rainy"></i>',
            snow: '<i class="mdi mdi-weather-snowy"></i>',
            fog: '<i class="mdi mdi-weather-fog"></i>',
            thunder: '<i class="mdi mdi-weather-lightning"></i>'
        };

        if (code.includes('clearsky')) return icons.clearsky;
        if (code.includes('fair')) return icons.partlycloudy;
        if (code.includes('partlycloudy')) return icons.partlycloudy;
        if (code.includes('cloudy')) return icons.cloudy;
        if (code.includes('rain') || code.includes('drizzle') || code.includes('sleet')) return icons.rain;
        if (code.includes('snow')) return icons.snow;
        if (code.includes('fog')) return icons.fog;
        if (code.includes('thunder')) return icons.thunder;

        return icons.cloudy;
    }

    render() {
        const timeDisplay = this.formatTime(this.time);
        const icon = this.getWeatherIcon(this.symbolCode);

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


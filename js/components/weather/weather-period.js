// Weather Period Component - displays aggregated weather forecast for a time period

class WeatherPeriod extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['label', 'min-temp', 'max-temp', 'symbol-code', 'precipitation'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const label = this.getAttribute('label') || 'Period';
        const minTemp = this.getAttribute('min-temp') || '0';
        const maxTemp = this.getAttribute('max-temp') || '0';
        const symbolCode = this.getAttribute('symbol-code') || 'clearsky';
        const precipitation = this.getAttribute('precipitation') || '0';
        const icon = IconLibrary.getWeatherIcon(symbolCode, 40);

        this.shadowRoot.innerHTML = `
            <style>
                ${IconLibrary.importCss}
                :host {
                    display: block;
                }

                .period-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    justify-content: space-between; /* space out the four sections */
                    background-color: var(--alt-background);
                    border-radius: var(--border-radius);
                }

                /* Ensure each of the four child sections take equal width and center their content */
                .period-item > * {
                    flex: 1 1 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-width: 0; /* allow shrinking */
                }

                 .period-icon {
                     display: inline-flex;
                     font-size: 40px;
                 }

                /* temp-item reused for both High and Low sections */
                .temp-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center; /* center labels and values */
                    min-width: 48px;
                }

                .temp-label {
                    font-size: var(--font-size-xs);
                    color: var(--text-light);
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .temp-value {
                    font-size: var(--font-size-xl);
                    font-weight: bold;
                    color: var(--text-alt, var(--text-color));
                }

                 .period-details {
                     display: flex;
                     flex-direction: column;
                     gap: var(--spacing-xs);
                     text-align: center;
                     justify-content: center;
                 }

                 .detail-row {
                     display: flex;
                     align-items: center;
                     gap: var(--spacing-xs);
                     font-size: var(--font-size-sm);
                     color: var(--text-light);
                 }

                 .detail-icon {
                     font-size: 16px;
                 }

                 /* Responsive: stack sections vertically on narrow screens */
                 @media (max-width: 480px) {
                     .period-item {
                         flex-wrap: wrap;
                         justify-content: center;
                         text-align: center;
                     }

                     /* keep equal-width behavior but stack vertically */
                     .period-item > * {
                         width: 100%;
                         order: 0;
                     }
                     .period-icon { order: 1; }
                     .period-details { order: 2; }
                     .temp-item { min-width: auto; }
                 }
             </style>

             <div class="period-item">
                <div class="period-icon">${icon}</div>
                <div class="temp-high temp-item">
                    <div class="temp-label">High</div>
                    <div class="temp-value">${Math.round(parseFloat(maxTemp))}°</div>
                </div>
                <div class="temp-low temp-item">
                    <div class="temp-label">Low</div>
                    <div class="temp-value">${Math.round(parseFloat(minTemp))}°</div>
                </div>
                <div class="period-details">
                    ${parseFloat(precipitation) > 0 ? `
                        <div class="detail-row">
                            <i class="mdi mdi-weather-rainy detail-icon"></i>
                            <span>${precipitation} mm</span>
                        </div>
                    ` : `
                        <!-- empty to keep layout evenly spaced -->
                        <div style="opacity:0;">&nbsp;</div>
                    `}
                </div>
            </div>
         `;
     }
 }

 customElements.define('weather-period', WeatherPeriod);

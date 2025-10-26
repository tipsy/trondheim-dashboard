class TrondheimDashboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }

                .dashboard-content {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                    padding: var(--spacing-md, 16px);
                    gap: var(--spacing-md, 16px);
                }

                .address-section {
                    flex-shrink: 0;
                    display: flex;
                    gap: var(--spacing-md, 16px);
                    align-items: flex-start;
                }

                .address-section address-input {
                    flex: 1;
                }

                .address-section theme-selector {
                    flex-shrink: 0;
                    width: 200px;
                }

                .widgets-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr 1fr;
                    gap: var(--spacing-md, 16px);
                    flex: 1;
                    min-height: 0;
                }

                .widgets-grid > * {
                    height: 100%;
                    overflow: hidden;
                }

                @media (max-width: 1024px) {
                    .widgets-grid {
                        grid-template-columns: 1fr;
                        overflow-y: auto;
                    }

                    .widgets-grid > * {
                        height: auto;
                        overflow-y: visible;
                    }

                    h1 {
                        font-size: 24px;
                    }

                    .subtitle {
                        font-size: 12px;
                    }
                }

                .footer {
                    padding: var(--spacing-sm, 8px);
                    text-align: center;
                    color: var(--text-light, #666);
                    font-size: 11px;
                    border-top: 1px solid var(--border-color, #e0e0e0);
                    background-color: var(--card-background, #ffffff);
                    flex-shrink: 0;
                }

                .footer p {
                    margin: var(--spacing-xs, 4px) 0;
                }

                .footer a {
                    color: var(--primary-color, #0066cc);
                    text-decoration: none;
                }

                .footer a:hover {
                    text-decoration: underline;
                }

                .data-sources {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: var(--spacing-sm, 8px);
                    flex-wrap: wrap;
                }

                .data-source {
                    font-size: 11px;
                    color: var(--text-light, #666);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
            </style>

            <div class="dashboard-content">
                <div class="address-section">
                    <address-input id="address-input"></address-input>
                    <theme-selector></theme-selector>
                </div>

                <div class="widgets-grid">
                    <bus-widget id="bus-widget"></bus-widget>
                    <weather-widget id="weather-widget"></weather-widget>
                    <trash-widget id="trash-widget"></trash-widget>
                </div>
            </div>

            <div class="footer">
                <div class="data-sources">
                    <span class="data-source">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="6" width="18" height="12" rx="2"/>
                            <path d="M3 10h18M8 14h.01M16 14h.01"/>
                            <circle cx="8" cy="18" r="1"/>
                            <circle cx="16" cy="18" r="1"/>
                        </svg>
                        <a href="https://entur.no" target="_blank">Entur/ATB</a>
                    </span>
                    <span class="data-source">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"/>
                            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        <a href="https://yr.no" target="_blank">YR/MET</a>
                    </span>
                    <span class="data-source">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                        <a href="https://trv.no" target="_blank">TRV</a>
                    </span>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const addressInput = this.shadowRoot.getElementById('address-input');
        const busWidget = this.shadowRoot.getElementById('bus-widget');
        const weatherWidget = this.shadowRoot.getElementById('weather-widget');
        const trashWidget = this.shadowRoot.getElementById('trash-widget');

        // Listen for location updates from address input
        addressInput.addEventListener('location-updated', (event) => {
            const { lat, lon, address } = event.detail;
            
            // Update all widgets with the new location
            busWidget.updateLocation(lat, lon);
            weatherWidget.updateLocation(lat, lon);
            
            // Trash widget needs the address string
            if (address) {
                trashWidget.updateAddress(address);
            }
        });
    }
}

customElements.define('trondheim-dashboard', TrondheimDashboard);


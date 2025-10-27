class TrondheimDashboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.refreshInterval = null;
        this.currentLocation = null;
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.loadURLParameters();
        this.startAutoRefresh();
    }

    disconnectedCallback() {
        // Clean up interval when component is removed
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                }

                :host {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }

                .dashboard-content {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    padding: var(--spacing-sm, 8px);
                    gap: var(--spacing-sm, 8px);
                }

                /* Larger padding on desktop */
                @media (min-width: 768px) {
                    .dashboard-content {
                        padding: var(--spacing-md, 16px);
                        gap: var(--spacing-md, 16px);
                    }
                }

                .address-section {
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md, 16px);
                }

                .address-section address-input {
                    width: 100%;
                }

                .address-section theme-selector {
                    width: 100%;
                }

                .widgets-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--spacing-md, 16px);
                }

                .right-column {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md, 16px);
                }

                /* Desktop layout */
                @media (min-width: 1025px) {
                    :host {
                        height: 100vh;
                        overflow: hidden;
                    }

                    .dashboard-content {
                        overflow: hidden;
                        display: grid;
                        grid-template-columns: 1fr 2fr 1fr;
                        grid-template-rows: auto 1fr;
                        gap: var(--spacing-md, 16px);
                    }

                    .address-section {
                        grid-column: 1 / -1;
                        display: grid;
                        grid-template-columns: subgrid;
                        gap: var(--spacing-md, 16px);
                        align-items: flex-start;
                    }

                    .address-section address-input {
                        grid-column: 1 / 3;
                        width: 100%;
                    }

                    .address-section theme-selector {
                        grid-column: 3;
                        width: 100%;
                    }

                    .widgets-grid {
                        grid-column: 1 / -1;
                        display: grid;
                        grid-template-columns: subgrid;
                        gap: var(--spacing-md, 16px);
                        min-height: 0;
                    }

                    .widgets-grid > * {
                        height: 100%;
                        overflow: hidden;
                    }

                    .right-column {
                        height: 100%;
                        min-height: 0;
                        overflow: hidden;
                    }

                    .right-column > energy-widget {
                        flex: 0 0 auto;
                        min-height: 0;
                        overflow: hidden;
                    }

                    .right-column > trash-widget {
                        flex: 1;
                        min-height: 0;
                        overflow: hidden;
                    }
                }

                /* Tablet layout */
                @media (min-width: 768px) and (max-width: 1024px) {
                    .widgets-grid {
                        grid-template-columns: 1fr 1fr;
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
                    <div class="right-column">
                        <energy-widget id="energy-widget"></energy-widget>
                        <trash-widget id="trash-widget"></trash-widget>
                    </div>
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
                    <span class="data-source">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        <a href="https://www.hvakosterstrommen.no" target="_blank">hvakosterstrommen.no</a>
                    </span>
                    <span class="data-source">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"/>
                            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        <a href="https://sunrise-sunset.org" target="_blank">sunrise-sunset.org</a>
                    </span>
                </div>
            </div>
        `;
    }

    loadURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);

        // Handle theme parameter
        const theme = urlParams.get('theme');
        if (theme) {
            const themeSelector = this.shadowRoot.querySelector('theme-selector');
            if (themeSelector) {
                // Set theme directly
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('trondheim-dashboard-theme', theme);
                // Update the selector to reflect the theme
                setTimeout(() => {
                    const select = themeSelector.shadowRoot.querySelector('custom-select');
                    if (select) {
                        select.setAttribute('selected', theme);
                    }
                }, 100);
            }
        }

        // Handle address parameter
        const address = urlParams.get('address');
        if (address) {
            const addressInput = this.shadowRoot.getElementById('address-input');
            if (addressInput) {
                // Wait a bit for the address input to be fully initialized
                setTimeout(() => {
                    const input = addressInput.shadowRoot.getElementById('address-input');
                    if (input) {
                        input.value = decodeURIComponent(address);
                        // Trigger search
                        addressInput.handleAddressSearch(true);
                    }
                }, 200);
            }
        }
    }

    attachEventListeners() {
        const addressInput = this.shadowRoot.getElementById('address-input');

        // Listen for location updates from address input
        addressInput.addEventListener('location-updated', (event) => {
            const { lat, lon, address } = event.detail;

            // Store current location for auto-refresh
            this.currentLocation = { lat, lon, address };

            // Update all widgets with the new location
            this.updateAllWidgets(lat, lon, address);
        });
    }

    updateAllWidgets(lat, lon, address) {
        const busWidget = this.shadowRoot.getElementById('bus-widget');
        const weatherWidget = this.shadowRoot.getElementById('weather-widget');
        const energyWidget = this.shadowRoot.getElementById('energy-widget');
        const trashWidget = this.shadowRoot.getElementById('trash-widget');

        if (busWidget) {
            busWidget.updateLocation(lat, lon);
        }

        if (weatherWidget) {
            weatherWidget.updateLocation(lat, lon);
        }

        if (energyWidget) {
            energyWidget.updateLocation(lat, lon);
        }

        // Trash widget needs the address string
        if (trashWidget && address) {
            trashWidget.updateAddress(address);
        }
    }

    startAutoRefresh() {
        // Refresh all widgets every 5 minutes (300000 ms)
        this.refreshInterval = setInterval(() => {
            if (this.currentLocation) {
                const { lat, lon, address } = this.currentLocation;
                this.updateAllWidgets(lat, lon, address);
            }
        }, 300000); // 5 minutes
    }
}

customElements.define('trondheim-dashboard', TrondheimDashboard);


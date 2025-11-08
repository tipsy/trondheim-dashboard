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
                        grid-template-columns: 1fr 2fr 1fr;
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
                        grid-template-columns: 1fr 2fr 1fr;
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
                    // Use loadFromURL which checks for saved coordinates first
                    addressInput.loadFromURL(decodeURIComponent(address));
                }, 200);
            }
        }
    }

    attachEventListeners() {
        const addressInput = this.shadowRoot.getElementById('address-input');
        const themeSelector = this.shadowRoot.querySelector('theme-selector');

        // Listen for location updates from address input
        addressInput.addEventListener('location-updated', (event) => {
            const { lat, lon, address } = event.detail;

            // Store current location for auto-refresh
            this.currentLocation = { lat, lon, address };

            // Update all widgets with the new location
            this.updateAllWidgets(lat, lon, address);

            // Update URL with address
            this.updateURL({ address });
        });

        // Listen for theme changes
        if (themeSelector) {
            themeSelector.addEventListener('theme-changed', (event) => {
                const { theme } = event.detail;
                // Update URL with theme
                this.updateURL({ theme });
            });
        }
    }

    updateURL(params) {
        const url = new URL(window.location);

        // Update or add parameters
        if (params.address !== undefined) {
            if (params.address) {
                url.searchParams.set('address', encodeURIComponent(params.address));
            } else {
                url.searchParams.delete('address');
            }
        }

        if (params.theme !== undefined) {
            if (params.theme) {
                url.searchParams.set('theme', params.theme);
            } else {
                url.searchParams.delete('theme');
            }
        }

        // Update URL without reloading the page
        window.history.pushState({}, '', url);
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
        // Reload the entire page every 5 minutes to get new app versions
        this.refreshInterval = setInterval(() => {
            console.log('Auto-refreshing dashboard to get latest version...');
            location.reload();
        }, 300000); // 5 minutes
    }
}

customElements.define('trondheim-dashboard', TrondheimDashboard);


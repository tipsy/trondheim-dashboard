class AddressInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.loadSavedAddress();
    }

    loadSavedAddress() {
        const savedAddress = localStorage.getItem('trondheim-dashboard-address');
        if (savedAddress) {
            const input = this.shadowRoot.getElementById('address-input');
            if (input) {
                input.value = savedAddress;
                // Auto-search the saved address
                this.handleSearch();
            }
        }
    }

    saveAddress(address) {
        localStorage.setItem('trondheim-dashboard-address', address);
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .address-container {
                    background-color: var(--card-background, #ffffff);
                    border-radius: var(--border-radius, 8px);
                    padding: var(--spacing-md, 16px);
                    box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
                }

                h2 {
                    margin: 0 0 var(--spacing-sm) 0;
                    color: var(--text-color);
                    font-size: var(--font-size-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                }

                .input-group {
                    display: flex;
                    gap: var(--spacing-sm);
                }

                input {
                    flex: 1;
                    padding: var(--spacing-sm) var(--spacing-md);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    font-size: var(--font-size-md);
                    background-color: var(--input-background);
                    color: var(--text-color);
                }

                input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }

                button {
                    padding: var(--spacing-sm) var(--spacing-md);
                    background-color: var(--primary-color);
                    color: var(--button-text);
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    font-size: var(--font-size-md);
                    transition: background-color 0.2s;
                }

                button:hover {
                    background-color: var(--secondary-color);
                }

                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .location-btn {
                    background-color: var(--success-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .location-btn:hover {
                    background-color: var(--success-hover);
                }

                .current-location {
                    display: none;
                }

                .error {
                    color: var(--error-color);
                    padding: var(--spacing-sm);
                    background-color: var(--error-bg);
                    border-radius: var(--border-radius);
                    margin-top: var(--spacing-sm);
                    font-size: var(--font-size-sm);
                }

                .loading {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid var(--button-text);
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>

            <div class="address-container">
                <h2>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Your Address
                </h2>
                <div class="input-group">
                    <input
                        type="text"
                        id="address-input"
                        placeholder="Enter address in Trondheim..."
                        aria-label="Address"
                    />
                    <button id="search-btn">Search</button>
                    <button id="location-btn" class="location-btn" title="Use my location">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                        </svg>
                    </button>
                </div>
                <div id="current-location" class="current-location"></div>
                <div id="error-message" class="error" style="display: none;"></div>
            </div>
        `;
    }

    attachEventListeners() {
        const input = this.shadowRoot.getElementById('address-input');
        const searchBtn = this.shadowRoot.getElementById('search-btn');
        const locationBtn = this.shadowRoot.getElementById('location-btn');

        searchBtn.addEventListener('click', () => this.handleAddressSearch());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddressSearch();
            }
        });
        locationBtn.addEventListener('click', () => this.handleCurrentLocation());
    }

    handleSearch() {
        this.handleAddressSearch();
    }

    async handleAddressSearch() {
        const input = this.shadowRoot.getElementById('address-input');
        const address = input.value.trim();

        if (!address) {
            this.showError('Please enter an address');
            return;
        }

        this.showLoading(true);
        this.hideError();

        try {
            const location = await GeocodingAPI.geocodeAddress(address);
            this.saveAddress(address);
            this.updateLocation(location.lat, location.lon, address);
            this.showCurrentLocation(address);
        } catch (error) {
            this.showError('Could not find address. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleCurrentLocation() {
        this.showLoading(true);
        this.hideError();

        try {
            const location = await GeocodingAPI.getCurrentLocation();
            this.updateLocation(location.lat, location.lon, null);
            this.showCurrentLocation('Your current location');
        } catch (error) {
            this.showError('Could not get your location. Check browser settings.');
        } finally {
            this.showLoading(false);
        }
    }

    updateLocation(lat, lon, address) {
        const event = new CustomEvent('location-updated', {
            detail: { lat, lon, address },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }

    showCurrentLocation(text) {
        const locationDiv = this.shadowRoot.getElementById('current-location');
        locationDiv.textContent = `Selected: ${text}`;
    }

    showError(message) {
        const errorDiv = this.shadowRoot.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideError() {
        const errorDiv = this.shadowRoot.getElementById('error-message');
        errorDiv.style.display = 'none';
    }

    showLoading(isLoading) {
        const searchBtn = this.shadowRoot.getElementById('search-btn');
        const locationBtn = this.shadowRoot.getElementById('location-btn');

        if (isLoading) {
            searchBtn.disabled = true;
            locationBtn.disabled = true;
            searchBtn.innerHTML = '<span class="loading"></span>';
        } else {
            searchBtn.disabled = false;
            locationBtn.disabled = false;
            searchBtn.textContent = 'Search';
        }
    }
}

customElements.define('address-input', AddressInput);


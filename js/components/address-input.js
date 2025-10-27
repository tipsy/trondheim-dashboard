class AddressInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.searchTimeout = null;
        this.debounceDelay = 500; // milliseconds
        this.isSearching = false; // Prevent multiple simultaneous searches
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();

        // Delay loading saved address to ensure parent listeners are attached
        setTimeout(() => {
            this.loadSavedAddress();
        }, 100);
    }

    disconnectedCallback() {
        // Clean up
        this.cancelDebounce();
        if (this.clickOutsideHandler) {
            document.removeEventListener('click', this.clickOutsideHandler);
        }
    }

    loadSavedAddress() {

        const savedData = localStorage.getItem('trondheim-dashboard-location');

        if (savedData) {
            try {
                const { address, lat, lon } = JSON.parse(savedData);

                const input = this.shadowRoot.getElementById('address-input');
                if (input && address && lat && lon) {
                    input.value = address;
                    // Directly update location without searching
                    this.updateLocation(lat, lon, address);
                }
            } catch (error) {
                console.error('Error loading saved address:', error);
                // Clear invalid data
                localStorage.removeItem('trondheim-dashboard-location');
            }
        }
    }

    saveLocation(address, lat, lon) {
        const data = { address, lat, lon };
        localStorage.setItem('trondheim-dashboard-location', JSON.stringify(data));
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                }

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
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }

                .input-row {
                    display: flex;
                    gap: var(--spacing-sm);
                }

                .button-row {
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
                    font-family: var(--font-family, sans-serif);
                    transition: border-color 0.2s;
                    width: 100%;
                }

                input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }

                .input-wrapper {
                    position: relative;
                    flex: 1;
                    width: 100%;
                }

                .typing-indicator {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: var(--font-size-xs);
                    color: var(--text-light);
                    display: none;
                }

                .typing-indicator.visible {
                    display: block;
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
                    font-family: var(--font-family, sans-serif);
                    white-space: nowrap;
                }

                button:hover {
                    background-color: var(--secondary-color);
                }

                button:active {
                    transform: scale(0.98);
                }

                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .location-btn {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                    background-color: var(--card-background);
                    color: var(--text-color);
                    border: 1px solid var(--border-color);
                }

                .location-btn:hover {
                    background-color: var(--hover-bg, #f5f5f5);
                }

                .location-text {
                    display: none;
                }

                /* Mobile: stack buttons vertically */
                @media (max-width: 767px) {
                    .button-row {
                        flex-direction: column;
                    }

                    button {
                        width: 100%;
                    }

                    .location-text {
                        display: inline;
                    }
                }

                /* Desktop layout */
                @media (min-width: 768px) {
                    .location-text {
                        display: inline;
                    }

                    .input-group {
                        flex-direction: row;
                        align-items: stretch;
                    }

                    .input-row {
                        flex: 1;
                    }

                    .button-row {
                        flex-shrink: 0;
                    }

                    button {
                        flex: 0 0 auto;
                        min-width: 100px;
                    }

                    .location-btn {
                        min-width: auto;
                    }
                }

                .current-location {
                    margin-top: var(--spacing-sm);
                    padding: var(--spacing-sm);
                    background-color: var(--success-bg, #e8f5e9);
                    color: var(--success-color, #2e7d32);
                    border-radius: var(--border-radius);
                    font-size: var(--font-size-sm);
                    display: none;
                }

                .current-location.visible {
                    display: block;
                }

                .suggestions {
                    margin-top: var(--spacing-sm);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    background-color: var(--card-background);
                    max-height: 300px;
                    overflow-y: auto;
                    display: none;
                    box-shadow: var(--shadow);
                }

                /* Mobile: larger touch targets */
                @media (max-width: 767px) {
                    .suggestions {
                        max-height: 400px;
                    }

                    .suggestion-item {
                        padding: var(--spacing-md);
                        min-height: 60px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                }

                .suggestions.visible {
                    display: block;
                }

                .suggestion-item {
                    padding: var(--spacing-sm) var(--spacing-md);
                    cursor: pointer;
                    border-bottom: 1px solid var(--border-color);
                    transition: background-color 0.2s;
                }

                .suggestion-item:last-child {
                    border-bottom: none;
                }

                .suggestion-item:hover {
                    background-color: var(--hover-bg, #f5f5f5);
                }

                .suggestion-item .address-name {
                    font-weight: 500;
                    color: var(--text-color);
                    font-size: var(--font-size-md);
                }

                .suggestion-item .address-details {
                    font-size: var(--font-size-sm);
                    color: var(--text-light, #666);
                    margin-top: 2px;
                }

                .error {
                    color: var(--error-color);
                    padding: var(--spacing-md);
                    background-color: var(--error-bg);
                    border-radius: var(--border-radius);
                    margin-top: var(--spacing-sm);
                    font-size: var(--font-size-sm);
                    border: 1px solid var(--error-color);
                    line-height: 1.5;
                    display: none;
                }

                .error:not([style*="display: none"]) {
                    display: block;
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
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Your Address
                </h2>
                <div class="input-group">
                    <div class="input-row">
                        <div class="input-wrapper">
                            <input
                                type="text"
                                id="address-input"
                                placeholder="Start typing an address..."
                                aria-label="Address"
                                autocomplete="off"
                            />
                            <span id="typing-indicator" class="typing-indicator">...</span>
                        </div>
                    </div>
                    <div class="button-row">
                        <button id="search-btn">Search</button>
                        <button id="location-btn" class="location-btn" title="Use my location">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                            </svg>
                            <span class="location-text">Use Location</span>
                        </button>
                    </div>
                </div>
                <div id="suggestions" class="suggestions"></div>
                <div id="current-location" class="current-location"></div>
                <div id="error-message" class="error" style="display: none;"></div>
            </div>
        `;
    }

    attachEventListeners() {
        const input = this.shadowRoot.getElementById('address-input');
        const searchBtn = this.shadowRoot.getElementById('search-btn');
        const locationBtn = this.shadowRoot.getElementById('location-btn');

        // Debounced search on input
        input.addEventListener('input', (e) => {
            this.handleInputChange(e.target.value);
        });

        // Keyboard shortcuts
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.cancelDebounce();
                this.handleAddressSearch(true); // Disable input for manual search
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
                this.cancelDebounce();
            }
        });

        // Manual search button
        searchBtn.addEventListener('click', () => {
            this.cancelDebounce();
            this.handleAddressSearch(true); // Disable input for manual search
        });

        locationBtn.addEventListener('click', () => this.handleCurrentLocation());

        // Close suggestions when clicking outside
        this.clickOutsideHandler = (e) => {
            try {
                if (!this.contains(e.target)) {
                    this.hideSuggestions();
                }
            } catch (error) {
                // Silently handle any errors in click handler
                console.error('Error in click outside handler:', error);
            }
        };
        document.addEventListener('click', this.clickOutsideHandler);
    }

    handleInputChange(value) {
        // Clear any existing timeout
        this.cancelDebounce();

        const trimmedValue = value.trim();

        // Hide suggestions and errors if input is too short
        if (trimmedValue.length < 3) {
            this.hideSuggestions();
            this.hideCurrentLocation();
            this.hideTypingIndicator();
            this.hideError();
            return;
        }

        // Hide error when user starts typing
        this.hideError();

        // Show typing indicator
        this.showTypingIndicator();

        // Set new timeout for debounced search
        this.searchTimeout = setTimeout(() => {
            this.hideTypingIndicator();
            this.handleAddressSearch();
        }, this.debounceDelay);
    }

    cancelDebounce() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
        this.hideTypingIndicator();
    }

    showTypingIndicator() {
        const indicator = this.shadowRoot.getElementById('typing-indicator');
        if (indicator) {
            indicator.classList.add('visible');
        }
    }

    hideTypingIndicator() {
        const indicator = this.shadowRoot.getElementById('typing-indicator');
        if (indicator) {
            indicator.classList.remove('visible');
        }
    }

    handleSearch() {
        this.handleAddressSearch();
    }

    async handleAddressSearch(disableInput = false) {
        // Prevent multiple simultaneous searches
        if (this.isSearching) {
            console.log('Search already in progress, skipping...');
            return;
        }

        const input = this.shadowRoot.getElementById('address-input');
        const address = input.value.trim();

        if (!address) {
            this.showError('Please enter an address');
            return;
        }

        this.isSearching = true;
        this.showLoading(true, disableInput);
        this.hideError();
        this.hideSuggestions();

        try {
            const locations = await GeocodingAPI.geocodeAddress(address);

            // Always show suggestions, even for single result
            // This gives user a chance to review before selecting
            this.showSuggestions(locations, address);
        } catch (error) {
            console.error('Address search error:', error);
            this.showError(error.message || 'Could not find address. Please try again.');
        } finally {
            this.showLoading(false, disableInput);
            this.isSearching = false;
        }
    }

    selectLocation(location) {
        // Always use the location's display name
        const addressToSave = location.displayName;

        // Update the input field with the selected address
        const input = this.shadowRoot.getElementById('address-input');
        if (input) {
            input.value = addressToSave;
        }

        // Save address with coordinates
        this.saveLocation(addressToSave, location.lat, location.lon);
        this.updateLocation(location.lat, location.lon, addressToSave);
        this.hideSuggestions();
        this.hideCurrentLocation(); // Don't show the selected message
    }

    showSuggestions(locations, originalAddress) {
        const suggestionsDiv = this.shadowRoot.getElementById('suggestions');

        suggestionsDiv.innerHTML = locations.map((loc, index) => {
            // Extract main address and details
            const parts = loc.displayName.split(',');
            const mainAddress = parts.slice(0, 2).join(',');
            const details = parts.slice(2).join(',');

            return `
                <div class="suggestion-item" data-index="${index}">
                    <div class="address-name">${mainAddress}</div>
                    <div class="address-details">${details}</div>
                </div>
            `;
        }).join('');

        // Add click handlers to suggestions
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectLocation(locations[index]);
            });
        });

        suggestionsDiv.classList.add('visible');
    }

    hideSuggestions() {
        const suggestionsDiv = this.shadowRoot.getElementById('suggestions');
        suggestionsDiv.classList.remove('visible');
        // Clear innerHTML will automatically remove event listeners
        suggestionsDiv.innerHTML = '';
    }

    async handleCurrentLocation() {
        // Prevent multiple simultaneous location requests
        if (this.isSearching) {
            console.log('Location request already in progress, skipping...');
            return;
        }

        this.isSearching = true;
        this.showLoading(true, true); // Disable input for location search
        this.hideError();
        this.hideSuggestions();

        try {
            const location = await GeocodingAPI.getCurrentLocation();

            // Get address from coordinates via reverse geocoding
            const address = await GeocodingAPI.reverseGeocode(location.lat, location.lon);

            // Update input field
            const input = this.shadowRoot.getElementById('address-input');
            if (input) {
                input.value = address;
            }

            // Save location with coordinates
            this.saveLocation(address, location.lat, location.lon);
            this.updateLocation(location.lat, location.lon, address);
            this.hideCurrentLocation(); // Don't show the selected message
        } catch (error) {
            console.error('Current location error:', error);
            this.showError(error.message || 'Could not get your location. Check browser settings.');
        } finally {
            this.showLoading(false, true);
            this.isSearching = false;
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
        locationDiv.textContent = `✓ Selected: ${text}`;
        locationDiv.classList.add('visible');
    }

    hideCurrentLocation() {
        const locationDiv = this.shadowRoot.getElementById('current-location');
        locationDiv.classList.remove('visible');
    }

    showError(message) {
        const errorDiv = this.shadowRoot.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        this.hideCurrentLocation();
    }

    hideError() {
        const errorDiv = this.shadowRoot.getElementById('error-message');
        errorDiv.style.display = 'none';
    }

    showLoading(isLoading, disableInput = false) {
        const searchBtn = this.shadowRoot.getElementById('search-btn');
        const locationBtn = this.shadowRoot.getElementById('location-btn');
        const input = this.shadowRoot.getElementById('address-input');

        if (isLoading) {
            searchBtn.disabled = true;
            locationBtn.disabled = true;
            // Only disable input if explicitly requested (manual search)
            if (disableInput) {
                input.disabled = true;
            }
            searchBtn.innerHTML = '<span class="loading"></span>';
            this.hideTypingIndicator();
        } else {
            searchBtn.disabled = false;
            locationBtn.disabled = false;
            input.disabled = false;
            searchBtn.textContent = 'Search';
        }
    }
}

customElements.define('address-input', AddressInput);


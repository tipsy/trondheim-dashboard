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
                    // Show clear button since we have text
                    this.updateClearButton();
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

    // Load address from URL parameter - check if we have saved coordinates first
    async loadFromURL(address) {
        const savedData = localStorage.getItem('trondheim-dashboard-location');

        // Check if we have saved coordinates for this exact address
        if (savedData) {
            try {
                const { address: savedAddress, lat, lon } = JSON.parse(savedData);
                if (savedAddress === address && lat && lon) {
                    // We have the coordinates, use them directly
                    const input = this.shadowRoot.getElementById('address-input');
                    if (input) {
                        input.value = address;
                    }
                    this.updateLocation(lat, lon, address);
                    return;
                }
            } catch (error) {
                console.error('Error loading saved address:', error);
            }
        }

        // No saved coordinates, need to geocode and auto-select first result
        const input = this.shadowRoot.getElementById('address-input');
        if (input) {
            input.value = address;
        }

        this.showLoading(true, false);
        this.hideError();

        try {
            const locations = await GeocodingAPI.geocodeAddress(address);

            if (locations && locations.length > 0) {
                // Auto-select the first result when loading from URL
                const firstLocation = locations[0];
                this.selectLocation(firstLocation);
            } else {
                this.showError('Could not find address from URL. Please search again.');
            }
        } catch (error) {
            console.error('Error loading address from URL:', error);
            this.showError(error.message || 'Could not find address from URL. Please search again.');
        } finally {
            this.showLoading(false, false);
        }
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
                    color: var(--heading-color, var(--text-color));
                    font-size: var(--font-size-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }

                h2 svg {
                    stroke: var(--heading-color, var(--primary-color));
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md);
                }

                .input-row {
                    display: flex;
                    gap: var(--spacing-sm);
                }

                .button-row {
                    display: flex;
                    gap: var(--spacing-md);
                }

                input {
                    flex: 1;
                    padding: var(--spacing-sm) 40px var(--spacing-sm) var(--spacing-md);
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

                .clear-btn {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    padding: 6px;
                    cursor: pointer;
                    color: var(--text-light, #999);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s;
                    width: 28px;
                    height: 28px;
                    z-index: 10;
                }

                .clear-btn:hover {
                    background-color: var(--hover-bg, #f5f5f5);
                    color: var(--text-color);
                }

                .clear-btn:active {
                    transform: translateY(-50%) scale(0.95);
                }

                .clear-btn svg {
                    width: 16px;
                    height: 16px;
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
                }

                .suggestions.visible {
                    display: block;
                }

                address-suggestion-item:last-child {
                    border-bottom: none;
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
                    text-align: center;
                }

                .error:not([style*="display: none"]) {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--spacing-xs);
                }

                .error svg {
                    flex-shrink: 0;
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
                    ${IconLibrary.getIcon('location')}
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
                            <button id="clear-btn" class="clear-btn" title="Clear">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="button-row">
                        <button id="search-btn">Search</button>
                        <button id="location-btn" class="location-btn" title="Use my location">
                            ${IconLibrary.getIcon('location-crosshair', 16)}
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

    updateClearButton() {
        const input = this.shadowRoot.getElementById('address-input');
        const clearBtn = this.shadowRoot.getElementById('clear-btn');

        if (input && clearBtn) {
            if (input.value.trim()) {
                clearBtn.style.display = 'flex';
            } else {
                clearBtn.style.display = 'none';
            }
        }
    }

    attachEventListeners() {
        const input = this.shadowRoot.getElementById('address-input');
        const searchBtn = this.shadowRoot.getElementById('search-btn');
        const locationBtn = this.shadowRoot.getElementById('location-btn');
        const clearBtn = this.shadowRoot.getElementById('clear-btn');

        // Debounced search on input
        input.addEventListener('input', (e) => {
            this.updateClearButton();
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

        // Clear button
        clearBtn.addEventListener('click', () => {
            input.value = '';
            this.updateClearButton();
            this.hideSuggestions();
            this.cancelDebounce();
            input.focus();
        });

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
            this.hideError();
            return;
        }

        // Hide error when user starts typing
        this.hideError();

        // Set new timeout for debounced search
        this.searchTimeout = setTimeout(() => {
            this.handleAddressSearch();
        }, this.debounceDelay);
    }

    cancelDebounce() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
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

        // Check if we already have saved coordinates for this exact address
        const savedData = localStorage.getItem('trondheim-dashboard-location');
        if (savedData) {
            try {
                const { address: savedAddress, lat, lon } = JSON.parse(savedData);
                if (savedAddress === address && lat && lon) {
                    // We already have this address selected, just reload it
                    this.updateLocation(lat, lon, address);
                    this.hideSuggestions();
                    return;
                }
            } catch (error) {
                console.error('Error checking saved address:', error);
            }
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

        // Clear previous suggestions
        suggestionsDiv.innerHTML = '';

        // Create suggestion item components
        locations.forEach((loc, index) => {
            const suggestionItem = document.createElement('address-suggestion-item');
            suggestionItem.setAttribute('display-name', loc.displayName);
            suggestionItem.setAttribute('index', index.toString());

            // Listen for selection
            suggestionItem.addEventListener('select', (e) => {
                this.selectLocation(locations[e.detail.index]);
            });

            suggestionsDiv.appendChild(suggestionItem);
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
        errorDiv.innerHTML = `
            ${IconLibrary.getIcon('warning', 18)}
            <span>${message}</span>
        `;
        errorDiv.style.display = 'flex';
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
        } else {
            searchBtn.disabled = false;
            locationBtn.disabled = false;
            input.disabled = false;
            searchBtn.textContent = 'Search';
        }
    }
}

customElements.define('address-input', AddressInput);


import { LitElement, html, css } from 'lit';
import { sharedStyles, adoptMDIStyles } from '../../utils/shared-styles.js';

class AddressInput extends LitElement {
    static properties = {
        addressValue: { type: String, state: true },
        suggestions: { type: Array, state: true },
        showSuggestions: { type: Boolean, state: true },
        showCurrentLocation: { type: Boolean, state: true },
        currentLocationText: { type: String, state: true },
        errorMessage: { type: String, state: true },
        isLoading: { type: Boolean, state: true },
        buttonsDisabled: { type: Boolean, state: true },
        inputDisabled: { type: Boolean, state: true }
    };

    static styles = [
        sharedStyles,
        css`
        :host {
            display: block;
            height: 100%;
        }

        .address-container {
            background-color: var(--card-background, #ffffff);
            border-radius: var(--border-radius, 8px);
            padding: var(--spacing-md, 16px);
            box-shadow: var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
            display: flex;
            flex-direction: column;
        }

        h2 {
            margin: 0 0 var(--spacing-sm) 0;
            color: var(--heading-color, var(--text-color));
            font-size: var(--font-size-lg);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }

        h2 i {
            font-size: 28px;
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

        .input-wrapper {
            position: relative;
            flex: 1;
            width: 100%;
        }


        .location-text {
            display: none;
        }

        @media (max-width: 767px) {
            .button-row {
                flex-direction: column;
            }

            primary-button,
            secondary-button {
                width: 100%;
            }

            .location-text {
                display: inline;
            }
        }

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
        }

        .current-location {
            margin-top: var(--spacing-sm);
            padding: var(--spacing-sm);
            background-color: var(--success-bg, #e8f5e9);
            color: var(--success-color, #2e7d32);
            border-radius: var(--border-radius);
            font-size: var(--font-size-sm);
        }

        .suggestions {
            margin-top: var(--spacing-sm);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            background-color: var(--card-background);
            max-height: 300px;
            overflow-y: auto;
            box-shadow: var(--shadow);
        }

        @media (max-width: 767px) {
            .suggestions {
                max-height: 400px;
            }
        }

        address-suggestion-item:last-child {
            border-bottom: none;
        }
    `];

    constructor() {
        super();
        this.addressValue = '';
        this.suggestions = [];
        this.showSuggestions = false;
        this.showCurrentLocation = false;
        this.currentLocationText = '';
        this.errorMessage = '';
        this.isLoading = false;
        this.buttonsDisabled = false;
        this.inputDisabled = false;
        this.searchTimeout = null;
        this.debounceDelay = 500;
        this.isSearching = false;
    }

    connectedCallback() {
        super.connectedCallback();

        adoptMDIStyles(this.shadowRoot);

        // Delay loading saved address to ensure parent listeners are attached
        setTimeout(() => {
            this.loadSavedAddress();
        }, 100);

        // Add click outside handler
        this.clickOutsideHandler = (e) => {
            try {
                const path = e.composedPath();
                if (!path.includes(this)) {
                    this.hideSuggestionsState();
                }
            } catch (error) {
                console.error('Error in click outside handler:', error);
            }
        };
        document.addEventListener('click', this.clickOutsideHandler);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
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

                if (address && lat && lon) {
                    this.addressValue = address;
                    this.updateLocation(lat, lon, address);
                }
            } catch (error) {
                console.error('Error loading saved address:', error);
                localStorage.removeItem('trondheim-dashboard-location');
            }
        }
    }

    saveLocation(address, lat, lon) {
        const data = { address, lat, lon };
        localStorage.setItem('trondheim-dashboard-location', JSON.stringify(data));
    }

    async loadFromURL(address) {
        const savedData = localStorage.getItem('trondheim-dashboard-location');

        if (savedData) {
            try {
                const { address: savedAddress, lat, lon } = JSON.parse(savedData);
                if (savedAddress === address && lat && lon) {
                    this.addressValue = address;
                    this.updateLocation(lat, lon, address);
                    return;
                }
            } catch (error) {
                console.error('Error loading saved address:', error);
            }
        }

        this.addressValue = address;
        this.isLoading = true;
        this.buttonsDisabled = true;
        this.hideErrorState();

        try {
            const locations = await GeocodingAPI.geocodeAddress(address);

            if (locations && locations.length > 0) {
                this.selectLocation(locations[0]);
            } else {
                this.showErrorState('Could not find address from URL. Please search again.');
            }
        } catch (error) {
            console.error('Error loading address from URL:', error);
            this.showErrorState(error.message || 'Could not find address from URL. Please search again.');
        } finally {
            this.isLoading = false;
            this.buttonsDisabled = false;
            this.inputDisabled = false;
        }
    }

    handleInputChange(value) {
        this.addressValue = value;
        this.cancelDebounce();

        const trimmedValue = value.trim();

        if (trimmedValue.length < 3) {
            this.hideSuggestionsState();
            this.showCurrentLocation = false;
            this.hideErrorState();
            return;
        }

        this.hideErrorState();

        this.searchTimeout = setTimeout(() => {
            this.handleAddressSearch();
        }, this.debounceDelay);
    }

    handleInputKeydown(e) {
        const key = e.detail.key;
        if (key === 'Enter') {
            this.cancelDebounce();
            this.handleAddressSearch(true);
        } else if (key === 'Escape') {
            this.hideSuggestionsState();
            this.cancelDebounce();
        }
    }

    handleClear() {
        this.addressValue = '';
        this.hideSuggestionsState();
        this.cancelDebounce();
        this.shouldFocusInput = true;
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        if (this.shouldFocusInput) {
            const inputField = this.shadowRoot.querySelector('input-field');
            if (inputField) {
                inputField.focus();
                this.shouldFocusInput = false;
            }
        }
    }

    cancelDebounce() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
    }

    async handleAddressSearch(disableInput = false) {
        if (this.isSearching) {
            console.log('Search already in progress, skipping...');
            return;
        }

        const address = this.addressValue.trim();

        if (!address) {
            this.showErrorState('Please enter an address');
            return;
        }

        const savedData = localStorage.getItem('trondheim-dashboard-location');
        if (savedData) {
            try {
                const { address: savedAddress, lat, lon } = JSON.parse(savedData);
                if (savedAddress === address && lat && lon) {
                    this.updateLocation(lat, lon, address);
                    this.hideSuggestionsState();
                    return;
                }
            } catch (error) {
                console.error('Error checking saved address:', error);
            }
        }

        this.isSearching = true;
        this.isLoading = true;
        this.buttonsDisabled = true;
        this.inputDisabled = disableInput;
        this.hideErrorState();
        this.hideSuggestionsState();

        try {
            const locations = await GeocodingAPI.geocodeAddress(address);
            this.showSuggestionsState(locations);
        } catch (error) {
            console.error('Address search error:', error);
            this.showErrorState(error.message || 'Could not find address. Please try again.');
        } finally {
            this.isLoading = false;
            this.buttonsDisabled = false;
            this.inputDisabled = false;
            this.isSearching = false;
        }
    }

    selectLocation(location) {
        const addressToSave = location.displayName;
        this.addressValue = addressToSave;
        this.saveLocation(addressToSave, location.lat, location.lon);
        this.updateLocation(location.lat, location.lon, addressToSave);
        this.hideSuggestionsState();
        this.showCurrentLocation = false;
    }

    showSuggestionsState(locations) {
        this.suggestions = locations;
        this.showSuggestions = true;
    }

    hideSuggestionsState() {
        this.showSuggestions = false;
        this.suggestions = [];
    }

    async handleCurrentLocation() {
        if (this.isSearching) {
            console.log('Location request already in progress, skipping...');
            return;
        }

        this.isSearching = true;
        this.isLoading = true;
        this.buttonsDisabled = true;
        this.inputDisabled = true;
        this.hideErrorState();
        this.hideSuggestionsState();

        try {
            const location = await GeocodingAPI.getCurrentLocation();
            const address = await GeocodingAPI.reverseGeocode(location.lat, location.lon);
            this.addressValue = address;
            this.saveLocation(address, location.lat, location.lon);
            this.updateLocation(location.lat, location.lon, address);
            this.showCurrentLocation = false;
        } catch (error) {
            console.error('Current location error:', error);
            this.showErrorState(error.message || 'Could not get your location. Check browser settings.');
        } finally {
            this.isLoading = false;
            this.buttonsDisabled = false;
            this.inputDisabled = false;
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

    showErrorState(message) {
        this.errorMessage = message;
        this.showCurrentLocation = false;
    }

    hideErrorState() {
        this.errorMessage = '';
    }

    handleSuggestionSelect(e) {
        const index = e.detail.index;
        if (this.suggestions[index]) {
            this.selectLocation(this.suggestions[index]);
        }
    }

    render() {
        return html`
            <div class="address-container">
                <h2>
                    <i class="mdi mdi-map-marker-outline"></i>
                    Your Address
                </h2>
                <div class="input-group">
                    <div class="input-row">
                        <div class="input-wrapper">
                            <input-field
                                .value=${this.addressValue}
                                placeholder="Start typing an address..."
                                ?disabled=${this.inputDisabled}
                                @input-change=${(e) => this.handleInputChange(e.detail.value)}
                                @input-keydown=${this.handleInputKeydown}
                            ></input-field>
                            <clear-button
                                ?hidden=${!this.addressValue.trim()}
                                @clear=${this.handleClear}
                            ></clear-button>
                        </div>
                    </div>
                    <div class="button-row">
                        <primary-button
                            ?disabled=${this.buttonsDisabled}
                            ?loading=${this.isLoading}
                            @button-click=${() => this.handleAddressSearch(true)}
                        >
                            Search
                        </primary-button>
                        <secondary-button
                            ?disabled=${this.buttonsDisabled}
                            title="Use my location"
                            @button-click=${this.handleCurrentLocation}
                        >
                            <i class="mdi mdi-crosshairs-gps"></i>
                            <span class="location-text">Use Location</span>
                        </secondary-button>
                    </div>
                </div>
                <div class="suggestions" style="display: ${this.showSuggestions ? 'block' : 'none'}">
                    ${this.suggestions.map((loc, index) => html`
                        <address-suggestion-item
                            display-name=${loc.displayName}
                            index=${index}
                            @select=${this.handleSuggestionSelect}
                        ></address-suggestion-item>
                    `)}
                </div>
                ${this.showCurrentLocation ? html`
                    <div class="current-location">
                        ${this.currentLocationText}
                    </div>
                ` : ''}
                ${this.errorMessage ? html`
                    <error-message
                        message=${this.errorMessage}
                        style="margin-top: var(--spacing-sm);"
                    ></error-message>
                ` : ''}
            </div>
        `;
    }
}

customElements.define('address-input', AddressInput);


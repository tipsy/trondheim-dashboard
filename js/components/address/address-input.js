import { BaseWidget } from "../common/base-widget.js";
import { html, css } from "lit";
import { t } from "../../utils/localization.js";
import { dispatchEvent } from "../../utils/event-helpers.js";
import { GeocodingAPI } from "../../utils/api/geocoding-api.js";
import storage from "../../utils/storage.js";
import "../common/input-field.js";
import "../common/buttons/icon-button.js";
import "../common/buttons/primary-button.js";
import "../common/buttons/secondary-button.js";
import "../common/heading-2.js";
import "./address-suggestion-item.js";

class AddressInput extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    addressValue: { type: String, state: true },
    suggestions: { type: Array, state: true },
    localErrorMessage: { type: String, state: true },
  };

  constructor() {
    super();
    this.title = "Your Address"; // Will be localized in BaseWidget render
    this.icon = "mdi-map-marker-outline";
    this.compactHeader = true;
    this.addressValue = "";
    this.suggestions = [];
    this.localErrorMessage = "";
    this.searchTimeout = null;
    this.debounceDelay = 500;
    this.isSearching = false;
  }

  get showSuggestions() {
    // Derived getters for reactive state
    return this.suggestions.length > 0 && !this.localErrorMessage;
  }

  static styles = [
    ...BaseWidget.styles,
    css`
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

      .clear-btn {
        position: absolute;
        right: 4px;
        top: 0;
        z-index: 10;
        --icon-btn-size: var(--input-height);
        --icon-btn-color: var(--text-muted, #999);
        --icon-btn-radius: 50%;
      }

      .location-text {
        display: none;
      }

      @media (max-width: 767px) {
        .input-group {
          flex-direction: row;
          gap: var(--spacing-sm);
        }

        .input-row {
          flex: 1;
          min-width: 0;
        }

        .button-row {
          flex: 0 0 auto;
          gap: var(--spacing-sm);
          /* Keep row direction */
        }

        primary-button,
        secondary-button {
          flex: 0 0 auto;
        }

        .location-text {
          display: none; /* Hide text on mobile to save space */
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
    `,
  ];

  connectedCallback() {
    super.connectedCallback();

    // Delay loading saved address to ensure parent listeners are attached
    setTimeout(() => {
      this.loadSavedAddress();
    }, 100);

    // Add click outside handler
    this.clickOutsideHandler = (e) => {
      try {
        const path = e.composedPath();
        if (!path.includes(this)) {
          this.suggestions = [];
        }
      } catch (error) {
        console.error("Error in click outside handler:", error);
      }
    };
    document.addEventListener("click", this.clickOutsideHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cancelDebounce();
    if (this.clickOutsideHandler) {
      document.removeEventListener("click", this.clickOutsideHandler);
    }
  }

  loadSavedAddress() {
    const savedData = storage.loadLocation();
    if (savedData) {
      const { address, lat, lon } = savedData;
      if (address && lat && lon) {
        this.addressValue = address;
        this.updateLocation(lat, lon, address);
      }
    }
  }

  saveLocation(address, lat, lon) {
    const data = { address, lat, lon };
    storage.saveLocation(data);
  }

  async loadFromURL(address) {
    const savedData = storage.loadLocation();
    if (savedData) {
      const { address: savedAddress, lat, lon } = savedData;
      if (savedAddress === address && lat && lon) {
        this.addressValue = address;
        this.updateLocation(lat, lon, address);
        return;
      }
    }

    this.addressValue = address;
    this.isLoading = true;
    this.localErrorMessage = "";

    try {
      const locations = await GeocodingAPI.geocodeAddress(address);

      if (locations && locations.length > 0) {
        this.selectLocation(locations[0]);
      } else {
        this.localErrorMessage = t(
          "Could not find address from URL. Please search again.",
        );
      }
    } catch (error) {
      console.error("Error loading address from URL:", error);
      this.localErrorMessage =
        error.message ||
        t("Could not find address from URL. Please search again.");
    } finally {
      this.isLoading = false;
    }
  }

  handleInputChange(value) {
    this.addressValue = value;
    this.cancelDebounce();

    const trimmedValue = value.trim();

    if (trimmedValue.length < 3) {
      this.suggestions = [];
      this.localErrorMessage = "";
      return;
    }

    this.localErrorMessage = "";

    this.searchTimeout = setTimeout(() => {
      this.handleAddressSearch(false); // false = don't show loading spinner
    }, this.debounceDelay);
  }

  handleInputKeydown(e) {
    const key = e.detail.key;
    if (key === "Enter") {
      this.cancelDebounce();
      this.handleAddressSearch(true); // true = show loading spinner for explicit search
    } else if (key === "Escape") {
      this.suggestions = [];
      this.cancelDebounce();
    }
  }

  handleClear() {
    this.addressValue = "";
    this.suggestions = [];
    this.cancelDebounce();
    this.shouldFocusInput = true;

    // Clear location from localStorage
    storage.clearLocation();

    // Notify dashboard to clear address from URL
    this.updateLocation(null, null, "");
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (this.shouldFocusInput) {
      const inputField = this.shadowRoot.querySelector("input-field");
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

  async handleAddressSearch(showLoading = true) {
    if (this.isSearching) {
      console.log("Search already in progress, skipping...");
      return;
    }

    const address = this.addressValue.trim();

    if (!address) {
      this.localErrorMessage = t("Please enter an address");
      return;
    }

    const savedData = storage.loadLocation();
    if (savedData) {
      const { address: savedAddress, lat, lon } = savedData;
      if (savedAddress === address && lat && lon) {
        this.updateLocation(lat, lon, address);
        this.suggestions = [];
        return;
      }
    }

    this.isSearching = true;
    if (showLoading) {
      this.isLoading = true;
    }
    this.localErrorMessage = "";
    this.suggestions = [];

    try {
      const locations = await GeocodingAPI.geocodeAddress(address);
      this.suggestions = locations;
    } catch (error) {
      console.error("Address search error:", error);
      this.localErrorMessage =
        error.message || t("Could not find address. Please try again.");
    } finally {
      if (showLoading) {
        this.isLoading = false;
      }
      this.isSearching = false;
    }
  }

  selectLocation(location) {
    const addressToSave = location.displayName;
    this.addressValue = addressToSave;
    this.saveLocation(addressToSave, location.lat, location.lon);
    this.updateLocation(location.lat, location.lon, addressToSave);
    this.suggestions = [];
  }

  async handleCurrentLocation() {
    if (this.isSearching) {
      console.log("Location request already in progress, skipping...");
      return;
    }

    this.isSearching = true;
    this.isLoading = true;
    this.localErrorMessage = "";
    this.suggestions = [];

    try {
      const location = await GeocodingAPI.getCurrentLocation();
      const address = await GeocodingAPI.reverseGeocode(
        location.lat,
        location.lon,
      );
      this.addressValue = address;
      this.saveLocation(address, location.lat, location.lon);
      this.updateLocation(location.lat, location.lon, address);
    } catch (error) {
      console.error("Current location error:", error);
      this.localErrorMessage =
        error.message ||
        t("Could not get your location. Check browser settings.");
    } finally {
      this.isLoading = false;
      this.isSearching = false;
    }
  }

  updateLocation(lat, lon, address) {
    dispatchEvent(this, "location-updated", { lat, lon, address });
  }

  handleSuggestionSelect(e) {
    this.selectLocation(e.detail.location);
  }

  handleSearchButtonClick() {
    this.handleAddressSearch(true); // Show loading spinner for explicit button click
  }

  renderContent() {
    return html`
      <div class="input-group">
        <div class="input-row">
          <div class="input-wrapper">
            <input-field
              .value=${this.addressValue}
              placeholder="${t("Start typing an address...")}"
              @input-change=${(e) => this.handleInputChange(e.detail.value)}
              @input-keydown=${this.handleInputKeydown}
            ></input-field>
            <icon-button
              class="clear-btn"
              ?hidden=${!this.addressValue.trim()}
              @button-click=${this.handleClear}
              title="${t("Clear")}"
              aria-label="${t("Clear input")}"
            >
              <i class="mdi mdi-close"></i>
            </icon-button>
          </div>
        </div>
        <div class="button-row">
          <primary-button
            ?disabled=${this.isLoading}
            ?loading=${this.isLoading}
            @button-click=${this.handleSearchButtonClick}
          >
            ${t("Search")}
          </primary-button>
          <secondary-button
            ?disabled=${this.isLoading}
            title="${t("Use my location")}"
            @button-click=${this.handleCurrentLocation}
          >
            <i class="mdi mdi-crosshairs-gps"></i>
            <span class="location-text">${t("Use Location")}</span>
          </secondary-button>
        </div>
      </div>
      <div
        class="suggestions"
        style="display: ${this.showSuggestions ? "block" : "none"}"
      >
        ${this.suggestions.map(
          (loc) => html`
            <address-suggestion-item
              .location=${loc}
              @select=${this.handleSuggestionSelect}
            ></address-suggestion-item>
          `,
        )}
      </div>
      ${this.localErrorMessage
        ? html`
            <error-message
              message=${this.localErrorMessage}
              style="margin-top: var(--spacing-sm);"
            ></error-message>
          `
        : ""}
    `;
  }
}

customElements.define("address-input", AddressInput);

import { LitElement, html, css } from "lit";
import { sharedStyles } from "../utils/shared-styles.js";
import storage from "../utils/storage.js";
import { normalizeLayout, DEFAULT_LAYOUT } from "../utils/layout-utils.js";

// Import all components used in the template
import "./address/address-input.js";
import "./config/theme-selector.js";
import "./bus/bus-widget.js";
import "./events/events-widget.js";
import "./weather/weather-right-now.js";
import "./weather/weather-today.js";
import "./energy/energy-widget.js";
import "./trash/trash-widget.js";
import "./police/police-widget.js";
import "./nrk/nrk-widget.js";
import "./layout/layout-widget.js";

class TrondheimDashboard extends LitElement {
  static properties = {
    currentLocation: { type: Object, state: true },
    layout: { type: Object, state: true },
    layoutEditorOpen: { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.refreshInterval = null;
    this.currentLocation = null;
    const saved = storage.loadLayout();
    this.layout = normalizeLayout(saved || DEFAULT_LAYOUT);
    this.layoutEditorOpen = false;
  }


  static styles = [
    sharedStyles,
    css`
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
        height: 100%;
      }

      .address-section theme-selector {
        width: 100%;
        height: 100%;
      }

      .widgets-grid {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md, 16px);
        flex: 1;
        min-height: 0;
      }

      /* Desktop layout */
      @media (min-width: 1025px) {
        :host {
          height: 100vh;
          overflow: hidden;
        }

        .dashboard-content {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 16px);
          height: 100%;
        }

        .address-section {
          flex-shrink: 0;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--spacing-md, 16px);
          align-items: stretch;
        }

        layout-widget {
          flex-shrink: 0;
        }

        /* Widgets grid - flexbox with dynamic column widths */
        .widgets-grid {
          flex: 1;
          display: flex;
          flex-direction: row;
          gap: var(--spacing-md, 16px);
          min-height: 0;
        }

        /* Column containers - each is a flex column */
        .widgets-grid .column {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 16px);
          min-height: 0;
          overflow: hidden;
          flex: 1; /* Default equal width, overridden by JS */
        }

        /* All widgets */
        .widgets-grid .column > * {
          min-height: 0;
          overflow: hidden;
        }

        /* Energy widget - never grows, stays at natural height */
        #energy-widget {
          flex: 0 0 auto;
        }

        /* Weather right now - grows more, shrinks less */
        #weather-right-now {
          flex: 2 1 auto;
        }

        /* Weather today - grows less, shrinks more */
        #weather-today {
          flex: 1 2 auto;
        }

        /* Trash widget - takes as much space as possible */
        #trash-widget {
          flex: 3;
        }

        /* Other widgets - normal growth */
        #bus-widget,
        #events-widget,
        #police-widget,
        #nrk-widget {
          flex: 1;
        }
      }

      /* Tablet layout */
      @media (min-width: 768px) and (max-width: 1024px) {
        .widgets-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.startAutoRefresh();
  }

  firstUpdated() {
    this.loadURLParameters();
    this.applyLayoutToStyles();
  }

  updated(changed) {
    if (changed.has('layout')) {
      this.applyLayoutToStyles();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.refreshInterval);
  }

  handleLocationUpdate(event) {
    const { lat, lon, address } = event.detail;
    this.currentLocation = { lat, lon, address };
    this.updateAllWidgets(lat, lon, address);
    this.updateURL({ address });
  }

  handleThemeChange(event) {
    this.updateURL({ theme: event.detail.theme });
  }

  render() {
    return html`
      <div class="dashboard-content">
        ${!this.layoutEditorOpen ? html`
          <div class="address-section">
            <address-input
              id="address-input"
              @location-updated=${this.handleLocationUpdate}
            ></address-input>
            <theme-selector
              @theme-changed=${this.handleThemeChange}
              @layout-editor-toggle=${this.handleLayoutEditorToggle}
            ></theme-selector>
          </div>
        ` : ''}

        ${this.layoutEditorOpen ? html`
          <layout-widget
            @layout-changed=${this.handleLayoutChanged}
            @layout-editor-close=${this.handleLayoutEditorClose}
          ></layout-widget>
        ` : ''}

        <div class="widgets-grid">
          <!-- Column containers for flexbox layout -->
          <div class="column" data-column="0"></div>
          <div class="column" data-column="1"></div>
          <div class="column" data-column="2"></div>
          <div class="column" data-column="3"></div>

          <!-- Widgets rendered here, will be moved into columns by JS -->
          <bus-widget id="bus-widget" style="display:none"></bus-widget>
          <events-widget id="events-widget" style="display:none"></events-widget>
          <weather-right-now id="weather-right-now" style="display:none"></weather-right-now>
          <weather-today id="weather-today" style="display:none"></weather-today>
          <energy-widget id="energy-widget" style="display:none"></energy-widget>
          <trash-widget id="trash-widget" style="display:none"></trash-widget>
          <police-widget id="police-widget" style="display:none"></police-widget>
          <nrk-widget id="nrk-widget" style="display:none"></nrk-widget>
        </div>
      </div>
    `;
  }

  handleLayoutChanged(e) {
    this.layout = e.detail.layout;
    this.applyLayoutToStyles();
  }

  handleLayoutEditorToggle() {
    this.layoutEditorOpen = !this.layoutEditorOpen;
  }

  handleLayoutEditorClose() {
    this.layoutEditorOpen = false;
  }

  applyLayoutToStyles() {
    // Apply layout changes by moving widgets into flexbox columns
    try {
      const cols = this.layout?.columns || [];
      const hiddenWidgets = this.layout?.hiddenWidgets || {};
      const grid = this.shadowRoot.querySelector('.widgets-grid');
      if (!grid) return;

      // Get all column containers
      const columnContainers = Array.from(grid.querySelectorAll('.column'));

      // Set column widths using flex
      cols.forEach((col, colIndex) => {
        const container = columnContainers[colIndex];
        if (!container) return;

        if (col.enabled) {
          container.style.flex = `${col.width}`;
          container.style.display = '';
        } else {
          container.style.flex = '0';
          container.style.display = 'none';
        }
      });

      // Get all widgets
      const allWidgets = [
        'bus-widget', 'events-widget', 'weather-right-now', 'weather-today',
        'energy-widget', 'trash-widget', 'police-widget', 'nrk-widget'
      ];

      // First, clear all columns and hide all widgets
      columnContainers.forEach(container => {
        // Remove widgets from column but don't destroy them
        while (container.firstChild) {
          const child = container.firstChild;
          grid.appendChild(child);
          child.style.display = 'none';
        }
      });

      // Now place widgets into their columns (max 2 per column)
      cols.forEach((col, colIndex) => {
        if (!col.enabled) return;

        const container = columnContainers[colIndex];
        if (!container) return;

        // Count visible widgets in this column
        const visibleWidgets = col.widgets.slice(0, 2).filter(widgetId => !hiddenWidgets[widgetId]);
        const isOnlyWidget = visibleWidgets.length === 1;

        // Only process the first 2 widgets in each column
        col.widgets.slice(0, 2).forEach((widgetId) => {
          const widget = grid.querySelector(`#${widgetId}`);
          if (!widget) return;

          const isHidden = hiddenWidgets[widgetId];

          if (isHidden) {
            widget.style.display = 'none';
          } else {
            widget.style.display = '';

            // Special case: energy widget grows when it's alone
            if (widgetId === 'energy-widget' && isOnlyWidget) {
              widget.style.flex = '1';
            } else if (widgetId === 'energy-widget') {
              widget.style.flex = '0 0 auto';
            }

            container.appendChild(widget);
          }
        });
      });
    } catch (err) {
      console.warn('applyLayoutToStyles failed', err);
    }
  }

  loadURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);

    // Handle theme parameter
    const theme = urlParams.get("theme");
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
      storage.saveTheme(theme);
      const themeSelector = this.shadowRoot.querySelector("theme-selector");
      if (themeSelector) {
        themeSelector.selectedTheme = theme;
      }
    }

    // Handle address parameter
    const address = urlParams.get("address");
    if (address) {
      setTimeout(() => {
        const addressInput = this.shadowRoot.querySelector("#address-input");
        addressInput?.loadFromURL(decodeURIComponent(address));
      }, 200);
    }
  }


  updateURL(params) {
    const url = new URL(window.location);

    // Update or add parameters
    if (params.address !== undefined) {
      if (params.address) {
        url.searchParams.set("address", encodeURIComponent(params.address));
      } else {
        url.searchParams.delete("address");
      }
    }

    if (params.theme !== undefined) {
      if (params.theme) {
        url.searchParams.set("theme", params.theme);
      } else {
        url.searchParams.delete("theme");
      }
    }

    // Update URL without reloading the page
    window.history.pushState({}, "", url);
  }

  updateAllWidgets(lat, lon, address) {
    const locationWidgets = [
      "#bus-widget",
      "#weather-right-now",
      "#weather-today",
      "#energy-widget",
    ];

    locationWidgets.forEach((selector) => {
      this.shadowRoot.querySelector(selector)?.updateLocation(lat, lon);
    });

    // Trash widget needs the address string
    this.shadowRoot.querySelector("#trash-widget")?.updateAddress(address);
  }

  startAutoRefresh() {
    // Reload the entire page every 5 minutes to get new app versions
    this.refreshInterval = setInterval(() => {
      console.log("Auto-refreshing dashboard to get latest version...");
      location.reload();
    }, 300000); // 5 minutes
  }
}

customElements.define("trondheim-dashboard", TrondheimDashboard);

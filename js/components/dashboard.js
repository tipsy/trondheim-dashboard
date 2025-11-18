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
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      .dashboard-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: var(--spacing-sm, 8px);
        gap: var(--spacing-sm, 8px);
        width: 100%;
        box-sizing: border-box;
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
          width: 100%;
        }

        .dashboard-content {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 16px);
          height: 100%;
          width: 100%;
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
          width: 100%;
        }

        /* Column containers - each is a flex column */
        /* Columns use flex-grow values set by JS to proportionally fill width */
        .widgets-grid .column {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 16px);
          min-height: 0;
          overflow: hidden;
          flex: 1 1 0; /* Default equal width, overridden by JS */
          min-width: 0; /* Allow columns to shrink below content size */
        }

        /* All widgets use CSS order property for positioning */
        .widgets-grid .column > * {
          min-height: 0;
          overflow: hidden;
          order: var(--widget-order, 0);
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

          <!-- Widgets pool - will be shown/hidden and assigned to columns via classes -->
          <bus-widget id="bus-widget"></bus-widget>
          <events-widget id="events-widget"></events-widget>
          <weather-right-now id="weather-right-now"></weather-right-now>
          <weather-today id="weather-today"></weather-today>
          <energy-widget id="energy-widget"></energy-widget>
          <trash-widget id="trash-widget"></trash-widget>
          <police-widget id="police-widget"></police-widget>
          <nrk-widget id="nrk-widget"></nrk-widget>
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
    // Apply layout using flexbox columns with minimal DOM manipulation
    // Uses CSS order property to reorder widgets within columns without moving them
    try {
      const cols = this.layout?.columns || [];
      const hiddenWidgets = this.layout?.hiddenWidgets || {};
      const grid = this.shadowRoot.querySelector('.widgets-grid');
      if (!grid) return;

      // Get all column containers
      const columnContainers = Array.from(grid.querySelectorAll('.column'));

      // Set column widths using CSS with flex-grow to ensure 100% width
      // Use the width values as proportions (flex-grow values)
      cols.forEach((col, colIndex) => {
        const container = columnContainers[colIndex];
        if (!container) return;

        if (col.enabled) {
          // Use flex-grow with the width as the proportion
          // This ensures columns always fill 100% width regardless of total
          container.style.flex = `${col.width} 1 0`;
          container.style.display = '';
        } else {
          container.style.flex = '0 0 0';
          container.style.display = 'none';
        }
      });

      // Get all widgets
      const allWidgets = [
        'bus-widget', 'events-widget', 'weather-right-now', 'weather-today',
        'energy-widget', 'trash-widget', 'police-widget', 'nrk-widget'
      ];

      // Build map of widget -> {targetColumn, order, visible}
      const widgetTargets = new Map();

      cols.forEach((col, colIndex) => {
        if (!col.enabled) return;

        col.widgets.slice(0, 2).forEach((widgetId, orderIndex) => {
          const isHidden = hiddenWidgets[widgetId];
          widgetTargets.set(widgetId, {
            column: colIndex,
            order: orderIndex,
            visible: !isHidden
          });
        });
      });

      // Process each widget
      allWidgets.forEach(widgetId => {
        const widget = grid.querySelector(`#${widgetId}`);
        if (!widget) return;

        const target = widgetTargets.get(widgetId);

        if (!target || !target.visible) {
          // Hide this widget
          widget.style.display = 'none';
          widget.style.setProperty('--widget-order', '999');
        } else {
          // Show and position this widget
          widget.style.display = '';
          widget.style.setProperty('--widget-order', `${target.order}`);

          const targetContainer = columnContainers[target.column];

          // Only appendChild if widget is not already in the correct parent
          // This minimizes DOM manipulation
          if (widget.parentElement !== targetContainer) {
            targetContainer.appendChild(widget);
          }
        }
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

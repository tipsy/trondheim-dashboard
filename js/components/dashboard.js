import { LitElement, html, css } from "lit";
import { sharedStyles } from "../utils/shared-styles.js";
import storage from "../utils/storage.js";
import { normalizeLayout, DEFAULT_LAYOUT } from "../utils/layout-utils.js";
import { changeLocale } from "../utils/localization.js";

// Components will be loaded dynamically after localization is initialized
// This ensures translations are loaded before widgets render

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
        --col-1-width: 25;
        --col-2-width: 20;
        --col-3-width: 30;
        --col-4-width: 25;
      }

      .dashboard-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: var(--spacing-sm, 8px);
        gap: var(--spacing-md, 16px);
        width: 100%;
        box-sizing: border-box;
      }

      /* Larger padding on desktop */
      @media (min-width: 768px) {
        .dashboard-content {
          padding: var(--spacing-md, 16px);
        }
      }

      .address-section {
        flex-shrink: 0;
        display: flex;
        flex-direction: row;
        gap: var(--spacing-md, 16px);
        align-items: stretch;
      }

      .address-section.hidden {
        display: none;
      }

      .address-section address-input {
        flex: 4;
        min-width: 0;
      }

      .address-section language-selector {
        flex: 1;
        min-width: 0;
      }

      .address-section theme-selector {
        flex: 2;
        min-width: 0;
      }



      layout-widget {
        flex-shrink: 0;
      }

      layout-widget.hidden {
        display: none;
      }

      .widgets-grid {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md, 16px);
        flex: 1;
        min-height: 0;
      }

      /* Mobile: columns stack vertically, widgets within columns need spacing */
      .widgets-grid .column {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md, 16px);
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
        .widgets-grid .column {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md, 16px);
          min-height: 0;
          min-width: 0; /* Allow columns to shrink below content width */
        }

        .widgets-grid .column[data-column="0"] {
          flex: var(--col-1-width) 1 0;
        }
        .widgets-grid .column[data-column="1"] {
          flex: var(--col-2-width) 1 0;
        }
        .widgets-grid .column[data-column="2"] {
          flex: var(--col-3-width) 1 0;
        }
        .widgets-grid .column[data-column="3"] {
          flex: var(--col-4-width) 1 0;
        }

        /* All widgets */
        .widgets-grid .column > * {
          min-height: 0;
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

      /* Stack vertically on mobile, but keep language and config side-by-side */
      @media (max-width: 768px) {
        .dashboard-content {
          gap: var(--spacing-sm, 8px);
        }

        .widgets-grid {
          gap: var(--spacing-sm, 8px);
        }

        .widgets-grid .column {
          gap: var(--spacing-sm, 8px);
        }

        .address-section {
          flex-direction: row;
          flex-wrap: wrap;
          gap: var(--spacing-sm, 8px);
        }

        .address-section address-input {
          flex: 1 1 100%;
        }

        .address-section language-selector,
        .address-section theme-selector {
          flex: 1 1 calc(50% - var(--spacing-sm, 8px) / 2);
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
    // Layout changes are handled by handleLayoutChanged() which has smart detection
    // layoutEditorOpen changes just toggle CSS visibility, no layout updates needed
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

  async handleLocaleChange(event) {
    console.log(
      "[Dashboard] handleLocaleChange called with:",
      event.detail.locale,
    );
    await changeLocale(event.detail.locale);
    console.log("[Dashboard] changeLocale complete, reloading page...");
    // Reload page to apply new locale to all components
    window.location.reload();
  }

  render() {
    return html`
      <div class="dashboard-content">
        <div class="address-section ${this.layoutEditorOpen ? "hidden" : ""}">
          <address-input
            id="address-input"
            @location-updated=${this.handleLocationUpdate}
          ></address-input>
          <language-selector
            @locale-changed=${this.handleLocaleChange}
          ></language-selector>
          <theme-selector
            @theme-changed=${this.handleThemeChange}
            @layout-editor-toggle=${this.handleLayoutEditorToggle}
          ></theme-selector>
        </div>

        <layout-widget
          class="${this.layoutEditorOpen ? "" : "hidden"}"
          .layout=${this.layout}
          @layout-changed=${this.handleLayoutChanged}
          @layout-editor-close=${this.handleLayoutEditorClose}
        ></layout-widget>

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
    const oldLayout = this.layout;
    const newLayout = e.detail.layout;

    // Check if only widths changed (no widget movement or visibility changes)
    const onlyWidthsChanged =
      oldLayout &&
      JSON.stringify(oldLayout.hiddenWidgets) ===
        JSON.stringify(newLayout.hiddenWidgets) &&
      oldLayout.columns.every(
        (col, i) =>
          col.enabled === newLayout.columns[i].enabled &&
          JSON.stringify(col.widgets) ===
            JSON.stringify(newLayout.columns[i].widgets),
      );

    this.layout = newLayout;

    if (onlyWidthsChanged) {
      this.updateColumnWidths();
    } else {
      this.applyLayoutToStyles();
    }
  }

  updateColumnWidths() {
    // Fast path: only update CSS variables for column widths
    const cols = this.layout?.columns || [];
    cols.forEach((col, colIndex) => {
      this.style.setProperty(
        `--col-${colIndex + 1}-width`,
        col.enabled ? col.width : 0,
      );
    });
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
      const grid = this.shadowRoot.querySelector(".widgets-grid");
      if (!grid) return;

      // Get all column containers
      const columnContainers = Array.from(grid.querySelectorAll(".column"));

      // Set column widths using CSS variables and visibility
      cols.forEach((col, colIndex) => {
        const container = columnContainers[colIndex];
        if (!container) return;

        this.style.setProperty(
          `--col-${colIndex + 1}-width`,
          col.enabled ? col.width : 0,
        );
        container.style.display = col.enabled ? "" : "none";
      });

      // Get all widgets
      const allWidgets = [
        "bus-widget",
        "events-widget",
        "weather-right-now",
        "weather-today",
        "energy-widget",
        "trash-widget",
        "police-widget",
        "nrk-widget",
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
            visible: !isHidden,
          });
        });
      });

      // Process each widget
      allWidgets.forEach((widgetId) => {
        const widget = grid.querySelector(`#${widgetId}`);
        if (!widget) return;

        const target = widgetTargets.get(widgetId);

        if (!target || !target.visible) {
          // Hide this widget
          widget.style.display = "none";
          widget.style.setProperty("--widget-order", "999");
        } else {
          // Show and position this widget
          widget.style.display = "";
          widget.style.setProperty("--widget-order", `${target.order}`);

          const targetContainer = columnContainers[target.column];

          // Only appendChild if widget is not already in the correct parent
          // This minimizes DOM manipulation
          if (widget.parentElement !== targetContainer) {
            targetContainer.appendChild(widget);
          }
        }
      });
    } catch (err) {
      console.warn("applyLayoutToStyles failed", err);
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
      customElements.whenDefined("address-input").then(() => {
        const addressInput = this.shadowRoot.querySelector("#address-input");
        if (addressInput && typeof addressInput.loadFromURL === "function") {
          addressInput.loadFromURL(decodeURIComponent(address));
        } else {
          // Fallback if upgrade is delayed
          setTimeout(() => {
            const input = this.shadowRoot.querySelector("#address-input");
            input?.loadFromURL?.(decodeURIComponent(address));
          }, 500);
        }
      });
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
      const widgetName = selector.replace("#", "");
      customElements.whenDefined(widgetName).then(() => {
        const widget = this.shadowRoot.querySelector(selector);
        if (widget && typeof widget.updateLocation === "function") {
          // Pass address as third parameter for widgets that support it (like bus-widget)
          widget.updateLocation(lat, lon, address);
        }
      });
    });

    // Trash widget needs the address string
    customElements.whenDefined("trash-widget").then(() => {
      const trashWidget = this.shadowRoot.querySelector("#trash-widget");
      if (trashWidget && typeof trashWidget.updateAddress === "function") {
        trashWidget.updateAddress(address);
      }
    });
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      const response = await fetch(window.location.origin + "/index.html", {
        method: "HEAD",
        cache: "no-cache",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn("Health check failed:", error.message);
      return false;
    }
  }

  startAutoRefresh() {
    // Reload the entire page every 5 minutes to get new app versions
    this.refreshInterval = setInterval(
      async () => {
        console.log("Auto-refresh: checking health before reload...");
        const isHealthy = await this.checkHealth();

        if (isHealthy) {
          console.log("Health check passed, reloading dashboard...");
          location.reload();
        } else {
          console.warn(
            "Health check failed, skipping reload. Will retry in 5 minutes.",
          );
        }
      },
      1000 * 60 * 5,
    ); // 5 minutes
  }
}

customElements.define("trondheim-dashboard", TrondheimDashboard);

import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";
import { dispatchEvent } from "../../utils/event-helpers.js";
import storage from "../../utils/storage.js";
import "../common/custom-select.js";
import "../common/buttons/icon-button.js";
import "../common/heading-2.js";

class ThemeSelector extends LitElement {
  static properties = {
    selectedTheme: { type: String, state: true },
  };

  constructor() {
    super();
    this.selectedTheme = storage.loadTheme();
    this.setTheme(this.selectedTheme);
  }

  get themeOptions() {
    return [
      { value: "midnight-blue", label: "Midnight Blue" },
      { value: "peach", label: "Peach Pink" },
      { value: "solarized", label: "Solarized️" },
      { value: "monokai", label: "Monokai" },
      { value: "cat", label: "Cat" },
      { value: "dark", label: "Dark" },
      { value: "light", label: "Light" },
      { value: "retro", label: "High Contrast" },
    ];
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        height: 100%;
      }

      .theme-container {
        background-color: var(--card-background);
        border-radius: var(--border-radius);
        border: var(--widget-border, 1px solid var(--border-color));
        padding: var(--spacing-md);
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      heading-2 {
        margin-bottom: var(--spacing-sm);
      }

      .header-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    adoptMDIStyles(this.shadowRoot);
  }

  handleThemeChange(e) {
    this.selectedTheme = e.detail.value;
    this.setTheme(this.selectedTheme);
  }

  handleRefresh() {
    if (confirm("Clear all cached data and refresh the page?")) {
      localStorage.clear();
      window.location.reload();
    }
  }

  handleLayoutClick() {
    dispatchEvent(this, "layout-editor-toggle", {});
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    storage.saveTheme(theme);
    dispatchEvent(this, "theme-changed", { theme });
  }

  render() {
    return html`
      <div class="theme-container">
        <heading-2 icon="mdi-palette-outline" title="Config">
          <div class="header-actions">
            <icon-button
              @button-click=${this.handleLayoutClick}
              title="Toggle layout editor"
              aria-label="Toggle layout editor"
            >
              <i class="mdi mdi-view-dashboard"></i>
            </icon-button>
            <icon-button
              @button-click=${this.handleRefresh}
              title="Clear cache and refresh"
              aria-label="Clear cache and refresh"
            >
              <i class="mdi mdi-refresh"></i>
            </icon-button>
          </div>
        </heading-2>
        <custom-select
          .options=${this.themeOptions}
          .selected=${this.selectedTheme}
          @change=${this.handleThemeChange}
        >
        </custom-select>
      </div>
    `;
  }
}

customElements.define("theme-selector", ThemeSelector);

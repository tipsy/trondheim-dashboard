import { BaseWidget } from "../common/base-widget.js";
import { html, css } from "lit";
import { dispatchEvent } from "../../utils/event-helpers.js";
import storage from "../../utils/storage.js";
import "../common/custom-select.js";
import "../common/buttons/icon-button.js";

class ThemeSelector extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    selectedTheme: { type: String, state: true },
  };

  constructor() {
    super();
    this.title = "Config";
    this.icon = "mdi-palette-outline";
    this.compactHeader = true;
    this.selectedTheme = storage.loadTheme();
    this.setTheme(this.selectedTheme);
  }

  get themeOptions() {
    return [
      { value: "midnight-blue", label: "Midnight Blue" },
      { value: "retro", label: "High Contrast" },
      { value: "solarized", label: "Solarized️" },
      { value: "monokai", label: "Monokai" },
      { value: "sakura", label: "Sakura" },
      { value: "galaxy", label: "Galaxy" },
      { value: "cat", label: "Cat" },
      { value: "dark", label: "Dark" },
      { value: "light", label: "Light" },
    ];
  }

  static styles = [
    ...BaseWidget.styles,
    css`
      .header-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .header-actions icon-button {
        --icon-btn-size: 28px;
      }

      .header-actions icon-button i {
        font-size: 20px;
      }
    `,
  ];

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

  renderHeaderActions() {
    return html`
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
    `;
  }

  renderContent() {
    return html`
      <custom-select
        .options=${this.themeOptions}
        .selected=${this.selectedTheme}
        @change=${this.handleThemeChange}
      >
      </custom-select>
    `;
  }
}

customElements.define("theme-selector", ThemeSelector);

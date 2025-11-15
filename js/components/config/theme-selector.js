import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";
import { dispatchEvent } from "../../utils/event-helpers.js";
import "../common/custom-select.js";
import "../common/refresh-button.js";
import "../common/heading-2.js";

class ThemeSelector extends LitElement {
  static properties = {
    selectedTheme: { type: String, state: true },
    themeOptions: { type: Array, state: true },
  };

  constructor() {
    super();
    this.selectedTheme =
      localStorage.getItem("trondheim-dashboard-theme") || "midnight-blue";
    this.themeOptions = [
      { value: "midnight-blue", label: "Midnight Blue" },
      { value: "peach", label: "Peach Pink" },
      { value: "solarized", label: "Solarized️" },
      { value: "monokai", label: "Monokai" },
      { value: "cat", label: "Cat" },
      { value: "dark", label: "Dark" },
      { value: "light", label: "Light" },
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
        padding: var(--spacing-md);
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      heading-2 {
        margin-bottom: var(--spacing-sm);
      }

      heading-2 i.mdi {
        color: var(--primary-color);
        font-size: 20px;
      }
    `,
  ];

  async firstUpdated() {
    adoptMDIStyles(this.shadowRoot);
    this.setTheme(this.selectedTheme);
  }

  handleThemeChange(e) {
    const theme = e.detail.value;
    this.selectedTheme = theme;
    this.setTheme(theme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("trondheim-dashboard-theme", theme);
    dispatchEvent(this, "theme-changed", { theme });
  }

  render() {
    return html`
      <div class="theme-container">
        <heading-2 icon="mdi-palette-outline" title="Config">
          <refresh-button>
            <i class="mdi mdi-refresh"></i>
          </refresh-button>
        </heading-2>
        <custom-select
          id="theme-select"
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

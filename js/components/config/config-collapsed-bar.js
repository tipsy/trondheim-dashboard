import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";
import { dispatchEvent } from "../../utils/event-helpers.js";
import storage from "../../utils/storage.js";
import { t } from "../../utils/localization.js";

class ConfigCollapsedBar extends LitElement {
  static properties = {
    address: { type: String },
  };

  constructor() {
    super();
    this.address = "";
  }

  connectedCallback() {
    super.connectedCallback();
    adoptMDIStyles(this.shadowRoot);
  }

  getCurrentLanguageLabel() {
    const locale = storage.loadLocale();
    return locale === "no" ? "Norsk" : "English";
  }

  getCurrentThemeLabel() {
    const theme = storage.loadTheme() || "midnight-blue";
    const themeLabels = {
      "midnight-blue": "Midnight Blue",
      "retro": "High Contrast",
      "solarized": "Solarized",
      "monokai": "Monokai",
      "sakura": "Sakura",
      "galaxy": "Galaxy",
      "cat": "Cat",
      "dark": "Dark",
      "light": "Light",
    };
    return themeLabels[theme] || theme;
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .collapsed-bar {
        background-color: var(--card-background);
        border-radius: var(--border-radius);
        border: var(--widget-border, 1px solid var(--border-color));
        box-shadow: var(--shadow);
        padding: var(--spacing-sm) var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        cursor: pointer;
      }

      .collapsed-bar-content {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        color: var(--text-color);
        font-size: var(--font-size-sm);
        min-width: 0;
      }

      .info-item {
        display: flex;
        align-items: center;
        gap: 2px;
        min-width: 0;
        line-height: 1;
      }

      .info-label {
        color: var(--text-muted);
        flex-shrink: 0;
        font-size: var(--font-size-xs);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .info-value {
        color: var(--text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        background: var(--hover-background, rgba(255, 255, 255, 0.05));
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }

      .expand-icon {
        color: var(--text-muted);
        font-size: 24px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }

      @media (max-width: 768px) {
        .collapsed-bar-content {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--spacing-xs);
        }
      }
    `,
  ];

  handleExpand(e) {
    e?.stopPropagation();
    dispatchEvent(this, "config-expand", {});
  }

  render() {
    return html`
      <div class="collapsed-bar" @click=${this.handleExpand}>
        <div class="collapsed-bar-content">
          <div class="info-item">
            <span class="info-label">${t("Address")}:</span>
            <span class="info-value">${this.address || t("Not set")}</span>
          </div>
          <div class="info-item">
            <span class="info-label">${t("Language")}:</span>
            <span class="info-value">${this.getCurrentLanguageLabel()}</span>
          </div>
          <div class="info-item">
            <span class="info-label">${t("Theme")}:</span>
            <span class="info-value">${this.getCurrentThemeLabel()}</span>
          </div>
        </div>
        <i class="mdi mdi-chevron-down expand-icon"></i>
      </div>
    `;
  }
}

customElements.define("config-collapsed-bar", ConfigCollapsedBar);


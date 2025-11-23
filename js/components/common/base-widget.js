// Base Widget Component - provides common widget structure and functionality
// All dashboard widgets should extend this class

import { LitElement, html, css } from "lit";
import { t } from "../../utils/localization.js";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";
import "./loading-spinner.js";
import "./error-message.js";
import "./heading-2.js";

export class BaseWidget extends LitElement {
  static properties = {
    title: { type: String },
    icon: { type: String },
    compactHeader: { type: Boolean },
    collapsible: { type: Boolean },
    isLoading: { type: Boolean, state: true },
    errorMessage: { type: String, state: true },
    collapsed: { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.title = "Widget";
    this.icon = "mdi-square-outline";
    this.compactHeader = false;
    this.collapsible = false;
    this.isLoading = false;
    this.errorMessage = "";
    this.collapsed = true;
    this._placeholderTimerId = null;
    this._showPlaceholder = false;
  }

  get showPlaceholder() {
    return this._showPlaceholder && !this.isLoading && !this.errorMessage;
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .widget-container {
        background-color: var(--card-background);
        border-radius: var(--border-radius);
        border: var(--widget-border, 1px solid var(--border-color));
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
      }

      /* Desktop: fixed height with scrolling */
      @media (min-width: 1025px) {
        .widget-container {
          height: 100%;
        }

        #content {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
      }

      /* Mobile/Tablet: natural height, no scrolling */
      @media (max-width: 1024px) {
        .widget-container {
          height: auto;
        }

        #content {
          overflow-y: visible;
          overflow-x: visible;
          min-height: auto;
        }

        #content.collapsed {
          display: none;
        }

        .widget-header.collapsed {
          margin-bottom: 0;
        }

        .widget-header.scrolled {
          border-bottom-color: transparent;
        }
      }

      .widget-header {
        margin-bottom: var(--spacing-sm);
        padding: var(--spacing-md);
        flex-shrink: 0;
        border-bottom: 1px solid transparent;
        transition: border-color 0.2s ease;
      }

      .widget-header.compact {
        padding-bottom: var(--spacing-xs);
      }

      .widget-header.scrolled {
        border-bottom-color: var(--border-color);
        margin-bottom: 0;
      }

      #content {
        padding: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
      }

      #content::-webkit-scrollbar {
        width: 4px;
      }

      #content::-webkit-scrollbar-track {
        background: transparent;
      }

      #content::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 2px;
        transition: background 0.3s ease;
      }

      #content.scrolling::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb);
      }

      #content.scrolling::-webkit-scrollbar-thumb:hover {
        background: var(--scrollbar-thumb-hover);
      }

      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: var(--spacing-xl);
      }

      .no-data {
        text-align: center;
        color: var(--text-muted);
        padding: var(--spacing-xl);
      }

      .placeholder {
        text-align: center;
        color: var(--text-muted);
        padding: var(--spacing-xl);
      }

      /* Additional styles that child widgets might need */
      h4 {
        margin: var(--spacing-md) 0 var(--spacing-sm) 0;
        color: var(--text-color);
        font-size: var(--font-size-md);
      }

      error-message {
        display: block;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    adoptMDIStyles(this.shadowRoot);
  }

  firstUpdated() {
    this.setupScrollListener();
    this.startPlaceholderTimer();
  }

  // Override this method in child classes to provide header actions (like refresh buttons)
  renderHeaderActions() {
    return html``;
  }

  // Override this method in child classes to customize placeholder text
  getPlaceholderText() {
    return t("Enter address to see information");
  }

  // Override this for custom content rendering
  renderContent() {
    return html``;
  }

  render() {
    const contentTemplate = this.isLoading
      ? html`
          <div class="loading-container">
            <loading-spinner size="large"></loading-spinner>
          </div>
        `
      : this.errorMessage
        ? html` <error-message message="${this.errorMessage}"></error-message> `
        : this.showPlaceholder
          ? html` <p class="placeholder">${this.getPlaceholderText()}</p> `
          : this.renderContent();

    const isCollapsed = this.collapsible && this.collapsed;

    return html`
      <div class="widget-container">
        <div class="widget-header ${this.compactHeader ? "compact" : ""} ${isCollapsed ? "collapsed" : ""}">
          <heading-2 
            icon="${this.icon}" 
            title="${t(this.title)}"
            ?collapsible=${this.collapsible}
            ?collapsed=${this.collapsed}
            @collapse-toggle=${this.handleCollapseToggle}
          >
            ${this.renderHeaderActions()}
          </heading-2>
        </div>
        <div id="content" class="${isCollapsed ? "collapsed" : ""}">${contentTemplate}</div>
      </div>
    `;
  }

  handleCollapseToggle() {
    this.collapsed = !this.collapsed;
  }

  // Set up scroll listener to add border to header when scrolled
  setupScrollListener() {
    const content = this.shadowRoot.getElementById("content");
    const header = this.shadowRoot.querySelector(".widget-header");

    if (content && header) {
      // Only enable scroll listener on desktop (> 1024px)
      const isDesktop = () => window.matchMedia("(min-width: 1025px)").matches;

      if (!isDesktop()) {
        // On mobile, don't set up scroll listener
        return;
      }

      let scrollTimeout;

      content.addEventListener("scroll", () => {
        // Only apply scroll effects on desktop
        if (!isDesktop()) return;

        // Update header border
        if (content.scrollTop > 0) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }

        // Show scrollbar while scrolling
        content.classList.add("scrolling");

        // Hide scrollbar after scrolling stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          content.classList.remove("scrolling");
        }, 200); // Hide after .2s of no scrolling
      });
    }
  }

  // Start a delayed placeholder that will appear after 1s if no content/activity occurs
  startPlaceholderTimer() {
    this.cancelPlaceholderTimer();
    this._placeholderTimerId = setTimeout(() => {
      // Only show placeholder if still connected and content is empty
      if (!this.isConnected) return;
      const content = this.shadowRoot.getElementById("content");
      if (content && content.children.length === 0) {
        this._showPlaceholder = true;
        this.requestUpdate();
      }
    }, 1000);
  }

  cancelPlaceholderTimer() {
    if (this._placeholderTimerId) {
      clearTimeout(this._placeholderTimerId);
      this._placeholderTimerId = null;
    }
  }

  // Utility methods for common widget operations
  showLoading(loading = true) {
    this.cancelPlaceholderTimer();
    this.isLoading = loading;
    this.errorMessage = "";
    this._showPlaceholder = false;

    if (!loading) {
      this.startPlaceholderTimer();
    }
  }

  showError(message) {
    this.cancelPlaceholderTimer();
    this.isLoading = false;
    this.errorMessage = message;
    this._showPlaceholder = false;
  }

  // Utility method for managing auto-refresh intervals
  setupAutoRefresh(callback, intervalMs = 60000) {
    this.clearAutoRefresh();
    this._refreshInterval = setInterval(() => {
      if (this.isConnected) {
        callback();
      }
    }, intervalMs);
  }

  clearAutoRefresh() {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  }

  // Helper method to handle API data fetching with standard error handling
  async fetchData(apiFn, errorMsg = "Could not load data") {
    this.showLoading(true);
    try {
      return await apiFn();
    } catch (error) {
      console.error(errorMsg, error);
      // Use the error message if it's more specific than the default
      const displayMsg =
        error.message && error.message.length > 10 ? error.message : errorMsg;
      this.showError(displayMsg);
      return null;
    } finally {
      this.showLoading(false);
    }
  }

  // Helper to validate array data is not empty
  hasData(data) {
    return Array.isArray(data) && data.length > 0;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearAutoRefresh();
    this.cancelPlaceholderTimer();
  }
}

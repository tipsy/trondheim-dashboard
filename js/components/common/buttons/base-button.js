import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../../utils/shared-styles.js";
import { dispatchEvent } from "../../../utils/event-helpers.js";

/**
 * Base Button Component
 * Abstract base class for all button components
 * Provides common styling and loading functionality
 */
export class BaseButton extends LitElement {
  static properties = {
    disabled: { type: Boolean },
    loading: { type: Boolean },
    dense: { type: Boolean },
  };

  static styles = [
    sharedStyles,
    css`
      :host {
        display: inline-block;
      }

      button {
        position: relative;
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: var(--font-size-md);
        transition:
          background-color 0.2s,
          transform 0.1s;
        font-family: var(--font-family, sans-serif);
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: var(--input-height);
        gap: var(--spacing-xs);
      }

      :host([dense]) button {
        padding: 4px 12px;
        font-size: 0.9rem;
        min-height: auto;
      }

      button:active:not(:disabled) {
        transform: scale(0.98);
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .button-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      .button-content.loading {
        visibility: hidden;
      }

      .loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid var(--button-text);
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback?.();
    try {
      // Ensure MDI icon font styles are available inside the button's shadow root
      adoptMDIStyles(this.shadowRoot);
    } catch (e) {
      // ignore if adoptMDIStyles not available or fails
    }
  }

  handleClick(e) {
    if (!this.disabled && !this.loading) {
      dispatchEvent(this, "button-click");
    }
  }

  render() {
    return html`
      <button
        ?disabled=${this.disabled || this.loading}
        @click=${this.handleClick}
      >
        <span class="button-content ${this.loading ? "loading" : ""}">
          <slot></slot>
        </span>
        ${this.loading ? html`<span class="loading-spinner"></span>` : ""}
      </button>
    `;
  }
}

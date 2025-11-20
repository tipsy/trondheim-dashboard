import { LitElement, html, css } from "lit";
import { sharedStyles } from "../../utils/shared-styles.js";

class LoadingSpinner extends LitElement {
  static properties = {
    size: { type: String },
  };

  constructor() {
    super();
    this.size = "medium";
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .spinner {
        display: inline-block;
        border: solid var(--spinner-ring, var(--border-color, #e0e0e0));
        border-top-color: var(--spinner-segment, var(--primary-color, #0066cc));
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .spinner.small {
        width: 16px;
        height: 16px;
        border-width: 2px;
      }

      .spinner.medium {
        width: 24px;
        height: 24px;
        border-width: 3px;
      }

      .spinner.large {
        width: 40px;
        height: 40px;
        border-width: 4px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ];

  render() {
    return html`<div class="spinner ${this.size || 'medium'}"></div>`;
  }
}

customElements.define("loading-spinner", LoadingSpinner);

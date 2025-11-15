import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";

class ErrorMessage extends LitElement {
  static properties = {
    message: { type: String },
  };

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .message-container {
        padding: var(--spacing-md, 16px);
        border-radius: var(--border-radius, 8px);
        border: 1px solid;
        line-height: 1.5;
        font-size: var(--font-size-sm, 14px);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm, 8px);
        text-align: center;
        color: var(--error-color, #d32f2f);
        background-color: var(--error-bg, #ffebee);
        border-color: var(--error-color, #d32f2f);
      }

      .message-container i {
        flex-shrink: 0;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    adoptMDIStyles(this.shadowRoot);
  }

  render() {
    return html`
      <div class="message-container">
        <i class="mdi mdi-alert-circle-outline"></i>
        <span>${this.message}</span>
      </div>
    `;
  }
}

customElements.define("error-message", ErrorMessage);

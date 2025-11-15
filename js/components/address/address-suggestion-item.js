// Address Suggestion Item Component
// Displays a single address suggestion with main address and details

import { LitElement, html, css } from "lit";
import { sharedStyles } from "../../utils/shared-styles.js";
import { dispatchEvent } from "../../utils/event-helpers.js";

class AddressSuggestionItem extends LitElement {
  static properties = {
    location: { type: Object },
  };

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .suggestion-item {
        padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
        cursor: pointer;
        border-bottom: 1px solid var(--border-color, #e0e0e0);
        transition: background-color 0.2s;
      }

      .suggestion-item:hover {
        background-color: var(--hover-bg, #f5f5f5);
      }

      :host(:last-child) .suggestion-item {
        border-bottom: none;
      }

      /* Mobile: larger touch targets */
      @media (max-width: 767px) {
        .suggestion-item {
          padding: var(--spacing-md, 16px);
          min-height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
      }

      .address-name {
        font-weight: 500;
        color: var(--text-color, #000);
        font-size: var(--font-size-md, 16px);
      }
    `,
  ];

  handleClick() {
    dispatchEvent(this, "select", { location: this.location });
  }

  render() {
    return html`
      <div class="suggestion-item" @click=${this.handleClick}>
        <div class="address-name">${this.location.displayName}</div>
      </div>
    `;
  }
}

customElements.define("address-suggestion-item", AddressSuggestionItem);

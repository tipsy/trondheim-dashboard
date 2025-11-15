import { css, html } from "lit";
import { BaseButton } from "./base-button.js";
import { adoptMDIStyles } from "../../../utils/shared-styles.js";

/**
 * Icon Button Component
 * Generic button that displays only an icon
 */
export class IconButton extends BaseButton {
  static styles = [
    ...BaseButton.styles,
    css`
      button {
        background-color: transparent;
        color: var(--icon-btn-color, var(--text-color));
        border: none;
        border-radius: var(--icon-btn-radius, var(--border-radius));
        width: var(--icon-btn-size, 32px);
        height: var(--icon-btn-size, 32px);
        min-height: var(--icon-btn-size, 32px);
        padding: var(--spacing-xs);
        gap: 0;
      }

      button:hover:not(:disabled) {
        background-color: transparent;
        color: var(--text-color);
      }

      ::slotted(i.mdi) {
        font-size: 24px;
        line-height: 1;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    adoptMDIStyles(this.shadowRoot);
  }

  render() {
    return html`
      <button
        ?disabled=${this.disabled || this.loading}
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

customElements.define("icon-button", IconButton);


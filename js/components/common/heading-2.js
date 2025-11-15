// Heading 2 Component - reusable heading for widget titles

import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";

class Heading2 extends LitElement {
  static properties = {
    icon: { type: String },
    title: { type: String },
  };

  firstUpdated() {
    adoptMDIStyles(this.shadowRoot);
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-md);
      }

      .title-section {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
        color: var(--heading-color, var(--text-color));
      }

      h2 {
        margin: 0;
        color: inherit;
        font-size: 18px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .title-section i {
        font-size: 28px;
        flex-shrink: 0;
        color: inherit;
        margin-right: var(--spacing-xs);
      }

      .actions {
        flex-shrink: 0;
      }
    `,
  ];

  render() {
    return html`
      <div class="title-section">
        ${this.icon ? html`<i class="mdi ${this.icon}"></i>` : ""}
        <h2>${this.title}</h2>
      </div>
      <div class="actions">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("heading-2", Heading2);

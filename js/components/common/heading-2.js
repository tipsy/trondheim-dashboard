// Heading 2 Component - reusable heading for widget titles

import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";

class Heading2 extends LitElement {
  static properties = {
    icon: { type: String },
    title: { type: String },
    collapsible: { type: Boolean },
    collapsed: { type: Boolean },
  };

  connectedCallback() {
    super.connectedCallback();
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
      }

      .chevron {
        font-size: 24px;
        cursor: pointer;
        transition: transform 0.2s ease;
        flex-shrink: 0;
        color: var(--text-muted);
      }

      .chevron.collapsed {
        transform: rotate(-90deg);
      }

      .actions-slot {
        flex-shrink: 0;
      }

      /* Desktop: Hide chevron, keep actions inline */
      @media (min-width: 1025px) {
        .chevron {
          display: none;
        }
      }

      /* Mobile: Collapsible widgets have different layout */
      @media (max-width: 1024px) {
        :host(.collapsible) {
          flex-wrap: wrap;
        }

        :host(.collapsible) .actions-slot {
          flex-basis: 100%;
          width: 100%;
        }

        :host(.collapsible.collapsed) .actions-slot {
          display: none;
        }
      }
    `,
  ];

  handleChevronClick() {
    if (this.collapsible) {
      this.dispatchEvent(new CustomEvent('collapse-toggle', { bubbles: true, composed: true }));
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    // Update host class based on collapsible property
    if (changedProperties.has('collapsible')) {
      if (this.collapsible) {
        this.classList.add('collapsible');
      } else {
        this.classList.remove('collapsible');
      }
    }
    // Update host class based on collapsed property
    if (changedProperties.has('collapsed')) {
      if (this.collapsed) {
        this.classList.add('collapsed');
      } else {
        this.classList.remove('collapsed');
      }
    }
  }

  render() {
    return html`
      <div class="title-section">
        ${this.icon ? html`<i class="mdi ${this.icon}"></i>` : ""}
        <h2>${this.title}</h2>
      </div>
      ${this.collapsible
        ? html`
            <i 
              class="mdi mdi-chevron-down chevron ${this.collapsed ? 'collapsed' : ''}"
              @click=${this.handleChevronClick}
            ></i>
          `
        : ""}
      <div class="actions-slot">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("heading-2", Heading2);

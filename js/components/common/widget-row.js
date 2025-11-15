// Widget Row Component - Lit version
// Simple card wrapper with either attributes or slot

import { LitElement, html, css } from "lit";
import { sharedStyles } from "../../utils/shared-styles.js";

class WidgetRow extends LitElement {
  static properties = {
    title: { type: String },
    description: { type: String },
    href: { type: String },
    borderColor: { type: String, attribute: "border-color" },
  };

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .card {
        background-color: var(--alt-background);
        border-radius: var(--border-radius);
        padding: var(--spacing-md);
        overflow: hidden;
      }

      a.card {
        text-decoration: none;
        color: inherit;
        display: block;
        transition:
          transform 0.08s ease,
          box-shadow 0.08s ease;
      }

      a.card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-hover, 0 4px 14px rgba(0, 0, 0, 0.08));
      }

      .content {
        display: flex;
        flex-direction: column;
      }

      .title {
        font-weight: bold;
        color: var(--text-color);
        font-size: var(--font-size-md);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .description {
        font-size: var(--font-size-sm);
        color: var(--text-light);
        margin-top: 4px;
      }

      .title.responsive-text,
      .description.responsive-text {
        /* Responsive text handling via shared styles */
      }
    `,
  ];

  renderContent() {
    const hasAttributes = this.title || this.description;
    if (hasAttributes) {
      return html`
        <div class="content">
          ${this.title ? html`<div class="title">${this.title}</div>` : ""}
          ${this.description
            ? html`<div class="description responsive-text">
                ${this.description}
              </div>`
            : ""}
        </div>
      `;
    }
    return html`<slot></slot>`;
  }

  render() {
    const style = this.borderColor
      ? `border-left: 4px solid ${this.borderColor};`
      : "";

    if (this.href) {
      return html`
        <a
          class="card"
          style=${style}
          href=${this.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          ${this.renderContent()}
        </a>
      `;
    }

    return html`
      <div class="card" style=${style}>${this.renderContent()}</div>
    `;
  }
}

customElements.define("widget-row", WidgetRow);

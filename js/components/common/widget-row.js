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
      .card {
        background-color: var(--alt-background);
        border-radius: var(--border-radius);
        padding: var(--spacing-md);
        overflow: hidden;
      }

      .card.bordered {
        border-left: 4px solid var(--row-border-color);
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
    `,
  ];

  render() {
    const content = (this.title || this.description)
      ? html`
          <div class="content">
            ${this.title ? html`<div class="title">${this.title}</div>` : ""}
            ${this.description ? html`<div class="description">${this.description}</div>` : ""}
          </div>
        `
      : html`<slot></slot>`;

    const cardClass = `card ${this.borderColor ? 'bordered' : ''}`;

    if (this.borderColor) {
      this.style.setProperty('--row-border-color', this.borderColor);
    }

    return this.href
      ? html`<a class=${cardClass} href=${this.href} target="_blank" rel="noopener noreferrer">${content}</a>`
      : html`<div class=${cardClass}>${content}</div>`;
  }
}

customElements.define("widget-row", WidgetRow);

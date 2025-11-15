import { LitElement, html, css } from 'lit';
import { sharedStyles, adoptMDIStyles } from '../../utils/shared-styles.js';
import { baseButtonStyles } from './base-button-styles.js';
import { dispatchEvent } from '../../utils/event-helpers.js';

class SecondaryButton extends LitElement {
    static properties = {
        disabled: { type: Boolean }
    };

    static styles = [
        sharedStyles,
        baseButtonStyles,
        css`
            button {
                background-color: var(--card-background);
                color: var(--text-color);
                border: 1px solid var(--border-color);
            }

            button:hover:not(:disabled) {
                background-color: var(--hover-bg, #f5f5f5);
            }
        `
    ];

    constructor() {
        super();
        this.disabled = false;
    }

    connectedCallback() {
        super.connectedCallback();
        adoptMDIStyles(this.shadowRoot);
    }

    handleClick(e) {
        if (!this.disabled) {
            dispatchEvent(this, 'button-click');
        }
    }

    render() {
        return html`
            <button
                ?disabled=${this.disabled}
                @click=${this.handleClick}
            >
                <slot></slot>
            </button>
        `;
    }
}

customElements.define('secondary-button', SecondaryButton);


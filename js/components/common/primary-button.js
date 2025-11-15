import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../utils/shared-styles.js';
import { baseButtonStyles } from './base-button-styles.js';

class PrimaryButton extends LitElement {
    static properties = {
        disabled: { type: Boolean },
        loading: { type: Boolean }
    };

    static styles = [
        sharedStyles,
        baseButtonStyles,
        css`
            button {
                background-color: var(--primary-color);
                color: var(--button-text);
            }

            button:hover:not(:disabled) {
                background-color: var(--secondary-color);
            }
        `
    ];

    constructor() {
        super();
        this.disabled = false;
        this.loading = false;
    }

    handleClick(e) {
        if (!this.disabled && !this.loading) {
            this.dispatchEvent(new CustomEvent('button-click', {
                bubbles: true,
                composed: true
            }));
        }
    }

    render() {
        return html`
            <button
                ?disabled=${this.disabled || this.loading}
                @click=${this.handleClick}
            >
                <span class="button-content ${this.loading ? 'loading' : ''}">
                    <slot></slot>
                </span>
                ${this.loading ? html`<span class="loading-spinner"></span>` : ''}
            </button>
        `;
    }
}

customElements.define('primary-button', PrimaryButton);


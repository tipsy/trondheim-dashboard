import { LitElement, html, css } from 'lit';
import { sharedStyles, adoptMDIStyles } from '../../utils/shared-styles.js';

class ClearButton extends LitElement {
    static properties = {
        visible: { type: Boolean }
    };

    static styles = [
        sharedStyles,
        css`
            :host {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                z-index: 10;
            }

            button {
                background: none;
                border: none;
                padding: 6px;
                cursor: pointer;
                color: var(--text-light, #999);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
                width: 28px;
                height: 28px;
            }

            button:hover {
                background-color: var(--hover-bg, #f5f5f5);
                color: var(--text-color);
            }

            button:active {
                transform: scale(0.95);
            }

            :host([hidden]) {
                display: none;
            }
        `
    ];

    constructor() {
        super();
        this.visible = false;
    }

    connectedCallback() {
        super.connectedCallback();
        adoptMDIStyles(this.shadowRoot);
    }

    handleClick(e) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('clear', {
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <button
                @click=${this.handleClick}
                title="Clear"
                aria-label="Clear input"
            >
                <i class="mdi mdi-close"></i>
            </button>
        `;
    }
}

customElements.define('clear-button', ClearButton);


import { LitElement, html, css } from 'lit';
import { sharedStyles, adoptMDIStyles } from '../../utils/shared-styles.js';
import { dispatchEvent } from '../../utils/event-helpers.js';

class ClearButton extends LitElement {
    static properties = {
        visible: { type: Boolean }
    };

    static styles = [
        sharedStyles,
        css`
            :host {
                position: absolute;
                right: 0;
                top: 0;
                height: 40px;
                width: 40px;
                z-index: 10;
            }

            button {
                background: none;
                border: none;
                padding: 0;
                cursor: pointer;
                color: var(--text-light, #999);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
                width: 100%;
                height: 100%;
            }

            button:hover {
                background-color: var(--hover-bg, #f5f5f5);
                color: var(--text-color);
            }

            button:active {
                transform: scale(0.95);
            }

            button i {
                font-size: 20px;
            }

            :host([hidden]) {
                display: none;
            }
        `
    ];


    connectedCallback() {
        super.connectedCallback();
        adoptMDIStyles(this.shadowRoot);
    }

    handleClick(e) {
        e.stopPropagation();
        dispatchEvent(this, 'clear');
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


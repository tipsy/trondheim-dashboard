import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../utils/shared-styles.js';

class InputField extends LitElement {
    static properties = {
        value: { type: String },
        placeholder: { type: String },
        disabled: { type: Boolean },
        type: { type: String }
    };

    static styles = [
        sharedStyles,
        css`
            :host {
                display: block;
                flex: 1;
            }

            input {
                width: 100%;
                height: 40px;
                padding: var(--spacing-sm) 40px var(--spacing-sm) var(--spacing-md);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                font-size: var(--font-size-md);
                background-color: var(--input-background);
                color: var(--text-color);
                font-family: var(--font-family, sans-serif);
                transition: border-color 0.2s;
            }

            input:focus {
                outline: none;
                border-color: var(--primary-color);
            }

            input:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `
    ];

    constructor() {
        super();
        this.value = '';
        this.placeholder = '';
        this.disabled = false;
        this.type = 'text';
    }

    handleInput(e) {
        this.value = e.target.value;
        this.dispatchEvent(new CustomEvent('input-change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }

    handleKeydown(e) {
        this.dispatchEvent(new CustomEvent('input-keydown', {
            detail: { key: e.key, event: e },
            bubbles: true,
            composed: true
        }));
    }

    focus() {
        const input = this.shadowRoot.querySelector('input');
        if (input) input.focus();
    }

    render() {
        return html`
            <input
                type=${this.type}
                .value=${this.value}
                placeholder=${this.placeholder}
                ?disabled=${this.disabled}
                @input=${this.handleInput}
                @keydown=${this.handleKeydown}
                autocomplete="off"
            />
        `;
    }
}

customElements.define('input-field', InputField);


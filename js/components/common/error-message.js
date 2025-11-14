import { LitElement, html, css, unsafeCSS } from 'lit';

class ErrorMessage extends LitElement {
    static properties = {
        message: { type: String }
    };

    static styles = css`
        ${unsafeCSS(IconLibrary.importCss)}

        :host {
            display: block;
        }

        .message-container {
            padding: var(--spacing-md, 16px);
            border-radius: var(--border-radius, 8px);
            border: 1px solid;
            line-height: 1.5;
            font-size: var(--font-size-sm, 14px);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-sm, 8px);
            text-align: center;
            color: var(--error-color, #d32f2f);
            background-color: var(--error-bg, #ffebee);
            border-color: var(--error-color, #d32f2f);
        }

        .error-icon {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .message-text {
            flex: 1;
        }
    `;

    constructor() {
        super();
        this.message = 'An error occurred';
    }

    render() {
        return html`
            <div class="message-container">
                <div class="error-icon">
                    <i class="mdi mdi-alert-circle-outline"></i>
                </div>
                <div class="message-text">${this.message}</div>
            </div>
        `;
    }
}

customElements.define('error-message', ErrorMessage);

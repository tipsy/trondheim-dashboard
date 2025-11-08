class ErrorMessage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['message', 'type', 'dismissible'];
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const message = this.getAttribute('message') || 'An error occurred';
        const type = this.getAttribute('type') || 'error';
        const dismissible = this.hasAttribute('dismissible');

        const typeStyles = {
            error: {
                bg: 'var(--error-bg, #ffebee)',
                color: 'var(--error-color, #d32f2f)',
                border: 'var(--error-color, #d32f2f)',
                icon: '<i class="mdi mdi-alert-circle-outline"></i>'
            },
            warning: {
                bg: '#fff3e0',
                color: '#e65100',
                border: '#e65100',
                icon: '<i class="mdi mdi-alert-outline"></i>'
            },
            info: {
                bg: 'var(--info-bg, #e3f2fd)',
                color: 'var(--info-color, #1976d2)',
                border: 'var(--info-color, #1976d2)',
                icon: '<i class="mdi mdi-information-outline"></i>'
            }
        };

        const style = typeStyles[type] || typeStyles.error;

        this.shadowRoot.innerHTML = `
            <style>
                ${IconLibrary.importCss}
                * {
                    box-sizing: border-box;
                }

                :host {
                    display: block;
                }

                .message-container {
                    color: ${style.color};
                    padding: var(--spacing-md, 16px);
                    background-color: ${style.bg};
                    border-radius: var(--border-radius, 8px);
                    border: 1px solid ${style.border};
                    line-height: 1.5;
                    font-size: var(--font-size-sm, 14px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--spacing-sm, 8px);
                    text-align: center;
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

                .dismiss-button {
                    background: none;
                    border: none;
                    color: ${style.color};
                    cursor: pointer;
                    padding: 0;
                    font-size: 20px;
                    line-height: 1;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                    flex-shrink: 0;
                }

                .dismiss-button:hover {
                    opacity: 1;
                }
            </style>

            <div class="message-container">
                <div class="error-icon">${style.icon}</div>
                <div class="message-text">${message}</div>
                ${dismissible ? '<button class="dismiss-button" aria-label="Dismiss">×</button>' : ''}
            </div>
        `;
    }

    attachEventListeners() {
        const dismissButton = this.shadowRoot.querySelector('.dismiss-button');
        if (dismissButton) {
            dismissButton.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
                this.remove();
            });
        }
    }
}

customElements.define('error-message', ErrorMessage);


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
                icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>`
            },
            warning: {
                bg: '#fff3e0',
                color: '#e65100',
                border: '#e65100',
                icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>`
            },
            info: {
                bg: 'var(--info-bg, #e3f2fd)',
                color: 'var(--info-color, #1976d2)',
                border: 'var(--info-color, #1976d2)',
                icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>`
            }
        };

        const style = typeStyles[type] || typeStyles.error;

        this.shadowRoot.innerHTML = `
            <style>
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
                    align-items: flex-start;
                    gap: var(--spacing-sm, 8px);
                }

                .error-icon {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 2px;
                }

                .error-icon svg {
                    width: 24px;
                    height: 24px;
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


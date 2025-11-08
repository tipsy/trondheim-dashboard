class IconButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['icon', 'label', 'variant', 'loading', 'disabled'];
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    attributeChangedCallback() {
        this.render();
    }

    getIcon(iconName) {
        const icons = {
            'search': '<i class="mdi mdi-magnify"></i>',
            'location': '<i class="mdi mdi-crosshairs-gps"></i>',
            'close': '<i class="mdi mdi-close"></i>',
            'check': '<i class="mdi mdi-check"></i>'
        };
        return icons[iconName] || '';
    }

    render() {
        const icon = this.getAttribute('icon') || '';
        const label = this.getAttribute('label') || '';
        const variant = this.getAttribute('variant') || 'primary';
        const loading = this.hasAttribute('loading');
        const disabled = this.hasAttribute('disabled');

        const variants = {
            primary: {
                bg: 'var(--primary-color, #0066cc)',
                hoverBg: 'var(--secondary-color, #004d99)',
                color: 'var(--button-text, #ffffff)'
            },
            secondary: {
                bg: 'var(--card-background, #ffffff)',
                hoverBg: 'var(--hover-bg, #f5f5f5)',
                color: 'var(--text-color, #333333)'
            },
            success: {
                bg: 'var(--success-color, #4caf50)',
                hoverBg: 'var(--success-hover, #45a049)',
                color: 'var(--button-text, #ffffff)'
            }
        };

        const style = variants[variant] || variants.primary;

        this.shadowRoot.innerHTML = `
            <style>
                ${IconLibrary.importCss}
                * {
                    box-sizing: border-box;
                }

                :host {
                    display: inline-block;
                }

                button {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs, 4px);
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    background-color: ${style.bg};
                    color: ${style.color};
                    border: ${variant === 'secondary' ? '1px solid var(--border-color, #e0e0e0)' : 'none'};
                    border-radius: var(--border-radius, 8px);
                    font-size: var(--font-size-md, 16px);
                    font-family: var(--font-family, sans-serif);
                    cursor: pointer;
                    transition: background-color 0.2s, transform 0.1s;
                    white-space: nowrap;
                }

                button:hover:not(:disabled) {
                    background-color: ${style.hoverBg};
                }

                button:active:not(:disabled) {
                    transform: scale(0.98);
                }

                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid currentColor;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>

            <button ${disabled || loading ? 'disabled' : ''}>
                ${loading ? '<span class="spinner"></span>' : (icon ? `<span class="icon">${this.getIcon(icon)}</span>` : '')}
                ${label ? `<span>${label}</span>` : ''}
            </button>
        `;
    }

    attachEventListeners() {
        const button = this.shadowRoot.querySelector('button');
        if (button) {
            button.addEventListener('click', (e) => {
                if (!this.hasAttribute('disabled') && !this.hasAttribute('loading')) {
                    this.dispatchEvent(new CustomEvent('click', { 
                        bubbles: true, 
                        composed: true,
                        detail: e
                    }));
                }
            });
        }
    }
}

customElements.define('icon-button', IconButton);


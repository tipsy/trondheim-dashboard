class LoadingSpinner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['size'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const size = this.getAttribute('size') || 'medium';
        
        const sizes = {
            small: { width: '16px', height: '16px', border: '2px' },
            medium: { width: '24px', height: '24px', border: '3px' },
            large: { width: '40px', height: '40px', border: '4px' }
        };

        const dimensions = sizes[size] || sizes.medium;

        this.shadowRoot.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                }

                :host {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .spinner {
                    display: inline-block;
                    width: ${dimensions.width};
                    height: ${dimensions.height};
                    border: ${dimensions.border} solid var(--border-color, #e0e0e0);
                    border-top-color: var(--primary-color, #0066cc);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-md, 16px);
                }
            </style>

            <div class="container">
                <div class="spinner"></div>
            </div>
        `;
    }
}

customElements.define('loading-spinner', LoadingSpinner);


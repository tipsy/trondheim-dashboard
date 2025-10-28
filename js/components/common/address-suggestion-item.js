// Address Suggestion Item Component
// Displays a single address suggestion with main address and details

class AddressSuggestionItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['display-name', 'index'];
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const displayName = this.getAttribute('display-name') || '';

        // For Norwegian format "Street Number, Postcode City"
        // Just show the whole address as main, no details needed
        const mainAddress = displayName;
        const details = ''; // No additional details for clean Norwegian format

        this.shadowRoot.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                }

                :host {
                    display: block;
                }

                .suggestion-item {
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    cursor: pointer;
                    border-bottom: 1px solid var(--border-color, #e0e0e0);
                    transition: background-color 0.2s;
                }

                .suggestion-item:hover {
                    background-color: var(--hover-bg, #f5f5f5);
                }

                /* Mobile: larger touch targets */
                @media (max-width: 767px) {
                    .suggestion-item {
                        padding: var(--spacing-md, 16px);
                        min-height: 60px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                }

                .address-name {
                    font-weight: 500;
                    color: var(--text-color, #000);
                    font-size: var(--font-size-md, 16px);
                }

                .address-details {
                    font-size: var(--font-size-sm, 14px);
                    color: var(--text-light, #666);
                    margin-top: 2px;
                }
            </style>

            <div class="suggestion-item">
                <div class="address-name">${mainAddress}</div>
                <div class="address-details">${details}</div>
            </div>
        `;
    }

    attachEventListeners() {
        const item = this.shadowRoot.querySelector('.suggestion-item');
        if (item) {
            item.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('select', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        index: parseInt(this.getAttribute('index') || '0')
                    }
                }));
            });
        }
    }
}

customElements.define('address-suggestion-item', AddressSuggestionItem);


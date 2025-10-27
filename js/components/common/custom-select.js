class CustomSelect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.options = [];
    }

    static get observedAttributes() {
        return ['label', 'selected', 'placeholder'];
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    disconnectedCallback() {
        // Clean up event listeners
        const select = this.shadowRoot.getElementById('select');
        if (select && this.changeHandler) {
            select.removeEventListener('change', this.changeHandler);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
            // Re-attach listeners after render
            if (this.isConnected) {
                this.attachEventListeners();
            }
        }
    }

    setOptions(options) {
        this.options = options;
        this.render();
        // Re-attach listeners after render
        if (this.isConnected) {
            this.attachEventListeners();
        }
    }

    render() {
        const label = this.getAttribute('label') || '';
        const selected = this.getAttribute('selected') || '';
        const placeholder = this.getAttribute('placeholder') || 'Select an option';

        this.shadowRoot.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                }

                :host {
                    display: block;
                }

                .select-container {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-xs, 4px);
                }

                label {
                    font-size: var(--font-size-sm, 14px);
                    color: var(--text-color, #333333);
                    font-weight: 500;
                }

                select {
                    width: 100%;
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    border: 1px solid var(--border-color, #e0e0e0);
                    border-radius: var(--border-radius, 8px);
                    font-size: var(--font-size-md, 16px);
                    background-color: var(--input-background, #ffffff);
                    color: var(--text-color, #333333);
                    font-family: var(--font-family, sans-serif);
                    cursor: pointer;
                    transition: border-color 0.2s;
                }

                select:focus {
                    outline: none;
                    border-color: var(--primary-color, #0066cc);
                }

                select:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            </style>

            <div class="select-container">
                ${label ? `<label>${label}</label>` : ''}
                <select id="select">
                    ${placeholder && !selected ? `<option value="" disabled selected>${placeholder}</option>` : ''}
                    ${this.options.map(option => `
                        <option value="${option.value}" ${option.value === selected ? 'selected' : ''}>
                            ${option.label}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    attachEventListeners() {
        const select = this.shadowRoot.getElementById('select');
        if (select) {
            // Remove old listener if it exists
            if (this.changeHandler) {
                select.removeEventListener('change', this.changeHandler);
            }

            // Create and store the handler
            this.changeHandler = (e) => {
                this.setAttribute('selected', e.target.value);
                this.dispatchEvent(new CustomEvent('change', {
                    bubbles: true,
                    composed: true,
                    detail: { value: e.target.value }
                }));
            };

            select.addEventListener('change', this.changeHandler);
        }
    }

    get value() {
        const select = this.shadowRoot.getElementById('select');
        return select ? select.value : '';
    }

    set value(val) {
        this.setAttribute('selected', val);
    }
}

customElements.define('custom-select', CustomSelect);


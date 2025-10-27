class ThemeSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.loadSavedTheme();
        this.attachEventListeners();
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('trondheim-dashboard-theme') || 'light';
        this.setTheme(savedTheme);
        const select = this.shadowRoot.querySelector('custom-select');
        if (select) {
            select.setAttribute('selected', savedTheme);
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('trondheim-dashboard-theme', theme);

        // Dispatch event for dashboard to update URL
        this.dispatchEvent(new CustomEvent('theme-changed', {
            detail: { theme },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        const themeIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>`;

        this.shadowRoot.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                }

                :host {
                    display: block;
                }

                .theme-container {
                    background-color: var(--card-background);
                    border-radius: var(--border-radius);
                    padding: var(--spacing-md);
                    box-shadow: var(--shadow);
                }

                h2 {
                    margin: 0 0 var(--spacing-sm) 0;
                    color: var(--text-color);
                    font-size: var(--font-size-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                }

                svg {
                    flex-shrink: 0;
                }
            </style>

            <div class="theme-container">
                <h2>
                    ${themeIcon}
                    Theme
                </h2>
                <custom-select id="theme-select"></custom-select>
            </div>
        `;
    }

    attachEventListeners() {
        const select = this.shadowRoot.querySelector('custom-select');

        // Set options
        select.setOptions([
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'peach', label: 'Peach Pink 🌸' }
        ]);

        select.addEventListener('change', (e) => {
            this.setTheme(e.detail.value);
        });
    }
}

customElements.define('theme-selector', ThemeSelector);


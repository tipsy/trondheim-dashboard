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
        const savedTheme = localStorage.getItem('trondheim-dashboard-theme') || 'midnight-blue';
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
        this.shadowRoot.innerHTML = `
            <style>
                ${IconLibrary.importCss}
                * {
                    box-sizing: border-box;
                }

                :host {
                    display: block;
                    height: 100%;
                }

                .theme-container {
                    background-color: var(--card-background);
                    border-radius: var(--border-radius);
                    padding: var(--spacing-md);
                    box-shadow: var(--shadow);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                h2 {
                    margin: 0 0 var(--spacing-sm) 0;
                    color: var(--heading-color, var(--text-color));
                    font-size: var(--font-size-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                }

                h2 i {
                    font-size: 28px;
                }
            </style>

            <div class="theme-container">
                <h2>
                    <i class="mdi mdi-palette-outline"></i>
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
            { value: 'midnight-blue', label: 'Midnight Blue' },
            { value: 'peach', label: 'Peach Pink' },
            { value: 'solarized', label: 'Solarized️' },
            { value: 'monokai', label: 'Monokai' },
            { value: 'cat', label: 'Cat' },
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
        ]);

        select.addEventListener('change', (e) => {
            this.setTheme(e.detail.value);
        });
    }
}

customElements.define('theme-selector', ThemeSelector);


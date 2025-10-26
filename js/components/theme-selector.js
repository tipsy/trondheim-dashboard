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
        const select = this.shadowRoot.getElementById('theme-select');
        if (select) {
            select.value = savedTheme;
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('trondheim-dashboard-theme', theme);
    }

    render() {
        const themeIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>`;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .theme-container {
                    background-color: var(--card-background);
                    border-radius: var(--border-radius);
                    padding: var(--spacing-md);
                    box-shadow: var(--shadow);
                    box-sizing: border-box;
                }

                h2 {
                    margin: 0 0 var(--spacing-sm) 0;
                    color: var(--text-color);
                    font-size: var(--font-size-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                }

                .selector-group {
                    display: flex;
                    gap: var(--spacing-sm);
                    align-items: center;
                }

                label {
                    color: var(--text-color);
                    font-size: var(--font-size-md);
                    white-space: nowrap;
                }

                select {
                    flex: 1;
                    padding: var(--spacing-sm) var(--spacing-md);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    background-color: var(--input-background);
                    color: var(--text-color);
                    font-size: var(--font-size-md);
                    cursor: pointer;
                }

                select:focus {
                    outline: none;
                    border-color: var(--primary-color);
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
                <div class="selector-group">
                    <select id="theme-select">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="peach">Peach Pink 🌸</option>
                    </select>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const select = this.shadowRoot.getElementById('theme-select');
        select.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });
    }
}

customElements.define('theme-selector', ThemeSelector);


import { LitElement, html, css } from 'lit';
import { sharedStyles, adoptMDIStyles } from '../../utils/shared-styles.js';
import { dispatchEvent } from '../../utils/event-helpers.js';

class ThemeSelector extends LitElement {
    static properties = {
        selectedTheme: { type: String, state: true }
    };

    static styles = [
        sharedStyles,
        css`

        :host {
            display: block;
            height: 100%;
        }

        .theme-container {
            background-color: var(--card-background);
            border-radius: var(--border-radius);
            padding: var(--spacing-md);
            box-shadow: var(--shadow);
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
    `];

    constructor() {
        super();
        this.selectedTheme = localStorage.getItem('trondheim-dashboard-theme') || 'midnight-blue';
    }

    connectedCallback() {
        super.connectedCallback();
        adoptMDIStyles(this.shadowRoot);
    }

    async firstUpdated() {
        this.setTheme(this.selectedTheme);
        await this.setupThemeSelector();
    }

    async setupThemeSelector() {
        const select = this.shadowRoot.querySelector('custom-select');
        if (!select) return;

        await customElements.whenDefined('custom-select');

        await select.setOptions([
            { value: 'midnight-blue', label: 'Midnight Blue' },
            { value: 'peach', label: 'Peach Pink' },
            { value: 'solarized', label: 'Solarized️' },
            { value: 'monokai', label: 'Monokai' },
            { value: 'cat', label: 'Cat' },
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
        ]);

        select.addEventListener('change', (e) => {
            this.handleThemeChange(e.detail.value);
        });
    }

    handleThemeChange(theme) {
        this.selectedTheme = theme;
        this.setTheme(theme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('trondheim-dashboard-theme', theme);

        dispatchEvent(this, 'theme-changed', { theme });
    }

    render() {
        return html`
            <div class="theme-container">
                <h2>
                    <i class="mdi mdi-palette-outline"></i>
                    Theme
                </h2>
                <custom-select id="theme-select" .selected=${this.selectedTheme}></custom-select>
            </div>
        `;
    }
}

customElements.define('theme-selector', ThemeSelector);


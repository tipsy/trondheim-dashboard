class DetailItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['icon', 'label', 'value'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    getIcon(iconName) {
        const icons = {
            precipitation: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
            </svg>`,
            wind: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/>
            </svg>`,
            temperature: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/>
            </svg>`,
            humidity: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
            </svg>`,
            pressure: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
            </svg>`
        };
        return icons[iconName] || '';
    }

    render() {
        const icon = this.getAttribute('icon') || '';
        const label = this.getAttribute('label') || '';
        const value = this.getAttribute('value') || '';

        this.shadowRoot.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                }

                :host {
                    display: block;
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-xs, 4px);
                }

                .detail-label {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs, 4px);
                    font-size: var(--font-size-sm, 14px);
                    color: var(--text-light, #666666);
                }

                .icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .detail-value {
                    font-size: var(--font-size-md, 16px);
                    font-weight: 600;
                    color: var(--text-color, #333333);
                }
            </style>

            <div class="detail-item">
                <span class="detail-label">
                    ${icon ? `<span class="icon">${this.getIcon(icon)}</span>` : ''}
                    ${label}
                </span>
                <span class="detail-value">${value}</span>
            </div>
        `;
    }
}

customElements.define('detail-item', DetailItem);


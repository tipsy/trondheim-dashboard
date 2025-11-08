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
            'precipitation': '<i class="mdi mdi-water-outline"></i>',
            'wind': '<i class="mdi mdi-weather-windy"></i>',
            'temperature': '<i class="mdi mdi-thermometer"></i>',
            'humidity': '<i class="mdi mdi-water-percent"></i>',
            'pressure': '<i class="mdi mdi-gauge"></i>',
            'sunrise': '<i class="mdi mdi-weather-sunset-up"></i>',
            'sunset': '<i class="mdi mdi-weather-sunset-down"></i>',
            'daylight': '<i class="mdi mdi-clock-outline"></i>'
        };
        return icons[iconName] || '';
    }

    render() {
        const icon = this.getAttribute('icon') || '';
        const label = this.getAttribute('label') || '';
        const value = this.getAttribute('value') || '';

        this.shadowRoot.innerHTML = `
            <style>
                ${IconLibrary.importCss}
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
                    font-size: 16px;
                    color: var(--text-light, #666666);
                    line-height: 1;
                }

                .detail-label i.mdi {
                    font-size: 24px;
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


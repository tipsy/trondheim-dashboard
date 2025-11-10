// Widget Row Component - simple card wrapper with either attributes or slot

class WidgetRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['title', 'description', 'href', 'border-color'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    get title() {
        return this.getAttribute('title') || '';
    }

    get description() {
        return this.getAttribute('description') || '';
    }

    get href() {
        return this.getAttribute('href') || '';
    }

    get borderColor() {
        return this.getAttribute('border-color') || '';
    }

    render() {
        const hasAttributes = this.title || this.description;
        const borderStyle = this.borderColor ? `border-left: 4px solid ${this.borderColor};` : '';
        const isLink = !!this.href;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .card {
                    background-color: var(--alt-background);
                    border-radius: var(--border-radius);
                    padding: var(--spacing-md);
                    ${borderStyle}
                    overflow: hidden;
                }

                a.card {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                    transition: transform 0.08s ease, box-shadow 0.08s ease;
                }

                a.card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-hover, 0 4px 14px rgba(0,0,0,0.08));
                }

                .content {
                    display: flex;
                    flex-direction: column;
                }

                .title {
                    font-weight: bold;
                    color: var(--text-color);
                    font-size: var(--font-size-md);
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    overflow: hidden;
                }

                .description {
                    font-size: var(--font-size-sm);
                    color: var(--text-light);
                    margin-top: 4px;
                }

                /* Mobile: allow text to wrap */
                @media (max-width: 1024px) {
                    .title,
                    .description {
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                        word-break: break-word;
                        hyphens: auto;
                    }
                }

                /* Desktop: use single-line ellipsis for descriptions only */
                @media (min-width: 1025px) {
                    .description {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
            </style>

            ${isLink ? `<a href="${this._escape(this.href)}" target="_blank" rel="noopener noreferrer" class="card">` : '<div class="card">'}
                ${hasAttributes ? `
                    <div class="content">
                        ${this.title ? `<div class="title">${this._escape(this.title)}</div>` : ''}
                        ${this.description ? `<div class="description">${this._escape(this.description)}</div>` : ''}
                    </div>
                ` : `
                    <slot></slot>
                `}
            ${isLink ? '</a>' : '</div>'}
        `;
    }

    _escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

customElements.define('widget-row', WidgetRow);

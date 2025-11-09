// filepath: /Users/david/git/trondheim-dashboard/js/components/nrk/nrk-row.js
// NRK Row Component - displays a single news item as a card (clickable)

class NrkRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['title', 'link', 'pubdate'];
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

    get link() {
        return this.getAttribute('link') || '#';
    }

    get pubdate() {
        return this.getAttribute('pubdate') || '';
    }

    render() {
        const displayDate = (() => {
            try {
                const d = new Date(this.pubdate);
                return isNaN(d.getTime()) ? this.pubdate : d.toLocaleString();
            } catch (e) {
                return this.pubdate;
            }
        })();

        this.shadowRoot.innerHTML = `
            <style>
                ${IconLibrary.importCss}
                :host { display: block; }

                a.row-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                    border-radius: var(--border-radius);
                }

                .row {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    background-color: var(--alt-background);
                    border-radius: var(--border-radius);
                    transition: transform 0.08s ease, box-shadow 0.08s ease;
                }

                .row:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-hover, 0 4px 14px rgba(0,0,0,0.08));
                }

                .info {
                    flex: 1;
                    min-width: 0;
                }

                .title {
                    font-weight: bold;
                    color: var(--text-color);
                    font-size: var(--font-size-md);
                }

                /* Mobile: allow text to wrap */
                @media (max-width: 1024px) {
                    .title {
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                        word-break: break-word;
                        hyphens: auto;
                    }
                }

                /* Desktop: use ellipsis for long text */
                @media (min-width: 1025px) {
                    .title {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }

                .date {
                    font-size: var(--font-size-sm);
                    color: var(--text-light);
                    margin-top: 4px;
                }
            </style>

            <a class="row-link" href="${this.link}" target="_blank" rel="noopener noreferrer">
                <div class="row">
                    <div class="info">
                        <div class="title">${this._escape(this.title)}</div>
                        <div class="date">${this._escape(displayDate)}</div>
                    </div>
                </div>
            </a>
        `;
    }

    // Simple escape to avoid breaking HTML in attributes
    _escape(s) {
        if (!s) return '';
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

customElements.define('nrk-row', NrkRow);

// filepath: /Users/david/git/trondheim-dashboard/js/components/police/police-row.js
// Police Row Component - displays a single police log entry as a card

class PoliceRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['id', 'category', 'municipality', 'area', 'text', 'createdon', 'isactive'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    get id() {
        return this.getAttribute('id') || '';
    }

    get category() {
        return this.getAttribute('category') || '';
    }

    get municipality() {
        return this.getAttribute('municipality') || '';
    }

    get area() {
        return this.getAttribute('area') || '';
    }

    get text() {
        return this.getAttribute('text') || '';
    }

    get createdon() {
        return this.getAttribute('createdon') || '';
    }

    get isactive() {
        return this.getAttribute('isactive') === 'true';
    }

    get link() {
        // Extract threadId from id (e.g., "257vxg-0" -> "257vxg")
        const threadId = this.id ? this.id.split('-')[0] : '';
        return threadId ? `https://www.politiet.no/politiloggen/hendelse/#/${threadId}/` : '#';
    }

    render() {
        const displayDate = (() => {
            try {
                const d = new Date(this.createdon);
                return isNaN(d.getTime()) ? this.createdon : d.toLocaleString('no-NO', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return this.createdon;
            }
        })();

        const location = [this.municipality, this.area].filter(x => x).join(', ');
        const locationDate = [location, displayDate].filter(x => x).join(' • ');

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

                .text {
                    font-weight: bold;
                    color: var(--text-color);
                    font-size: var(--font-size-md);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .meta {
                    font-size: var(--font-size-sm);
                    color: var(--text-light);
                    margin-top: 4px;
                }
            </style>

            <a class="row-link" href="${this.link}" target="_blank" rel="noopener noreferrer">
                <div class="row">
                    <div class="info">
                        <div class="text">${this._escape(this.text)}</div>
                        ${locationDate ? `<div class="meta">${this._escape(locationDate)}</div>` : ''}
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

customElements.define('police-row', PoliceRow);


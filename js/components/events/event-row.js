// filepath: /Users/david/git/trondheim-dashboard/js/components/events/event-row.js
// Event Row Component - displays a single event as a clickable card

class EventRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['id', 'slug', 'title', 'startdate', 'enddate', 'venue'];
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

    get slug() {
        return this.getAttribute('slug') || '';
    }

    get title() {
        return this.getAttribute('title') || '';
    }

    get startdate() {
        return this.getAttribute('startdate') || '';
    }

    get enddate() {
        return this.getAttribute('enddate') || '';
    }

    get venue() {
        return this.getAttribute('venue') || '';
    }

    get link() {
        return this.slug ? `https://trdevents.no/event/${this.slug}` : '#';
    }

    render() {
        const displayDate = (() => {
            try {
                const d = new Date(this.startdate);
                if (isNaN(d.getTime())) return this.startdate;
                
                // Format as "DD.MM HH:MM"
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                
                return `${day}.${month} ${hours}:${minutes}`;
            } catch (e) {
                return this.startdate;
            }
        })();

        const venueDate = [this.venue, displayDate].filter(x => x).join(' • ');

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
                        <div class="title">${this._escape(this.title)}</div>
                        ${venueDate ? `<div class="meta">${this._escape(venueDate)}</div>` : ''}
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

customElements.define('event-row', EventRow);


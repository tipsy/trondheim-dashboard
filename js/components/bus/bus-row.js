// Bus Row Component - displays a single bus departure

class BusRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['line-number', 'destination', 'departure-time', 'realtime'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    get lineNumber() {
        return this.getAttribute('line-number') || '';
    }

    get destination() {
        return this.getAttribute('destination') || '';
    }

    get departureTime() {
        return this.getAttribute('departure-time') || '';
    }

    get isRealtime() {
        return this.hasAttribute('realtime');
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMinutes = Math.round((date - now) / 60000);

        if (diffMinutes < 1) {
            return 'Now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} min`;
        } else {
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        }
    }

    render() {
        const timeDisplay = this.formatTime(this.departureTime);
        const realtimeClass = this.isRealtime ? 'realtime' : '';
        const isFlybuss = this.destination.toLowerCase().includes('flybus') ||
                          this.destination.toLowerCase().includes('airport') ||
                          this.destination.toLowerCase().includes('værnes');

        const airplaneIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>`;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .departure-item {
                    display: grid;
                    grid-template-columns: 60px 1fr auto;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    border-bottom: 1px solid var(--border-color);
                    align-items: center;
                }

                .departure-item:last-child {
                    border-bottom: none;
                }

                .line-number {
                    background-color: var(--primary-color);
                    color: var(--button-text);
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border-radius: var(--spacing-xs);
                    font-weight: bold;
                    text-align: center;
                    font-size: var(--font-size-md);
                }

                .destination {
                    font-size: var(--font-size-sm);
                    color: var(--text-color);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                }

                .time {
                    font-weight: bold;
                    color: var(--primary-color);
                    font-size: var(--font-size-md);
                    text-align: right;
                }
            </style>

            <div class="departure-item ${realtimeClass}">
                <div class="line-number">${this.lineNumber}</div>
                <div class="destination">
                    ${isFlybuss ? airplaneIcon : ''}
                    <span>${this.destination}</span>
                </div>
                <div class="time">${timeDisplay}</div>
            </div>
        `;
    }
}

customElements.define('bus-row', BusRow);


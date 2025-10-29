// Bus Row Component - displays a single bus departure

class BusRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['line-number', 'destination', 'aimed-time', 'expected-time', 'realtime'];
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

    get aimedTime() {
        return this.getAttribute('aimed-time') || '';
    }

    get expectedTime() {
        return this.getAttribute('expected-time') || '';
    }

    get isRealtime() {
        return this.hasAttribute('realtime');
    }

    formatTime(isoString) {
        if (!isoString) {
            return 'N/A';
        }

        const date = new Date(isoString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'N/A';
        }

        const now = new Date();
        const diffMinutes = Math.round((date - now) / 60000);

        if (diffMinutes <= 0) {
            return 'Now';
        } else if (diffMinutes <= 10) {
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
        const aimedTimeDisplay = this.formatTime(this.aimedTime);
        const expectedTimeDisplay = this.formatTime(this.expectedTime);

        // Check if bus is delayed (expected time is later than aimed time)
        const aimedDate = new Date(this.aimedTime);
        const expectedDate = new Date(this.expectedTime);
        const isDelayed = expectedDate > aimedDate;

        // Only show strikethrough if delayed AND the formatted times are different
        const hasDelay = isDelayed && aimedTimeDisplay !== expectedTimeDisplay;

        const realtimeClass = this.isRealtime ? 'realtime' : '';
        const isFlybuss = this.destination.toLowerCase().includes('flybus') ||
                          this.destination.toLowerCase().includes('airport') ||
                          this.destination.toLowerCase().includes('værnes');

        // Material Design Icons
        const busIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
        </svg>`;

        const planeIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>`;

        const vehicleIcon = isFlybuss ? planeIcon : busIcon;

        // Build time display HTML
        let timeHTML;
        if (hasDelay) {
            timeHTML = `
                <div class="time-actual">${expectedTimeDisplay}</div>
                <div class="time-original">${aimedTimeDisplay}</div>
            `;
        } else {
            timeHTML = `<div class="time-actual">${expectedTimeDisplay}</div>`;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .departure-item {
                    display: grid;
                    grid-template-columns: 70px 1fr auto;
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                }

                .line-number svg {
                    flex-shrink: 0;
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
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 2px;
                }

                .time-actual {
                    font-weight: bold;
                    color: var(--primary-color);
                }

                .time-original {
                    font-size: var(--font-size-xs);
                    color: var(--text-light);
                    text-decoration: line-through;
                }
            </style>

            <div class="departure-item ${realtimeClass}">
                <div class="line-number">
                    ${vehicleIcon}
                    <span>${this.lineNumber}</span>
                </div>
                <div class="destination">
                    <span>${this.destination}</span>
                </div>
                <div class="time">${timeHTML}</div>
            </div>
        `;
    }
}

customElements.define('bus-row', BusRow);


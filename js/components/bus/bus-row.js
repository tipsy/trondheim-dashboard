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

        const vehicleIcon = isFlybuss
            ? '<i class="mdi mdi-airplane" style="font-size: 18px;"></i>'
            : '<i class="mdi mdi-bus" style="font-size: 18px;"></i>';

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
                ${IconLibrary.importCss}
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

                .destination {
                    font-size: var(--font-size-sm);
                    color: var(--text-color);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                    min-width: 0;
                }

                /* Mobile: allow text to wrap */
                @media (max-width: 1024px) {
                    .destination span {
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                        word-break: break-word;
                        hyphens: auto;
                    }
                }

                /* Desktop: use ellipsis for long text */
                @media (min-width: 1025px) {
                    .destination span {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
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


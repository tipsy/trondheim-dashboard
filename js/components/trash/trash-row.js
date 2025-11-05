// Trash Row Component - displays a single trash collection item

class TrashRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['trash-type', 'collection-date', 'trash-class'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    get trashType() {
        return this.getAttribute('trash-type') || '';
    }

    get collectionDate() {
        return this.getAttribute('collection-date') || '';
    }

    get trashClass() {
        return this.getAttribute('trash-class') || 'other';
    }

    getTrashIcon(type) {
        const typeLower = type.toLowerCase();

        // Trash bag icon for restavfall
        const trashBagIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>`;

        // Cardboard box icon for papp og papir
        const cardboardIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>`;

        // Plastic bottle icon for plast-emballasje
        const plasticBottleIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 2h6v2h2a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h2V2z"/>
            <path d="M9 2v2h6V2"/>
            <line x1="7" y1="10" x2="17" y2="10"/>
        </svg>`;

        // Food icon for matavfall (utensils)
        const foodIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3z"/>
            <line x1="21" y1="15" x2="21" y2="22"/>
        </svg>`;

        // Check for specific Norwegian waste types
        if (typeLower.includes('matavfall')) return foodIcon;
        if (typeLower.includes('plast') && typeLower.includes('emballasje')) return plasticBottleIcon;
        if (typeLower.includes('restavfall')) return trashBagIcon;
        if (typeLower.includes('papp') || typeLower.includes('papir')) return cardboardIcon;

        // Fallback to generic checks
        if (typeLower.includes('mat') || typeLower.includes('food') || typeLower.includes('bio')) return foodIcon;
        if (typeLower.includes('plast') || typeLower.includes('plastic')) return plasticBottleIcon;
        if (typeLower.includes('rest') || typeLower.includes('general')) return trashBagIcon;
        if (typeLower.includes('paper')) return cardboardIcon;

        return trashBagIcon;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];

        return `${dayName}, ${month} ${day}`;
    }

    getDaysUntil(dateString) {
        const collectionDate = new Date(dateString);
        const today = new Date();

        // Reset time to midnight for accurate day comparison
        collectionDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = collectionDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    getCountdownText(daysUntil) {
        if (daysUntil === 0) return 'Today';
        if (daysUntil === 1) return '1 day';
        if (daysUntil < 0) return 'Past';
        return `${daysUntil} days`;
    }

    shouldPulse(daysUntil) {
        // Pulse if collection is today, tomorrow, or in 2 days
        return daysUntil >= 0 && daysUntil <= 2;
    }

    render() {
        const icon = this.getTrashIcon(this.trashType);
        const formattedDate = this.formatDate(this.collectionDate);
        const daysUntil = this.getDaysUntil(this.collectionDate);
        const countdownText = this.getCountdownText(daysUntil);
        const shouldPulse = this.shouldPulse(daysUntil);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .schedule-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    background-color: var(--alt-background);
                    border-radius: var(--border-radius);
                    border-left: 4px solid var(--primary-color);
                }

                .schedule-item.general {
                    border-left-color: var(--trash-general);
                }

                .schedule-item.paper {
                    border-left-color: var(--trash-paper);
                }

                .schedule-item.plastic {
                    border-left-color: var(--trash-plastic);
                }

                .schedule-item.food {
                    border-left-color: var(--trash-food);
                }

                .schedule-item.glass {
                    border-left-color: var(--trash-glass);
                }

                .schedule-item.metal {
                    border-left-color: var(--trash-metal);
                }

                .trash-icon {
                    font-size: 32px;
                }

                .trash-info {
                    flex: 1;
                    min-width: 0;
                }

                .trash-type {
                    font-weight: bold;
                    color: var(--text-color);
                    font-size: var(--font-size-md);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .trash-date {
                    font-size: var(--font-size-sm);
                    color: var(--text-light);
                }

                .countdown-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-width: 60px;
                    padding: var(--spacing-sm);
                    background-color: var(--card-background);
                    border-radius: var(--border-radius);
                    border: 2px solid var(--border-color);
                    position: relative;
                }

                .countdown-indicator.pulse {
                    border-color: var(--error-color);
                }

                .countdown-indicator.pulse::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    border: 2px solid var(--error-color);
                    background-color: color-mix(in srgb, var(--error-color) 20%, transparent);
                    border-radius: var(--border-radius);
                    animation: ripple 2s ease-out infinite;
                }

                .countdown-days {
                    font-size: var(--font-size-lg);
                    font-weight: bold;
                    color: var(--text-color);
                    line-height: 1;
                    position: relative;
                    z-index: 1;
                }

                .countdown-indicator.pulse .countdown-days {
                    color: var(--error-color);
                }

                .countdown-label {
                    font-size: var(--font-size-xs);
                    color: var(--text-light);
                    text-transform: uppercase;
                    margin-top: 2px;
                    position: relative;
                    z-index: 1;
                }

                .countdown-indicator.pulse .countdown-label {
                    color: var(--error-color);
                }

                @keyframes ripple {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    75% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
            </style>

            <div class="schedule-item ${this.trashClass}">
                <div class="trash-icon">${icon}</div>
                <div class="trash-info">
                    <div class="trash-type">${this.trashType}</div>
                    <div class="trash-date">${formattedDate}</div>
                </div>
                <div class="countdown-indicator ${shouldPulse ? 'pulse' : ''}">
                    <div class="countdown-days">${daysUntil >= 0 ? daysUntil : '-'}</div>
                    <div class="countdown-label">${countdownText}</div>
                </div>
            </div>
        `;
    }
}

customElements.define('trash-row', TrashRow);


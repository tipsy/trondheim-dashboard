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

        // Check for specific Norwegian waste types
        if (typeLower.includes('matavfall')) return '<i class="mdi mdi-food-apple-outline"></i>';
        if (typeLower.includes('plast') && typeLower.includes('emballasje')) return '<i class="mdi mdi-bottle-soda-classic-outline"></i>';
        if (typeLower.includes('restavfall')) return '<i class="mdi mdi-trash-can-outline"></i>';
        if (typeLower.includes('papp') || typeLower.includes('papir')) return '<i class="mdi mdi-package-variant"></i>';

        // Fallback to generic checks
        if (typeLower.includes('mat') || typeLower.includes('food') || typeLower.includes('bio')) return '<i class="mdi mdi-food-apple-outline"></i>';
        if (typeLower.includes('plast') || typeLower.includes('plastic')) return '<i class="mdi mdi-bottle-soda-classic-outline"></i>';
        if (typeLower.includes('rest') || typeLower.includes('general')) return '<i class="mdi mdi-trash-can-outline"></i>';
        if (typeLower.includes('paper')) return '<i class="mdi mdi-package-variant"></i>';

        return '<i class="mdi mdi-trash-can-outline"></i>';
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
        if (daysUntil === 1) return 'day';
        if (daysUntil < 0) return 'Past';
        return 'days';
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
                ${IconLibrary.importCss}
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
                    font-size: 28px;
                }

                .trash-info {
                    flex: 1;
                    min-width: 0;
                }

                .trash-type {
                    font-weight: bold;
                    color: var(--text-color);
                    font-size: var(--font-size-md);
                }

                /* Mobile: allow text to wrap */
                @media (max-width: 1024px) {
                    .trash-type {
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                        word-break: break-word;
                        hyphens: auto;
                    }
                }

                /* Desktop: use ellipsis for long text */
                @media (min-width: 1025px) {
                    .trash-type {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
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


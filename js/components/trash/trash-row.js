// Trash Row Component - displays a single trash collection item

import { LitElement, html, css } from 'lit';
import { sharedStyles, adoptMDIStyles } from '../../utils/shared-styles.js';

class TrashRow extends LitElement {
    static properties = {
        trashType: { type: String, attribute: 'trash-type' },
        collectionDate: { type: String, attribute: 'collection-date' },
        trashClass: { type: String, attribute: 'trash-class' }
    };

    constructor() {
        super();
        this.trashClass = 'other';
    }

    static styles = [
        sharedStyles,
        css`
            :host {
                display: block;
            }

            .trash-content {
                display: grid;
                grid-template-columns: auto 1fr auto;
                gap: var(--spacing-md);
                align-items: center;
            }

            .trash-icon {
                font-size: 28px;
            }

            .trash-info {
                display: flex;
                flex-direction: column;
            }

            .trash-type {
                font-weight: bold;
                color: var(--text-color);
                font-size: var(--font-size-md);
            }

            .trash-date {
                font-size: var(--font-size-sm);
                color: var(--text-light);
                margin-top: 4px;
            }

            .countdown-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-width: 80px;
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
                background-color: color-mix(in srgb, var(--error-color) 10%, transparent);
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

            .countdown-label.today {
                font-size: 14px;
                line-height: 32px;
                font-weight: bold;
                color: var(--text-color);
                margin-top: 0;
            }

            .countdown-indicator.pulse .countdown-label.today {
                color: var(--error-color);
            }

            @keyframes ripple {
                0% {
                    transform: scale(1);
                    opacity: 0.8;
                }
                75% {
                    transform: scale(1.25);
                    opacity: 0;
                }
                100% {
                    transform: scale(1.25);
                    opacity: 0;
                }
            }
        `
    ];

    firstUpdated() {
        adoptMDIStyles(this.shadowRoot);
    }

    getTrashIconClass(type) {
        const typeLower = type?.toLowerCase() || '';

        if (typeLower.includes('matavfall')) return 'mdi-food-apple-outline';
        if (typeLower.includes('plast') && typeLower.includes('emballasje')) return 'mdi-bottle-soda-classic-outline';
        if (typeLower.includes('restavfall')) return 'mdi-trash-can-outline';
        if (typeLower.includes('papp') || typeLower.includes('papir')) return 'mdi-package-variant';

        if (typeLower.includes('mat') || typeLower.includes('food') || typeLower.includes('bio')) return 'mdi-food-apple-outline';
        if (typeLower.includes('plast') || typeLower.includes('plastic')) return 'mdi-bottle-soda-classic-outline';
        if (typeLower.includes('rest') || typeLower.includes('general')) return 'mdi-trash-can-outline';
        if (typeLower.includes('paper')) return 'mdi-package-variant';

        return 'mdi-trash-can-outline';
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
        return daysUntil >= 0 && daysUntil <= 2;
    }

    getBorderColor() {
        const colorMap = {
            'general': 'var(--trash-general)',
            'paper': 'var(--trash-paper)',
            'plastic': 'var(--trash-plastic)',
            'food': 'var(--trash-food)',
            'glass': 'var(--trash-glass)',
            'metal': 'var(--trash-metal)'
        };
        return colorMap[this.trashClass] || 'var(--primary-color)';
    }

    render() {
        const iconClass = this.getTrashIconClass(this.trashType);
        const formattedDate = this.formatDate(this.collectionDate);
        const daysUntil = this.getDaysUntil(this.collectionDate);
        const countdownText = this.getCountdownText(daysUntil);
        const shouldPulse = this.shouldPulse(daysUntil);
        const borderColor = this.getBorderColor();

        return html`
            <widget-row border-color="${borderColor}">
                <div class="trash-content">
                    <div class="trash-icon">
                        <i class="mdi ${iconClass}"></i>
                    </div>
                    <div class="trash-info">
                        <div class="trash-type">${this.trashType}</div>
                        <div class="trash-date">${formattedDate}</div>
                    </div>
                    <div class="countdown-indicator ${shouldPulse ? 'pulse' : ''}">
                        ${daysUntil !== 0 ? html`
                            <div class="countdown-days">${daysUntil >= 0 ? daysUntil : '-'}</div>
                        ` : ''}
                        <div class="countdown-label ${daysUntil === 0 ? 'today' : ''}">${countdownText}</div>
                    </div>
                </div>
            </widget-row>
        `;
    }
}

customElements.define('trash-row', TrashRow);


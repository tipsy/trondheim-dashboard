// Bus Row Component - displays a single bus departure

import { LitElement, html, css } from 'lit';
import { sharedStyles, adoptMDIStyles } from '../../utils/shared-styles.js';
import '../common/widget-row.js';

class BusRow extends LitElement {
    static properties = {
        lineNumber: { type: String, attribute: 'line-number' },
        destination: { type: String },
        aimedTime: { type: String, attribute: 'aimed-time' },
        expectedTime: { type: String, attribute: 'expected-time' },
        realtime: { type: Boolean }
    };

    static styles = [
        sharedStyles,
        css`
            :host {
                display: block;
            }

            .bus-content {
                display: grid;
                grid-template-columns: 70px 1fr auto;
                gap: var(--spacing-md);
                align-items: center;
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
        `
    ];

    firstUpdated() {
        adoptMDIStyles(this.shadowRoot);
    }

    formatTime(isoString) {
        if (!isoString) {
            return 'N/A';
        }

        const date = new Date(isoString);

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

        const aimedDate = new Date(this.aimedTime);
        const expectedDate = new Date(this.expectedTime);
        const isDelayed = expectedDate > aimedDate;
        const hasDelay = isDelayed && aimedTimeDisplay !== expectedTimeDisplay;

        const isFlybuss = this.destination?.toLowerCase().includes('flybus') ||
                          this.destination?.toLowerCase().includes('airport') ||
                          this.destination?.toLowerCase().includes('værnes');

        return html`
            <widget-row>
                <div class="bus-content">
                    <div class="line-number">
                        <i class="mdi mdi-${isFlybuss ? 'airplane' : 'bus'}"></i>
                        <span>${this.lineNumber}</span>
                    </div>
                    <div class="destination">
                        <span>${this.destination}</span>
                    </div>
                    <div class="time">
                        <div class="time-actual">${expectedTimeDisplay}</div>
                        ${hasDelay ? html`
                            <div class="time-original">${aimedTimeDisplay}</div>
                        ` : ''}
                    </div>
                </div>
            </widget-row>
        `;
    }
}

customElements.define('bus-row', BusRow);

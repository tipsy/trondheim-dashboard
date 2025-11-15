// Address Suggestion Item Component
// Displays a single address suggestion with main address and details

import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../utils/shared-styles.js';
import { dispatchEvent } from '../../utils/event-helpers.js';

class AddressSuggestionItem extends LitElement {
    static properties = {
        displayName: { type: String, attribute: 'display-name' },
        index: { type: Number }
    };

    static styles = [
        sharedStyles,
        css`
            :host {
                display: block;
            }

            .suggestion-item {
                padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                cursor: pointer;
                border-bottom: 1px solid var(--border-color, #e0e0e0);
                transition: background-color 0.2s;
            }

            .suggestion-item:hover {
                background-color: var(--hover-bg, #f5f5f5);
            }

            :host(:last-child) .suggestion-item {
                border-bottom: none;
            }

            /* Mobile: larger touch targets */
            @media (max-width: 767px) {
                .suggestion-item {
                    padding: var(--spacing-md, 16px);
                    min-height: 60px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
            }

            .address-name {
                font-weight: 500;
                color: var(--text-color, #000);
                font-size: var(--font-size-md, 16px);
            }

            .address-details {
                font-size: var(--font-size-sm, 14px);
                color: var(--text-light, #666);
                margin-top: 2px;
            }
        `
    ];

    constructor() {
        super();
        this.displayName = '';
        this.index = 0;
    }

    handleClick() {
        dispatchEvent(this, 'select', { index: this.index });
    }

    render() {
        // For Norwegian format "Street Number, Postcode City"
        // Just show the whole address as main, no details needed
        const mainAddress = this.displayName;
        const details = ''; // No additional details for clean Norwegian format

        return html`
            <div class="suggestion-item" @click=${this.handleClick}>
                <div class="address-name">${mainAddress}</div>
                ${details ? html`<div class="address-details">${details}</div>` : ''}
            </div>
        `;
    }
}

customElements.define('address-suggestion-item', AddressSuggestionItem);


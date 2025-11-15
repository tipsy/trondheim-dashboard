// Trash Widget - displays trash collection schedule

import { BaseWidget } from '../common/base-widget.js';
import { html, css } from 'lit';
import { TrashAPI } from '../../utils/trash-api.js';
import './trash-row.js';
import '../common/widget-list.js';

class TrashWidget extends BaseWidget {
    static properties = {
        ...BaseWidget.properties,
        collections: { type: Array, state: true },
        address: { type: String, state: true }
    };

    constructor() {
        super();
        this.title = 'Trash Schedule';
        this.icon = 'mdi-trash-can-outline';
        this.collections = [];
        this.address = null;
        this.addressId = null;
    }

    static styles = [
        ...BaseWidget.styles
    ];

    async updateAddress(address) {
        if (!address) {
            this.showPlaceholder();
            return;
        }

        // Check if this is the same address we already loaded
        if (this.address === address && this.addressId) {
            return;
        }

        this.address = address;
        await this.loadTrashSchedule();
    }

    normalizeAddress(address) {
        // addresses are given as "Nedre Kristianstens gate 18B, 7014 Trondheim"
        // we need to extract "Nedre Kristianstens gate 18 B" (with space before letter)

        // Get the street address part (before the comma)
        const streetAddress = address.split(',')[0].trim();

        // Find the house number (last part that contains a digit)
        const parts = streetAddress.split(' ');
        let numberIndex = -1;

        // Find the last part that contains a number
        for (let i = parts.length - 1; i >= 0; i--) {
            if (/\d/.test(parts[i])) {
                numberIndex = i;
                break;
            }
        }

        if (numberIndex === -1) {
            // No number found, return as-is
            return streetAddress.toUpperCase();
        }

        // Split into street name and house number
        const streetName = parts.slice(0, numberIndex).join(' ');
        let houseNumber = parts[numberIndex];

        // Add space before letter if needed (18B -> 18 B)
        if (houseNumber.match(/\d+[A-Z]/i)) {
            houseNumber = houseNumber.replace(/(\d+)([A-Z])/i, '$1 $2');
        }

        return `${streetName} ${houseNumber}`.toUpperCase();
    }

    async loadTrashSchedule() {
        if (!this.address) return;

        this.showLoading(true);

        try {
            const normalizedAddress = this.normalizeAddress(this.address);

            // Try to search with the normalized address
            let searchResults = await TrashAPI.searchTrashAddress(normalizedAddress);

            // If no results, try without the space before the letter
            if (!searchResults || searchResults.length === 0) {
                const addressWithoutSpace = normalizedAddress.replace(/(\d+)\s+([A-Z])$/, '$1$2');
                searchResults = await TrashAPI.searchTrashAddress(addressWithoutSpace);
            }

            // If still no results, try with lowercase letter
            if (!searchResults || searchResults.length === 0) {
                const addressLowerLetter = normalizedAddress.replace(/(\d+)\s+([A-Z])$/, (match, num, letter) => {
                    return `${num} ${letter.toLowerCase()}`;
                });
                searchResults = await TrashAPI.searchTrashAddress(addressLowerLetter);
            }

            if (!searchResults || searchResults.length === 0) {
                this.showError('Address not found in trash collection database. Try entering just the street name and number (e.g., "Persaunvegen 1C")');
                return;
            }

            // Use the first result
            const addressData = searchResults[0];
            this.addressId = addressData.id;

            // Now get the actual schedule
            const schedule = await TrashAPI.getTrashSchedule(this.addressId);
            this.processSchedule(schedule);
        } catch (error) {
            console.error('Error loading trash schedule:', error);
            this.showError('Could not load trash schedule. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    processSchedule(schedule) {
        if (!schedule || !schedule.calendar) {
            this.showError('No schedule data available');
            return;
        }

        // Parse and organize the schedule data
        const collections = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        schedule.calendar.forEach(item => {
            const date = new Date(item.dato);

            // Only show future dates
            if (date >= today) {
                collections.push({
                    date: date,
                    type: item.fraksjon,
                    trashClass: this.getTrashClass(item.fraksjon)
                });
            }
        });

        // Sort by date
        collections.sort((a, b) => a.date - b.date);

        // Take only next 10 collections
        this.collections = collections.slice(0, 10);
    }

    getTrashClass(type) {
        const typeLower = type.toLowerCase();
        if (typeLower.includes('rest') || typeLower.includes('general')) return 'general';
        if (typeLower.includes('papp') || typeLower.includes('papir') || typeLower.includes('paper')) return 'paper';
        if (typeLower.includes('plast') || typeLower.includes('plastic') || typeLower.includes('emballasje')) return 'plastic';
        if (typeLower.includes('mat') || typeLower.includes('food') || typeLower.includes('bio')) return 'food';
        if (typeLower.includes('glass')) return 'glass';
        if (typeLower.includes('metal')) return 'metal';
        return 'other';
    }

    renderContent() {
        if (!this.collections || this.collections.length === 0) {
            return html`<p class="no-data">No upcoming collections found</p>`;
        }

        return html`
            <widget-list>
                ${this.collections.map(item => html`
                    <trash-row
                        trash-type="${item.type}"
                        collection-date="${item.date.toISOString()}"
                        trash-class="${item.trashClass}">
                    </trash-row>
                `)}
            </widget-list>
        `;
    }

    getPlaceholderText() {
        return 'Enter address to see trash collection schedule';
    }
}

customElements.define('trash-widget', TrashWidget);


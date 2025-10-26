class TrashWidget extends BaseWidget {
    constructor() {
        super();
        this.address = null;
        this.addressId = null;
    }

    async updateAddress(address) {
        if (!address) {
            this.showPlaceholder();
            return;
        }

        this.address = address;
        await this.loadTrashSchedule();
    }

    normalizeAddress(address) {
        // addresses are given as 1C, Persaunvegen, Dalen, Lerkehaug, Østbyen, Trondheim, Trøndelag, 7045, Norway
        // we care about 1C and Persaunvegen, but in reverse order
        const parts = address.split(',');
        let number = parts[0].trim();
        // if the number includes a letter, we have to insert a space
        if (number.match(/[A-Z]/)) {
            number = number.replace(/(\d+)([A-Z])/, '$1 $2');
        }
        const street = parts[1].trim();
        return (street + ' ' + number).toUpperCase();
    }

    async loadTrashSchedule() {
        if (!this.address) return;

        this.showLoading(true);
        this.hideError();

        try {
            const normalizedAddress = this.normalizeAddress(this.address);

            console.log('Trash API: Original address:', this.address);
            console.log('Trash API: Normalized address:', normalizedAddress);

            // Try to search with the normalized address
            let searchResults = await TrashAPI.searchTrashAddress(normalizedAddress);

            console.log('Trash API: Search results:', searchResults);

            // If no results, try without the space before the letter
            if (!searchResults || searchResults.length === 0) {
                const addressWithoutSpace = normalizedAddress.replace(/(\d+)\s+([A-Z])$/, '$1$2');
                console.log('Trash API: Trying without space:', addressWithoutSpace);
                searchResults = await TrashAPI.searchTrashAddress(addressWithoutSpace);
            }

            // If still no results, try with lowercase letter
            if (!searchResults || searchResults.length === 0) {
                const addressLowerLetter = normalizedAddress.replace(/(\d+)\s+([A-Z])$/, (match, num, letter) => {
                    return `${num} ${letter.toLowerCase()}`;
                });
                console.log('Trash API: Trying with lowercase letter:', addressLowerLetter);
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
            this.renderSchedule(schedule, addressData);
        } catch (error) {
            console.error('Error loading trash schedule:', error);
            this.showError('Could not load trash schedule. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    renderSchedule(schedule, addressData) {
        const content = this.shadowRoot.getElementById('content');

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
                    type: item.fraksjon
                });
            }
        });

        // Sort by date
        collections.sort((a, b) => a.date - b.date);

        // Take only next 10 collections
        const upcomingCollections = collections.slice(0, 10);

        if (upcomingCollections.length === 0) {
            content.innerHTML = '<p class="no-data">No upcoming collections found</p>';
            return;
        }

        content.innerHTML = `
            <div class="schedule-list" id="schedule-list"></div>
        `;

        // Create trash-row components for each collection
        const scheduleList = content.querySelector('#schedule-list');
        upcomingCollections.forEach(item => {
            const trashRow = document.createElement('trash-row');
            trashRow.setAttribute('trash-type', item.type);
            trashRow.setAttribute('collection-date', item.date.toISOString());
            trashRow.setAttribute('trash-class', this.getTrashClass(item.type));
            scheduleList.appendChild(trashRow);
        });
    }

    formatDate(date) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];

        return `${dayName}, ${month} ${day}`;
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



    // Override BaseWidget methods
    getTitle() {
        return 'Trash Schedule';
    }

    getIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>`;
    }

    getPlaceholderText() {
        return 'Enter address to see trash collection schedule';
    }

    afterRender() {
        // Add trash-specific styles to the shadow DOM
        const style = document.createElement('style');
        style.textContent = `
            .schedule-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
                max-width: 100%;
            }
        `;
        this.shadowRoot.appendChild(style);
    }
}

customElements.define('trash-widget', TrashWidget);


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

    async loadTrashSchedule() {
        if (!this.address) return;

        this.showLoading(true);
        this.hideError();

        try {
            // Extract just the street and number from the address (remove postal code)
            // e.g., "Persaunvegen 1C, 7045" -> "Persaunvegen 1C"
            let addressParts = this.address.split(',')[0].trim();

            // Ensure there's a space before the letter suffix (e.g., "Persaunvegen 1C" -> "Persaunvegen 1 C")
            // The API requires this format
            addressParts = addressParts.replace(/(\d+)([A-Z])\s*$/, '$1 $2');

            console.log('Trash API: Searching for address:', addressParts);

            // First, search for the address to get the address ID
            const searchResults = await TrashAPI.searchTrashAddress(addressParts);

            console.log('Trash API: Search results:', searchResults);

            if (!searchResults || searchResults.length === 0) {
                this.showError('Address not found in trash collection database');
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


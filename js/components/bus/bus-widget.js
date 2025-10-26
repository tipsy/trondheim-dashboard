class BusWidget extends BaseWidget {
    constructor() {
        super();
        this.location = null;
        this.selectedStopId = null;
        this.availableStops = [];
        this.refreshInterval = null;
    }

    disconnectedCallback() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    async updateLocation(lat, lon) {
        this.location = { lat, lon };
        await this.loadBusStops();
    }

    async loadBusStops() {
        if (!this.location) return;

        this.showLoading(true);
        this.hideError();

        try {
            const stops = await BusAPI.getClosestBusStops(
                this.location.lat,
                this.location.lon,
                1000
            );

            this.availableStops = stops;

            if (stops.length > 0) {
                // Try to restore saved bus stop, otherwise use first one
                const savedStopId = localStorage.getItem('trondheim-dashboard-bus-stop');
                if (savedStopId && stops.find(s => s.id === savedStopId)) {
                    this.selectedStopId = savedStopId;
                } else {
                    this.selectedStopId = stops[0].id;
                }
                this.updateStopSelector();
                await this.loadDepartures();
                this.startAutoRefresh();
            } else {
                this.showError('No bus stops found nearby');
            }
        } catch (error) {
            this.showError('Could not load bus stops');
        } finally {
            this.showLoading(false);
        }
    }

    async loadDepartures() {
        if (!this.selectedStopId) return;

        try {
            const stopData = await BusAPI.getBusDepartures(this.selectedStopId, 10);
            this.renderDepartures(stopData);
        } catch (error) {
            this.showError('Could not load departures');
        }
    }

    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadDepartures();
        }, 30000);
    }

    updateStopSelector() {
        const selectorContainer = this.shadowRoot.querySelector('.stop-selector-container');
        const selector = this.shadowRoot.getElementById('stop-selector');
        if (!selector || !selectorContainer) return;

        if (this.availableStops.length > 0) {
            selector.innerHTML = this.availableStops.map(stop => `
                <option value="${stop.id}" ${stop.id === this.selectedStopId ? 'selected' : ''}>
                    ${stop.name} (${Math.round(stop.distance)}m)
                </option>
            `).join('');
            selectorContainer.style.display = 'block';
        } else {
            selectorContainer.style.display = 'none';
        }
    }

    renderDepartures(stopData) {
        const container = this.shadowRoot.getElementById('departures-container');
        if (!container) return;

        if (!stopData || !stopData.estimatedCalls || stopData.estimatedCalls.length === 0) {
            container.innerHTML = '<p class="no-data">No departures found</p>';
            return;
        }

        // Clear container
        container.innerHTML = '';

        // Create bus-row components for each departure
        stopData.estimatedCalls.forEach(call => {
            const busRow = document.createElement('bus-row');
            busRow.setAttribute('line-number', call.serviceJourney.line.publicCode);
            busRow.setAttribute('destination', call.destinationDisplay.frontText);
            busRow.setAttribute('departure-time', call.expectedDepartureTime);
            if (call.realtime) {
                busRow.setAttribute('realtime', '');
            }
            container.appendChild(busRow);
        });
    }

    // Override BaseWidget methods
    getTitle() {
        return 'Upcoming buses';
    }

    getIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="6" width="18" height="12" rx="2"/>
            <path d="M3 10h18M8 14h.01M16 14h.01"/>
            <circle cx="8" cy="18" r="1"/>
            <circle cx="16" cy="18" r="1"/>
        </svg>`;
    }

    getHeaderContent() {
        return `
            <style>
                .stop-selector-container {
                    flex: 1;
                    min-width: 0;
                    max-width: 200px;
                }

                select {
                    width: 100%;
                    padding: var(--spacing-sm) var(--spacing-md);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    font-size: var(--font-size-sm);
                    background-color: var(--input-background);
                    color: var(--text-color);
                }

                select:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
            </style>
            <div class="stop-selector-container" style="display: none;">
                <select id="stop-selector"></select>
            </div>
        `;
    }

    getPlaceholderText() {
        return 'Enter address to see bus departures';
    }

    afterRender() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const selector = this.shadowRoot.getElementById('stop-selector');
        if (selector) {
            selector.addEventListener('change', async (e) => {
                this.selectedStopId = e.target.value;
                localStorage.setItem('trondheim-dashboard-bus-stop', this.selectedStopId);
                await this.loadDepartures();
            });
        }
    }

    hideError() {
        const selectorContainer = this.shadowRoot.querySelector('.stop-selector-container');
        if (this.availableStops.length > 0) {
            selectorContainer.style.display = 'block';
        }
        const content = this.shadowRoot.getElementById('content');
        content.innerHTML = '<div id="departures-container"></div>';
    }
}

customElements.define('bus-widget', BusWidget);


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
            // Get nearby quays (each quay represents one direction at a stop)
            const quays = await BusAPI.getClosestBusStops(
                this.location.lat,
                this.location.lon,
                1000
            );

            this.availableStops = quays;

            if (quays.length > 0) {
                // Try to restore saved quay, otherwise use first one
                const savedQuayId = localStorage.getItem('trondheim-dashboard-bus-stop');
                if (savedQuayId && quays.find(q => q.id === savedQuayId)) {
                    this.selectedStopId = savedQuayId;
                } else {
                    this.selectedStopId = quays[0].id;
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
        // Refresh every 60 seconds (1 minute)
        this.refreshInterval = setInterval(() => {
            this.loadDepartures();
        }, 60000);
    }

    updateStopSelector() {
        const selectorContainer = this.shadowRoot.querySelector('.stop-selector-container');
        const selector = this.shadowRoot.querySelector('custom-select');
        if (!selector || !selectorContainer) return;

        if (this.availableStops.length > 0) {
            const options = this.availableStops.map(stop => {
                // Build label with stop name, platform/direction info, and distance
                let label = stop.name;

                // Add platform number if available
                if (stop.publicCode) {
                    label += ` (Platform ${stop.publicCode})`;
                }

                // Add description (direction/destination) if available
                if (stop.description) {
                    label += ` - ${stop.description}`;
                }

                // Add distance
                label += ` - ${Math.round(stop.distance)}m`;

                return {
                    value: stop.id,
                    label: label
                };
            });

            selector.setOptions(options);
            selector.setAttribute('selected', this.selectedStopId);
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

            // Try to get the best destination name
            let destination = call.destinationDisplay.frontText;

            // If frontText looks like a code or is missing, try line name
            if (!destination || destination.length < 3 || /^\d+$/.test(destination)) {
                destination = call.serviceJourney.line.name || destination;
            }

            busRow.setAttribute('destination', destination);
            busRow.setAttribute('aimed-time', call.aimedDepartureTime);
            busRow.setAttribute('expected-time', call.expectedDepartureTime);
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
        return `<i class="mdi mdi-bus-clock"></i>`;
    }

    getHeaderContent() {
        return `
            <style>
                .stop-selector-container {
                    flex: 1;
                    min-width: 0;
                }

                /* Desktop: limit width */
                @media (min-width: 1025px) {
                    .stop-selector-container {
                        max-width: 200px;
                    }
                }
            </style>
            <div class="stop-selector-container" style="display: none;">
                <custom-select id="stop-selector"></custom-select>
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
        const selector = this.shadowRoot.querySelector('custom-select');
        if (selector) {
            selector.addEventListener('change', async (e) => {
                this.selectedStopId = e.detail.value;
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


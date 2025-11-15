// Bus Widget - displays real-time bus departures

import { BaseWidget } from '../common/base-widget.js';
import { html, css } from 'lit';
import { BusAPI } from '../../utils/bus-api.js';
import './bus-row.js';
import '../common/custom-select.js';

class BusWidget extends BaseWidget {
    static properties = {
        ...BaseWidget.properties,
        departures: { type: Array, state: true },
        availableStops: { type: Array, state: true },
        selectedStopId: { type: String, state: true }
    };

    constructor() {
        super();
        this.title = 'Buses';
        this.icon = 'mdi-bus-clock';
        this.departures = [];
        this.availableStops = [];
        this.selectedStopId = null;
        this.location = null;
        this.refreshInterval = null;
        this.isLoadingDepartures = false;
    }

    static styles = [
        ...BaseWidget.styles,
        css`
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

            .departures-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }
        `
    ];

    disconnectedCallback() {
        super.disconnectedCallback();
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

        // Prevent overlapping loads
        if (this.isLoadingDepartures) {
            return;
        }

        this.isLoadingDepartures = true;
        try {
            const stopData = await BusAPI.getBusDepartures(this.selectedStopId, 10);
            this.processDepartures(stopData);
        } catch (error) {
            this.showError('Could not load departures');
        } finally {
            this.isLoadingDepartures = false;
        }
    }

    processDepartures(stopData) {
        if (!stopData || !stopData.estimatedCalls || stopData.estimatedCalls.length === 0) {
            this.departures = [];
            return;
        }

        this.departures = stopData.estimatedCalls.map(call => {
            // Try to get the best destination name
            let destination = call.destinationDisplay.frontText;

            // If frontText looks like a code or is missing, try line name
            if (!destination || destination.length < 3 || /^\d+$/.test(destination)) {
                destination = call.serviceJourney.line.name || destination;
            }

            return {
                lineNumber: call.serviceJourney.line.publicCode,
                destination: destination,
                aimedTime: call.aimedDepartureTime,
                expectedTime: call.expectedDepartureTime,
                realtime: call.realtime
            };
        });
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

    getStopOptions() {
        return this.availableStops.map(stop => {
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
    }

    async firstUpdated() {
        super.firstUpdated();
        await this.setupStopSelector();
    }

    async setupStopSelector() {
        // Wait for custom-select to be defined
        await customElements.whenDefined('custom-select');

        const selector = this.shadowRoot.querySelector('#stop-selector');
        if (!selector) return;

        // Listen for stop change
        selector.addEventListener('change', async (e) => {
            this.selectedStopId = e.detail.value;
            localStorage.setItem('trondheim-dashboard-bus-stop', this.selectedStopId);
            await this.loadDepartures();
        });
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        // Update selector when stops or selection changes
        if (changedProperties.has('availableStops') || changedProperties.has('selectedStopId')) {
            this.updateStopSelector();
        }
    }

    updateStopSelector() {
        const selector = this.shadowRoot.querySelector('#stop-selector');
        if (!selector) return;

        if (this.availableStops.length > 0) {
            selector.options = this.getStopOptions();
            selector.selected = this.selectedStopId;
        }
    }

    renderContent() {
        if (!this.departures || this.departures.length === 0) {
            return html`<p class="no-data">No departures found</p>`;
        }

        return html`
            <div class="departures-list">
                ${this.departures.map(departure => html`
                    <bus-row
                        line-number="${departure.lineNumber}"
                        destination="${departure.destination}"
                        aimed-time="${departure.aimedTime}"
                        expected-time="${departure.expectedTime}"
                        ?realtime="${departure.realtime}">
                    </bus-row>
                `)}
            </div>
        `;
    }

    renderHeaderActions() {
        return html`
            <div class="stop-selector-container" style="${this.availableStops.length > 0 ? 'display: block;' : 'display: none;'}">
                <custom-select id="stop-selector"></custom-select>
            </div>
        `;
    }

    getPlaceholderText() {
        return 'Enter address to see bus departures';
    }
}

customElements.define('bus-widget', BusWidget);


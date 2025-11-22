// Bus Widget - displays real-time bus departures

import { BaseWidget } from "../common/base-widget.js";
import { html, css } from "lit";
import { t } from "../../utils/localization.js";
import { BusAPI } from "../../utils/api/bus-api.js";
import "./bus-row.js";
import "../common/widget-list.js";
import "../common/custom-select.js";
import storage from "../../utils/storage.js";

class BusWidget extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    departures: { type: Array, state: true },
    availableStops: { type: Array, state: true },
    selectedStopId: { type: String, state: true },
  };

  constructor() {
    super();
    this.title = "Buses";
    this.icon = "mdi-bus-clock";
    this.departures = [];
    this.availableStops = [];
    this.selectedStopId = null;
    this.location = null;
  }

  get stopOptions() {
    return this.availableStops.map((stop) => {
      const parts = [stop.name];
      if (stop.publicCode) parts.push(`(${t("Platform")} ${stop.publicCode})`);
      if (stop.description) parts.push(`- ${stop.description}`);
      parts.push(`- ${Math.round(stop.distance)}m`);

      return {
        value: stop.id,
        label: parts.join(" "),
      };
    });
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
    `,
  ];

  async updateLocation(lat, lon) {
    this.location = { lat, lon };
    await this.loadBusStops();
  }

  async loadBusStops() {
    if (!this.location) return;

    const quays = await this.fetchData(
      () =>
        BusAPI.getClosestBusStops(this.location.lat, this.location.lon, 1000),
      t("Could not load bus stops"),
    );

    if (quays && quays.length > 0) {
      this.availableStops = quays;

      // Try to restore saved quay, otherwise use first one
      const savedQuayId = storage.loadBusStop();
      if (savedQuayId && quays.find((q) => q.id === savedQuayId)) {
        this.selectedStopId = savedQuayId;
      } else {
        this.selectedStopId = quays[0].id;
      }

      await this.loadDepartures();
      this.setupAutoRefresh(() => this.loadDepartures(), 60000);
    } else if (quays) {
      // fetchData succeeded but returned empty array
      this.showError(t("No bus stops found nearby"));
    }
  }

  async loadDepartures() {
    if (!this.selectedStopId) return;

    const stopData = await BusAPI.getBusDepartures(this.selectedStopId, 10);
    this.processDepartures(stopData);
  }

  processDepartures(stopData) {
    if (
      !stopData ||
      !stopData.estimatedCalls ||
      stopData.estimatedCalls.length === 0
    ) {
      this.departures = [];
      return;
    }

    this.departures = stopData.estimatedCalls.map((call) => {
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
      };
    });
  }

  handleStopChange(e) {
    this.selectedStopId = e.detail.value;
    storage.saveBusStop(this.selectedStopId);
    this.loadDepartures();
  }

  renderContent() {
    if (!this.departures || this.departures.length === 0) {
      return html`<p class="no-data">${t("No departures found")}</p>`;
    }

    return html`
      <widget-list>
        ${this.departures.map(
          (departure) => html`
            <bus-row
              line-number="${departure.lineNumber}"
              destination="${departure.destination}"
              aimed-time="${departure.aimedTime}"
              expected-time="${departure.expectedTime}"
            >
            </bus-row>
          `,
        )}
      </widget-list>
    `;
  }

  renderHeaderActions() {
    return html`
      <div
        class="stop-selector-container"
        ?hidden=${this.availableStops.length === 0}
      >
        <custom-select
          id="stop-selector"
          .options=${this.stopOptions}
          .selected=${this.selectedStopId}
          @change=${this.handleStopChange}
        ></custom-select>
      </div>
    `;
  }

  getPlaceholderText() {
    return t("Enter address to see bus departures");
  }
}

customElements.define("bus-widget", BusWidget);

// Events Widget - displays upcoming events in Trondheim

import { BaseWidget } from "../common/base-widget.js";
import { html, css } from "lit";
import { EventsAPI } from "../../utils/events-api.js";
import { DateFormatter } from "../../utils/date-formatter.js";
import "../common/widget-row.js";
import "../common/widget-list.js";
import "../common/custom-select.js";

class EventsWidget extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    events: { type: Array, state: true },
    selectedDate: { type: String, state: true },
  };

  constructor() {
    super();
    this.title = "Events";
    this.icon = "mdi-calendar-star";
    this.events = [];
    // Default to today's date in YYYY-MM-DD (local date, not UTC)
    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    this.selectedDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  }

  get dateOptions() {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayName = d.toLocaleDateString("no-NO", { weekday: "long" });
      const monthDay = d.toLocaleDateString("no-NO", {
        day: "numeric",
        month: "short",
      });
      const label =
        i === 0
          ? `Today (${monthDay})`
          : i === 1
            ? `Tomorrow (${monthDay})`
            : `${dayName} (${monthDay})`;
      options.push({ value, label });
    }
    return options;
  }

  static styles = [
    ...BaseWidget.styles,
    css`
      .date-selector-container {
        min-width: 180px;
      }
    `,
  ];

  async connectedCallback() {
    super.connectedCallback();
    await this.loadEventsForDate(this.selectedDate);
  }

  async loadEventsForDate(date) {
    this.showLoading(true);

    try {
      // Fetch three pages to cover more events (page 0, 1 and 2)
      const [page0, page1, page2] = await Promise.all([
        EventsAPI.getUpcomingEvents(100, 0),
        EventsAPI.getUpcomingEvents(100, 1),
        EventsAPI.getUpcomingEvents(100, 2),
      ]);

      // Merge and dedupe by id
      const all = [...(page0 || []), ...(page1 || []), ...(page2 || [])];
      const byId = new Map();
      all.forEach((ev) => {
        if (!ev || !ev.id) return;
        if (!byId.has(ev.id)) byId.set(ev.id, ev);
      });
      const allEvents = Array.from(byId.values());

      // Filter events to the selected date using local date comparison
      this.events = this.filterEventsByDate(allEvents, date);
    } catch (error) {
      this.showError("Could not load events");
    } finally {
      this.showLoading(false);
    }
  }

  filterEventsByDate(events, date) {
    const [selY, selM, selD] = (date || "")
      .split("-")
      .map((s) => parseInt(s, 10));
    return (events || []).filter((ev) => {
      if (!ev.startDate) return false;
      const evDateObj = new Date(ev.startDate);
      if (isNaN(evDateObj.getTime())) {
        // fallback to naive string compare if parsing fails
        const evDate = String(ev.startDate).split("T")[0];
        return evDate === date;
      }
      return (
        evDateObj.getFullYear() === selY &&
        evDateObj.getMonth() + 1 === selM &&
        evDateObj.getDate() === selD
      );
    });
  }

  getEventDescription(event) {
    const venue = event.venue || "";
    const displayDate = DateFormatter.formatToEventDateTime(event.startDate);
    return [venue, displayDate].filter((x) => x).join(" • ");
  }

  getEventUrl(event) {
    return event.slug ? `https://trdevents.no/event/${event.slug}` : "";
  }

  renderContent() {
    if (!this.events || this.events.length === 0) {
      return html`<p class="no-data">No events for the selected date</p>`;
    }

    return html`
      <widget-list>
        ${this.events.map(
          (event) => html`
            <widget-row
              title="${event.title || ""}"
              description="${this.getEventDescription(event)}"
              href="${this.getEventUrl(event)}"
            >
            </widget-row>
          `,
        )}
      </widget-list>
    `;
  }

  renderHeaderActions() {
    return html`
      <div class="date-selector-container">
        <custom-select
          id="events-date-select"
          .options=${this.dateOptions}
          .selected=${this.selectedDate}
          @change=${this.handleDateChange}
        ></custom-select>
      </div>
    `;
  }

  handleDateChange(e) {
    this.selectedDate = e.detail.value;
    this.loadEventsForDate(this.selectedDate);
  }

  getPlaceholderText() {
    return "Loading events...";
  }
}

customElements.define("events-widget", EventsWidget);

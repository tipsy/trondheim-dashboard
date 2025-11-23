// Events Widget - displays upcoming events in Trondheim

import { BaseWidget } from "../common/base-widget.js";
import { html, css } from "lit";
import { t } from "../../utils/localization.js";
import { EventsAPI } from "../../utils/api/events-api.js";
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
    this.collapsible = true;
    this.events = [];
    this.selectedDate = this.formatDate(new Date());
  }

  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  get dateOptions() {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const value = this.formatDate(d);
      const dayName = d.toLocaleDateString("no-NO", { weekday: "long" });
      const monthDay = d.toLocaleDateString("no-NO", {
        day: "numeric",
        month: "short",
      });
      const label =
        i === 0
          ? `${t("Today")} (${monthDay})`
          : i === 1
            ? `${t("Tomorrow")} (${monthDay})`
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
    const result = await this.fetchData(async () => {
      // Fetch three pages to cover more events
      const [page0, page1, page2] = await Promise.all([
        EventsAPI.getUpcomingEvents(100, 0),
        EventsAPI.getUpcomingEvents(100, 1),
        EventsAPI.getUpcomingEvents(100, 2),
      ]);

      // Merge and dedupe by id
      const all = [...(page0 || []), ...(page1 || []), ...(page2 || [])];
      return [
        ...new Map(
          all.filter((ev) => ev?.id).map((ev) => [ev.id, ev]),
        ).values(),
      ];
    }, t("Could not load events"));

    if (result) {
      // Filter events to the selected date
      this.events = this.filterEventsByDate(result, date);
    }
  }

  filterEventsByDate(events, date) {
    const [selY, selM, selD] = date.split("-").map(Number);

    return events.filter((ev) => {
      if (!ev?.startDate) return false;

      const evDateObj = new Date(ev.startDate);
      if (isNaN(evDateObj.getTime())) {
        // Fallback to string comparison if parsing fails
        return ev.startDate.split("T")[0] === date;
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
    if (!this.events?.length) {
      return html`<p class="no-data">
        ${t("No events for the selected date")}
      </p>`;
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
    return t("Loading events...");
  }
}

customElements.define("events-widget", EventsWidget);

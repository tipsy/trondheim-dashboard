// Police Widget - displays latest police log messages from Trøndelag

import { BaseWidget } from "../common/base-widget.js";
import { html } from "lit";
import { PoliceAPI } from "../../utils/api/police-api.js";
import { DateFormatter } from "../../utils/date-formatter.js";
import "../common/widget-row.js";
import "../common/widget-list.js";

class PoliceWidget extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    messages: { type: Array, state: true },
  };

  constructor() {
    super();
    this.title = "Police Log";
    this.icon = "mdi-car-emergency";
    this.messages = [];
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadMessages();
  }

  async loadMessages() {
    const messages = await this.fetchData(
      () => PoliceAPI.getLatestMessages(),
      "Could not load police log"
    );
    if (messages) {
      this.messages = messages;
    }
  }

  getLocation(msg) {
    return [msg.municipality, msg.area].filter(Boolean).join(", ");
  }

  getDescription(msg) {
    const location = this.getLocation(msg);
    const locationDate = [
      location,
      DateFormatter.formatToNorwegianDateTime(msg.createdOn),
    ]
      .filter(Boolean)
      .join(" • ");
    return [msg.category, locationDate].filter(Boolean).join(" • ");
  }

  getThreadUrl(msg) {
    const threadId = msg.id?.split("-")[0];
    return threadId
      ? `https://www.politiet.no/politiloggen/hendelse/#/${threadId}/`
      : "";
  }

  renderContent() {
    if (!this.messages?.length) {
      return html`<p class="no-data">No police log messages available</p>`;
    }

    return html`
      <widget-list>
        ${this.messages.map(
          (msg) => html`
            <widget-row
              title="${msg.text || ""}"
              description="${this.getDescription(msg)}"
              href="${this.getThreadUrl(msg)}"
            >
            </widget-row>
          `,
        )}
      </widget-list>
    `;
  }

  getPlaceholderText() {
    return "Loading police log...";
  }
}

customElements.define("police-widget", PoliceWidget);

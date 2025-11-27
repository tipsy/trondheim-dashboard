// NRK Widget - displays top 10 NRK Trøndelag stories

import { BaseWidget } from "../common/base-widget.js";
import { html } from "lit";
import { t } from "../../utils/localization.js";
import { NrkRssAPI } from "../../utils/api/nrk-rss-api.js";
import { DateFormatter } from "../../utils/date-formatter.js";
import "../common/widget-row.js";
import "../common/widget-list.js";

class NRKWidget extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    stories: { type: Array, state: true },
  };

  constructor() {
    super();
    this.title = "News";
    this.icon = "mdi-newspaper-variant-outline";
    this.collapsible = true;
    this.stories = [];
    this.placeholderText = t("Loading news...");
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadStories();
  }

  async loadStories() {
    const items = await this.fetchData(
      () => NrkRssAPI.getTopTen("trondelag"),
      t("Could not load news"),
    );
    if (items) {
      this.stories = items;
    }
  }

  renderContent() {
    if (!this.stories?.length) {
      return html`<p class="no-data">${t("No news available")}</p>`;
    }

    return html`
      <widget-list>
        ${this.stories.map(
          (story) => html`
            <widget-row
              title="${story.title || ""}"
              description="${DateFormatter.formatToLocaleString(story.pubDate)}"
              href="${story.link || ""}"
            >
            </widget-row>
          `,
        )}
      </widget-list>
    `;
  }


}

customElements.define("nrk-widget", NRKWidget);

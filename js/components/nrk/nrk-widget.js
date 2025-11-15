// NRK Widget - displays top 10 NRK Trøndelag stories

import { BaseWidget } from "../common/base-widget.js";
import { html } from "lit";
import { NrkRssAPI } from "../../utils/nrk-rss-api.js";
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
    this.stories = [];
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadStories();
  }

  async loadStories() {
    this.showLoading(true);

    try {
      const items = await NrkRssAPI.getTopTen("trondelag");
      this.stories = items || [];
    } catch (error) {
      this.showError("Could not load news");
    } finally {
      this.showLoading(false);
    }
  }

  renderContent() {
    if (!this.stories?.length) {
      return html`<p class="no-data">No news available</p>`;
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

  getPlaceholderText() {
    return "Loading news...";
  }
}

customElements.define("nrk-widget", NRKWidget);

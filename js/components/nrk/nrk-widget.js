// filepath: /Users/david/git/trondheim-dashboard/js/components/nrk-widget.js
// NRK Widget - displays top 10 NRK Trøndelag stories

import { BaseWidget } from '../common/base-widget.js';
import { html } from 'lit';
import { NrkRssAPI } from '../../utils/nrk-rss-api.js';
import '../common/widget-row.js';

class NRKWidget extends BaseWidget {
    static properties = {
        ...BaseWidget.properties,
        stories: { type: Array, state: true }
    };

    constructor() {
        super();
        this.stories = [];
    }

    firstUpdated() {
        super.firstUpdated();
        this.loadStories(); // Load after first render
    }

    async loadStories() {
        this.showLoading(true);

        try {
            const items = await NrkRssAPI.getTopTen(this.region || 'trondelag');
            this.stories = items || [];
            this.showLoading(false);
        } catch (error) {
            console.error('NRK: Error loading stories:', error);
            this.showError('Could not load news');
        }
    }

    formatDate(dateString) {
        try {
            const d = new Date(dateString);
            return isNaN(d.getTime()) ? dateString : d.toLocaleString();
        } catch (e) {
            return dateString;
        }
    }

    renderContent() {
        if (!this.stories || this.stories.length === 0) {
            return html`<p class="no-data">No news available</p>`;
        }

        return html`
            <div id="nrk-list" style="display:flex;flex-direction:column;gap:8px">
                ${this.stories.map(story => html`
                    <widget-row
                        title="${story.title || ''}"
                        description="${this.formatDate(story.pubDate)}"
                        href="${story.link || ''}">
                    </widget-row>
                `)}
            </div>
        `;
    }

    // BaseWidget overrides
    getTitle() {
        return 'Trøndelag News';
    }

    getIcon() {
        return html`<i class="mdi mdi-newspaper"></i>`;
    }

    getPlaceholderText() {
        return 'Loading news...';
    }
}

customElements.define('nrk-widget', NRKWidget);

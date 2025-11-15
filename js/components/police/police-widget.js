// Police Widget - displays latest police log messages from Trøndelag

import { BaseWidget } from '../common/base-widget.js';
import { html } from 'lit';
import { PoliceAPI } from '../../utils/police-api.js';
import '../common/widget-row.js';

class PoliceWidget extends BaseWidget {
    static properties = {
        ...BaseWidget.properties,
        messages: { type: Array, state: true }
    };

    constructor() {
        super();
        this.messages = [];
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.loadMessages();
    }

    async loadMessages() {
        this.showLoading(true);

        try {
            const messages = await PoliceAPI.getLatestMessages();
            this.messages = messages || [];
        } catch (error) {
            this.showError('Could not load police log');
        } finally {
            this.showLoading(false);
        }
    }

    formatDate(dateString) {
        try {
            const d = new Date(dateString);
            return isNaN(d.getTime()) ? dateString : d.toLocaleString('no-NO', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    getLocation(msg) {
        return [msg.municipality, msg.area].filter(x => x).join(', ');
    }

    getDescription(msg) {
        const location = this.getLocation(msg);
        const locationDate = [location, this.formatDate(msg.createdOn)].filter(x => x).join(' • ');
        return [msg.category, locationDate].filter(x => x).join(' • ');
    }

    getThreadUrl(msg) {
        if (!msg.id) return '';
        const threadId = msg.id.split('-')[0];
        return threadId ? `https://www.politiet.no/politiloggen/hendelse/#/${threadId}/` : '';
    }

    renderContent() {
        if (!this.messages || this.messages.length === 0) {
            return html`<p class="no-data">No police log messages available</p>`;
        }

        return html`
            <div id="police-list" style="display:flex;flex-direction:column;gap:8px">
                ${this.messages.map(msg => html`
                    <widget-row
                        title="${msg.text || ''}"
                        description="${this.getDescription(msg)}"
                        href="${this.getThreadUrl(msg)}">
                    </widget-row>
                `)}
            </div>
        `;
    }

    // BaseWidget overrides
    getTitle() {
        return 'Trøndelag Police Log';
    }

    getIcon() {
        return html`<i class="mdi mdi-car-emergency"></i>`;
    }

    getPlaceholderText() {
        return 'Loading police log...';
    }
}

customElements.define('police-widget', PoliceWidget);


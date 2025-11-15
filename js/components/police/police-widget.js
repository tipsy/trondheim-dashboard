// filepath: /Users/david/git/trondheim-dashboard/js/components/police-widget.js
// Police Widget - displays latest police log messages from Trøndelag

import { BaseWidget } from '../common/base-widget.js';
import { html } from 'lit';

class PoliceWidget extends BaseWidget {
    constructor() {
        super();
        this._usesInnerHTML = true; // This widget uses innerHTML for rendering
    }

    async connectedCallback() {
        // BaseWidget.connectedCallback calls render; we want to fetch after render
        super.connectedCallback();
        await this.loadMessages();
    }

    async loadMessages() {
        this.showLoading(true);
        this.hideError();

        try {
            const messages = await PoliceAPI.getLatestMessages();
            this.renderMessages(messages);
        } catch (error) {
            this.showError('Could not load police log');
        } finally {
            this.showLoading(false);
        }
    }

    renderMessages(messages) {
        const content = this.getContentElement();
        if (!content) return;

        if (!messages || !messages.length) {
            content.innerHTML = '<p class="no-data">No police log messages available</p>';
            return;
        }

        // Declarative HTML generation: build a safe HTML string of widget-row elements
        const escapeAttr = (s) => {
            if (s === undefined || s === null) return '';
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };

        const formatDate = (dateString) => {
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
        };

        const rowsHtml = messages.map(msg => {
            const text = escapeAttr(msg.text || '');
            const municipality = escapeAttr(msg.municipality || '');
            const area = escapeAttr(msg.area || '');
            const displayDate = escapeAttr(formatDate(msg.createdOn));
            const category = escapeAttr(msg.category || '');

            const location = [municipality, area].filter(x => x).join(', ');
            const locationDate = [location, displayDate].filter(x => x).join(' • ');
            // Prepend category (title) to description when available; use a short dot separator
            const description = [category, locationDate].filter(x => x).join(' • ');

            // Extract threadId from id (e.g., "257vxg-0" -> "257vxg")
            const threadId = msg.id ? msg.id.split('-')[0] : '';
            const href = threadId ? `https://www.politiet.no/politiloggen/hendelse/#/${threadId}/` : '';

            return `<widget-row title="${text}" description="${description}" href="${href}"></widget-row>`;
        }).join('');

        content.innerHTML = `<div id="police-list" style="display:flex;flex-direction:column;gap:8px">${rowsHtml}</div>`;
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

    afterRender() {
        // No-op; styles are in police-row
    }
}

customElements.define('police-widget', PoliceWidget);

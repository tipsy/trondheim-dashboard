// filepath: /Users/david/git/trondheim-dashboard/js/components/events-widget.js
// Events Widget - displays upcoming events in Trondheim

import { BaseWidget } from '../common/base-widget.js';
import { html } from 'lit';

class EventsWidget extends BaseWidget {
    constructor() {
        super();
        this._usesInnerHTML = true; // This widget uses innerHTML for rendering
        // default to today's date in YYYY-MM-DD (local date, not UTC)
        const today = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        this.selectedDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        this._dateChangeHandler = null;
    }

    async connectedCallback() {
        // BaseWidget.connectedCallback calls render; we want to fetch after render
        super.connectedCallback();
        await this.loadEventsForDate(this.selectedDate);
    }

    async loadEventsForDate(date) {
        this.showLoading(true);
        this.hideError();

        try {
            // Fetch three pages to cover more events (page 0, 1 and 2)
            const [page0, page1, page2] = await Promise.all([
                EventsAPI.getUpcomingEvents(100, 0),
                EventsAPI.getUpcomingEvents(100, 1),
                EventsAPI.getUpcomingEvents(100, 2)
            ]);

            // Merge and dedupe by id
            const all = [...(page0 || []), ...(page1 || []), ...(page2 || [])];
            const byId = new Map();
            all.forEach(ev => {
                if (!ev || !ev.id) return;
                if (!byId.has(ev.id)) byId.set(ev.id, ev);
            });
            const events = Array.from(byId.values());

            // Filter events to the selected date using local date comparison
            const [selY, selM, selD] = (date || '').split('-').map(s => parseInt(s, 10));
            const filtered = (events || []).filter(ev => {
                if (!ev.startDate) return false;
                const evDateObj = new Date(ev.startDate);
                if (isNaN(evDateObj.getTime())) {
                    // fallback to naive string compare if parsing fails
                    const evDate = String(ev.startDate).split('T')[0];
                    return evDate === date;
                }
                return (
                    evDateObj.getFullYear() === selY &&
                    (evDateObj.getMonth() + 1) === selM &&
                    evDateObj.getDate() === selD
                );
            });

            this.renderEvents(filtered);
        } catch (error) {
            this.showError('Could not load events');
        } finally {
            this.showLoading(false);
        }
    }

    renderEvents(events) {
        const content = this.getContentElement();
        if (!content) return;

        if (!events || !events.length) {
            content.innerHTML = '<p class="no-data">No events for the selected date</p>';
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
                if (isNaN(d.getTime())) return dateString;

                // Format as "DD. Mon HH:MM"
                const day = String(d.getDate()).padStart(2, '0');
                const monthShort = d.toLocaleDateString(undefined, { month: 'short' });
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');

                return `${day}. ${monthShort} ${hours}:${minutes}`;
            } catch (e) {
                return dateString;
            }
        };

        const rowsHtml = events.map(event => {
            const title = escapeAttr(event.title || '');
            const venue = escapeAttr(event.venue || '');
            const displayDate = escapeAttr(formatDate(event.startDate));
            const venueDate = [venue, displayDate].filter(x => x).join(' • ');
            const href = event.slug ? `https://trdevents.no/event/${escapeAttr(event.slug)}` : '';

            return `<widget-row title="${title}" description="${venueDate}" href="${href}"></widget-row>`;
        }).join('');

        content.innerHTML = `<div id="events-list" style="display:flex;flex-direction:column;gap:8px">${rowsHtml}</div>`;
    }

    // Override BaseWidget methods
    getTitle() {
        return 'Trondheim Events';
    }

    getIcon() {
        return html`<i class="mdi mdi-calendar-star"></i>`;
    }

    getHeaderContent() {
        return html`
            <style>
                .date-selector-container { min-width: 180px; }
            </style>
            <div class="date-selector-container">
                <custom-select id="events-date-select"></custom-select>
            </div>
        `;
    }

    getPlaceholderText() {
        return 'Loading events...';
    }

    afterRender() {
        this.setupDateSelector();
    }

    async setupDateSelector() {
        const select = this.shadowRoot.querySelector('#events-date-select');
        if (!select) return;

        // Wait for the custom element to be upgraded
        await customElements.whenDefined('custom-select');

        // Build options: Today + next 7 days
        const options = [];
        const today = new Date();
        for (let i = 0; i <= 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const value = `${yyyy}-${mm}-${dd}`;

            // compute localized pieces
            const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
            const monthShort = d.toLocaleDateString(undefined, { month: 'short' });
            let label = '';
            if (i === 0) {
                // Show Today with the normally formatted local date, e.g. "Today (12. Nov)"
                label = `Today (${dd}. ${monthShort})`;
            } else {
                label = `${weekday} ${dd}. ${monthShort}`;
            }

            options.push({ value, label });
        }

        // Set options on the custom-select
        select.options = options;
        select.selected = this.selectedDate;

        // Remove previous handler if re-rendered
        if (this._dateChangeHandler) {
            select.removeEventListener('change', this._dateChangeHandler);
            this._dateChangeHandler = null;
        }

        this._dateChangeHandler = async (e) => {
            const newDate = e.detail.value;
            if (!newDate) return;
            this.selectedDate = newDate;
            await this.loadEventsForDate(this.selectedDate);
        };

        select.addEventListener('change', this._dateChangeHandler);
    }
}

customElements.define('events-widget', EventsWidget);

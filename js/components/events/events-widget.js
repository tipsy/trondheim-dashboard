// filepath: /Users/david/git/trondheim-dashboard/js/components/events-widget.js
// Events Widget - displays upcoming events in Trondheim

class EventsWidget extends BaseWidget {
    constructor() {
        super();
    }

    async connectedCallback() {
        // BaseWidget.connectedCallback calls render; we want to fetch after render
        super.connectedCallback();
        await this.loadEvents();
    }

    async loadEvents() {
        this.showLoading(true);
        this.hideError();

        try {
            const events = await EventsAPI.getUpcomingEvents(10);
            this.renderEvents(events);
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
            content.innerHTML = '<p class="no-data">No upcoming events available</p>';
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

                // Format as "DD.MM HH:MM"
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');

                return `${day}.${month} ${hours}:${minutes}`;
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

    // BaseWidget overrides
    getTitle() {
        return 'Trondheim Events';
    }

    getIcon() {
        return '<i class="mdi mdi-calendar-star"></i>';
    }

    getPlaceholderText() {
        return 'Loading events...';
    }

    afterRender() {
        // No-op; styles are in event-row
    }
}

customElements.define('events-widget', EventsWidget);


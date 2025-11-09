// filepath: /Users/david/git/trondheim-dashboard/js/components/police-widget.js
// Police Widget - displays latest police log messages from Trøndelag

class PoliceWidget extends BaseWidget {
    constructor() {
        super();
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

        // Declarative HTML generation: build a safe HTML string of <police-row> elements
        const escapeAttr = (s) => {
            if (s === undefined || s === null) return '';
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };

        const rowsHtml = messages.map(msg => {
            const id = escapeAttr(msg.id || '');
            const category = escapeAttr(msg.category || '');
            const municipality = escapeAttr(msg.municipality || '');
            const area = escapeAttr(msg.area || '');
            const text = escapeAttr(msg.text || '');
            const createdOn = escapeAttr(msg.createdOn || '');
            const isActive = msg.isActive ? 'true' : 'false';
            return `<police-row id="${id}" category="${category}" municipality="${municipality}" area="${area}" text="${text}" createdon="${createdOn}" isactive="${isActive}"></police-row>`;
        }).join('');

        content.innerHTML = `<div id="police-list" style="display:flex;flex-direction:column;gap:8px">${rowsHtml}</div>`;
    }

    // BaseWidget overrides
    getTitle() {
        return 'Trøndelag Police Log';
    }

    getIcon() {
        return '<i class="mdi mdi-shield-alert"></i>';
    }

    getPlaceholderText() {
        return 'Loading police log...';
    }

    afterRender() {
        // No-op; styles are in police-row
    }
}

customElements.define('police-widget', PoliceWidget);


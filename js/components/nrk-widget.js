// filepath: /Users/david/git/trondheim-dashboard/js/components/nrk-widget.js
// NRK Widget - displays top 10 NRK Trøndelag stories

class NrkWidget extends BaseWidget {
    constructor() {
        super();
        this.region = 'trondelag';
    }

    async connectedCallback() {
        // BaseWidget.connectedCallback calls render; we want to fetch after render
        super.connectedCallback();
        await this.loadStories();
    }

    async loadStories() {
        this.showLoading(true);
        this.hideError();

        try {
            const items = await NrkRssAPI.getTopTen(this.region);
            this.renderStories(items);
        } catch (error) {
            this.showError('Could not load news');
        } finally {
            this.showLoading(false);
        }
    }

    renderStories(items) {
        const content = this.getContentElement();
        if (!content) return;

        if (!items || !items.length) {
            content.innerHTML = '<p class="no-data">No news available</p>';
            return;
        }

        // Declarative HTML generation: build a safe HTML string of <nrk-row> elements
        const escapeAttr = (s) => {
            if (s === undefined || s === null) return '';
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };

        const rowsHtml = items.map(it => {
            const title = escapeAttr(it.title || '');
            const link = escapeAttr(it.link || '#');
            const pub = escapeAttr(it.pubDate || '');
            return `<nrk-row title="${title}" link="${link}" pubdate="${pub}"></nrk-row>`;
        }).join('');

        content.innerHTML = `<div id="nrk-list" style="display:flex;flex-direction:column;gap:8px">${rowsHtml}</div>`;
    }

    // BaseWidget overrides
    getTitle() {
        return 'Last 10 from NRK Trøndelag';
    }

    getIcon() {
        return '<i class="mdi mdi-newspaper"></i>';
    }

    getPlaceholderText() {
        return 'Loading news...';
    }

    afterRender() {
        // No-op; styles are in nrk-row
    }
}

customElements.define('nrk-widget', NrkWidget);

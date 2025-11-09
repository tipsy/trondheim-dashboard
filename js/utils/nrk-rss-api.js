// filepath: /Users/david/git/trondheim-dashboard/js/utils/nrk-rss-api.js
// Minimal NRK RSS API for Trondheim Dashboard
// Returns top 10 RSS items (title, link, pubDate)

class NrkRssAPI extends APIBase {
    static defaultFeed(region = 'trondelag') {
        return `https://www.nrk.no/${region}/siste.rss`;
    }

    /**
     * Fetch and return the top 10 RSS items as JSON-serializable objects:
     * [{ title, link, pubDate }]
     * pubDate will be an ISO string when parseable, otherwise the original string.
     *
     * Note: We can't use fetchJSON here because RSS returns XML, not JSON
     * So we handle caching manually with rateLimitedFetch
     */
    static async getTopTen(region = 'trondelag', timeout = 10000) {
        const url = this.defaultFeed(region);

        // Check cache first - use named params
        const cached = CacheClient.get({ key: url, ttl: CacheConfig.NRK_TTL });
        if (cached !== null) {
            return cached;
        }

        // No cache, fetch and wait
        return await this.fetchFreshNews(region, timeout, url);
    }

    static async fetchFreshNews(region, timeout, url) {
        try {
            const response = await this.rateLimitedFetch('nrk-rss', url, {}, timeout);
            if (!response.ok) throw new Error(`API returned ${response.status}`);

            const text = await response.text();

            // parse XML in browser environment
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'application/xml');
            const parseError = xml.querySelector('parsererror');
            if (parseError) throw new Error('Failed to parse RSS XML');

            const items = Array.from(xml.querySelectorAll('item'))
                .slice(0, 10)
                .map(item => {
                    const title = item.querySelector('title')?.textContent?.trim() || '';
                    const link = item.querySelector('link')?.textContent?.trim() || '';
                    const pubRaw = item.querySelector('pubDate')?.textContent?.trim() || '';

                    let pubDate = pubRaw;
                    try {
                        const d = new Date(pubRaw);
                        if (!isNaN(d.getTime())) pubDate = d.toISOString();
                    } catch (e) {
                        // leave pubDate as raw string
                    }

                    return { title, link, pubDate };
                });

            // Cache the results using named params
            CacheClient.set({ key: url, data: items });

            return items;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch NRK top ten');
        }
    }
}

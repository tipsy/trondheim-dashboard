// filepath: /Users/david/git/trondheim-dashboard/js/utils/police-api.js
// Politiet API for Trondheim Dashboard
// Returns latest police log messages from Trøndelag

class PoliceAPI extends APIBase {
    static defaultEndpoint() {
        return 'https://api.politiet.no/politiloggen/v1/messages?Districts=Tr%C3%B8ndelag&Take=10';
    }

    /**
     * Fetch and return the latest 10 police log messages for Trøndelag:
     * [{ id, category, municipality, area, text, createdOn, isActive }]
     */
    static async getLatestMessages(timeout = 10000) {
        const apiUrl = this.defaultEndpoint();

        const json = await this.fetchJSON(
            'police-api',
            {
                url: apiUrl,
                options: {},
                timeout: timeout,
                ttl: 60 * 5 * 1000, // 5 minute cache
                useCorsProxy: true
            }
        );

        if (!json.data || !Array.isArray(json.data)) {
            throw new Error('Invalid API response format');
        }

        // Map to simplified format
        const messages = json.data.map(msg => ({
            id: msg.id || '',
            category: msg.category || '',
            municipality: msg.municipality || '',
            area: msg.area || '',
            text: msg.text || '',
            createdOn: msg.createdOn || '',
            isActive: msg.isActive || false
        }));

        return messages;
    }
}

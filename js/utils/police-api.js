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

        // Use CORS proxy for browser compatibility
        const corsProxy = 'https://corsproxy.io/?';
        const url = `${corsProxy}${encodeURIComponent(apiUrl)}`;

        try {
            const response = await this.rateLimitedFetch('police-api', url, {}, timeout);
            if (!response.ok) throw new Error(`API returned ${response.status}`);

            const json = await response.json();
            
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
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch police log messages');
        }
    }
}


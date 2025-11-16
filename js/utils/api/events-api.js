// TrdEvents API for Trondheim Dashboard
// Returns upcoming events in Trondheim

import { APIBase } from './api-base.js';
import { CacheConfig } from '../cache-config.js';

export class EventsAPI extends APIBase {

    static defaultEndpoint() {
        return 'https://trdevents-224613.web.app/graphQL';
    }

    /**
     * Fetch and return upcoming events:
     * [{ id, title, startDate, endDate, venue }]
     * Accepts pageSize and page to allow fetching additional pages.
     */
    static async getUpcomingEvents(pageSize = 10, page = 0, timeout = 10000) {
        const url = this.defaultEndpoint();

        const query = `
            query {
                events(filter: {}, page: ${page}, pageSize: ${pageSize}) {
                    data {
                        id
                        event_slug
                        title_nb
                        startDate
                        endDate
                        venue {
                            name
                        }
                    }
                }
            }
        `;

        const json = await this.fetchGraphQL(
            'events-api',
            {
                url: url,
                query: query,
                variables: {},
                headers: {},
                timeout: timeout,
                ttl: CacheConfig.EVENTS_TTL
            }
        );

        if (!json.data || !json.data.events || !json.data.events.data) {
            throw new Error('Invalid API response format');
        }

        // Map to simplified format
        const events = json.data.events.data.map(event => ({
            id: event.id || '',
            slug: event.event_slug || '',
            title: event.title_nb || '',
            startDate: event.startDate || '',
            endDate: event.endDate || '',
            venue: event.venue?.name || ''
        }));

        return events;
    }

}

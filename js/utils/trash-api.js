// Trash API utilities for Trondheim Dashboard
// Using Trondheim Kommune (TRV) Wasteplan API

class TrashAPI extends APIBase {
    static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    /**
     * Search for address to get waste collection schedule
     */
    static async searchTrashAddress(address) {
        const encodedAddress = encodeURIComponent(address);
        return await this.fetchJSON(
            'trash-search',
            `https://trv.no/wp-json/wasteplan/v2/adress?s=${encodedAddress}`,
            {},
            10000,
            this.CACHE_DURATION // 24 hour cache for search results too
        );
    }

    /**
     * Get trash schedule for a specific address ID
     */
    static async getTrashSchedule(addressId) {
        const url = `https://trv.no/wp-json/wasteplan/v2/calendar/${addressId}`;

        return await this.fetchJSON(
            'trash-schedule',
            url,
            {},
            10000,
            this.CACHE_DURATION // 24 hour cache
        );
    }
}


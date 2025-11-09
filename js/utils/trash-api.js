// Trash API utilities for Trondheim Dashboard
// Using Trondheim Kommune (TRV) Wasteplan API

class TrashAPI extends APIBase {

    static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    /**
     * Search for address to get waste collection schedule
     */
    static async searchTrashAddress(address) {
        const encodedAddress = encodeURIComponent(address);
        return await this.fetchJSON(
            'trash-search',
            {
                url: `https://trv.no/wp-json/wasteplan/v2/adress?s=${encodedAddress}`,
                timeout: 10000,
                ttl: this.CACHE_DURATION // 24 hours in milliseconds
            }
        );
    }

    /**
     * Get trash schedule for a specific address ID
     */
    static async getTrashSchedule(addressId) {
        const url = `https://trv.no/wp-json/wasteplan/v2/calendar/${addressId}`;

        return await this.fetchJSON(
            'trash-schedule',
            {
                url: url,
                timeout: 10000,
                ttl: this.CACHE_DURATION // 24 hour cache
            }
        );
    }
}

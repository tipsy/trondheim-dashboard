// Trash API utilities for Trondheim Dashboard
// Using Trondheim Kommune (TRV) Wasteplan API

class TrashAPI extends APIBase {
    /**
     * Search for address to get waste collection schedule
     */
    static async searchTrashAddress(address) {
        try {
            const encodedAddress = encodeURIComponent(address);
            const data = await this.fetchJSON(
                'trash-search',
                `https://trv.no/wp-json/wasteplan/v2/adress?s=${encodedAddress}`
            );
            return data;
        } catch (error) {
            throw this.handleError(error, 'Failed to search address');
        }
    }

    /**
     * Get trash schedule for a specific address ID
     */
    static async getTrashSchedule(addressId) {
        try {
            const data = await this.fetchJSON(
                'trash-schedule',
                `https://trv.no/wp-json/wasteplan/v2/calendar/${addressId}`
            );
            return data;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch trash schedule');
        }
    }
}


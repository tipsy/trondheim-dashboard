// Trash API utilities for Trondheim Dashboard
// Using Trondheim Kommune (TRV) Wasteplan API

class TrashAPI {
    /**
     * Search for address to get waste collection schedule
     */
    static async searchTrashAddress(address) {
        try {
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(
                `https://trv.no/wp-json/wasteplan/v2/adress?s=${encodedAddress}`
            );

            if (!response.ok) {
                throw new Error('Failed to search address');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching trash address:', error);
            throw error;
        }
    }

    /**
     * Get trash schedule for a specific address ID
     */
    static async getTrashSchedule(addressId) {
        try {
            const response = await fetch(
                `https://trv.no/wp-json/wasteplan/v2/calendar/${addressId}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch trash schedule');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching trash schedule:', error);
            throw error;
        }
    }
}


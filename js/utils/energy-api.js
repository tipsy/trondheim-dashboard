// Energy Price API utilities for Trondheim Dashboard
// Using hvakosterstrommen.no API

class EnergyAPI extends APIBase {

    static async getEnergyPrices(priceArea = 'NO3') {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const url = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${priceArea}.json`;

        return await this.fetchJSON(
            'energy-prices',
            {
                url: url,
                timeout: 10000,
                ttl: CacheConfig.ENERGY_TTL
            }
        );
    }

    // Get price area based on location (simplified mapping)
    static getPriceAreaFromLocation(lat, lon) {
        // Simplified mapping based on approximate coordinates
        // NO1 = Oslo / Øst-Norge (around 60°N, 11°E)
        // NO2 = Kristiansand / Sør-Norge (around 58°N, 8°E)
        // NO3 = Trondheim / Midt-Norge (around 63°N, 10°E)
        // NO4 = Tromsø / Nord-Norge (around 69°N, 19°E)
        // NO5 = Bergen / Vest-Norge (around 60°N, 5°E)
        
        if (lat > 67) {
            return 'NO4'; // Nord-Norge
        } else if (lat > 61 && lat <= 67) {
            return 'NO3'; // Midt-Norge (Trondheim area)
        } else if (lat > 59 && lon < 7) {
            return 'NO5'; // Vest-Norge (Bergen area)
        } else if (lat <= 59) {
            return 'NO2'; // Sør-Norge (Kristiansand area)
        } else {
            return 'NO1'; // Øst-Norge (Oslo area)
        }
    }

}

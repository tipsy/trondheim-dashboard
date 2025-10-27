// Bus API utilities for Trondheim Dashboard
// Using EnTur API which ATB (Trondheim public transport) is part of

class BusAPI extends APIBase {
    static async getClosestBusStops(lat, lon, radius = 500) {
        try {
            const query = `
                {
                    nearest(
                        latitude: ${lat}
                        longitude: ${lon}
                        maximumDistance: ${radius}
                        maximumResults: 10
                        filterByPlaceTypes: [stopPlace]
                    ) {
                        edges {
                            node {
                                place {
                                    ... on StopPlace {
                                        id
                                        name
                                        latitude
                                        longitude
                                    }
                                }
                                distance
                            }
                        }
                    }
                }
            `;

            const data = await this.fetchGraphQL(
                'bus-stops',
                'https://api.entur.io/journey-planner/v3/graphql',
                query,
                {},
                { 'ET-Client-Name': 'trondheim-dashboard' }
            );

            // Transform the response to match expected format
            const stops = data.data?.nearest?.edges?.map(edge => ({
                id: edge.node.place.id,
                name: edge.node.place.name,
                latitude: edge.node.place.latitude,
                longitude: edge.node.place.longitude,
                distance: edge.node.distance
            })) || [];

            return stops;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch bus stops');
        }
    }

    static async getBusDepartures(stopPlaceId, numberOfDepartures = 10) {
        try {
            const query = `
                {
                    stopPlace(id: "${stopPlaceId}") {
                        id
                        name
                        estimatedCalls(numberOfDepartures: ${numberOfDepartures}, timeRange: 86400) {
                            expectedDepartureTime
                            realtime
                            destinationDisplay {
                                frontText
                            }
                            serviceJourney {
                                line {
                                    publicCode
                                    transportMode
                                }
                            }
                        }
                    }
                }
            `;

            const data = await this.fetchGraphQL(
                'bus-departures',
                'https://api.entur.io/journey-planner/v3/graphql',
                query,
                {},
                { 'ET-Client-Name': 'trondheim-dashboard' }
            );

            return data.data?.stopPlace || null;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch bus departures');
        }
    }
}


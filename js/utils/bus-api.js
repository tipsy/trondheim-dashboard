// Bus API utilities for Trondheim Dashboard
// Using EnTur API which ATB (Trondheim public transport) is part of

class BusAPI {
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

            const response = await fetch('https://api.entur.io/journey-planner/v3/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ET-Client-Name': 'trondheim-dashboard'
                },
                body: JSON.stringify({ query })
            });

            const data = await response.json();

            if (data.errors) {
                console.error('GraphQL errors:', data.errors);
                throw new Error('GraphQL query failed');
            }

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
            console.error('Error fetching bus stops:', error);
            throw error;
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

            const response = await fetch('https://api.entur.io/journey-planner/v3/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ET-Client-Name': 'trondheim-dashboard'
                },
                body: JSON.stringify({ query })
            });

            const data = await response.json();

            if (data.errors) {
                console.error('GraphQL errors:', data.errors);
                throw new Error('GraphQL query failed');
            }

            return data.data?.stopPlace || null;
        } catch (error) {
            console.error('Error fetching bus departures:', error);
            throw error;
        }
    }
}


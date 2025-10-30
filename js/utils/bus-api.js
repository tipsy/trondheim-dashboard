// Bus API utilities for Trondheim Dashboard
// Using EnTur Journey Planner GraphQL API with real-time data
// Note: We query individual quays (platforms) to separate different directions

class BusAPI extends APIBase {
    static async getClosestBusStops(lat, lon, radius = 500) {
        try {
            // Query for stop places and their quays
            // We get description and publicCode to help distinguish between different platforms/directions
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
                                        quays {
                                            id
                                            name
                                            description
                                            publicCode
                                        }
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

            // Transform the response to return individual quays
            const quays = [];
            data.data?.nearest?.edges?.forEach(edge => {
                const stopPlace = edge.node.place;
                const distance = edge.node.distance;

                // Add each quay as a separate entry
                stopPlace.quays?.forEach(quay => {
                    quays.push({
                        id: quay.id,
                        name: stopPlace.name,
                        description: quay.description,
                        publicCode: quay.publicCode,
                        latitude: stopPlace.latitude,
                        longitude: stopPlace.longitude,
                        distance: distance
                    });
                });
            });

            return quays;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch bus stops');
        }
    }

    static async getBusDepartures(quayId, numberOfDepartures = 10) {
        try {
            // Query a specific quay to get departures for one direction only
            const query = `
                {
                    quay(id: "${quayId}") {
                        id
                        name
                        description
                        estimatedCalls(numberOfDepartures: ${numberOfDepartures}, timeRange: 86400) {
                            realtime
                            aimedDepartureTime
                            expectedDepartureTime
                            destinationDisplay {
                                frontText
                                via
                            }
                            quay {
                                publicCode
                            }
                            serviceJourney {
                                journeyPattern {
                                    name
                                }
                                line {
                                    publicCode
                                    name
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

            return data.data?.quay || null;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch bus departures');
        }
    }


}


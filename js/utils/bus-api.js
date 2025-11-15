// Bus API utilities for Trondheim Dashboard
// Using EnTur Journey Planner GraphQL API with real-time data
// Note: We query individual quays (platforms) to separate different directions

import { APIBase } from './api-base.js';
import { CacheConfig } from './cache-config.js';

export class BusAPI extends APIBase {
    // Track in-flight requests to avoid duplicate concurrent fetches for the same quay
    static inFlightRequests = new Map();

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
                {
                    url: 'https://api.entur.io/journey-planner/v3/graphql',
                    query: query,
                    headers: { 'ET-Client-Name': 'trondheim-dashboard' },
                    timeout: 10000,
                    ttl: CacheConfig.BUS_STOPS_TTL
                }
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
        // If a request for this quay is already in-flight, return the same Promise
        if (this.inFlightRequests.has(quayId)) {
            return this.inFlightRequests.get(quayId);
        }

        // Create a promise for this request and store it
        const requestPromise = (async () => {
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
                    {
                        url: 'https://api.entur.io/journey-planner/v3/graphql',
                        query: query,
                        headers: { 'ET-Client-Name': 'trondheim-dashboard' },
                        timeout: 10000,
                        ttl: 0 // No cache for real-time departures
                    }
                );

                return data.data?.quay || null;
            } catch (error) {
                throw this.handleError(error, 'Failed to fetch departures');
            } finally {
                // Remove the in-flight marker when done (success or failure)
                this.inFlightRequests.delete(quayId);
            }
        })();

        this.inFlightRequests.set(quayId, requestPromise);
        return requestPromise;
    }

}

// Cache configuration constants for Trondheim Dashboard
// All TTLs are in milliseconds

export class CacheConfig {
  // Enable/disable cache logging (set to false to disable console logs for cache hits/misses)
  static ENABLE_LOGGING = false;

  // News / RSS: slightly below dashboard auto-refresh (5 min) so cache expires before refresh
  static NRK_TTL = 4 * 60 * 1000; // 4 minutes

  // Weather: slightly below dashboard auto-refresh (5 min) so cache expires before refresh
  static WEATHER_TTL = 4 * 60 * 1000; // 5 minutes
  static SUN_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Trash schedules are stable daily
  static TRASH_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Energy prices (hourly granularity)
  static ENERGY_TTL = 60 * 60 * 1000; // 1 hour

  // Events and other relatively static content
  static EVENTS_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Nearest bus stops metadata can be cached longer; increase from 1h to 6h
  static BUS_STOPS_TTL = 6 * 60 * 60 * 1000; // 6 hours

  // Real-time departures: no cache
  static BUS_DEPARTURES_TTL = 0;

  // Police logs: slightly below dashboard auto-refresh (5 min) so cache expires before refresh
  static POLICE_TTL = 4 * 60 * 1000; // 5 minutes

  // Geocoding (Nominatim) - respect rate limits
  static GEOCODING_TTL = 60 * 60 * 1000; // 1 hour
}

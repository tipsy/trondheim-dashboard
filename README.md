# Trondheim Dashboard

A small, client-side web dashboard built with vanilla Web Components (Custom Elements + Shadow DOM).
It aggregates local, real-time information useful for Trondheim residents:
bus departures, weather, trash collection, electricity prices and more.

Live demo: https://trondheim-dashboard.com

This repository is intentionally lightweight — just static HTML, CSS and JavaScript — so it can be served from any static host.

Quick start
1. Clone the repository:

   git clone https://github.com/your-user/trondheim-dashboard.git
   cd trondheim-dashboard

2. Serve the directory with any static server and open http://localhost:8000

   # Python 3 built-in server
   python -m http.server 8000

   # Node (http-server)
   npx http-server

   # Or open index.html directly in the browser (some APIs may require a server due to CORS)

What you'll find
- index.html — main page that composes the dashboard
- styles/ — global stylesheet and theme CSS files
- img/ — background and other static assets
- js/ — all JavaScript source code, split into `components/` and `utils/`

Project structure (important files)

js/
├─ components/
│  ├─ dashboard.js          # Main dashboard component (composes widgets, handles URL state)
│  ├─ base-widget.js        # Base class for widgets (layout, loading / error handling)
│  ├─ address/              # Address input and suggestion components
│  ├─ bus/                  # Bus widget + row component
│  ├─ weather/              # Weather widgets
│  ├─ trash/                # Trash collection widget
│  ├─ police/               # Police log widget
│  └─ common/               # Shared UI building blocks (spinner, error message, etc.)
└─ utils/
   ├─ api-base.js           # Lightweight fetch wrapper / caching helper
   ├─ bus-api.js            # Entur/ATB integration
   ├─ weather-api.js        # MET Norway integration
   ├─ trash-api.js          # TRV integration
   ├─ energy-api.js         # Electricity price API
   └─ geocoding-api.js      # Nominatim address lookup

Integrations (detailed)
Below is a comprehensive list of all external integrations used by the app (endpoints discovered in `js/utils/` and components). Each entry shows what the integration provides and any important notes (CORS, headers, caching).

- Entur / Journey Planner (GraphQL)
  - Endpoint: `https://api.entur.io/journey-planner/v3/graphql`
  - Purpose: Nearest stop search, quay details and real-time departures (used by `js/utils/bus-api.js`).
  - Notes: GraphQL POST requests; the code sets an `ET-Client-Name` header. Real-time data is treated as dynamic (background refresh).

- MET Norway (locationforecast)
  - Endpoint: `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat={lat}&lon={lon}`
  - Purpose: Weather forecast and current conditions (used by `js/utils/weather-api.js`).
  - Notes: Requests include a `User-Agent` header. Code may use a CORS proxy for this endpoint.

- Sunrise-Sunset
  - Endpoint: `https://api.sunrise-sunset.org/json?lat={lat}&lng={lon}&date={date}&formatted=0`
  - Purpose: Sunrise, sunset and day-length times (used by `js/utils/weather-api.js`).

- TRV (Trondheim Renholdsverk) Wasteplan
  - Endpoints:
    - Search: `https://trv.no/wp-json/wasteplan/v2/adress?s={query}`
    - Calendar: `https://trv.no/wp-json/wasteplan/v2/calendar/{addressId}`
  - Purpose: Address lookup and trash collection schedule (used by `js/utils/trash-api.js`).
  - Notes: Search and calendar responses are cached for 24 hours in the app.

- HvaKosterStrommen (Electricity prices)
  - Endpoint pattern: `https://www.hvakosterstrommen.no/api/v1/prices/{year}/{month}-{day}_{priceArea}.json`
  - Purpose: Current daily electricity prices by price area (used by `js/utils/energy-api.js`).
  - Notes: Cached for 1 hour by default. The app maps coordinates to a simplified price-area (NO1-NO5).

- OpenStreetMap Nominatim (Geocoding)
  - Endpoints:
    - Search: `https://nominatim.openstreetmap.org/search?q={query}&format=json&limit={limit}&countrycodes=no&addressdetails=1`
    - Reverse: `https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json`
  - Purpose: Address autocomplete, reverse geocoding, and address formatting (used by `js/utils/geocoding-api.js`).
  - Notes: The app adds `Trøndelag, Norway` to searches when appropriate, filters results to addresses with house numbers, and sets a custom `User-Agent` header.

- Politiet / Politiloggen
  - Endpoint: `https://api.politiet.no/politiloggen/v1/messages?Districts=Tr%C3%B8ndelag&Take=10`
  - Purpose: Latest police log messages for Trøndelag (used by `js/utils/police-api.js`).
  - Notes: The code uses a CORS proxy for this endpoint and treats data as dynamic.

- NRK RSS
  - Endpoint pattern: `https://www.nrk.no/{region}/siste.rss` (e.g., `trondelag`)
  - Purpose: Fetch latest news RSS feed and parse into JSON objects (used by `js/utils/nrk-rss-api.js`).
  - Notes: RSS is XML; the app parses XML in the browser and caches results (short TTL by default).

- TrdEvents (third-party GraphQL for Trondheim events)
  - Endpoint: `https://trdevents-224613.web.app/graphQL`
  - Purpose: Fetch upcoming local events (used by `js/utils/events-api.js`).
  - Notes: GraphQL endpoint; results are cached (24h) by default.

- External assets and helpers
  - Material Design Icons (CDN): `https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css` (used by `js/utils/icon-library.js`).
  - Google Fonts (in `styles/main.css`): Quicksand and Fira Code via `fonts.googleapis.com`.
  - CORS proxy used optionally: `https://corsproxy.io/?` (applied from `js/utils/api-base.js` when `useCorsProxy` is true).

- External site links (used for deep links from components)
  - Politiet event page: `https://www.politiet.no/politiloggen/hendelse/#/{threadId}/` (linked from police rows)
  - TrdEvents site: `https://trdevents.no/event/{slug}` (linked from event rows)

Caching & CORS proxy
This project uses a small, centralized client-side cache and an optional CORS proxy. The cache and proxy are used by `js/utils/api-base.js` and the various `*api.js` utilities.

New central cache configuration
- TTL values are now controlled from a single file: `js/utils/cache-config.js`.
- The file exposes a small `CacheConfig` class with named static constants (for example `CacheConfig.WEATHER_TTL`, `CacheConfig.NRK_TTL`, `CacheConfig.BUS_STOPS_TTL`, etc.).
- Update those constants in `js/utils/cache-config.js` to tune caching globally — no need to search individual API files.

How caching works (CacheClient)
- Storage: All cached entries are stored in `localStorage` using keys prefixed with `trondheim-cache-`.
- Keying: Cache keys are derived from the request URL using a simple 32-bit hash converted to base36 (see `CacheClient.getCacheKey(url)`).
- Payload: Each entry stores `{ timestamp, url, data }` so the app can report age and size.
- API: `CacheClient.get(url, ttl)`, `set(url, data)`, `getAge(url)`, and `isStale(url, ttl)` — the repo now prefers the object-style calls: `CacheClient.get({ key, ttl })` and `CacheClient.set({ key, data })`.
- TTL semantics (implementation):
  - If `ttl` is the number `0`, caching is disabled for that request (no cache read, no cache write).
  - If `ttl` is a number > 0, the cache entry is considered valid only if age <= ttl; otherwise `CacheClient.get` returns `null`.
  - If `ttl` is `null`, `CacheClient.get` will return any cached entry regardless of age (this is useful if you want to show cached data even when stale). Note: the library does not automatically revalidate stale entries in the background — see below.

Which constants are used by the code
- The code references named constants in `CacheConfig` for each integration. Examples (names only — change values in `js/utils/cache-config.js`):
  - `CacheConfig.WEATHER_TTL` — weather forecast freshness
  - `CacheConfig.SUN_TTL` — sunrise/sunset data
  - `CacheConfig.TRASH_TTL` — TRV wasteplan search & calendar
  - `CacheConfig.ENERGY_TTL` — electricity prices
  - `CacheConfig.EVENTS_TTL` — TrdEvents data
  - `CacheConfig.BUS_STOPS_TTL` — nearest bus stops (stop/quay metadata)
  - `CacheConfig.BUS_DEPARTURES_TTL` — departures (typically set to `0` — no cache)
  - `CacheConfig.NRK_TTL` — NRK RSS feed
  - `CacheConfig.POLICE_TTL` — Politiet feed
  - `CacheConfig.GEOCODING_TTL` — Nominatim geocoding

- If a particular API call does not pass a `ttl` explicitly it will default to the `fetchJSON` default (which is `0` = no cache).

How the higher-level API uses the cache (APIBase.fetchJSON / fetchGraphQL)
- Function signatures (high level):
  - `fetchJSON(apiName, urlOrConfig, options = {}, timeout = 10000, cacheTTL = 0, useCorsProxy = false)`
  - `fetchGraphQL(apiName, urlOrConfig, queryOrNothing, variables = {}, headers = {}, timeout = 10000, cacheTTL = 0)`
- Implemented behavior (accurate):
  - `cacheTTL === 0`: No cache is used — the request is fetched live and the result is not cached.
  - `cacheTTL === null`: The code will read and return any cached entry regardless of age. The current implementation does NOT automatically revalidate the cache in the background — it simply returns the cached value. If you want "stale-while-revalidate" behavior (return cached immediately, then refresh cache in background) you'll need to implement a small background refresh in `APIBase.fetchJSON`.
  - `cacheTTL` is a positive number: the cache is read and the entry is returned only if it is within the TTL. If no valid (non-expired) entry exists, the network request is performed and the fresh response is cached.

Examples from the codebase (what to look for)
- `js/utils/trash-api.js` — uses `TrashAPI.CACHE_DURATION` (configured via `CacheConfig.TRASH_TTL`)
- `js/utils/energy-api.js` — uses `EnergyAPI.CACHE_DURATION` (configured via `CacheConfig.ENERGY_TTL`)
- `js/utils/events-api.js` — uses `CacheConfig.EVENTS_TTL`
- `js/utils/nrk-rss-api.js` — uses `CacheConfig.NRK_TTL` (short TTL, RSS is parsed client-side)
- `js/utils/bus-api.js` — stop metadata uses `CacheConfig.BUS_STOPS_TTL`; real-time departures use no cache (`ttl === 0`)

Background refresh (optional enhancement)
- The README used to describe automatic background refresh behavior; the current implementation does not perform background revalidation. If you want that UX, a recommended approach is:
  1. When `CacheClient.get({ key, ttl })` returns a value but `CacheClient.isStale({ key, ttl })` is true, return the cached value immediately.
  2. Start a non-blocking `fetchJSONDirect(...)` for that key and `CacheClient.set({ key, data })` when it resolves (optionally emit an event so the UI can refresh).
- I can implement this `stale-while-revalidate` behavior in `js/utils/api-base.js` if you'd like.

CORS proxy behavior
- The optional CORS proxy is applied by `APIBase.fetchJSON` when `useCorsProxy` is truthy: the URL is prefixed with `https://corsproxy.io/?` and the original URL is encoded as a parameter.
- The proxy is used in code where cross-origin restrictions or missing CORS headers are likely (for example, MET Norway and Politiet calls in this repo set `useCorsProxy = true`).
- Notes and trade-offs:
  - Proxies add an extra network hop and may add rate limits or latency. They may also alter response caching semantics.
  - If you control a backend for the project, the recommended production approach is to proxy requests server-side (so you can add caching, API keys, and logging) instead of relying on a public CORS proxy.

Development
- No build step required: the app uses ES modules and runs in modern browsers. Serve with a static server (see Quick start).
- Cache & debugging:
  - Clear or inspect cache during development: open your browser DevTools → Application → Local Storage and remove keys prefixed with `trondheim-cache-`.
  - Programmatic inspection: use `CacheClient.getAge(url)` and `CacheClient.isStale(url, ttl)` in the console as needed.
  - To change TTLs, edit `js/utils/cache-config.js` and reload the page.
- Testing & linting:
  - There are no automated tests included. For quick checks, run the app locally and open DevTools to inspect console and network requests.
  - Suggested next steps: add unit tests for pure utilities (`js/utils/`) with a lightweight runner (Vitest) and add an end-to-end smoke test (Playwright) that verifies widgets render and handle cached/mocked responses.
- Disabling the public CORS proxy: edit `js/utils/api-base.js` or pass `useCorsProxy = false` from the calling API util to avoid `https://corsproxy.io/?`.

Security and privacy
- This project runs entirely client-side. No data is sent to the project owner (except to the third-party APIs the app contacts).
- Be mindful of exposing API keys in client-side code. This project does not include any private API keys by default.

Contributing
- Improvements and bug fixes are welcome. Please open a GitHub issue or a pull request.
- When contributing code, prefer small, focused PRs and include a short description and screenshots if the change affects the UI.

License
- The project is provided for personal and educational use. If you plan to reuse code commercially, please confirm license terms with the author.

Credits
- Bus data: Entur
- Weather: MET Norway / YR
- Trash schedules: TRV (Trondheim Renholdsverk)
- Electricity prices: hvakosterstrommen.no
- Geocoding: OpenStreetMap Nominatim
- Animated backgrounds: bubbly-bg by @tipsy

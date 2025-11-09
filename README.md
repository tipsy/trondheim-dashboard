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

How caching works (CacheClient)
- Storage: All cached entries are stored in `localStorage` using keys prefixed with `trondheim-cache-`.
- Keying: Cache keys are derived from the request URL using a simple 32-bit hash converted to base36 (see `CacheClient.getCacheKey(url)`).
- Payload: Each entry stores `{ timestamp, url, data }` so the app can report age and size.
- API: `CacheClient.get(url, ttl)`, `set(url, data)`, `getAge(url)`, and `isStale(url, ttl)`.
- TTL behavior:
  - If `ttl` is a number (milliseconds), `CacheClient.get(url, ttl)` returns cached data only if age <= ttl.
  - If `ttl` is falsy (for example `0` or omitted), caching is disabled and the request is fetched live (no background refresh behavior).
  - The codebase now uses object-style calls for clarity: `CacheClient.get({ key, ttl })` and `CacheClient.set({ key, data })`.

- Examples from the codebase:
  - `js/utils/trash-api.js` — `cacheTTL = 24h` for search and calendar (`TrashAPI.CACHE_DURATION`)
  - `js/utils/energy-api.js` — `cacheTTL = 1h` for electricity prices (`EnergyAPI.CACHE_DURATION`)
  - `js/utils/events-api.js` — `cacheTTL = 24h` for events
  - `js/utils/nrk-rss-api.js` — uses a short TTL (5 minutes) and no background refresh
  - `js/utils/bus-api.js` — real-time departures use `cacheTTL = 0` (no cache)

How the higher-level API uses the cache (APIBase.fetchJSON / fetchGraphQL)
- Function signature highlights:
  - `fetchJSON(apiName, url, options = {}, timeout = 10000, cacheTTL = 0, useCorsProxy = false)`
  - `fetchGraphQL(apiName, url, query, variables = {}, headers = {}, timeout = 10000, cacheTTL = 0)`
- Behavior summary:
  - cacheTTL === 0 (default): No cache used. `fetchJSON` calls `fetchJSONDirect` and returns the live response immediately.
  - cacheTTL === null: Treat the resource as dynamic — return cached value immediately if present, but always start a background refresh to update the cache when the fresh response arrives.
  - cacheTTL is a number: Use it as TTL (ms). If cached data exists and is not stale, return it immediately. If stale, return the cached value and trigger a background refresh; if no cached data, wait for the network response, cache it and return it.
- Examples from the codebase:
  - `js/utils/trash-api.js` — `cacheTTL = 24h` for search and calendar (`TrashAPI.CACHE_DURATION`)
  - `js/utils/energy-api.js` — `cacheTTL = 1h` for electricity prices (`EnergyAPI.CACHE_DURATION`)
  - `js/utils/events-api.js` — `cacheTTL = 24h` for events
  - `js/utils/nrk-rss-api.js` — uses a short TTL (5 minutes) and no background refresh
  - `js/utils/bus-api.js` — real-time departures use `cacheTTL = 0` (no cache)

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

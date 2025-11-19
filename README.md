# Trondheim Dashboard

A modern, client-side web dashboard built with vanilla Web Components and Lit for Trondheim residents. It aggregates real-time local information including bus departures, weather forecasts, trash collection schedules, electricity prices, police logs, news, and events — all in a customizable, themeable interface.

**Live demo:** https://trondheim-dashboard.com

This repository is intentionally lightweight — just static HTML, CSS and JavaScript with no build process required — so it can be served from any static host.

## ✨ Features

- **📍 Location-based widgets** - Enter any address in Trondheim/Trøndelag to get personalized information
- **🚌 Real-time bus departures** - Live ATB/Entur data with nearest stops and platform selection
- **🌤️ Weather forecasts** - Current conditions, hourly forecast, and 5-day outlook from MET Norway
- **⚡ Electricity prices** - Current and upcoming hourly prices by Norwegian price area
- **🗑️ Trash collection** - Personalized waste pickup schedule from TRV
- **👮 Police log** - Latest incidents from Politiet (Trøndelag district)
- **📰 News** - Top stories from NRK Trøndelag
- **🎭 Events** - Upcoming events in Trondheim with date filtering
- **🎨 7 themes** - Midnight Blue, Peach Pink, Solarized, Monokai, Cat, Dark, and Light
- **🔗 URL state** - Shareable links with address and theme parameters
- **♻️ Auto-refresh** - Dashboard reloads every 5 minutes to get latest data and app updates
- **📱 Responsive** - Optimized layouts for desktop (grid with scrollable widgets) and mobile/tablet (stacked)

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-user/trondheim-dashboard.git
   cd trondheim-dashboard
   ```

2. **Serve with any static server:**
   ```bash
   # Python 3 built-in server
   python -m http.server 8000

   # Node (http-server)
   npx http-server

   # Or simply open index.html in a browser
   ```

3. **Open in browser:** Navigate to `http://localhost:8000`

No build process, no dependencies to install — just serve and go!

## 📁 Project Structure

```
trondheim-dashboard/
├── index.html              # Main entry point
├── manifest.json           # PWA manifest
├── robots.txt              # Search engine crawler rules
├── sitemap.xml             # XML sitemap for SEO
├── CNAME                   # GitHub Pages custom domain
├── README.md               # This file
├── SEO_GUIDE.md            # SEO documentation and guidelines
├── img/
│   ├── trondheimsrosa.svg  # Dashboard favicon (Trondheim rose)
│   └── example-background.jpg
├── og/
│   └── screenshot.png      # Open Graph / social media preview image
├── styles/
│   ├── main.css            # Global styles and layout
│   └── themes/             # 7 theme CSS files
│       ├── midnight-blue.css
│       ├── peach.css
│       ├── solarized.css
│       ├── monokai.css
│       ├── cat.css
│       ├── dark.css
│       └── light.css
├── img/
│   └── example-background.jpg
└── js/
    ├── components/         # Web Components (Lit-based)
    │   ├── dashboard.js    # Main dashboard orchestrator
    │   ├── address/        # Address input with autocomplete
    │   │   ├── address-input.js
    │   │   └── address-suggestion-item.js
    │   ├── bus/            # Bus departure widget
    │   │   ├── bus-widget.js
    │   │   └── bus-row.js
    │   ├── weather/        # Weather widgets (4 components)
    │   │   ├── weather-right-now.js    # Current + next 4 hours
    │   │   ├── weather-today.js        # 5-day forecast
    │   │   ├── weather-current.js
    │   │   ├── weather-detail.js
    │   │   └── weather-hour.js
    │   ├── energy/         # Electricity price widget
    │   │   └── energy-widget.js
    │   ├── trash/          # Trash collection widget
    │   │   ├── trash-widget.js
    │   │   └── trash-row.js
    │   ├── police/         # Police log widget
    │   │   └── police-widget.js
    │   ├── nrk/            # News widget
    │   │   └── nrk-widget.js
    │   ├── events/         # Events widget
    │   │   └── events-widget.js
    │   ├── config/         # Configuration components
    │   │   └── theme-selector.js
    │   └── common/         # Reusable UI components
    │       ├── base-widget.js          # Base class for all widgets
    │       ├── widget-list.js
    │       ├── widget-row.js
    │       ├── heading-2.js
    │       ├── input-field.js
    │       ├── custom-select.js
    │       ├── loading-spinner.js
    │       ├── error-message.js
    │       └── buttons/
    │           ├── base-button.js
    │           ├── icon-button.js
    │           ├── primary-button.js
    │           └── secondary-button.js
    └── utils/              # API clients and helpers
        ├── api-base.js              # Fetch wrapper with caching
        ├── cache-client.js          # localStorage-based cache
        ├── cache-config.js          # Cache TTL configuration
        ├── icon-library.js          # Weather icon mapping
        ├── date-formatter.js        # Norwegian date formatting
        ├── shared-styles.js         # Lit shared CSS
        ├── event-helpers.js         # Custom event utilities
        └── api/                     # External API clients
            ├── api-base.js          # Base class for all APIs
            ├── bus-api.js           # Entur GraphQL client
            ├── weather-api.js       # MET Norway client
            ├── energy-api.js        # Electricity price client
            ├── trash-api.js         # TRV wasteplan client
            ├── geocoding-api.js     # Nominatim geocoding client
            ├── police-api.js        # Politiet API client
            ├── nrk-rss-api.js      # NRK RSS parser
            └── events-api.js        # TrdEvents GraphQL client
```

## 🏗️ Architecture

### Technology Stack

- **Lit 3** - Lightweight reactive Web Components library (loaded via CDN)
- **Material Design Icons** - Icon font (loaded via CDN)
- **Vanilla CSS** - No preprocessors, CSS variables for theming
- **ES Modules** - Native browser modules, no bundler needed
- **Custom Elements v1** - Web Components standard with Shadow DOM

### Component Architecture

All widgets extend `BaseWidget`, which provides:
- Standard layout (header with title/icon, scrollable content area)
- Loading state management with spinner
- Error state management with error messages
- Placeholder state for widgets awaiting user input
- Scroll detection for header border effects
- Responsive behavior (fixed height on desktop, natural height on mobile)

```javascript
// Typical widget structure
class MyWidget extends BaseWidget {
  constructor() {
    super();
    this.title = "Widget Title";
    this.icon = "mdi-icon-name";
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadData();
  }

  renderContent() {
    // Widget-specific rendering
  }
}
```

### State Management

- **Component-level state** - Each widget manages its own data using Lit's reactive properties
- **URL parameters** - Address and theme persisted in URL for sharing
- **localStorage** - Theme preference and API cache storage
- **Event-driven updates** - Components communicate via custom events:
  - `location-updated` - Fired when address changes
  - `theme-changed` - Fired when theme changes

### Caching Strategy

Smart caching with configurable TTLs (defined in `cache-config.js`):

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Weather | 4 minutes | Slightly below 5-min dashboard refresh |
| Bus stops (metadata) | 6 hours | Stop locations change infrequently |
| Bus departures | 0 (no cache) | Real-time data |
| Energy prices | 1 hour | Updated hourly |
| Trash schedule | 24 hours | Daily granularity |
| News (NRK RSS) | 4 minutes | Fresh news on each dashboard cycle |
| Police log | 4 minutes | Recent incidents |
| Events | 24 hours | Relatively static |
| Geocoding | 1 hour | Respect rate limits |

## 🔌 External Integrations

### 1. Entur Journey Planner (Bus Data)
- **Endpoint:** `https://api.entur.io/journey-planner/v3/graphql`
- **Type:** GraphQL API
- **Purpose:** Real-time bus departures, stop searches, and platform information
- **Headers:** `ET-Client-Name` for API identification
- **Used by:** `bus-api.js` → `bus-widget.js`

### 2. MET Norway Weather API
- **Endpoint:** `https://api.met.no/weatherapi/locationforecast/2.0/complete`
- **Type:** REST API (JSON)
- **Purpose:** Weather forecasts and current conditions
- **Headers:** `User-Agent` required
- **Used by:** `weather-api.js` → `weather-right-now.js`, `weather-today.js`

### 3. Sunrise-Sunset API
- **Endpoint:** `https://api.sunrise-sunset.org/json`
- **Type:** REST API (JSON)
- **Purpose:** Sunrise/sunset times and day length
- **Used by:** `weather-api.js` → `weather-today.js`

### 4. TRV Wasteplan API
- **Endpoints:**
  - Search: `https://trv.no/wp-json/wasteplan/v2/adress`
  - Calendar: `https://trv.no/wp-json/wasteplan/v2/calendar/{id}`
- **Type:** WordPress REST API
- **Purpose:** Trash collection schedules for Trondheim addresses
- **Cache:** 24 hours
- **Used by:** `trash-api.js` → `trash-widget.js`

### 5. HvaKosterStrommen (Electricity Prices)
- **Endpoint:** `https://www.hvakosterstrommen.no/api/v1/prices/{year}/{month}-{day}_{area}.json`
- **Type:** REST API (JSON)
- **Purpose:** Hourly electricity prices by Norwegian price area (NO1-NO5)
- **Cache:** 1 hour
- **Used by:** `energy-api.js` → `energy-widget.js`

### 6. OpenStreetMap Nominatim (Geocoding)
- **Endpoints:**
  - Search: `https://nominatim.openstreetmap.org/search`
  - Reverse: `https://nominatim.openstreetmap.org/reverse`
- **Type:** REST API (JSON)
- **Purpose:** Address autocomplete and geocoding
- **Headers:** Custom `User-Agent`
- **Features:** Filters to Norway, prioritizes Trøndelag, requires house numbers
- **Used by:** `geocoding-api.js` → `address-input.js`

### 7. Politiet API (Police Log)
- **Endpoint:** `https://api.politiet.no/politiloggen/v1/messages`
- **Type:** REST API (JSON)
- **Purpose:** Latest police incidents in Trøndelag
- **Notes:** May require CORS proxy
- **Cache:** 4 minutes
- **Used by:** `police-api.js` → `police-widget.js`

### 8. NRK RSS Feed (News)
- **Endpoint:** `https://www.nrk.no/trondelag/siste.rss`
- **Type:** RSS/XML
- **Purpose:** Top 10 news stories from NRK Trøndelag
- **Parsing:** XML parsed in-browser to JSON
- **Cache:** 4 minutes
- **Used by:** `nrk-rss-api.js` → `nrk-widget.js`

### 9. TrdEvents GraphQL (Events)
- **Endpoint:** `https://trdevents-224613.web.app/graphQL`
- **Type:** GraphQL API
- **Purpose:** Upcoming events in Trondheim
- **Cache:** 24 hours
- **Used by:** `events-api.js` → `events-widget.js`

## 🎨 Theming

The dashboard uses CSS variables for theming. Each theme file defines:

```css
[data-theme="theme-name"] {
  /* Core colors */
  --background-color: ...;
  --card-background: ...;
  --text-color: ...;
  --text-light: ...;
  --heading-color: ...;
  
  /* Interactive elements */
  --primary-color: ...;
  --secondary-color: ...;
  --button-text: ...;
  
  /* Borders and dividers */
  --border-color: ...;
  
  /* Optional: background image */
  --background-image: url(...);
  
  /* Typography */
  --font-family: ...;
}
```

**Available themes:**
- `midnight-blue` (default) - Deep blue with cyan accents
- `peach` - Warm peach with salmon highlights
- `solarized` - Classic Solarized color palette
- `monokai` - Developer-friendly dark theme
- `cat` - Playful cat-themed design
- `dark` - Clean dark theme
- `light` - Classic light theme

## 🌐 URL Parameters

Share configured dashboards via URL:

```
https://trondheim-dashboard.com/?address=Nidarosdomen%2C%20Trondheim&theme=midnight-blue
```

**Parameters:**
- `address` - Address string (URL-encoded)
- `theme` - Theme name (lowercase, hyphenated)

## 📱 Responsive Design

### Desktop (≥1025px)
- Fixed viewport height (no page scroll)
- 4-column grid layout
- Widgets have fixed height with internal scrolling
- Scroll indicators on widget headers

### Tablet (768-1024px)
- 2-column grid
- Natural widget heights
- Page scrolls naturally

### Mobile (<768px)
- Single column stack
- Full-width widgets
- Touch-optimized spacing

## 🎛️ Layout Widget

The Layout Widget allows you to customize the dashboard layout in real-time by reorganizing widgets and adjusting column widths.

### Features

- **Drag-and-drop reorganization** - Reorder widgets between columns by dragging
- **Swap widgets** - Drag a widget onto another widget to swap their positions
- **Column width adjustment** - Use sliders to resize columns (percentage-based)
- **Toggle column visibility** - Disable columns to focus on fewer widgets
- **Toggle widget visibility** - Hide individual widgets without removing them
- **Reset layout** - Restore the default dashboard layout
- **Persistent storage** - All layout changes are automatically saved to localStorage

### How to Use

1. **Open the Layout Editor** - Click the "Layout" widget (usually in the top-right)
2. **Drag widgets** - Click and drag any widget handle (⋮⋮ symbol) to reorder
3. **Swap widgets** - Drag a widget onto another widget to exchange their positions
4. **Adjust column width** - Use the slider beneath each column header to resize (Min 15%, Max 100%)
5. **Toggle columns** - Click the eye icon in the column header to hide/show the column
6. **Toggle widgets** - Click the eye icon next to a widget to hide/show it individually
7. **Reset layout** - Click the "Reset" button to restore the default layout
8. **Close editor** - Click "Close" to exit the layout editor

### Layout Data Structure

The layout is stored in localStorage under the key `dashboard-layout` and has this structure:

```javascript
{
  columns: [
    {
      enabled: true,
      width: 25,           // Percentage of container width
      previousWidth: null, // Width before disabling
      widgets: [
        "weather-right-now",
        "weather-today"
      ]
    },
    // ... more columns
  ],
  hiddenWidgets: {
    "bus-widget": true,    // Widget ID -> visibility state
    "events-widget": false
  }
}
```

### Default Layout

The dashboard ships with a 4-column default layout:

| Column 1 | Column 2 | Column 3 | Column 4 |
|----------|----------|----------|----------|
| Weather (Now) | Energy Prices | Bus Departures | Police Log |
| Weather (Today) | News | Trash Collection | Events |

This can be reset at any time using the "Reset" button.

### Technical Details

#### Architecture: Separation of Layout State and DOM

The Layout Widget achieves efficient widget reorganization by **completely separating layout state from Lit rendering**:

1. **Layout Widget (Editor Only)** - `layout-widget.js` manages only the layout configuration UI:
   - Renders drag-drop interface showing widget names and column settings
   - Updates layout state in localStorage
   - Fires `layout-changed` events when layout changes
   - **Does NOT render actual widgets**

2. **Widgets (Already in DOM)** - All 8 widgets are pre-rendered once in `dashboard.js`:
   ```javascript
   <bus-widget id="bus-widget" style="display:none"></bus-widget>
   <events-widget id="events-widget" style="display:none"></events-widget>
   // ... etc - all widgets exist in the DOM with display:none
   ```

3. **Dashboard Orchestrator** - `dashboard.js` handles layout application:
   - Listens for `layout-changed` events
   - Calls `applyLayoutToStyles()` to rearrange widgets
   - Uses native DOM APIs to move widgets between column containers

#### How Widgets Move Without Re-rendering

When you drag a widget in the layout editor, here's what happens:

```
User drags widget
         ↓
Layout widget updates state & fires layout-changed event
         ↓
Dashboard.handleLayoutChanged() → applyLayoutToStyles()
         ↓
DOM manipulation (NOT Lit re-render):
  1. Move widget DOM nodes using appendChild()
  2. Update CSS flex properties on columns
  3. Toggle display: none/'' for visibility
         ↓
Widget remains in place visually, no Lit update, state preserved
```

**Key code from `dashboard.js`:**
```javascript
applyLayoutToStyles() {
  // Move widget DOM nodes (not Lit rendering!)
  col.widgets.slice(0, 2).forEach((widgetId) => {
    const widget = grid.querySelector(`#${widgetId}`);
    // Native DOM API - no Lit involved
    container.appendChild(widget);  // Move to new column
    widget.style.display = '';      // Show/hide
  });
}
```

#### Performance Benefits

- **No re-initialization** - Widgets keep their loaded data, scroll positions, and internal state
- **Fast DOM moves** - `appendChild()` is a fast native operation (just updates DOM pointers)
- **No data refetch** - When a widget moves columns, its cached API data remains valid
- **Instant visual feedback** - Layout changes are visible immediately without widget lifecycle events

#### Constraints

- Each column can hold a maximum of 2 widgets
- Disabled columns cannot receive drops
- Column width minimum is 15%, respecting layout constraints

#### Persistence & Events

- Changes automatically sync to localStorage under key `dashboard-layout`
- Fires `layout-changed` custom event so dashboard can react
- Uses native HTML5 Drag & Drop API with fallback to instance-level `_dragging` state for cross-target reliability

## 🛠️ Development

### Adding a New Widget

1. **Create widget component** in `js/components/your-widget/`
   ```javascript
   import { BaseWidget } from "../common/base-widget.js";
   
   class YourWidget extends BaseWidget {
     constructor() {
       super();
       this.title = "Your Widget";
       this.icon = "mdi-your-icon";
     }
     
     renderContent() {
       return html`<p>Your content</p>`;
     }
   }
   
   customElements.define("your-widget", YourWidget);
   ```

2. **Import in dashboard.js**
   ```javascript
   import "./your-widget/your-widget.js";
   ```

3. **Add to template** in `dashboard.js`
   ```html
   <your-widget id="your-widget"></your-widget>
   ```

4. **Update grid layout** in dashboard.js styles if needed

### Adding a New API Integration

2. **Create API client** in `js/utils/api/your-api.js`
   ```javascript
   import { APIBase } from "./api-base.js";
   
   export class YourAPI {
     static async getData() {
       return APIBase.cachedFetch(
         "https://api.example.com/data",
         { ttl: 60 * 60 * 1000 } // 1 hour
       );
     }
   }
   ```

2. **Use in widget** via async methods
3. **Configure caching** in `cache-config.js`

### Creating a New Theme

1. **Create theme file** in `styles/themes/your-theme.css`
2. **Import in main.css**
   ```css
   @import url('themes/your-theme.css');
   ```
3. **Add to theme selector** in `theme-selector.js`
   ```javascript
   { value: "your-theme", label: "Your Theme" }
   ```

## 🐛 Known Issues & Limitations

- Some APIs may require CORS proxies in certain hosting environments
- Nominatim has usage limits - consider self-hosting for high traffic
- MET Norway API requires User-Agent header
- Dashboard auto-refreshes every 5 minutes (hard reload)

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🔍 SEO & Discoverability

This project includes comprehensive SEO optimizations to improve search engine visibility and social media sharing:

- **Meta Tags**: Optimized title, description, and keywords in Norwegian for local search
- **Open Graph**: Rich previews for Facebook, LinkedIn, and other social platforms
- **Twitter Cards**: Enhanced sharing on Twitter/X with large image cards
- **Structured Data**: Schema.org JSON-LD markup for better search engine understanding
- **Semantic HTML**: Proper HTML5 structure with ARIA labels
- **robots.txt**: Allows all search engine crawlers
- **sitemap.xml**: XML sitemap for search engines
- **PWA Manifest**: Progressive Web App support (manifest.json)
- **Canonical URLs**: Prevents duplicate content issues

For detailed SEO documentation and maintenance guidelines, see [SEO_GUIDE.md](./SEO_GUIDE.md).

## 🤝 Contributing

Contributions welcome! Please feel free to submit pull requests or open issues.

## 🙏 Acknowledgments

- Weather data from [MET Norway](https://api.met.no/)
- Bus data from [Entur](https://entur.org/)
- Icons from [Material Design Icons](https://materialdesignicons.com/)
- Powered by [Lit](https://lit.dev/)
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

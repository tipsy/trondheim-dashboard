# Trondheim Dashboard

A web component-based dashboard for Trondheim city residents, providing real-time information about:
- 🚌 Bus schedules from the closest bus stop (ATB/Entur)
- 🌤️ Weather forecast for your location (YR/MET Norway)
- 🗑️ Trash collection schedule for your address (TRV)
- ⚡ Current electricity prices (hvakosterstrommen.no)

## Features

- **Address Input**: Enter your address or use your current location with Norwegian address formatting
- **Bus Widget**: View real-time bus departures from nearby stops with the ability to select different stops
- **Weather Widget**: See current weather and 24-hour forecast with sunrise/sunset times
- **Trash Widget**: Check upcoming trash collection dates using real TRV API data
- **Energy Widget**: View current electricity prices and daily price trends
- **Theme Selector**: Choose from 7 beautiful themes including animated bubble backgrounds
- **URL State Management**: Share your dashboard with address and theme preserved in URL
- **Fully Responsive**: Works on desktop, tablet, and mobile devices
- **Web Components**: Each widget is an isolated, reusable web component with Shadow DOM

## Project Structure

```
trondheim-dashboard/
├── index.html                          # Main HTML file
├── favicon.svg                         # Dashboard icon
├── img/                                # Images and assets
│   └── trondheim-nidelven.jpg         # Background image for themes
├── styles/
│   ├── main.css                       # Global styles and CSS variables
│   └── themes/                        # Theme definitions
│       ├── light.css                  # Light theme
│       ├── dark.css                   # Dark theme
│       ├── midnight-blue.css          # Midnight Blue theme (default)
│       ├── peach.css                  # Peach Pink theme with bubbly background
│       ├── solarized.css              # Solarized theme
│       ├── monokai.css                # Monokai theme
│       └── cat.css                    # Cat theme
├── js/
│   ├── utils/
│   │   ├── api-base.js                # Base API client
│   │   ├── bus-api.js                 # Entur/ATB bus API
│   │   ├── weather-api.js             # MET Norway weather API
│   │   ├── trash-api.js               # TRV trash collection API
│   │   ├── energy-api.js              # Electricity price API
│   │   ├── geocoding-api.js           # OpenStreetMap geocoding API
│   │   ├── bubbly-themes.js           # Bubbly background configurations
│   │   ├── date-formatter.js          # Date/time formatting utilities
│   │   └── icon-library.js            # SVG icon library
│   └── components/
│       ├── dashboard.js               # Main dashboard component
│       ├── base-widget.js             # Base class for widgets
│       ├── theme-selector.js          # Theme selection component
│       ├── address-input.js           # Address input with autocomplete
│       ├── common/                    # Shared UI components
│       │   ├── loading-spinner.js
│       │   ├── error-message.js
│       │   ├── icon-button.js
│       │   ├── detail-item.js
│       │   ├── custom-select.js
│       │   └── address-suggestion-item.js
│       ├── bus/
│       │   ├── bus-widget.js          # Bus schedule widget
│       │   └── bus-row.js             # Individual bus departure row
│       ├── weather/
│       │   ├── weather-widget.js      # Weather forecast widget
│       │   ├── weather-current.js     # Current weather display
│       │   └── weather-hour.js        # Hourly forecast item
│       ├── energy/
│       │   └── energy-widget.js       # Electricity price widget
│       └── trash/
│           ├── trash-widget.js        # Trash collection widget
│           └── trash-row.js           # Individual trash collection row
└── README.md
```

## Getting Started

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Enter your address or use your current location
4. View real-time information for your location

### Running Locally

You can simply open `index.html` in your browser, or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

## APIs Used

### 1. Entur API (Bus Schedules)
- **Provider**: Entur (Norwegian public transport data)
- **Endpoint**: `https://api.entur.io/journey-planner/v3/graphql`
- **Documentation**: https://developer.entur.org/
- **Features**: Real-time bus departures, stop locations, route information

### 2. MET Norway API (Weather)
- **Provider**: Norwegian Meteorological Institute
- **Endpoint**: `https://api.met.no/weatherapi/locationforecast/2.0/compact`
- **Documentation**: https://api.met.no/
- **Features**: Weather forecasts, hourly predictions, current conditions

### 3. TRV API (Trash Schedule)
- **Provider**: TRV (Trondheim Renholdsverk)
- **Endpoint**: `https://trv.no/wp-json/wasteplan/v2/`
- **Documentation**: https://trv.no
- **Features**: Address search, waste collection calendar, multiple waste types

### 4. Electricity Price API
- **Provider**: hvakosterstrommen.no
- **Endpoint**: `https://www.hvakosterstrommen.no/api/v1/prices/`
- **Documentation**: https://www.hvakosterstrommen.no/strompris-api
- **Features**: Current and historical electricity prices for Norwegian price zones

### 5. Sunrise/Sunset API
- **Provider**: sunrise-sunset.org
- **Endpoint**: `https://api.sunrise-sunset.org/json`
- **Documentation**: https://sunrise-sunset.org/api
- **Features**: Sunrise, sunset, and daylight information

### 6. OpenStreetMap Nominatim API (Geocoding)
- **Provider**: OpenStreetMap
- **Endpoint**: `https://nominatim.openstreetmap.org/`
- **Documentation**: https://nominatim.org/
- **Features**: Address search, reverse geocoding, location data

## Web Components

Each component is self-contained with its own HTML, CSS, and JavaScript using Shadow DOM:

### Main Components

#### `<trondheim-dashboard>`
Main container component that orchestrates all widgets, handles location updates, and manages URL state.

#### `<theme-selector>`
Theme selection dropdown with 7 themes including animated bubble backgrounds. Persists selection to localStorage.

#### `<address-input>`
Address input with autocomplete using OpenStreetMap Nominatim API. Supports geolocation and displays addresses in Norwegian format (e.g., "Persaunvegen 1C, 7045 Trondheim").

### Widget Components

#### `<bus-widget>`
Displays real-time bus departures from nearby stops. Features:
- Auto-refreshes every 30 seconds
- Stop selection dropdown
- Real-time indicators
- Departure countdown

#### `<weather-widget>`
Shows current weather and 24-hour forecast. Features:
- Current temperature and conditions
- Sunrise/sunset times
- 24-hour forecast grid (3 columns mobile, 6 tablet, 8 desktop)
- Weather icons and precipitation

#### `<trash-widget>`
Displays upcoming trash collection dates using real TRV API data. Features:
- Multiple waste types (general, paper, plastic, food, glass, metal)
- Color-coded by waste type
- Shows next 5 upcoming collections

#### `<energy-widget>`
Shows current electricity prices and daily trends. Features:
- Current price with status indicator (cheap/normal/expensive)
- Daily price chart
- Min/max/average prices
- Price zone selection (NO1-NO5)

## Browser Support

This dashboard uses modern web standards:
- Custom Elements (Web Components)
- Shadow DOM
- ES6+ JavaScript
- CSS Grid and Flexbox
- Fetch API

Supported browsers:
- Chrome/Edge 67+
- Firefox 63+
- Safari 10.1+
- Opera 54+

## Themes

The dashboard includes 7 beautiful themes:

1. **Midnight Blue** (default) - Deep blue with excellent contrast
2. **Light** - Clean light theme with Trondheim background image
3. **Dark** - Dark theme with high contrast
4. **Peach Pink** - Soft peach theme with animated bubble background 🫧
5. **Solarized** - Popular Solarized color scheme
6. **Monokai** - Developer-favorite Monokai colors
7. **Cat** 🐱 - Playful orange tabby theme with Quicksand font

### Animated Bubble Backgrounds

The Peach theme features an animated bubble background using [bubbly-bg](https://github.com/tipsy/bubbly-bg). The bubbles are rendered on a canvas element behind all content, creating a beautiful animated effect.

To add bubbly backgrounds to other themes, edit `js/utils/bubbly-themes.js`:

```javascript
static configs = {
    peach: {
        background: (ctx) => {
            const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
            gradient.addColorStop(0, "#fff4e6");
            gradient.addColorStop(1, "#ffe9e4");
            return gradient;
        },
        compose: "source-over",
        bubbles: {
            fill: () => `hsla(${Math.random() * 50}, 100%, 50%, .3)`,
            shadow: () => ({blur: 1, color: "#fff"}),
        },
    }
    // Add more themes here
};
```

## Customization

### Creating Custom Themes

1. Create a new CSS file in `styles/themes/` (e.g., `my-theme.css`)
2. Define your theme using CSS custom properties:

```css
:root[data-theme="my-theme"] {
    --primary-color: #0066cc;
    --secondary-color: #004d99;
    --background-color: #f5f5f5;
    --card-background: #ffffff;
    --text-color: #333333;
    /* ... more variables */
}
```

3. Import the theme in `styles/main.css`:
```css
@import url('themes/my-theme.css');
```

4. Add the theme to the selector in `js/components/theme-selector.js`:
```javascript
{ value: 'my-theme', label: 'My Theme' }
```

### Adding New Widgets

1. Create a new component file in `js/components/` extending `BaseWidget`
2. Define your custom element class
3. Register it with `customElements.define()`
4. Add it to the dashboard grid in `dashboard.js`
5. Include the script in `index.html`

Example:
```javascript
class MyWidget extends BaseWidget {
    getTitle() { return 'My Widget'; }
    getIcon() { return IconLibrary.getIcon('sun'); }
    getPlaceholderText() { return 'Enter address...'; }

    async updateLocation(lat, lon) {
        // Your widget logic here
    }
}
customElements.define('my-widget', MyWidget);
```

## Known Limitations

1. **CORS**: Some APIs may have CORS restrictions. If running into issues, consider using a proxy or running through a local server.

2. **Rate Limiting**: The MET Norway API has rate limits. The dashboard implements caching and reasonable refresh intervals.

3. **Address Search**:
   - The trash widget requires an exact address match in the TRV database
   - Address search is limited to Trøndelag region
   - Only shows actual addresses with street numbers

4. **Geolocation**: Browser geolocation may not be accurate enough for trash collection lookup. Manual address entry is recommended.

## Features Implemented

- [x] Real-time bus departures with stop selection
- [x] 24-hour weather forecast with sunrise/sunset
- [x] Trash collection schedule
- [x] Electricity price tracking
- [x] URL state management (shareable links)
- [x] Norwegian address formatting
- [x] Responsive design (mobile, tablet, desktop)
- [x] Auto-refresh for real-time data
- [x] LocalStorage for preferences
- [x] Shadow DOM isolation
- [x] Accessible UI components

## Future Enhancements

- [ ] Add caching for API responses
- [ ] Implement service worker for offline support
- [ ] Add more widgets (parking, events, news, air quality)
- [ ] Multiple address support
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] PWA support (installable app)
- [ ] Export/import settings

## License

This project is open source and available for personal and educational use.

## Credits

- Bus data: [Entur](https://entur.no)
- Weather data: [YR/MET Norway](https://yr.no)
- Trash information: [TRV](https://trv.no)
- Electricity prices: [hvakosterstrommen.no](https://www.hvakosterstrommen.no)
- Sunrise/sunset data: [sunrise-sunset.org](https://sunrise-sunset.org)
- Geocoding: [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org)
- Animated backgrounds: [bubbly-bg](https://github.com/tipsy/bubbly-bg) by [@tipsy](https://github.com/tipsy)
- Background image: Trondheim Nidelven


# Trondheim Dashboard

A web component-based dashboard for Trondheim city residents, providing real-time information about:
- 🚌 Bus schedules from the closest bus stop (ATB/Entur)
- 🌤️ Weather forecast for your location (YR/MET Norway)
- 🗑️ Trash collection schedule for your address (TRV)

## Features

- **Address Input**: Enter your address or use your current location
- **Bus Widget**: View real-time bus departures from nearby stops with the ability to select different stops
- **Weather Widget**: See current weather and hourly forecast for your location
- **Trash Widget**: Check upcoming trash collection dates using real TRV API data
- **Full-Screen Layout**: Dashboard fills entire screen with 33% width for each widget
- **Fully Responsive**: Works on desktop, tablet, and mobile devices
- **Web Components**: Each widget is an isolated, reusable web component

## Project Structure

```
trondheim-dashboard/
├── index.html                 # Main HTML file
├── styles/
│   └── main.css              # Global styles and CSS variables
├── js/
│   ├── utils/
│   │   └── api-client.js     # API integration utilities
│   └── components/
│       ├── dashboard.js      # Main dashboard component
│       ├── address-input.js  # Address input component
│       ├── bus-widget.js     # Bus schedule widget
│       ├── weather-widget.js # Weather forecast widget
│       └── trash-widget.js   # Trash schedule widget
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

## Web Components

Each component is self-contained with its own HTML, CSS, and JavaScript:

### `<trondheim-dashboard>`
Main container component that orchestrates all widgets and handles location updates.

### `<address-input>`
Handles address input and geolocation. Emits `location-updated` events.

### `<bus-widget>`
Displays real-time bus departures. Auto-refreshes every 30 seconds.

### `<weather-widget>`
Shows current weather and hourly forecast for the next 12 hours.

### `<trash-widget>`
Displays upcoming trash collection dates using real TRV API data.

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

## Customization

### Styling
All styles use CSS custom properties (variables) defined in `styles/main.css`. You can easily customize colors, spacing, and other design tokens:

```css
:root {
    --primary-color: #0066cc;
    --secondary-color: #004d99;
    --background-color: #f5f5f5;
    /* ... more variables */
}
```

### Adding New Widgets
1. Create a new component file in `js/components/`
2. Define your custom element class
3. Register it with `customElements.define()`
4. Add it to the dashboard grid in `dashboard.js`
5. Include the script in `index.html`

## Known Limitations

1. **CORS**: Some APIs may have CORS restrictions. If running into issues, consider using a proxy or running through a local server.

2. **Rate Limiting**: The MET Norway API has rate limits. Avoid excessive requests.

3. **Address Search**: The trash widget requires an exact address match in the TRV database. If your address is not found, try variations or check https://trv.no directly.

## Future Enhancements

- [ ] Add caching for API responses
- [ ] Implement service worker for offline support
- [ ] Add more widgets (parking, events, news)
- [ ] User preferences and saved locations
- [ ] Dark mode support
- [ ] Accessibility improvements
- [ ] Multiple address support

## License

This project is open source and available for personal and educational use.

## Credits

- Bus data: [Entur](https://entur.no)
- Weather data: [YR/MET Norway](https://yr.no)
- Trash information: [TRV](https://trv.no)


// Initialize locale before loading any components
import { initLocale } from "./utils/localization.js";

// Load locale first, then load all components
await initLocale();
console.log("[Init] Locale loaded, now loading components...");

// Import all components dynamically after locale is initialized
// This ensures translations are loaded before any component renders
await Promise.all([
  import("./components/address/address-input.js"),
  import("./components/config/theme-selector.js"),
  import("./components/config/language-selector.js"),
  import("./components/config/config-collapsed-bar.js"),
  import("./components/bus/bus-widget.js"),
  import("./components/events/events-widget.js"),
  import("./components/weather/weather-right-now.js"),
  import("./components/weather/weather-today.js"),
  import("./components/energy/energy-widget.js"),
  import("./components/trash/trash-widget.js"),
  import("./components/police/police-widget.js"),
  import("./components/nrk/nrk-widget.js"),
  import("./components/layout/layout-widget.js"),
]);

console.log("[Init] All components loaded, now loading dashboard...");

// Now import the dashboard component
import "./components/dashboard.js";

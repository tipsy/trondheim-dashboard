// Centralized localStorage helpers for Trondheim Dashboard
// Provides typed helpers for common values (theme, location, bus stop)

export const THEME_KEY = "trondheim-dashboard-theme";
export const LOCATION_KEY = "trondheim-dashboard-location";
export const BUS_STOP_KEY = "trondheim-dashboard-bus-stop";
export const CACHE_KEY_PREFIX = "trondheim-cache-";
export const LAYOUT_KEY = "trondheim-dashboard-layout";
export const LOCALE_KEY = "trondheim-dashboard-locale";

function runCatching(fn, fallback = null) {
  try {
    return fn();
  } catch (error) {
    return fallback;
  }
}

class StorageClient {
  _set = (key, value) =>
    runCatching(() => {
      if (typeof value === "string") {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });

  _get = (key) => {
    const raw = runCatching(() => localStorage.getItem(key), null);
    if (raw === null) return null;
    const parsed = runCatching(() => JSON.parse(raw), null);
    return parsed ?? raw;
  };

  _remove = (key) => runCatching(() => localStorage.removeItem(key));

  saveTheme = (theme) => this._set(THEME_KEY, theme);
  loadTheme = (defaultValue = "retro") =>
    this._get(THEME_KEY) ?? defaultValue;

  saveLocation = (location) => this._set(LOCATION_KEY, location);
  loadLocation = () => this._get(LOCATION_KEY);
  clearLocation = () => this._remove(LOCATION_KEY);

  saveBusStop = (address, id) => this._set(`${BUS_STOP_KEY}:${address}`, id);
  loadBusStop = (address) => this._get(`${BUS_STOP_KEY}:${address}`);

  saveResponse = (key, data) => this._set(key, { timestamp: Date.now(), data });
  loadResponse = (key) => this._get(key);

  // Layout persistence helpers
  saveLayout = (layout) => this._set(LAYOUT_KEY, layout);
  loadLayout = () => this._get(LAYOUT_KEY);

  // Locale persistence helpers
  saveLocale = (locale) => this._set(LOCALE_KEY, locale);
  loadLocale = (defaultValue = "en") => this._get(LOCALE_KEY) ?? defaultValue;

  // Config collapsed state persistence
  saveConfigCollapsed = (collapsed) => this._set("trondheim-config-collapsed", collapsed);
  loadConfigCollapsed = () => this._get("trondheim-config-collapsed") ?? false;
}

const storage = new StorageClient();

export default storage;

// Centralized localStorage helpers for Trondheim Dashboard
// Provides typed helpers for common values (theme, location, bus stop)

export const THEME_KEY = 'trondheim-dashboard-theme';
export const LOCATION_KEY = 'trondheim-dashboard-location';
export const BUS_STOP_KEY = 'trondheim-dashboard-bus-stop';
export const CACHE_KEY_PREFIX = 'trondheim-cache-';

function runCatching(fn, fallback = null) {
  try {
    return fn();
  } catch (error) {
    return fallback;
  }
}

class StorageClient {

  _set = (key, value) => runCatching(() => {
    if (typeof value === 'string') {
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

  saveTheme = (theme) => this._set(THEME_KEY, theme);
  loadTheme = (defaultValue = 'midnight-blue') => this._get(THEME_KEY) ?? defaultValue;

  saveLocation = (location) => this._set(LOCATION_KEY, location);
  loadLocation = () => this._get(LOCATION_KEY);

  saveBusStop = (id) => this._set(BUS_STOP_KEY, id);
  loadBusStop = () => this._get(BUS_STOP_KEY);

  saveResponse = (key, data) => this._set(key, { timestamp: Date.now(), data });
  loadResponse = (key) => this._get(key);
}

const storage = new StorageClient();

export default storage;

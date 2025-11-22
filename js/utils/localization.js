// Simple JSON-based localization for Trondheim Dashboard

import storage from "./storage.js";

// Supported locales
export const sourceLocale = "en";
export const targetLocales = ["no"];
export const allLocales = [sourceLocale, ...targetLocales];

let currentLocale = sourceLocale;
let translations = {};

let enabledLogging = false;

function conditionalLog(...args) {
  if (enabledLogging) {
    console.log(...args);
  }
}

// Load translations for a given locale
async function loadTranslations(locale) {
  try {
    conditionalLog(`[Localization] Fetching /locales/${locale}.json...`);
    const response = await fetch(`/locales/${locale}.json`);
    conditionalLog(
      `[Localization] Fetch response:`,
      response.status,
      response.ok,
    );
    if (!response.ok) {
      console.warn(`Could not load translations for locale: ${locale}`);
      return {};
    }
    const data = await response.json();
    conditionalLog(`[Localization] Loaded translations:`, data);
    return data;
  } catch (error) {
    console.error(`Error loading translations for ${locale}:`, error);
    return {};
  }
}

// Get current locale
export function getLocale() {
  return currentLocale;
}

// Initialize locale from storage or default
export async function initLocale() {
  const savedLocale = storage.loadLocale(sourceLocale);
  conditionalLog("[Localization] Saved locale:", savedLocale);
  if (savedLocale && allLocales.includes(savedLocale)) {
    // Load translations FIRST, then set currentLocale
    // This prevents race condition where components render with locale="no" but empty translations
    const loadedTranslations = await loadTranslations(savedLocale);
    translations = loadedTranslations;
    currentLocale = savedLocale; // Only set after translations are loaded
    conditionalLog(
      "[Localization] Loaded",
      Object.keys(translations).length,
      "translations for",
      currentLocale,
    );
    conditionalLog("[Localization] Sample translations:", {
      "Police Log": translations["Police Log"],
      News: translations["News"],
      Language: translations["Language"],
    });
  } else {
    conditionalLog("[Localization] Using default locale (en)");
  }
}

// Change locale and save to storage
export async function changeLocale(newLocale) {
  conditionalLog("[Localization] changeLocale called with:", newLocale);
  if (!allLocales.includes(newLocale)) {
    console.warn(`Unsupported locale: ${newLocale}`);
    return;
  }
  conditionalLog("[Localization] Saving locale to storage...");
  storage.saveLocale(newLocale);
  conditionalLog("[Localization] Locale saved:", newLocale);
}

// Translate function - returns key if translation not found
export function t(key) {
  conditionalLog(
    `[t] key="${key}", locale="${currentLocale}", has translation=${!!translations[key]}`,
  );
  // If we're using English or translation not found, return the key
  if (currentLocale === sourceLocale || !translations[key]) {
    return key;
  }
  return translations[key];
}

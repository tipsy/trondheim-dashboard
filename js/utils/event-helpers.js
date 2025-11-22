// Event helpers for Lit components
// Provides utilities for dispatching events with correct shadow DOM settings

/**
 * Dispatch a custom event that works with shadow DOM
 * Automatically sets bubbles: true and composed: true
 *
 * @param {HTMLElement} element - The element to dispatch from
 * @param {string} eventName - Name of the event
 * @param {*} detail - Event detail data
 * @param {Object} options - Additional event options
 */
export function dispatchEvent(element, eventName, detail = null, options = {}) {
  element.dispatchEvent(
    new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail,
      ...options,
    }),
  );
}

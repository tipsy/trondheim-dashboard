// Trash Widget - displays trash collection schedule

import { BaseWidget } from "../common/base-widget.js";
import { html, css } from "lit";
import { t } from "../../utils/localization.js";
import { TrashAPI } from "../../utils/api/trash-api.js";
import "./trash-row.js";
import "../common/widget-list.js";

class TrashWidget extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    collections: { type: Array, state: true },
    address: { type: String, state: true },
  };

  constructor() {
    super();
    this.title = "Trash Schedule";
    this.icon = "mdi-trash-can-outline";
    this.collapsible = true;
    this.collections = [];
    this.address = null;
    this.addressId = null;
  }

  static styles = [...BaseWidget.styles];

  async updateAddress(address) {
    if (!address) {
      return;
    }

    // Check if this is the same address we already loaded
    if (this.address === address && this.addressId) {
      return;
    }

    this.address = address;
    await this.loadTrashSchedule();
  }

  normalizeAddress(address) {
    // Extract street address part (before the comma)
    // e.g., "Nedre Kristianstens gate 18B, 7014 Trondheim" -> "Nedre Kristianstens gate 18B"
    const streetAddress = address.split(",")[0].trim();

    // Find the last part containing a number (house number)
    const parts = streetAddress.split(" ");
    const numberIndex = parts.findLastIndex((part) => /\d/.test(part));

    if (numberIndex === -1) {
      return streetAddress.toUpperCase();
    }

    // Split into street name and house number
    const streetName = parts.slice(0, numberIndex).join(" ");
    let houseNumber = parts[numberIndex];

    // Add space before letter if needed (18B -> 18 B)
    houseNumber = houseNumber.replace(/(\d+)([A-Z])/i, "$1 $2");

    return `${streetName} ${houseNumber}`.toUpperCase();
  }

  async loadTrashSchedule() {
    if (!this.address) return;

    const result = await this.fetchData(async () => {
      const normalizedAddress = this.normalizeAddress(this.address);

      // Try to search with the normalized address
      let searchResults = await TrashAPI.searchTrashAddress(normalizedAddress);

      // If no results, try without the space before the letter
      if (!searchResults || searchResults.length === 0) {
        const addressWithoutSpace = normalizedAddress.replace(
          /(\d+)\s+([A-Z])$/,
          "$1$2",
        );
        searchResults = await TrashAPI.searchTrashAddress(addressWithoutSpace);
      }

      // If still no results, try with lowercase letter
      if (!searchResults || searchResults.length === 0) {
        const addressLowerLetter = normalizedAddress.replace(
          /(\d+)\s+([A-Z])$/,
          (match, num, letter) => {
            return `${num} ${letter.toLowerCase()}`;
          },
        );
        searchResults = await TrashAPI.searchTrashAddress(addressLowerLetter);
      }

      if (!searchResults || searchResults.length === 0) {
        throw new Error(
          t(
            'Address not found in trash collection database. Try entering just the street name and number (e.g., "Persaunvegen 1C")',
          ),
        );
      }

      // Use the first result
      const addressData = searchResults[0];
      this.addressId = addressData.id;

      // Now get the actual schedule
      return await TrashAPI.getTrashSchedule(this.addressId);
    }, t("Could not load trash schedule. Please try again."));

    if (result) {
      this.processSchedule(result);
    }
  }

  processSchedule(schedule) {
    if (!schedule?.calendar) {
      this.showError(t("No schedule data available"));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse, filter future dates, sort, and take top 10
    this.collections = schedule.calendar
      .map((item) => ({
        date: new Date(item.dato),
        type: item.fraksjon,
        trashClass: this.getTrashClass(item.fraksjon),
      }))
      .filter((item) => item.date >= today)
      .sort((a, b) => a.date - b.date)
      .slice(0, 10);
  }

  getTrashClass(type) {
    const typeLower = type.toLowerCase();

    const classMap = [
      { patterns: ["rest", "general"], class: "general" },
      { patterns: ["papp", "papir", "paper"], class: "paper" },
      { patterns: ["plast", "plastic", "emballasje"], class: "plastic" },
      { patterns: ["mat", "food", "bio"], class: "food" },
      { patterns: ["glass"], class: "glass" },
      { patterns: ["metal"], class: "metal" },
    ];

    for (const { patterns, class: className } of classMap) {
      if (patterns.some((pattern) => typeLower.includes(pattern))) {
        return className;
      }
    }

    return "other";
  }

  renderContent() {
    if (!this.collections?.length) {
      return html`<p class="no-data">${t("No upcoming collections found")}</p>`;
    }

    return html`
      <widget-list>
        ${this.collections.map(
          (item) => html`
            <trash-row
              trash-type="${item.type}"
              collection-date="${item.date.toISOString()}"
              trash-class="${item.trashClass}"
            >
            </trash-row>
          `,
        )}
      </widget-list>
    `;
  }

  getPlaceholderText() {
    return t("Enter address to see trash collection schedule");
  }
}

customElements.define("trash-widget", TrashWidget);

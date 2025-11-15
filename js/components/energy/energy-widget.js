// Energy Widget - displays electricity prices

import { BaseWidget } from "../common/base-widget.js";
import { html, css } from "lit";
import { EnergyAPI } from "../../utils/energy-api.js";

class EnergyWidget extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    currentPrice: { type: Object, state: true },
    nextHours: { type: Array, state: true },
    priceArea: { type: String, state: true },
  };

  constructor() {
    super();
    this.title = "Electricity";
    this.icon = "mdi-lightning-bolt-outline";
    this.currentPrice = null;
    this.nextHours = [];
    this.priceArea = "NO3"; // Default to Trondheim area
    this.location = null;
  }

  static styles = [
    ...BaseWidget.styles,
    css`
      .current-price {
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-sm) 0;
      }

      .current-price-value {
        font-size: 34px;
        font-weight: bold;
        color: var(--text-color);
        line-height: 1;
      }

      .next-hours-chips {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: 24px;
        overflow: hidden;
      }

      .chip {
        background-color: var(--alt-background);
        padding: 8px 12px;
        border-radius: calc(var(--border-radius) * 1.2);
        font-size: var(--font-size-sm);
        color: var(--text-color);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 6px;
        align-items: center;
        justify-content: center;
        flex: 1 1 0;
      }

      .chip .price-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .chip .price {
        font-weight: 700;
        font-size: 14px;
      }

      .chip .time {
        font-size: 12px;
        color: var(--text-light);
      }

      .trend.up {
        color: var(--error-color, #e74c3c);
      }
      .trend.down {
        color: var(--success-color, #2ecc71);
      }
      .trend.flat {
        color: var(--text-light);
      }
    `,
  ];

  async updateLocation(lat, lon) {
    this.location = { lat, lon };
    this.priceArea = EnergyAPI.getPriceAreaFromLocation(lat, lon);
    await this.loadEnergyPrices();
  }

  async loadEnergyPrices() {
    this.showLoading(true);

    try {
      const prices = await EnergyAPI.getEnergyPrices(this.priceArea);
      await this.processPrices(prices);
    } catch (error) {
      this.showError("Could not load energy prices");
    } finally {
      this.showLoading(false);
    }
  }

  async processPrices(prices) {
    if (!prices || prices.length === 0) {
      this.currentPrice = null;
      this.nextHours = [];
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();

    // Find current price
    this.currentPrice = prices.find((p) => {
      const start = new Date(p.time_start);
      return now >= start && now < new Date(p.time_end);
    });

    // Get remaining hours for today
    let remainingPrices = prices.filter((p) => {
      const start = new Date(p.time_start);
      return start.getHours() >= currentHour;
    });

    // If we don't have enough remaining hours, try to fetch next day's prices
    if (remainingPrices.length < 4) {
      try {
        const nextDayPrices = await this.fetchNextDayPrices();
        if (nextDayPrices) {
          remainingPrices = remainingPrices.concat(nextDayPrices);
        }
      } catch (e) {
        console.warn("Failed to fetch next day energy prices", e);
      }
    }

    // Process next 4 hours
    this.nextHours = this.calculateNextHours(remainingPrices.slice(0, 4));
  }

  async fetchNextDayPrices() {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, "0");
    const d = String(nextDate.getDate()).padStart(2, "0");

    return await EnergyAPI.getEnergyPrices(this.priceArea, `${y}-${m}-${d}`);
  }

  calculateNextHours(nextFourRaw) {
    return nextFourRaw.map((p, idx) => {
      const start = new Date(p.time_start);
      const hh = String(start.getHours()).padStart(2, "0");
      const mm = String(start.getMinutes()).padStart(2, "0");
      const valueNum = Math.round(p.NOK_per_kWh * 100);

      // Determine previous value for comparison
      let prevVal = null;
      if (idx === 0) {
        if (this.currentPrice)
          prevVal = Math.round(this.currentPrice.NOK_per_kWh * 100);
      } else {
        prevVal = Math.round(nextFourRaw[idx - 1].NOK_per_kWh * 100);
      }

      let trend = "none";
      if (prevVal !== null && !isNaN(prevVal)) {
        if (valueNum > prevVal) trend = "up";
        else if (valueNum < prevVal) trend = "down";
        else trend = "flat";
      }

      return {
        label: `${hh}:${mm}`,
        valueStr: valueNum + " øre",
        trend,
      };
    });
  }

  renderContent() {
    if (
      !this.currentPrice &&
      (!this.nextHours || this.nextHours.length === 0)
    ) {
      return html`<p class="no-data">No energy price data available</p>`;
    }

    return html`
      ${this.currentPrice
        ? html`
            <div class="current-price">
              <div class="current-price-value">
                ${Math.round(this.currentPrice.NOK_per_kWh * 100)} øre
              </div>
            </div>
          `
        : ""}

      <div class="next-hours-chips">
        ${this.nextHours.map(
          (h) => html`
            <div class="chip">
              <div class="price-row">
                <div class="price text-wrap">${h.valueStr}</div>
                ${h.trend !== "none"
                  ? html`
                      <div class="trend ${h.trend}">
                        <i
                          class="mdi ${h.trend === "up"
                            ? "mdi-arrow-up"
                            : h.trend === "down"
                              ? "mdi-arrow-down"
                              : ""}"
                        ></i>
                      </div>
                    `
                  : ""}
              </div>
              <div class="time text-wrap">${h.label}</div>
            </div>
          `,
        )}
      </div>
    `;
  }

  getPlaceholderText() {
    return "Enter address to see energy prices";
  }
}

customElements.define("energy-widget", EnergyWidget);

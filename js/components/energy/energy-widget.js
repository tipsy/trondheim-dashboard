import { BaseWidget } from '../common/base-widget.js';
import { html } from 'lit';
import { EnergyAPI } from '../../utils/energy-api.js';

class EnergyWidget extends BaseWidget {
    constructor() {
        super();
        this._usesInnerHTML = true; // This widget uses innerHTML for rendering
        this.location = null;
        this.priceArea = 'NO3'; // Default to Trondheim area
    }

    async updateLocation(lat, lon) {
        this.location = { lat, lon };
        this.priceArea = EnergyAPI.getPriceAreaFromLocation(lat, lon);
        await this.loadEnergyPrices();
    }

    async loadEnergyPrices() {
        this.showLoading(true);
        this.hideError();

        try {
            const prices = await EnergyAPI.getEnergyPrices(this.priceArea);
            await this.renderPrices(prices);
        } catch (error) {
            this.showError('Could not load energy prices');
        } finally {
            this.showLoading(false);
        }
    }

    async renderPrices(prices) {
        const content = this.getContentElement();
        if (!content) return;

        if (!prices || prices.length === 0) {
            content.innerHTML = '<error-message message="No energy price data available"></error-message>';
            return;
        }

        const now = new Date();
        const currentHour = now.getHours();

        // Find current price
        const currentPrice = prices.find(p => {
            const start = new Date(p.time_start);
            return now >= start && now < new Date(p.time_end);
        });

        // Get remaining hours for today
        let remainingPrices = prices.filter(p => {
            const start = new Date(p.time_start);
            return start.getHours() >= currentHour;
        });

        // If we don't have enough remaining hours for today, try to fetch next day's prices
        if (remainingPrices.length < 4) {
            try {
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + 1);
                const y = nextDate.getFullYear();
                const m = String(nextDate.getMonth() + 1).padStart(2, '0');
                const d = String(nextDate.getDate()).padStart(2, '0');
                const url = `https://www.hvakosterstrommen.no/api/v1/prices/${y}/${m}-${d}_${this.priceArea}.json`;
                const nextDayData = await APIBase.fetchJSON('energy-prices', { url, ttl: CacheConfig.ENERGY_TTL });
                if (Array.isArray(nextDayData) && nextDayData.length > 0) {
                    // append next day prices after today's remaining
                    remainingPrices = remainingPrices.concat(nextDayData);
                }
            } catch (e) {
                // ignore next-day fetch errors, we'll just show whatever we have
                console.warn('Failed to fetch next day energy prices', e);
            }
        }

        // Show current price and next 4 hours as flexible chips that grow to fit
        const nextFourRaw = remainingPrices.slice(0, 4);
        const nextFour = nextFourRaw.map((p, idx) => {
            const start = new Date(p.time_start);
            const hh = String(start.getHours()).padStart(2, '0');
            const mm = String(start.getMinutes()).padStart(2, '0');
            const valueNum = Math.round(p.NOK_per_kWh * 100);
            // Determine previous value for comparison
            let prevVal = null;
            if (idx === 0) {
                if (currentPrice) prevVal = Math.round(currentPrice.NOK_per_kWh * 100);
                // if no currentPrice is available, we won't attempt complex fallback here
            } else {
                prevVal = Math.round(nextFourRaw[idx - 1].NOK_per_kWh * 100);
            }

            let trend = 'none';
            if (prevVal !== null && !isNaN(prevVal)) {
                if (valueNum > prevVal) trend = 'up';
                else if (valueNum < prevVal) trend = 'down';
                else trend = 'flat';
            }

            return {
                label: `${hh}:${mm}`,
                valueStr: valueNum + ' øre',
                trend
            };
        });

        content.innerHTML = `
            <style>
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
                    overflow: hidden; /* allow chips to grow and fill container */
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
                    flex: 1 1 0; /* grow equally to fit the container */
                }

                .chip .price-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .chip .price {
                    font-weight: 700;
                    font-size: 14px;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                }

                .chip .time {
                    font-size: 12px;
                    color: var(--text-light);
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                }

                .trend.up { color: var(--error-color, #e74c3c); }
                .trend.down { color: var(--success-color, #2ecc71); }
                .trend.flat { color: var(--text-light); }
            </style>

            ${currentPrice ? `
                <div class="current-price">
                    <div class="current-price-value">${Math.round(currentPrice.NOK_per_kWh * 100)} øre</div>
                </div>
            ` : ''}

            <div class="next-hours-chips">
                ${nextFour.map(h => `
                    <div class="chip">
                        <div class="price-row"><div class="price">${h.valueStr}</div>
                            ${h.trend !== 'none' ? `<div class="trend ${h.trend}"><i class="mdi ${h.trend === 'up' ? 'mdi-arrow-up' : h.trend === 'down' ? 'mdi-arrow-down' : ''}"></i></div>` : ''}
                        </div>
                        <div class="time">${h.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Override BaseWidget methods
    getTitle() {
        return 'Electricity';
    }

    getIcon() {
        return html`<i class="mdi mdi-lightning-bolt-outline"></i>`;
    }

    getPlaceholderText() {
        return 'Enter address to see energy prices';
    }
}

customElements.define('energy-widget', EnergyWidget);

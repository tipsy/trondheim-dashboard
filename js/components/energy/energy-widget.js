class EnergyWidget extends BaseWidget {
    constructor() {
        super();
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
            this.renderPrices(prices);
        } catch (error) {
            this.showError('Could not load energy prices');
        } finally {
            this.showLoading(false);
        }
    }

    renderPrices(prices) {
        const content = this.shadowRoot.getElementById('content');
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
            const end = new Date(p.time_end);
            return now >= start && now < end;
        });

        // Get remaining hours for today
        const remainingPrices = prices.filter(p => {
            const start = new Date(p.time_start);
            return start.getHours() >= currentHour;
        });

        // Calculate statistics
        const priceValues = prices.map(p => p.NOK_per_kWh);
        const minPrice = Math.min(...priceValues);
        const maxPrice = Math.max(...priceValues);
        const avgPrice = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;

        const priceAreaNames = {
            'NO1': 'Oslo / Øst-Norge',
            'NO2': 'Kristiansand / Sør-Norge',
            'NO3': 'Trondheim / Midt-Norge',
            'NO4': 'Tromsø / Nord-Norge',
            'NO5': 'Bergen / Vest-Norge'
        };

        content.innerHTML = `
            <style>
                .current-price {
                    text-align: center;
                    padding: var(--spacing-md) 0;
                    margin-bottom: var(--spacing-md);
                }

                .current-price-value {
                    font-size: 40px;
                    font-weight: bold;
                    color: var(--text-color);
                    line-height: 1;
                }

                .price-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--spacing-sm);
                }

                .stat-item {
                    text-align: center;
                    padding: var(--spacing-sm);
                    background-color: var(--alt-background);
                    border-radius: var(--border-radius);
                }

                .stat-label {
                    font-size: var(--font-size-xs);
                    color: var(--text-light);
                    display: block;
                }

                .stat-value {
                    font-size: var(--font-size-md);
                    font-weight: 600;
                    color: var(--text-color);
                    display: block;
                    margin-top: var(--spacing-xs);
                }
            </style>

            ${currentPrice ? `
                <div class="current-price">
                    <div class="current-price-value">${(currentPrice.NOK_per_kWh * 100).toFixed(2)} øre</div>
                </div>
            ` : ''}

            <div class="price-stats">
                <div class="stat-item">
                    <span class="stat-label">Min</span>
                    <span class="stat-value">${(minPrice * 100).toFixed(1)} øre</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Avg</span>
                    <span class="stat-value">${(avgPrice * 100).toFixed(1)} øre</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Max</span>
                    <span class="stat-value">${(maxPrice * 100).toFixed(1)} øre</span>
                </div>
            </div>
        `;
    }

    // Override BaseWidget methods
    getTitle() {
        return 'Electricity';
    }

    getIcon() {
        return IconLibrary.getIcon('energy');
    }

    getPlaceholderText() {
        return 'Enter address to see energy prices';
    }
}

customElements.define('energy-widget', EnergyWidget);


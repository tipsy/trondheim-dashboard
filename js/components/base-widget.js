// Base Widget Component - provides common widget structure and functionality
// All dashboard widgets should extend this class

class BaseWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    // Override this method to provide the widget title
    getTitle() {
        return 'Widget';
    }

    // Override this method to provide the widget icon SVG
    getIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>`;
    }

    // Override this method to provide additional header content (e.g., selectors)
    getHeaderContent() {
        return '';
    }

    // Override this method to provide the initial placeholder text
    getPlaceholderText() {
        return 'Enter address to see information';
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                }

                :host {
                    display: block;
                }

                .widget-container {
                    background-color: var(--card-background);
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow);
                    display: flex;
                    flex-direction: column;
                }

                /* Desktop: fixed height with scrolling */
                @media (min-width: 1025px) {
                    .widget-container {
                        height: 100%;
                    }

                    #content {
                        flex: 1;
                        min-height: 0;
                        overflow-y: auto;
                    }
                }

                /* Mobile/Tablet: natural height, no scrolling */
                @media (max-width: 1024px) {
                    .widget-container {
                        height: auto;
                    }

                    #content {
                        overflow-y: visible;
                        overflow-x: visible;
                        min-height: auto;
                    }

                    .widget-header.scrolled {
                        border-bottom-color: transparent;
                    }
                }

                .widget-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-sm);
                    padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm) var(--spacing-md);
                    flex-shrink: 0;
                    gap: var(--spacing-md);
                    border-bottom: 1px solid transparent;
                    transition: border-color 0.2s ease;
                }

                .widget-header.scrolled {
                    border-bottom-color: var(--border-color);
                    margin-bottom: 0;
                }

                h3 {
                    margin: 0;
                    color: var(--text-color);
                    font-size: var(--font-size-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                    white-space: nowrap;
                }

                #content {
                    padding: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
                }

                #content::-webkit-scrollbar {
                    width: 4px;
                }

                #content::-webkit-scrollbar-track {
                    background: transparent;
                }

                #content::-webkit-scrollbar-thumb {
                    background: transparent;
                    border-radius: 2px;
                    transition: background 0.3s ease;
                }

                #content.scrolling::-webkit-scrollbar-thumb {
                    background: var(--scrollbar-thumb);
                }

                #content.scrolling::-webkit-scrollbar-thumb:hover {
                    background: var(--scrollbar-thumb-hover);
                }

                .loading-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: var(--spacing-xl);
                }

                .loading {
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--border-color);
                    border-top-color: var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .error {
                    color: var(--error-color);
                    padding: var(--spacing-md);
                    background-color: var(--error-bg);
                    border-radius: var(--border-radius);
                    text-align: center;
                }

                .no-data {
                    text-align: center;
                    color: var(--text-light);
                    padding: var(--spacing-xl);
                }

                .placeholder {
                    text-align: center;
                    color: var(--text-light);
                    padding: var(--spacing-xl);
                }

                /* Additional styles that child widgets might need */
                h4 {
                    margin: var(--spacing-md) 0 var(--spacing-sm) 0;
                    color: var(--text-color);
                    font-size: var(--font-size-md);
                }
            </style>

            <div class="widget-container">
                <div class="widget-header">
                    <h3>
                        ${this.getIcon()}
                        ${this.getTitle()}
                    </h3>
                    ${this.getHeaderContent()}
                </div>
                <div id="content">
                    <p class="placeholder">${this.getPlaceholderText()}</p>
                </div>
            </div>
        `;

        // Set up scroll listener for header border
        this.setupScrollListener();

        // Call post-render hook for child classes
        this.afterRender();
    }

    // Set up scroll listener to add border to header when scrolled
    setupScrollListener() {
        const content = this.shadowRoot.getElementById('content');
        const header = this.shadowRoot.querySelector('.widget-header');

        if (content && header) {
            // Only enable scroll listener on desktop (> 1024px)
            const isDesktop = () => window.matchMedia('(min-width: 1025px)').matches;

            if (!isDesktop()) {
                // On mobile, don't set up scroll listener
                return;
            }

            let scrollTimeout;

            content.addEventListener('scroll', () => {
                // Only apply scroll effects on desktop
                if (!isDesktop()) return;

                // Update header border
                if (content.scrollTop > 0) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }

                // Show scrollbar while scrolling
                content.classList.add('scrolling');

                // Hide scrollbar after scrolling stops
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    content.classList.remove('scrolling');
                }, 200); // Hide after .2s of no scrolling
            });
        }
    }

    // Override this method to attach event listeners after render
    afterRender() {
        // Child classes can override this
    }

    // Utility methods for common widget operations
    showLoading(isLoading) {
        const content = this.shadowRoot.getElementById('content');
        if (isLoading) {
            content.innerHTML = '<div class="loading-container"><loading-spinner size="large"></loading-spinner></div>';
        }
    }

    showError(message) {
        const content = this.shadowRoot.getElementById('content');
        content.innerHTML = `<error-message message="${message}"></error-message>`;
    }

    showPlaceholder() {
        const content = this.shadowRoot.getElementById('content');
        content.innerHTML = `<p class="placeholder">${this.getPlaceholderText()}</p>`;
    }

    hideError() {
        // Error will be replaced by content
        // Child classes can override if needed
    }

    // Helper to get the content element
    getContentElement() {
        return this.shadowRoot.getElementById('content');
    }
}


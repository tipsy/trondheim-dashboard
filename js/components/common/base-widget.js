// Base Widget Component - provides common widget structure and functionality
// All dashboard widgets should extend this class

import { LitElement, html, css } from 'lit';
import { sharedStyles, adoptMDIStyles } from '../../utils/shared-styles.js';
import './loading-spinner.js';
import './error-message.js';

export class BaseWidget extends LitElement {
    static properties = {
        isLoading: { type: Boolean, state: true },
        errorMessage: { type: String, state: true },
        showPlaceholderState: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.isLoading = false;
        this.errorMessage = '';
        this.showPlaceholderState = false;
        this._placeholderTimerId = null;
    }

    static styles = [
        sharedStyles,
        css`
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
                color: var(--heading-color, var(--text-color));
                font-size: var(--font-size-lg);
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            h3 i {
                font-size: 28px;
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

            error-message {
                display: block;
            }
        `
    ];


    firstUpdated() {
        adoptMDIStyles(this.shadowRoot);
        this.setupScrollListener();
        this.startPlaceholderTimer();
        this.afterRender();
    }

    // Override these methods in child classes to provide widget-specific content
    getTitle() {
        return 'Widget';
    }

    getIcon() {
        return html`<i class="mdi mdi-square-outline"></i>`;
    }

    getHeaderContent() {
        return html``;
    }

    getPlaceholderText() {
        return 'Enter address to see information';
    }

    // Override this for custom content rendering
    renderContent() {
        return html``;
    }

    updated(changedProperties) {
        // For widgets using innerHTML, manually update the content div when state changes
        // This is called AFTER render completes, so the DOM is stable
        if (this._usesInnerHTML && (
            changedProperties.has('isLoading') ||
            changedProperties.has('errorMessage') ||
            changedProperties.has('showPlaceholderState')
        )) {
            const content = this.shadowRoot.getElementById('content');
            if (!content) return;

            // Manually render loading/error/placeholder states using innerHTML
            // This avoids Lit's DOM tracking issues
            if (this.isLoading) {
                content.innerHTML = '<div class="loading-container"><loading-spinner size="large"></loading-spinner></div>';
            } else if (this.errorMessage) {
                content.innerHTML = `<error-message message="${this.errorMessage}"></error-message>`;
            } else if (this.showPlaceholderState) {
                content.innerHTML = `<p class="placeholder">${this.getPlaceholderText()}</p>`;
            }
            // If none of the above, the widget's render method will set content via innerHTML
        }
    }

    render() {
        // For vanilla widgets that use innerHTML, render an EMPTY content div
        // The widget will populate it via innerHTML, and state changes are handled in updated()
        // For Lit widgets, call renderContent()
        const contentTemplate = this._usesInnerHTML ? html`` : (
            this.isLoading ? html`
                <div class="loading-container">
                    <loading-spinner size="large"></loading-spinner>
                </div>
            ` : this.errorMessage ? html`
                <error-message message="${this.errorMessage}"></error-message>
            ` : this.showPlaceholderState ? html`
                <p class="placeholder">${this.getPlaceholderText()}</p>
            ` : this.renderContent()
        );

        return html`
            <div class="widget-container">
                <div class="widget-header">
                    <h3>
                        ${this.getIcon()}
                        ${this.getTitle()}
                    </h3>
                    ${this.getHeaderContent()}
                </div>
                <div id="content">
                    ${contentTemplate}
                </div>
            </div>
        `;
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

    // Start a delayed placeholder that will appear after 1s if no content/activity occurs
    startPlaceholderTimer() {
        this.cancelPlaceholderTimer();
        this._placeholderTimerId = setTimeout(() => {
            // Only show placeholder if the element is still connected
            if (!this.isConnected) return;
            // Only show the placeholder if the content is still empty
            const content = this.shadowRoot.getElementById('content');
            if (content && content.children.length === 0) {
                this.showPlaceholder();
            }
        }, 1000);
    }

    cancelPlaceholderTimer() {
        if (this._placeholderTimerId) {
            clearTimeout(this._placeholderTimerId);
            this._placeholderTimerId = null;
        }
    }

    // Set up post-render hook for child classes
    afterRender() {
        // Child classes can override this
    }

    // Utility methods for common widget operations
    showLoading(loading = true) {
        this.cancelPlaceholderTimer();
        this.isLoading = loading;
        this.errorMessage = '';
        this.showPlaceholderState = false;

        if (!loading) {
            // Start placeholder timer when loading stops
            this.startPlaceholderTimer();
        }
    }

    showError(message) {
        this.cancelPlaceholderTimer();
        this.isLoading = false;
        this.errorMessage = message;
        this.showPlaceholderState = false;
    }

    showPlaceholder() {
        this.cancelPlaceholderTimer();
        this.isLoading = false;
        this.errorMessage = '';
        this.showPlaceholderState = true;
    }

    hideError() {
        this.errorMessage = '';
    }

    // Helper to get the content element
    getContentElement() {
        // Mark that this widget uses innerHTML (vanilla widget pattern)
        this._usesInnerHTML = true;
        return this.shadowRoot.getElementById('content');
    }
}

// Widget List Component - Container for lists of widget rows
// Provides consistent spacing and layout for list-based widgets

import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../utils/shared-styles.js';

class WidgetList extends LitElement {
    static styles = [
        sharedStyles,
        css`
            :host {
                display: block;
            }

            .list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
            }
        `
    ];

    render() {
        return html`
            <div class="list">
                <slot></slot>
            </div>
        `;
    }
}

customElements.define('widget-list', WidgetList);


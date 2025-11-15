import { css } from 'lit';
import { BaseButton } from './base-button.js';
import { adoptMDIStyles } from '../../utils/shared-styles.js';

class SecondaryButton extends BaseButton {
    static properties = {
        ...BaseButton.properties
    };

    static styles = [
        ...BaseButton.styles,
        css`
            button {
                background-color: var(--card-background);
                color: var(--text-color);
                border: 1px solid var(--border-color);
            }

            button:hover:not(:disabled) {
                background-color: var(--hover-bg, #f5f5f5);
            }
        `
    ];

    firstUpdated() {
        adoptMDIStyles(this.shadowRoot);
    }
}

customElements.define('secondary-button', SecondaryButton);


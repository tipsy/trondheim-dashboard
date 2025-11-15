import { css } from 'lit';
import { SecondaryButton } from './secondary-button.js';
import { adoptMDIStyles } from '../../utils/shared-styles.js';

class RefreshButton extends SecondaryButton {
    static properties = {
        ...SecondaryButton.properties
    };


    static styles = [
        ...SecondaryButton.styles,
        css`
            button {
                width: 32px;
                height: 32px;
                min-height: 32px;
                padding: var(--spacing-xs);
                border: none;
            }
        `
    ];

    handleClick() {
        if (confirm('Clear all cached data and refresh the page?')) {
            localStorage.clear();
            window.location.reload();
        }
    }

    firstUpdated() {
        adoptMDIStyles(this.shadowRoot);
    }
}

customElements.define('refresh-button', RefreshButton);


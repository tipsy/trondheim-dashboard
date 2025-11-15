import { css } from 'lit';
import { BaseButton } from './base-button.js';

class PrimaryButton extends BaseButton {
    static styles = [
        ...BaseButton.styles,
        css`
            button {
                background-color: var(--primary-color);
                color: var(--button-text);
            }

            button:hover:not(:disabled) {
                background-color: var(--secondary-color);
            }
        `
    ];
}

customElements.define('primary-button', PrimaryButton);


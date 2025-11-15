import { css } from 'lit';

// Base button styles shared between primary and secondary buttons
export const baseButtonStyles = css`
    :host {
        display: inline-block;
    }

    button {
        position: relative;
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: var(--font-size-md);
        transition: background-color 0.2s, transform 0.1s;
        font-family: var(--font-family, sans-serif);
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        gap: var(--spacing-xs);
    }

    button:active:not(:disabled) {
        transform: scale(0.98);
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .button-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
    }

    .button-content.loading {
        visibility: hidden;
    }

    .loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid var(--button-text);
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;


import { css } from 'lit';

// Shared styles that should be included in all Lit components
export const sharedStyles = css`
    * {
        box-sizing: border-box;
    }

    /* Material Design Icons - make them work in shadow DOM */
    i.mdi {
        line-height: 1;
        filter: var(--icon-filter, none);
    }

    /* Apply icon filter to all images and emojis */
    img,
    .emoji,
    [role="img"] {
        filter: var(--icon-filter, none);
    }

    /* Common responsive text overflow patterns */
    .text-wrap {
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
    }

    .text-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Mobile: allow text to wrap */
    @media (max-width: 1024px) {
        .responsive-text {
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
            hyphens: auto;
        }
    }

    /* Desktop: use single-line ellipsis */
    @media (min-width: 1025px) {
        .responsive-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
`;

// Helper function to inject MDI font stylesheet into shadow root
// Call this in firstUpdated() of Lit components that use MDI icons
export function adoptMDIStyles(shadowRoot) {
    const mdiLink = document.createElement('link');
    mdiLink.rel = 'stylesheet';
    mdiLink.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css';
    shadowRoot.appendChild(mdiLink);
}


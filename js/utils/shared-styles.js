import { css } from 'lit';

// Shared styles that should be included in all Lit components
export const sharedStyles = css`
    * {
        box-sizing: border-box;
    }

    /* Material Design Icons - make them work in shadow DOM */
    i.mdi {
        line-height: 1;
    }
`;

// Helper function to inject MDI font stylesheet into shadow root
// Call this in connectedCallback of components that use MDI icons
export function adoptMDIStyles(shadowRoot) {
    const mdiLink = document.createElement('link');
    mdiLink.rel = 'stylesheet';
    mdiLink.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css';
    shadowRoot.appendChild(mdiLink);
}


// Icon Library - Centralized SVG icons for Trondheim Dashboard
// All icons use consistent sizing and stroke properties

class IconLibrary {
    /**
     * Get an SVG icon by name
     * @param {string} name - Icon name
     * @param {number} size - Icon size (default: 22)
     * @param {number} strokeWidth - Stroke width (default: 2)
     * @returns {string} SVG markup
     */
    static getIcon(name, size = 22, strokeWidth = 2) {
        const icons = {
            // Location/Map icons
            'location': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>`,

            'location-crosshair': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
            </svg>`,

            // Transportation icons
            'bus': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <rect x="3" y="6" width="18" height="12" rx="2"/>
                <path d="M3 10h18M8 14h.01M16 14h.01"/>
                <circle cx="8" cy="18" r="1"/>
                <circle cx="16" cy="18" r="1"/>
            </svg>`,

            // Weather icons
            'sun': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>`,

            'weather': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>`,

            // Utility icons
            'trash': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <path d="M3 6h18M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>`,

            'energy': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>`,

            'lightning': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>`,

            // Status icons
            'error': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>`,

            'warning': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`,

            'info': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>`,

            // Generic icons
            'widget': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>`,
        };

        return icons[name] || icons['widget'];
    }

    /**
     * Get all available icon names
     * @returns {string[]} Array of icon names
     */
    static getAvailableIcons() {
        return [
            'location',
            'location-crosshair',
            'bus',
            'sun',
            'weather',
            'trash',
            'energy',
            'lightning',
            'error',
            'warning',
            'info',
            'widget'
        ];
    }
}


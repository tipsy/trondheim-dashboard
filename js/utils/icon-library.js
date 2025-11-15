// Icon Library - Material Design Icons (MDI) CSS import for Trondheim Dashboard

export class IconLibrary {
    static baseStyle = "i.mdi{line-height:1;}";
    static importCss = "@import url('https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css');" + IconLibrary.baseStyle;

    // Return an HTML string for a weather icon based on MET symbol code (for vanilla components)
    static getWeatherIcon(symbolCode, size = 32) {
        const iconClass = this.getWeatherIconClass(symbolCode);
        const s = parseInt(size, 10) || 32;
        return `<i class="mdi ${iconClass}" style="font-size: ${s}px;"></i>`;
    }

    // Return the MDI class name for a weather icon (for Lit components)
    static getWeatherIconClass(symbolCode) {
        if (!symbolCode) return 'mdi-weather-partly-cloudy';

        const code = symbolCode.replace(/_night|_day|_polartwilight/g, '');

        if (code.includes('clearsky')) return 'mdi-weather-sunny';
        if (code.includes('fair')) return 'mdi-weather-partly-cloudy';
        if (code.includes('partlycloudy')) return 'mdi-weather-partly-cloudy';
        if (code.includes('cloudy')) return 'mdi-weather-cloudy';
        if (code.includes('heavyrain')) return 'mdi-weather-pouring';
        if (code.includes('rain') || code.includes('drizzle') || code.includes('lightrain')) return 'mdi-weather-rainy';
        if (code.includes('sleet')) return 'mdi-weather-snowy-rainy';
        if (code.includes('snow')) return 'mdi-weather-snowy';
        if (code.includes('fog')) return 'mdi-weather-fog';
        if (code.includes('thunder')) return 'mdi-weather-lightning';

        return 'mdi-weather-partly-cloudy';
    }
}

// Icon Library - Material Design Icons (MDI) CSS import for Trondheim Dashboard

class IconLibrary {
    static baseStyle = "i.mdi{line-height:1;}";
    static importCss = "@import url('https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css');" + IconLibrary.baseStyle;

    // Return an HTML string for a weather icon based on MET symbol code
    static getWeatherIcon(symbolCode, size = 32) {
        if (!symbolCode) symbolCode = 'fair';
        const code = symbolCode.replace(/_night|_day|_polartwilight/g, '');
        const s = parseInt(size, 10) || 32;

        const icons = {
            clearsky: `<i class="mdi mdi-weather-sunny" style="font-size: ${s}px;"></i>`,
            partlycloudy: `<i class="mdi mdi-weather-partly-cloudy" style="font-size: ${s}px;"></i>`,
            cloudy: `<i class="mdi mdi-weather-cloudy" style="font-size: ${s}px;"></i>`,
            rain: `<i class="mdi mdi-weather-rainy" style="font-size: ${s}px;"></i>`,
            snow: `<i class="mdi mdi-weather-snowy" style="font-size: ${s}px;"></i>`,
            fog: `<i class="mdi mdi-weather-fog" style="font-size: ${s}px;"></i>`,
            thunder: `<i class="mdi mdi-weather-lightning" style="font-size: ${s}px;"></i>`
        };

        if (code.includes('clearsky')) return icons.clearsky;
        if (code.includes('fair')) return icons.partlycloudy;
        if (code.includes('partlycloudy')) return icons.partlycloudy;
        if (code.includes('cloudy')) return icons.cloudy;
        if (code.includes('rain') || code.includes('drizzle') || code.includes('sleet') || code.includes('lightrain' )) return icons.rain;
        if (code.includes('heavyrain')) return `<i class=\"mdi mdi-weather-pouring\" style=\"font-size: ${s}px;\"></i>`;
        if (code.includes('snow')) return icons.snow;
        if (code.includes('sleet')) return `<i class=\"mdi mdi-weather-snowy-rainy\" style=\"font-size: ${s}px;\"></i>`;
        if (code.includes('fog')) return icons.fog;
        if (code.includes('thunder')) return icons.thunder;

        return icons.partlycloudy;
    }
}

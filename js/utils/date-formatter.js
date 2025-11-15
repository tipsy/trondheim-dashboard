// Date Formatter - Centralized date formatting utilities for Trondheim Dashboard

export class DateFormatter {
    static DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    static DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    static MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    static MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    /**
     * Format date as "Monday, Jan 15"
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    static formatLongDate(date) {
        const dayName = this.DAYS[date.getDay()];
        const day = date.getDate();
        const month = this.MONTHS_SHORT[date.getMonth()];
        return `${dayName}, ${month} ${day}`;
    }

    /**
     * Format date as "Mon, Jan 15"
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    static formatMediumDate(date) {
        const dayName = this.DAYS_SHORT[date.getDay()];
        const day = date.getDate();
        const month = this.MONTHS_SHORT[date.getMonth()];
        return `${dayName}, ${month} ${day}`;
    }

    /**
     * Format date as "Monday 1/15"
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    static formatDayWithNumericDate(date) {
        const dayName = this.DAYS[date.getDay()];
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${dayName} ${month}/${day}`;
    }

    /**
     * Format time as "14:30" (24-hour format)
     * @param {Date} date - Date to format
     * @returns {string} Formatted time string
     */
    static formatTime24(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    /**
     * Format time as "2:30 PM" (12-hour format)
     * @param {Date} date - Date to format
     * @returns {string} Formatted time string
     */
    static formatTime12(date) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Get day name from date
     * @param {Date} date - Date
     * @returns {string} Day name
     */
    static getDayName(date) {
        return this.DAYS[date.getDay()];
    }

    /**
     * Get short day name from date
     * @param {Date} date - Date
     * @returns {string} Short day name
     */
    static getDayNameShort(date) {
        return this.DAYS_SHORT[date.getDay()];
    }

    /**
     * Get month name from date
     * @param {Date} date - Date
     * @returns {string} Month name
     */
    static getMonthName(date) {
        return this.MONTHS[date.getMonth()];
    }

    /**
     * Get short month name from date
     * @param {Date} date - Date
     * @returns {string} Short month name
     */
    static getMonthNameShort(date) {
        return this.MONTHS_SHORT[date.getMonth()];
    }

    /**
     * Format relative time (e.g., "in 5 minutes", "2 hours ago")
     * @param {Date} date - Date to compare
     * @param {Date} baseDate - Base date to compare against (default: now)
     * @returns {string} Relative time string
     */
    static formatRelativeTime(date, baseDate = new Date()) {
        const diffMs = date - baseDate;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (Math.abs(diffSec) < 60) {
            return diffSec >= 0 ? 'in a moment' : 'just now';
        } else if (Math.abs(diffMin) < 60) {
            const min = Math.abs(diffMin);
            return diffMin >= 0 ? `in ${min} minute${min !== 1 ? 's' : ''}` : `${min} minute${min !== 1 ? 's' : ''} ago`;
        } else if (Math.abs(diffHour) < 24) {
            const hour = Math.abs(diffHour);
            return diffHour >= 0 ? `in ${hour} hour${hour !== 1 ? 's' : ''}` : `${hour} hour${hour !== 1 ? 's' : ''} ago`;
        } else {
            const day = Math.abs(diffDay);
            return diffDay >= 0 ? `in ${day} day${day !== 1 ? 's' : ''}` : `${day} day${day !== 1 ? 's' : ''} ago`;
        }
    }

    /**
     * Format duration in seconds to human-readable format
     * @param {number} seconds - Duration in seconds
     * @returns {string} Formatted duration (e.g., "2h 30m")
     */
    static formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Format date string to locale string with fallback
     * Used by NRK and Police widgets
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string or original if invalid
     */
    static formatToLocaleString(dateString) {
        try {
            const d = new Date(dateString);
            return isNaN(d.getTime()) ? dateString : d.toLocaleString();
        } catch (e) {
            return dateString;
        }
    }

    /**
     * Format date string to Norwegian date format (DD.MM HH:MM)
     * Used by Police widget
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string
     */
    static formatToNorwegianDateTime(dateString) {
        try {
            const d = new Date(dateString);
            return isNaN(d.getTime()) ? dateString : d.toLocaleString('no-NO', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    /**
     * Format date string to "DD. Mon HH:MM"
     * Used by Events widget
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string
     */
    static formatToEventDateTime(dateString) {
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;

            const day = String(d.getDate()).padStart(2, '0');
            const monthShort = d.toLocaleDateString(undefined, { month: 'short' });
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');

            return `${day}. ${monthShort} ${hours}:${minutes}`;
        } catch (e) {
            return dateString;
        }
    }
}


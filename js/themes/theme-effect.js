// Base class for theme-specific effects
// Provides common functionality for theme activation/deactivation and theme change observation

class ThemeEffect {
  constructor(themeName) {
    if (!themeName) {
      throw new Error("ThemeEffect requires a themeName parameter");
    }
    this.themeName = themeName;
    this.isActive = false;
    this.observer = null;
  }

  /**
   * Initialize the theme effect
   * Sets up theme observation and checks if theme is currently active
   */
  init() {
    this.checkTheme();
    this.observeThemeChanges();
  }

  /**
   * Check if the current theme matches this effect's theme
   * Automatically starts or stops the effect based on theme state
   */
  checkTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");

    if (currentTheme === this.themeName && !this.isActive) {
      this.start();
    } else if (currentTheme !== this.themeName && this.isActive) {
      this.stop();
    }
  }

  /**
   * Set up a MutationObserver to watch for theme changes
   * Automatically calls checkTheme() when the data-theme attribute changes
   */
  observeThemeChanges() {
    this.observer = new MutationObserver(() => {
      this.checkTheme();
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  /**
   * Start the theme effect
   * Override this method in subclasses to implement theme-specific behavior
   */
  start() {
    this.isActive = true;
    console.log(`🎨 ${this.themeName} theme effect started`);
  }

  /**
   * Stop the theme effect
   * Override this method in subclasses to clean up theme-specific resources
   */
  stop() {
    this.isActive = false;
    console.log(`🎨 ${this.themeName} theme effect stopped`);
  }

  /**
   * Clean up the observer
   * Call this if you need to completely destroy the effect
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.stop();
  }
}

/**
 * Auto-initialize a theme effect when the DOM is ready
 * @param {ThemeEffect} effectInstance - Instance of a ThemeEffect subclass
 */
export function autoInitThemeEffect(effectInstance) {
  if (!(effectInstance instanceof ThemeEffect)) {
    throw new Error("autoInitThemeEffect requires a ThemeEffect instance");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      effectInstance.init();
    });
  } else {
    effectInstance.init();
  }
}

export { ThemeEffect };

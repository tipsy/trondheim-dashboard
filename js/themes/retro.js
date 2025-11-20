// Retro Theme Background Pattern Rotator
// Cycles through all 38 classic Mac patterns

import { ThemeEffect, autoInitThemeEffect } from './theme-effect.js';

class RetroPatternRotator extends ThemeEffect {
  constructor() {
    super('retro');
    this.currentPattern = 0;
    this.totalPatterns = 38; // pattern_00 through pattern_37
    this.rotationInterval = null;
    this.rotationDelay = 1000 * 50 * 5; // Change pattern every 5 minutes
  }

  start() {
    super.start();

    // Start with a random pattern
    this.currentPattern = Math.floor(Math.random() * this.totalPatterns);
    this.applyPattern();

    // Rotate patterns at regular intervals
    this.rotationInterval = setInterval(() => {
      this.nextPattern();
    }, this.rotationDelay);
  }

  stop() {
    super.stop();

    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }

    // Remove the inline style so the theme CSS can take over
    document.documentElement.style.removeProperty('--background');
  }

  nextPattern() {
    if (!this.isActive) return;

    // Move to next pattern (wrap around at the end)
    this.currentPattern = (this.currentPattern + 1) % this.totalPatterns;
    this.applyPattern();
  }

  applyPattern() {
    // Format pattern number with leading zeros (00-37)
    const patternNumber = String(this.currentPattern).padStart(2, '0');
    const patternUrl = `/img/themes/retro/pattern_${patternNumber}_16x16.png`;
    
    // Update the CSS variable
    document.documentElement.style.setProperty(
      '--background',
      `url("${patternUrl}") repeat`
    );
  }
}

// Auto-initialize when the page loads
const retroRotator = new RetroPatternRotator();
autoInitThemeEffect(retroRotator);

export { RetroPatternRotator };


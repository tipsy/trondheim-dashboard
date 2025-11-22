// Galaxy Theme - Animated starfield with twinkling stars and shooting stars
// Creates a beautiful cosmic background with depth and movement

import { ThemeEffect, autoInitThemeEffect } from "./theme-effect.js";

class GalaxyEffect extends ThemeEffect {
  constructor() {
    super("galaxy");
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.shootingStars = [];
    this.animationFrame = null;
    this.lastShootingStarTime = 0;
    this.shootingStarInterval = 3000; // Shooting star every 3-8 seconds
  }

  start() {
    super.start();
    this.createCanvas();
    this.initStars();
    this.animate();
  }

  stop() {
    super.stop();

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.shootingStars = [];
  }

  createCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "-1";

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);

    // Handle window resize
    window.addEventListener("resize", () => {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initStars(); // Reinitialize stars on resize
      }
    });
  }

  initStars() {
    this.stars = [];
    const starCount = Math.floor(
      (this.canvas.width * this.canvas.height) / 3000,
    ); // Density based on screen size

    for (let i = 0; i < starCount; i++) {
      this.stars.push(this.createStar());
    }
  }

  createStar() {
    const shapes = ["+", "✦", "·", "✧"];
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() * 8 + 8, // Font size between 8 and 16
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.01 + 0.002, // Slower twinkle speeds
      twinkleDirection: Math.random() > 0.5 ? 1 : -1,
      color: this.getStarColor(),
      layer: Math.random(), // For parallax depth effect
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  }

  getStarColor() {
    // Mix of white, blue, purple, and pink stars for cosmic variety
    const colors = [
      "rgba(255, 255, 255, ", // White
      "rgba(200, 220, 255, ", // Blue-white
      "rgba(220, 200, 255, ", // Purple-white
      "rgba(255, 200, 240, ", // Pink-white
      "rgba(180, 200, 255, ", // Light blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  createShootingStar() {
    // Start from random position on top or right edge
    const startFromTop = Math.random() > 0.5;

    return {
      x: startFromTop ? Math.random() * this.canvas.width : this.canvas.width,
      y: startFromTop ? 0 : Math.random() * this.canvas.height * 0.5,
      length: Math.random() * 80 + 40, // Trail length
      speed: Math.random() * 4 + 3, // Slower speed
      angle: (Math.random() * Math.PI) / 6 + Math.PI / 4, // Angle (roughly diagonal)
      opacity: 1,
      thickness: Math.random() * 2 + 1,
    };
  }

  updateStars() {
    this.stars.forEach((star) => {
      // Twinkle effect
      star.opacity += star.twinkleSpeed * star.twinkleDirection;

      if (star.opacity >= 1) {
        star.opacity = 1;
        star.twinkleDirection = -1;
      } else if (star.opacity <= 0.2) {
        star.opacity = 0.2;
        star.twinkleDirection = 1;
      }
    });
  }

  updateShootingStars() {
    const now = Date.now();

    // Create new shooting star randomly
    if (now - this.lastShootingStarTime > this.shootingStarInterval) {
      this.shootingStars.push(this.createShootingStar());
      this.lastShootingStarTime = now;
      // Randomize next interval (5-12 seconds) - less frequent
      this.shootingStarInterval = Math.random() * 7000 + 5000;
    }

    // Update existing shooting stars
    this.shootingStars = this.shootingStars.filter((star) => {
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      star.opacity -= 0.008; // Slower fade

      // Remove if off screen or faded
      return (
        star.opacity > 0 &&
        star.x < this.canvas.width + 100 &&
        star.y < this.canvas.height + 100
      );
    });
  }

  drawStars() {
    this.stars.forEach((star) => {
      this.ctx.save();
      this.ctx.font = `${star.size}px Arial`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = star.color + star.opacity + ")";
      this.ctx.fillText(star.shape, star.x, star.y);

      // Add subtle glow for larger stars
      if (star.size > 12) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = star.color + star.opacity * 0.5 + ")";
        this.ctx.fillText(star.shape, star.x, star.y);
        this.ctx.shadowBlur = 0;
      }
      this.ctx.restore();
    });
  }

  drawShootingStars() {
    this.shootingStars.forEach((star) => {
      const gradient = this.ctx.createLinearGradient(
        star.x,
        star.y,
        star.x - Math.cos(star.angle) * star.length,
        star.y - Math.sin(star.angle) * star.length,
      );

      gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
      gradient.addColorStop(0.3, `rgba(200, 180, 255, ${star.opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(150, 100, 255, 0)`);

      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = star.thickness;
      this.ctx.lineCap = "round";

      this.ctx.beginPath();
      this.ctx.moveTo(star.x, star.y);
      this.ctx.lineTo(
        star.x - Math.cos(star.angle) * star.length,
        star.y - Math.sin(star.angle) * star.length,
      );
      this.ctx.stroke();

      // Add glow
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity * 0.3})`;
      this.ctx.lineWidth = star.thickness * 3;
      this.ctx.beginPath();
      this.ctx.moveTo(star.x, star.y);
      this.ctx.lineTo(
        star.x - Math.cos(star.angle) * star.length,
        star.y - Math.sin(star.angle) * star.length,
      );
      this.ctx.stroke();
    });
  }

  drawNebula() {
    // Create subtle nebula clouds in the background
    const gradient1 = this.ctx.createRadialGradient(
      this.canvas.width * 0.3,
      this.canvas.height * 0.3,
      0,
      this.canvas.width * 0.3,
      this.canvas.height * 0.3,
      this.canvas.width * 0.4,
    );
    gradient1.addColorStop(0, "rgba(139, 92, 246, 0.03)");
    gradient1.addColorStop(1, "rgba(139, 92, 246, 0)");

    this.ctx.fillStyle = gradient1;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const gradient2 = this.ctx.createRadialGradient(
      this.canvas.width * 0.7,
      this.canvas.height * 0.6,
      0,
      this.canvas.width * 0.7,
      this.canvas.height * 0.6,
      this.canvas.width * 0.5,
    );
    gradient2.addColorStop(0, "rgba(244, 114, 182, 0.02)");
    gradient2.addColorStop(1, "rgba(244, 114, 182, 0)");

    this.ctx.fillStyle = gradient2;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animate() {
    if (!this.isActive || !this.ctx) return;

    // Clear canvas with deep space background
    this.ctx.fillStyle = "#0a0118";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw nebula clouds
    this.drawNebula();

    // Update and draw stars
    this.updateStars();
    this.drawStars();

    // Update and draw shooting stars
    this.updateShootingStars();
    this.drawShootingStars();

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
}

// Auto-initialize when the page loads
const galaxyEffect = new GalaxyEffect();
autoInitThemeEffect(galaxyEffect);

export { GalaxyEffect };

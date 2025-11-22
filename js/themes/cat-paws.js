// Cat Paw Prints Animation for Cat Theme
// Uses canvas and vector math to draw realistic paw prints

import { ThemeEffect, autoInitThemeEffect } from "./theme-effect.js";

class CatPaws extends ThemeEffect {
  constructor() {
    super("cat");
    this.canvas = null;
    this.ctx = null;
    this.isWalking = false;
    this.pawPrints = [];
    this.animationFrame = null;
    this.currentX = 0;
    this.currentY = 0;
    this.currentAngle = 0;
    this.stepCount = 0;
    this.wallFollowSteps = 0; // Track steps while following wall
    this.isFollowingWall = false;
  }

  start() {
    super.start();
    this.createCanvas();
    this.animate();
    this.startNextWalk();
  }

  stop() {
    super.stop();
    this.isWalking = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;
    this.pawPrints = [];
  }

  createCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "1";

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);

    // Handle window resize
    window.addEventListener("resize", () => {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
    });
  }

  startNextWalk() {
    if (!this.isActive) return;

    // Initialize random starting position and direction
    this.currentX = Math.random() * window.innerWidth;
    this.currentY = Math.random() * window.innerHeight;
    this.currentAngle = Math.random() * Math.PI * 2;
    this.stepCount = 0;

    this.isWalking = true;
    this.walkStep();
  }

  walkStep() {
    if (!this.isActive) return;

    // If following wall, count down steps
    if (this.isFollowingWall) {
      this.wallFollowSteps--;
      if (this.wallFollowSteps <= 0) {
        this.isFollowingWall = false;
      }
    }

    // Only add curve if not following a wall
    if (!this.isFollowingWall) {
      // Add gentle curve to the path
      // Change angle slightly each step (increased for more curving)
      const angleChange = (Math.random() - 0.5) * 1.2;
      this.currentAngle += angleChange;
    }

    // Calculate direction vector from current angle
    const direction = {
      x: Math.cos(this.currentAngle),
      y: Math.sin(this.currentAngle),
    };

    const stepSize = 60;
    const pawOffset = 18;

    // Store old position
    const oldX = this.currentX;
    const oldY = this.currentY;

    // Move forward
    this.currentX += direction.x * stepSize;
    this.currentY += direction.y * stepSize;

    const margin = 50;

    // Check if out of bounds - if so, follow the wall
    let hitWall = false;

    if (this.currentX < margin) {
      // Hit left wall - turn to walk along it
      this.currentX = margin;
      // Choose to go up or down along the wall (whichever continues current direction better)
      if (direction.y < 0) {
        this.currentAngle = -Math.PI / 2; // Walk up
      } else {
        this.currentAngle = Math.PI / 2; // Walk down
      }
      hitWall = true;
    } else if (this.currentX > window.innerWidth - margin) {
      // Hit right wall - turn to walk along it
      this.currentX = window.innerWidth - margin;
      if (direction.y < 0) {
        this.currentAngle = -Math.PI / 2; // Walk up
      } else {
        this.currentAngle = Math.PI / 2; // Walk down
      }
      hitWall = true;
    }

    if (this.currentY < margin) {
      // Hit top wall - turn to walk along it
      this.currentY = margin;
      // Choose to go left or right along the wall
      if (direction.x < 0) {
        this.currentAngle = Math.PI; // Walk left
      } else {
        this.currentAngle = 0; // Walk right
      }
      hitWall = true;
    } else if (this.currentY > window.innerHeight - margin) {
      // Hit bottom wall - turn to walk along it
      this.currentY = window.innerHeight - margin;
      if (direction.x < 0) {
        this.currentAngle = Math.PI; // Walk left
      } else {
        this.currentAngle = 0; // Walk right
      }
      hitWall = true;
    }

    // If we just hit a wall and not already following one, start following
    if (hitWall && !this.isFollowingWall) {
      this.isFollowingWall = true;
      this.wallFollowSteps = 5;
    }

    // Recalculate direction after potential wall bounce
    const finalDirection = {
      x: Math.cos(this.currentAngle),
      y: Math.sin(this.currentAngle),
    };

    // Perpendicular vector for left/right offset
    const perpendicular = {
      x: -finalDirection.y,
      y: finalDirection.x,
    };

    // Alternate between left and right paws
    const isLeft = this.stepCount % 2 === 0;
    const side = isLeft ? -1 : 1;

    // Calculate paw position
    const pawX = this.currentX + perpendicular.x * pawOffset * side;
    const pawY = this.currentY + perpendicular.y * pawOffset * side;

    // Add paw print
    this.addPawPrint(pawX, pawY, finalDirection, isLeft);

    this.stepCount++;

    // Continue walking after a delay (increased to slow down)
    setTimeout(() => this.walkStep(), 600);
  }

  addPawPrint(x, y, direction, isLeft) {
    const now = Date.now();

    this.pawPrints.push({
      x,
      y,
      direction,
      isLeft,
      createdAt: now,
      opacity: 0,
      maxOpacity: 0.5,
    });
  }

  drawPaw(x, y, direction, isLeft, opacity) {
    if (opacity <= 0) return;

    this.ctx.save();
    this.ctx.translate(x, y);

    // Rotate to face the direction (add 90 degrees to correct orientation)
    const angle = Math.atan2(direction.y, direction.x) + Math.PI / 2;
    this.ctx.rotate(angle);

    // Use gray color for paw prints with opacity
    this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.2})`;

    // Draw 4 toe circles (smaller, at the top)
    const toeRadius = 3;

    // Far left toe
    this.ctx.beginPath();
    this.ctx.arc(-8, -2, toeRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Center-left toe
    this.ctx.beginPath();
    this.ctx.arc(-3, -5, toeRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Center-right toe
    this.ctx.beginPath();
    this.ctx.arc(3, -5, toeRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Far right toe
    this.ctx.beginPath();
    this.ctx.arc(8, -2, toeRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw large pad circle (bottom, overlapping area creating bean shape)
    const padRadius = 7;
    this.ctx.beginPath();
    this.ctx.arc(0, 5, padRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  animate() {
    if (!this.isActive || !this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const now = Date.now();
    const fadeInDuration = 300;
    const fadeOutDuration = 2000;
    const maxAge = 5000; // Paw prints last 5 seconds (keeps around 10 prints at 600ms steps)

    // Update and draw all paw prints
    this.pawPrints = this.pawPrints.filter((paw) => {
      const age = now - paw.createdAt;

      if (age > maxAge + fadeOutDuration) {
        return false; // Remove old paw prints
      }

      // Calculate opacity based on age
      let opacity;
      if (age < fadeInDuration) {
        // Fade in
        opacity = age / fadeInDuration;
      } else if (age > maxAge) {
        // Fade out
        const fadeAge = age - maxAge;
        opacity = 1 - fadeAge / fadeOutDuration;
      } else {
        // Full opacity
        opacity = 1;
      }

      // Clamp opacity between 0 and 1
      opacity = Math.max(0, Math.min(1, opacity));

      this.drawPaw(paw.x, paw.y, paw.direction, paw.isLeft, opacity);

      return true;
    });

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
}

// Auto-initialize when the page loads
const catPaws = new CatPaws();
autoInitThemeEffect(catPaws);

export { CatPaws };

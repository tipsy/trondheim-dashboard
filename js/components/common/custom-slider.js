import { LitElement, html, css } from 'lit';

class CustomSlider extends LitElement {
  static properties = {
    value: { type: Number },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    disabled: { type: Boolean },
  };

  constructor() {
    super();
    this.value = 50;
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.disabled = false;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .slider-container {
      position: relative;
      width: 100%;
      height: 24px;
      display: flex;
      align-items: center;
    }

    .slider-track {
      position: absolute;
      width: 100%;
      height: 4px;
      background: var(--border-color);
      border-radius: 2px;
      pointer-events: none;
    }

    .slider-fill {
      position: absolute;
      height: 4px;
      background: var(--primary-color);
      border-radius: 2px;
      pointer-events: none;
      transition: width 0.1s ease;
    }

    .slider-thumb {
      position: absolute;
      width: 16px;
      height: 16px;
      background: var(--primary-color);
      border: 2px solid var(--card-background);
      border-radius: 50%;
      cursor: grab;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .slider-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .slider-thumb:active {
      cursor: grabbing;
      transform: scale(1.1);
    }

    .slider-input {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      margin: 0;
    }

    :host([disabled]) .slider-track {
      background: var(--border-color);
      opacity: 0.5;
    }

    :host([disabled]) .slider-fill {
      background: var(--text-light);
      opacity: 0.5;
    }

    :host([disabled]) .slider-thumb {
      background: var(--text-light);
      cursor: not-allowed;
      opacity: 0.5;
    }

    :host([disabled]) .slider-input {
      cursor: not-allowed;
    }
  `;

  get percentage() {
    const range = this.max - this.min;
    if (range === 0) return 0;
    return ((this.value - this.min) / range) * 100;
  }

  handleInput(e) {
    if (this.disabled) return;
    
    const newValue = parseFloat(e.target.value);
    this.value = newValue;
    
    this.dispatchEvent(new CustomEvent('input', {
      detail: { value: newValue },
      bubbles: true,
      composed: true
    }));
  }

  handleChange(e) {
    if (this.disabled) return;
    
    const newValue = parseFloat(e.target.value);
    this.value = newValue;
    
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: newValue },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const percentage = this.percentage;
    
    return html`
      <div class="slider-container">
        <div class="slider-track"></div>
        <div class="slider-fill" style="width: ${percentage}%"></div>
        <div class="slider-thumb" style="left: calc(${percentage}% - 8px)"></div>
        <input
          type="range"
          class="slider-input"
          .value=${String(this.value)}
          min=${this.min}
          max=${this.max}
          step=${this.step}
          ?disabled=${this.disabled}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
      </div>
    `;
  }
}

customElements.define('custom-slider', CustomSlider);


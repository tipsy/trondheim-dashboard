import { LitElement, html, css } from "lit";
import { sharedStyles } from "../../utils/shared-styles.js";
import { dispatchEvent } from "../../utils/event-helpers.js";

class CustomSelect extends LitElement {
  static properties = {
    label: { type: String },
    selected: { type: String },
    placeholder: { type: String },
    options: { type: Array },
  };

  constructor() {
    super();
    this.placeholder = "Select an option";
    this.options = [];
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .select-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs, 4px);
      }

      label {
        font-size: var(--font-size-sm, 14px);
        color: var(--text-color, #333333);
        font-weight: 500;
      }

      select {
        width: 100%;
        height: var(--input-height);
        padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: var(--border-radius, 8px);
        font-size: var(--font-size-md, 16px);
        background-color: var(--input-background, #ffffff);
        color: var(--text-color, #333333);
        font-family: var(--font-family, sans-serif);
        cursor: pointer;
        transition: border-color 0.2s;
        text-overflow: ellipsis;
      }

      select:focus {
        outline: none;
        border-color: var(--primary-color, #0066cc);
      }

      select:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ];

  handleChange(e) {
    this.selected = e.target.value;
    dispatchEvent(this, "change", { value: e.target.value });
  }


  render() {
    return html`
      <div class="select-container">
        ${this.label ? html`<label>${this.label}</label>` : ""}
        <select @change=${this.handleChange}>
          ${this.placeholder
            ? html`<option value="" disabled ?selected=${!this.selected}>
                ${this.placeholder}
              </option>`
            : ""}
          ${this.options?.map(
            (option) => html`
              <option
                value="${option.value}"
                ?selected=${option.value === this.selected}
              >
                ${option.label}
              </option>
            `,
          )}
        </select>
      </div>
    `;
  }
}

customElements.define("custom-select", CustomSelect);

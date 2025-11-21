import { LitElement, html, css } from "lit";
import { sharedStyles, adoptMDIStyles } from "../../utils/shared-styles.js";
import { dispatchEvent } from "../../utils/event-helpers.js";

class CustomSelect extends LitElement {
  static properties = {
    label: { type: String },
    selected: { type: String },
    placeholder: { type: String },
    options: { type: Array },
    isOpen: { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.placeholder = "Select an option";
    this.options = [];
    this.isOpen = false;
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.handleDocumentClick);
    window.addEventListener('scroll', this.handleScroll, true);
    window.addEventListener('resize', this.handleResize);
    adoptMDIStyles(this.shadowRoot);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handleDocumentClick);
    window.removeEventListener('scroll', this.handleScroll, true);
    window.removeEventListener('resize', this.handleResize);
  }

  handleDocumentClick(e) {
    // Close dropdown if clicking outside
    if (!e.composedPath().includes(this)) {
      this.isOpen = false;
    }
  }

  handleScroll() {
    // Reposition dropdown on scroll
    if (this.isOpen) {
      this.requestUpdate();
    }
  }

  handleResize() {
    // Reposition dropdown on resize
    if (this.isOpen) {
      this.requestUpdate();
    }
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
        position: relative;
      }

      label {
        font-size: var(--font-size-sm, 14px);
        color: var(--text-color, #333333);
        font-weight: 500;
      }

      .select-trigger {
        width: 100%;
        height: var(--input-height);
        padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: var(--border-radius, 8px);
        font-size: var(--font-size-md, 16px);
        background-color: var(--input-background, #ffffff);
        color: var(--text-color, #333333);
        font-family: var(--font-family, sans-serif);
        cursor: pointer;
        transition: border-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
        gap: var(--spacing-sm, 8px);
      }

      .select-trigger .label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-transform: capitalize;
      }

      .select-trigger:hover {
        border-color: var(--primary-color, #0066cc);
      }

      .select-trigger.open {
        border-color: var(--primary-color, #0066cc);
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }

      .select-trigger .chevron {
        flex-shrink: 0;
        transition: transform 0.2s;
        font-size: 24px;
        display: flex;
        align-items: center;
      }

      .select-trigger.open .chevron {
        transform: rotate(180deg);
      }

      .select-dropdown {
        position: fixed;
        background-color: var(--input-background, #ffffff);
        border: 1px solid var(--primary-color, #0066cc);
        border-top: none;
        border-bottom-left-radius: var(--border-radius, 8px);
        border-bottom-right-radius: var(--border-radius, 8px);
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
      }

      .select-option {
        padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
        cursor: pointer;
        transition: background-color 0.15s;
        color: var(--text-color, #333333);
        font-size: var(--font-size-md, 16px);
        text-transform: capitalize;
      }

      .select-option:hover {
        background-color: var(--hover-bg, rgba(0, 102, 204, 0.1));
      }

      .select-option.selected {
        background-color: var(--primary-color, #0066cc);
        color: #ffffff;
      }

      .select-option.selected:hover {
        background-color: var(--primary-color, #0066cc);
      }
    `,
  ];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option) {
    this.selected = option.value;
    this.isOpen = false;
    dispatchEvent(this, "change", { value: option.value });
  }

  getSelectedLabel() {
    const selectedOption = this.options.find(opt => opt.value === this.selected);
    return selectedOption ? selectedOption.label : this.placeholder;
  }

  getDropdownPosition() {
    const trigger = this.shadowRoot.querySelector('.select-trigger');
    if (!trigger) return { top: 0, left: 0, width: 0 };

    const rect = trigger.getBoundingClientRect();
    return {
      top: rect.bottom,
      left: rect.left,
      width: rect.width
    };
  }

  render() {
    const dropdownPos = this.isOpen ? this.getDropdownPosition() : { top: 0, left: 0, width: 0 };

    return html`
      <div class="select-container">
        ${this.label ? html`<label>${this.label}</label>` : ""}
        <div
          class="select-trigger ${this.isOpen ? 'open' : ''}"
          @click=${this.toggleDropdown}
        >
          <span class="label">${this.getSelectedLabel()}</span>
          <i class="mdi mdi-chevron-down chevron"></i>
        </div>
        ${this.isOpen ? html`
          <div
            class="select-dropdown"
            style="top: ${dropdownPos.top}px; left: ${dropdownPos.left}px; width: ${dropdownPos.width}px;"
          >
            ${this.options?.map(
              (option) => html`
                <div
                  class="select-option ${option.value === this.selected ? 'selected' : ''}"
                  @click=${() => this.selectOption(option)}
                >
                  ${option.label}
                </div>
              `,
            )}
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define("custom-select", CustomSelect);

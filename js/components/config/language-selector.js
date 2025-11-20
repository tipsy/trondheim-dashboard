import { BaseWidget } from "../common/base-widget.js";
import { html, css } from "lit";
import { dispatchEvent } from "../../utils/event-helpers.js";
import { getLocale } from "../../utils/localization.js";
import "../common/custom-select.js";

class LanguageSelector extends BaseWidget {
  static properties = {
    ...BaseWidget.properties,
    selectedLocale: { type: String, state: true },
  };

  constructor() {
    super();
    this.title = "Language";
    this.icon = "mdi-translate";
    this.compactHeader = true;
    this.selectedLocale = getLocale();
  }

  get localeOptions() {
    return [
      { value: "en", label: "English" },
      { value: "no", label: "Norsk" },
    ];
  }

  static styles = [
    ...BaseWidget.styles,
    css`
      /* No additional styles needed - BaseWidget provides the container */
    `,
  ];

  handleLocaleChange(e) {
    this.selectedLocale = e.detail.value;
    console.log('[LanguageSelector] Locale changed to:', this.selectedLocale);
    dispatchEvent(this, "locale-changed", { locale: this.selectedLocale });
  }

  renderContent() {
    return html`
      <custom-select
        .options=${this.localeOptions}
        .selected=${this.selectedLocale}
        @change=${this.handleLocaleChange}
      >
      </custom-select>
    `;
  }
}

customElements.define("language-selector", LanguageSelector);


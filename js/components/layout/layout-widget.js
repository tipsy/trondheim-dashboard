import { html, css } from 'lit';
import { t } from '../../utils/localization.js';
import { BaseWidget } from '../common/base-widget.js';
import '../common/custom-slider.js';
import storage from '../../utils/storage.js';
import { DEFAULT_LAYOUT, MAX_WIDGETS_PER_COLUMN, STEP, MIN_WIDTH } from '../../utils/layout-utils.js';

class LayoutWidget extends BaseWidget {
  static properties = {
    layout: { type: Object },
  };

  constructor() {
    super();
    this.title = 'Layout';
    this.icon = 'mdi-view-grid';
    this.layout = DEFAULT_LAYOUT;
    this._dragging = null;
  }

  static styles = [
    ...BaseWidget.styles,
    css`
      :host { display: block; grid-column: 1 / -1; width: 100%; }

      /* Override BaseWidget content padding */
      #content {
        padding: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
      }

      /* Single container with 4 columns separated by borders */
      .layout-container {
        display: flex;
        gap: 0;
        background: var(--card-background);
        border-radius: 8px;
      }

      .column {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-right: 8px;
        margin-right: 8px;
      }

      .column:last-child {
        margin-right: 0;
        padding-right: 0;
      }

      .column.disabled {
        opacity: 0.35;
      }

      /* Column header with slider and eye */
      .column-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: var(--alt-background);
        border: 1px solid var(--border-color);
        border-radius: 6px;
      }

      .pct {
        margin-left: 6px;
        min-width: 40px;
        text-align: left;
        color: var(--text-color);
        font-size: 0.9rem;
        font-weight: 500;
      }

      .slider {
        flex: 1;
      }

      .eye-btn {
        background: transparent;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        border-radius: 4px;
        transition: background-color 0.2s, color 0.2s;
      }

      .eye-btn:hover {
        background: var(--hover-bg);
        color: var(--primary-color);
      }

      .eye-btn i.mdi {
        font-size: 1.5rem;
        line-height: 1;
      }

      /* Widget slots */
      .slot-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        background: var(--alt-background);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        min-height: 42px;
        transition: background-color 0.2s, border-color 0.2s;
      }

      .slot-item.draggable {
        cursor: grab;
      }

      .slot-item.draggable:hover {
        background: var(--hover-bg);
        border-color: var(--primary-color);
      }

      .slot-item.hidden-widget {
        opacity: 0.35;
      }

      .slot-item.empty {
        background: transparent;
        border: 2px dashed var(--border-color);
        color: var(--text-light);
        font-size: 0.85rem;
        justify-content: center;
      }

      .drag-handle {
        margin-right: 8px;
        cursor: grab;
        color: var(--text-light);
      }

      .widget-label {
        flex: 1;
        color: var(--text-color);
      }
    `,
  ];

  // Render header actions into BaseWidget header
  renderHeaderActions() {
    return html`
      <div style="display:flex;gap:4px;align-items:center">
        <secondary-button dense @click=${this.resetLayout}>${t("Reset")}</secondary-button>
        <secondary-button dense @click=${this.closeEditor}>${t("Close")}</secondary-button>
      </div>
    `;
  }

  closeEditor() {
    this.dispatchEvent(new CustomEvent('layout-editor-close', { bubbles: true, composed: true }));
  }



  // Render editor content inside the widget
  renderContent() {
    const cols = this.layout.columns;
    return html`
      <div class="layout-container" @dragover=${this.onColumnsDragOver} @drop=${this.onColumnsDrop}>
        ${cols.map((col, colIndex) => html`
          <div class="column ${col.enabled ? '' : 'disabled'}" data-col-index="${colIndex}">
            <!-- Column header: pct | slider | eye -->
            <div class="column-header">
              <div class="pct">${col.enabled ? col.width + '%' : ((col.previousWidth || col.width) + '%')}</div>
              <custom-slider
                class="slider"
                .min=${MIN_WIDTH}
                .max=${100}
                .step=${STEP}
                .value=${col.enabled ? col.width : (col.previousWidth || col.width)}
                ?disabled=${!col.enabled}
                @input=${(e) => this.onSliderInput(colIndex, e)}
              ></custom-slider>
              <button
                class="eye-btn"
                @click=${() => this.toggleColumnEnabled(colIndex)}
                title="Toggle column"
              >
                <i class="mdi ${col.enabled ? 'mdi-eye' : 'mdi-eye-off'}"></i>
              </button>
            </div>

            <!-- Widget slots (max 2) -->
            ${Array.from({length: MAX_WIDGETS_PER_COLUMN}).map((_, slotIndex) => {
              const widgetId = col.widgets[slotIndex];
              if (!widgetId) {
                return html`
                  <div
                    class="slot-item empty"
                    data-col-index="${colIndex}"
                    data-slot-index="${slotIndex}"
                    @dragover=${this.onDragOver}
                    @drop=${this.onDrop}
                  >
                    ${t("Drop here")}
                  </div>
                `;
              }

              const hidden = this.isWidgetHidden(widgetId);
              return html`
                <div
                  class="slot-item draggable ${hidden ? 'hidden-widget' : ''}"
                  draggable="true"
                  data-widget-id="${widgetId}"
                  data-col-index="${colIndex}"
                  data-slot-index="${slotIndex}"
                  @dragstart=${this.onDragStart}
                  @dragend=${this.onDragEnd}
                  @dragover=${this.onDragOver}
                  @drop=${this.onDrop}
                >
                  <div style="display:flex;align-items:center;">
                    <span class="drag-handle">⋮⋮</span>
                    <span class="widget-label">${this.humanizeWidgetId(widgetId)}</span>
                  </div>
                  <button
                    class="eye-btn"
                    @click=${(e) => { e.stopPropagation(); this.toggleWidgetHidden(widgetId); }}
                    title="Toggle visibility"
                  >
                    <i class="mdi ${hidden ? 'mdi-eye-off' : 'mdi-eye'}"></i>
                  </button>
                </div>
              `;
            })}
          </div>
        `)}
      </div>
    `;
  }

  humanizeWidgetId(id) {
    // friendly label mapping for known widgets
    const map = {
      'bus-widget': t('Bus Departures'),
      'events-widget': t('Events'),
      'weather-right-now': t('Weather Now'),
      'weather-today': t('Weather Today'),
      'energy-widget': t('Energy Prices'),
      'trash-widget': t('Trash Collection'),
      'police-widget': t('Police Log'),
      'nrk-widget': t('News'),
    };
    return map[id] || id;
  }

  // Layout helpers
  isWidgetHidden(id) {
    const map = this.layout.hiddenWidgets || {};
    return !!map[id];
  }

  toggleWidgetHidden(id) {
    const map = Object.assign({}, this.layout.hiddenWidgets || {});
    map[id] = !map[id];

    // Check if all widgets in any column are now hidden/shown, and disable/enable that column accordingly
    const cols = this.layout.columns.map(c => ({ ...c }));
    cols.forEach((col, colIndex) => {
      if (col.widgets.length === 0) return; // Skip empty columns

      const allWidgetsHidden = col.widgets.every(widgetId => map[widgetId]);
      const anyWidgetVisible = col.widgets.some(widgetId => !map[widgetId]);

      if (allWidgetsHidden && col.enabled) {
        // All widgets in this column are hidden, disable the column
        col.previousWidth = col.width;
        col.enabled = false;
        col.width = 0;
      } else if (anyWidgetVisible && !col.enabled) {
        // At least one widget is visible, enable the column
        col.enabled = true;
        col.width = col.previousWidth || Math.floor(100 / cols.filter(c=>c.enabled).length);
      }
    });

    this.layout = { ...this.layout, hiddenWidgets: map, columns: cols };
    this.saveAndNotify();
  }

  toggleColumnEnabled(index) {
    const cols = this.layout.columns.map(c => ({ ...c }));
    const col = cols[index];
    if (col.enabled) {
      col.previousWidth = col.width;
      col.enabled = false;
      col.width = 0;
    } else {
      col.enabled = true;
      col.width = col.previousWidth || Math.floor(100 / cols.filter(c=>c.enabled).length);
    }
    this.layout = { ...this.layout, columns: cols };
    this.saveAndNotify();
  }

  onSliderInput(index, e) {
    // Handle both native input events and custom-slider events
    const val = e.detail ? parseInt(e.detail.value, 10) : parseInt(e.target.value, 10);
    const cols = this.layout.columns.map((c, i) => {
      if (i === index) {
        return { ...c, width: val };
      }
      return { ...c };
    });
    this.layout = { ...this.layout, columns: cols };
    this.saveAndNotify();
  }

  // Drag and drop handlers operate on the draft
  onDragStart(e) {
    const target = e.currentTarget;
    const widgetId = target.getAttribute('data-widget-id');
    const colIndex = parseInt(target.getAttribute('data-col-index'), 10);
    const slotIndex = parseInt(target.getAttribute('data-slot-index'), 10);
    const payloadObj = { widgetId, from: colIndex, slot: slotIndex };
    const payload = JSON.stringify(payloadObj);
    try {
      e.dataTransfer.setData('application/json', payload);
      e.dataTransfer.setData('text/plain', payload);
      // set a drag image so some browsers keep the drag active across targets
      try { e.dataTransfer.setDragImage(target, 10, 10); } catch (_) { /* ignore */ }
    } catch (_) {
      // ignore failures setting dataTransfer
    }
    // store on instance as a reliable fallback
    this._dragging = payloadObj;
    e.dataTransfer.effectAllowed = 'move';
    target.classList.add('dragging');
  }

  onDragEnd(e) {
    const target = e.currentTarget;
    target.classList.remove('dragging');
    // clear dragging fallback
    this._dragging = null;
  }

  onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    const colIndexAttr = el.getAttribute('data-col-index');
    const colIndex = colIndexAttr !== null ? parseInt(colIndexAttr, 10) : NaN;
    if (Number.isNaN(colIndex)) {
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
      return;
    }
    const column = this.layout.columns[colIndex];
    if (!column.enabled) {
      // disallow drops into disabled column
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
      return;
    }

    // We allow drops onto any enabled column (layout handling will manage insertion or swaps).
    // Still attempt to read payload for potential future rules, with fallback to this._dragging.
    // attempt to read payload to avoid potential cross-origin issues; ignore parse errors
    try { e.dataTransfer.getData('text/plain'); } catch (_) { /* ignore */ }
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  }

  onDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    // get payload, fallback to instance fallback
    let payload = null;
    try { payload = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain'); } catch(_) { payload = null; }
    let data = null;
    if (payload) {
      try { data = JSON.parse(payload); } catch(_) { data = null; }
    }
    if (!data && this._dragging) data = this._dragging;
    if (!data) return;

    // Determine target col and slot (if any)
    const toColIndex = parseInt(e.currentTarget.getAttribute('data-col-index'), 10);
    let toSlotIndex = parseInt(e.currentTarget.getAttribute('data-slot-index'), 10);

    // Use performDrop for consistent logic
    this.performDrop(data, toColIndex, toSlotIndex);
  }

  // Helper to save and notify immediately
  saveAndNotify() {
    storage.saveLayout(this.layout);
    // dispatch event so dashboard can pick up the new layout
    this.dispatchEvent(new CustomEvent('layout-changed', { detail: { layout: this.layout }, bubbles: true, composed: true }));
  }

  // Reset to default layout
  resetLayout() {
    this.layout = JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
    this.saveAndNotify();
  }

  // Dragover handler on the columns container: identify the column under the pointer and allow drop if enabled
  onColumnsDragOver(e) {
    e.preventDefault();
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const colEl = el.closest ? el.closest('.column') : null;
    if (!colEl) {
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
      return;
    }
    const colIndex = parseInt(colEl.getAttribute('data-col-index'), 10);
    const column = this.layout.columns[colIndex];
    if (!column || !column.enabled) {
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
      return;
    }
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  }

  // Drop handler on the columns container: compute column/slot from pointer and perform drop
  onColumnsDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const colEl = el.closest ? el.closest('.column') : null;
    if (!colEl) return;
    const colIndex = parseInt(colEl.getAttribute('data-col-index'), 10);
    // If we dropped on a slot-empty element, try to get its slot index
    const slotEl = el.closest ? el.closest('[data-slot-index]') : null;
    let slotIndex = -1;
    if (slotEl) slotIndex = parseInt(slotEl.getAttribute('data-slot-index'), 10);

    // get payload (same as onDrop)
    let payload = null;
    try { payload = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain'); } catch(_) { payload = null; }
    let data = null;
    if (payload) {
      try { data = JSON.parse(payload); } catch(_) { data = null; }
    }
    if (!data && this._dragging) data = this._dragging;
    if (!data) return;

    this.performDrop(data, colIndex, slotIndex);
  }

  // Core drop logic extracted so it can be called from onDrop and onColumnsDrop
  performDrop(data, toColIndex, toSlotIndex) {
    if (toColIndex == null || isNaN(toColIndex)) return;
    const widgetId = data.widgetId;
    const fromColIndex = data.from;
    const fromSlotIndex = data.slot;

    // Prevent dropping into disabled column
    const toCol = this.layout.columns[toColIndex];
    if (!toCol || !toCol.enabled) return;

    // Prepare new columns copy
    const cols = this.layout.columns.map(c => ({ ...c, widgets: [...(c.widgets || [])] }));

    // If toSlotIndex is not a valid number or negative, append to end
    const toWidgets = cols[toColIndex].widgets;
    if (!Number.isInteger(toSlotIndex) || toSlotIndex < 0) {
      toSlotIndex = toWidgets.length;
    }

    // Check if we're dropping on the same position (no-op)
    if (fromColIndex === toColIndex && fromSlotIndex === toSlotIndex) {
      return;
    }

    // Get the widget at the target position (if any)
    const targetWidget = toWidgets[toSlotIndex];

    // Remove dragged widget from source
    const fromWidgets = cols[fromColIndex].widgets;
    fromWidgets.splice(fromSlotIndex, 1);

    if (targetWidget) {
      // Swap: put target widget where dragged widget was
      fromWidgets.splice(fromSlotIndex, 0, targetWidget);
      // Put dragged widget where target widget was
      toWidgets.splice(toSlotIndex, 1, widgetId);
    } else {
      // Dropping into empty slot - just insert
      toWidgets.splice(toSlotIndex, 0, widgetId);
    }

    // Update layout and save immediately
    this.layout = { ...this.layout, columns: cols };
    this._dragging = null;
    this.saveAndNotify();
  }

}

customElements.define('layout-widget', LayoutWidget);

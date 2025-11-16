// Layout utilities for dashboard column widths and validation
// Rules enforced:
// - 4 columns
// - up to 2 widgets per column
// - widths are integers in percent, multiples of 5
// - min width for enabled columns is 15
// - disabled columns have width 0 but retain assigned widgets
// - sum of enabled column widths must be 100

export const DEFAULT_LAYOUT = {
  version: 1,
  columns: [
    { id: 'col-1', enabled: true, width: 25, widgets: ['bus-widget', 'events-widget'] },
    { id: 'col-2', enabled: true, width: 20, widgets: ['weather-right-now', 'weather-today'] },
    { id: 'col-3', enabled: true, width: 30, widgets: ['energy-widget', 'trash-widget'] },
    { id: 'col-4', enabled: true, width: 25, widgets: ['police-widget', 'nrk-widget'] },
  ],
};

export const STEP = 5;
export const MIN_WIDTH = 15;
export const MAX_COLUMNS = 4;
export const MAX_WIDGETS_PER_COLUMN = 2;

function clampToStep(value) {
  return Math.round(value / STEP) * STEP;
}

function sumEnabledWidths(columns) {
  return columns.filter(c => c.enabled).reduce((sum, c) => sum + (c.width || 0), 0);
}

function enabledColumns(columns) {
  return columns.filter(c => c.enabled);
}

// Distribute delta across other enabled columns while respecting min width and step.
// columns: array copy will be made inside. targetIndex: index of column being changed.
export function redistributeWidths(columns, targetIndex, desiredWidth) {
  const cols = columns.map(c => ({ ...c }));
  if (targetIndex < 0 || targetIndex >= cols.length) return cols;

  const target = cols[targetIndex];
  if (!target.enabled) {
    // If target is disabled, ignore width changes (must enable first)
    return cols;
  }

  desiredWidth = clampToStep(desiredWidth);
  desiredWidth = Math.max(desiredWidth, MIN_WIDTH);

  const oldWidth = target.width || 0;
  const diff = desiredWidth - oldWidth;
  if (diff === 0) return cols;

  // Work on other enabled columns
  const othersIdx = cols
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => i !== targetIndex && c.enabled)
    .map(({ i }) => i);

  // If no others, target must be 100
  if (othersIdx.length === 0) {
    target.width = 100;
    return cols;
  }

  // Total available to take/give from others
  const othersTotal = othersIdx.reduce((s, i) => s + (cols[i].width || 0), 0);

  // When increasing target, we need to reduce others by diff
  // When decreasing target, we will distribute extra to others proportionally

  if (diff > 0) {
    // Ensure others can provide diff without going below MIN_WIDTH
    const minOthersTotal = othersIdx.reduce((s, i) => s + MIN_WIDTH, 0);
    const maxReducible = othersTotal - minOthersTotal;
    const actualDiff = Math.min(diff, maxReducible);
    // Apply reductions proportionally to their current widths
    let remaining = actualDiff;
    // Sort others by width descending to reduce larger columns first
    const sorted = othersIdx.slice().sort((a, b) => cols[b].width - cols[a].width);
    for (const i of sorted) {
      if (remaining <= 0) break;
      const col = cols[i];
      const maxReduce = col.width - MIN_WIDTH;
      const take = Math.min(Math.round((col.width / othersTotal) * actualDiff), maxReduce, remaining);
      const adjust = clampToStep(take);
      col.width = Math.max(MIN_WIDTH, col.width - adjust);
      remaining -= adjust;
    }
    // If still remaining due to rounding, do a second pass greedy
    if (remaining > 0) {
      for (const i of sorted) {
        if (remaining <= 0) break;
        const col = cols[i];
        const maxReduce = col.width - MIN_WIDTH;
        const take = Math.min(maxReduce, remaining);
        const adjust = clampToStep(take);
        col.width = Math.max(MIN_WIDTH, col.width - adjust);
        remaining -= adjust;
      }
    }
    // Finally set target width to oldWidth + (actualDiff - remaining)
    const applied = actualDiff - remaining;
    target.width = clampToStep(oldWidth + applied);
  } else {
    // diff < 0, we free up width to distribute to others
    const freed = Math.abs(diff);
    // Distribute proportionally to current widths
    const totalForProportion = othersIdx.reduce((s, i) => s + cols[i].width, 0) || 1;
    let remaining = freed;
    for (const i of othersIdx) {
      const col = cols[i];
      const add = Math.min(clampToStep(Math.round((col.width / totalForProportion) * freed)), 100 - col.width);
      const adjust = clampToStep(add);
      col.width = Math.min(100, col.width + adjust);
      remaining -= adjust;
    }
    // If still remaining, give it to the first columns that can accept more
    if (remaining > 0) {
      for (const i of othersIdx) {
        if (remaining <= 0) break;
        const col = cols[i];
        const can = 100 - col.width;
        const take = Math.min(can, remaining);
        const adjust = clampToStep(take);
        col.width = Math.min(100, col.width + adjust);
        remaining -= adjust;
      }
    }
    target.width = clampToStep(Math.max(MIN_WIDTH, desiredWidth));
  }

  // After adjustments, ensure all widths are multiples of STEP and enabled sum to 100
  // Fix rounding issues by adjusting the largest enabled column
  let enabledCols = cols.filter(c => c.enabled);
  let total = enabledCols.reduce((s, c) => s + (c.width || 0), 0);
  const diffTotal = 100 - total;
  if (diffTotal !== 0) {
    // find largest enabled column and apply remaining diff (clamped to step)
    const largest = enabledCols.reduce((max, c) => (c.width > max.width ? c : max), enabledCols[0]);
    largest.width = clampToStep((largest.width || 0) + diffTotal);
  }

  // Final normalization: ensure min width respected
  enabledCols = cols.filter(c => c.enabled);
  enabledCols.forEach(c => {
    if (c.width < MIN_WIDTH) c.width = MIN_WIDTH;
  });

  // Re-balance if enforcement above changed totals
  total = cols.filter(c => c.enabled).reduce((s, c) => s + c.width, 0);
  if (total !== 100) {
    const adjustable = cols.filter(c => c.enabled && c.width > MIN_WIDTH);
    let remaining = total - 100;
    if (remaining > 0) {
      // need to decrease some
      for (const c of adjustable) {
        if (remaining <= 0) break;
        const can = c.width - MIN_WIDTH;
        const take = Math.min(can, remaining);
        const adjust = clampToStep(take);
        c.width -= adjust;
        remaining -= adjust;
      }
    } else if (remaining < 0) {
      // need to increase some
      remaining = Math.abs(remaining);
      for (const c of adjustable) {
        if (remaining <= 0) break;
        const can = 100 - c.width;
        const take = Math.min(can, remaining);
        const adjust = clampToStep(take);
        c.width += adjust;
        remaining -= adjust;
      }
    }
  }

  return cols;
}

export function normalizeLayout(layout) {
  if (!layout || !Array.isArray(layout.columns) || layout.columns.length !== MAX_COLUMNS) {
    return DEFAULT_LAYOUT;
  }

  const cols = layout.columns.map((c, i) => ({
    id: c.id || `col-${i + 1}`,
    enabled: typeof c.enabled === 'boolean' ? c.enabled : true,
    width: clampToStep(c.width || 0),
    widgets: Array.isArray(c.widgets) ? c.widgets.slice(0, MAX_WIDGETS_PER_COLUMN) : [],
  }));

  // Disabled columns should have width 0
  cols.forEach(c => { if (!c.enabled) c.width = 0; });

  // Ensure enabled widths sum to 100; if not, normalize equally
  const enabled = cols.filter(c => c.enabled);
  const total = enabled.reduce((s, c) => s + c.width, 0);
  if (enabled.length === 0) {
    // fall back to defaults
    return DEFAULT_LAYOUT;
  }

  if (total === 0) {
    // assign equal widths among enabled cols but respect MIN_WIDTH
    const per = Math.max(MIN_WIDTH, clampToStep(Math.floor(100 / enabled.length / STEP) * STEP));
    enabled.forEach((c, idx) => c.width = per);
    // fix remaining due to rounding
    let sum = enabled.reduce((s, c) => s + c.width, 0);
    let i = 0;
    while (sum < 100) {
      enabled[i % enabled.length].width += STEP;
      sum += STEP;
      i++;
    }
  } else if (total !== 100) {
    // scale proportionally
    let rem = 100;
    enabled.forEach((c, idx) => {
      if (idx === enabled.length - 1) {
        c.width = rem; // assign rest to last to avoid rounding gaps
      } else {
        const w = clampToStep(Math.max(MIN_WIDTH, Math.round((c.width / total) * 100)));
        c.width = w;
        rem -= w;
      }
    });
  }

  return { version: 1, columns: cols };
}


# Lit Optimization Work List - Vanilla WC → Lit Rewrite Review

## Summary

Analyzed all 29 component files in the codebase and identified opportunities to use Lit features to simplify and clean up the code (reactive > imperative).

---

## 🔴 High Priority - Major Simplification Opportunities

### Widgets using innerHTML pattern (should convert to Lit templates) ✅ ALL COMPLETED!

1. ~~**bus-widget.js**~~ - ✅ **COMPLETED** - Converted to Lit templates
2. ~~**weather-right-now.js**~~ - ✅ **COMPLETED** - Converted to Lit templates
3. ~~**weather-today.js**~~ - ✅ **COMPLETED** - Converted to Lit templates
4. ~~**energy-widget.js**~~ - ✅ **COMPLETED** - Converted to Lit templates
5. ~~**trash-widget.js**~~ - ✅ **COMPLETED** - Converted to Lit templates
6. ~~**events-widget.js**~~ - ✅ **COMPLETED** - Converted to Lit templates
7. ~~**police-widget.js**~~ - ✅ **COMPLETED** - Converted to Lit templates

🎉 **All 7 widgets have been converted from innerHTML to Lit templates!**

### Benefits of converting these:
- ✅ Automatic HTML escaping (remove manual escapeAttr functions)
- ✅ Reactive re-rendering when data changes
- ✅ Cleaner code with `.map()` instead of string concatenation
- ✅ No manual DOM manipulation with createElement/appendChild
- ✅ Static styles instead of manual style injection

---

## 🟡 Medium Priority - Code Quality Improvements

### Components with imperative patterns:

1. **dashboard.js** - Uses querySelector + imperative updateLocation calls (could use @query decorator)
2. **address-input.js** - Manual event listener management, could use @state for internal state
3. **theme-selector.js** - Manual event listener setup in firstUpdated (could use @change in template)
4. **custom-select.js** - Manual querySelector for value getter (could use @query)
5. **input-field.js** - Manual querySelector in focus() method (could use @query)

### Benefits:
- ✅ Less boilerplate with @query decorator
- ✅ Better state management with @state
- ✅ Declarative event binding in templates

---

## 🟢 Low Priority - Minor Optimizations

### Already well-implemented (minor review):

1. **nrk-widget.js** - Already uses Lit templates well ✨
2. **Button components** - Generally good, check for consistency
3. **Row components** - Check for computed property opportunities
4. **Weather sub-components** - Review property reactivity
5. **loading-spinner.js & error-message.js** - Simple, likely optimal

---

## 📊 Key Patterns to Replace

| Current Pattern | Lit Pattern | Files Affected |
|----------------|-------------|----------------|
| `innerHTML = \`...\`` | `html\`...\`` | 7 widgets |
| `document.createElement()` | `html\`<component>\`` | 5 widgets |
| Manual HTML escaping | Automatic escaping | 2 widgets |
| `querySelector()` | `@query` decorator | 5 components |
| Manual style injection | `static styles` | 2 widgets |
| String concatenation | `.map()` in templates | 7 widgets |
| `this._usesInnerHTML = true` | Remove (use renderContent) | 7 widgets |

---

## 🎯 Recommended Approach

1. **Start with one widget** (e.g., police-widget.js - simplest innerHTML case)
2. **Convert to Lit template pattern** - see how it works
3. **Apply learnings to other widgets** in order of complexity
4. **Then tackle common components** (custom-select, input-field)
5. **Finally optimize dashboard.js** (uses all the components)

---

## 💡 Example Transformation

### Before (innerHTML pattern):
```javascript
renderMessages(messages) {
    const content = this.getContentElement();
    const escapeAttr = (s) => String(s).replace(/&/g, '&amp;')...;
    const rowsHtml = messages.map(msg => {
        return `<widget-row title="${escapeAttr(msg.text)}"></widget-row>`;
    }).join('');
    content.innerHTML = `<div>${rowsHtml}</div>`;
}
```

### After (Lit template pattern):
```javascript
static properties = {
    messages: { type: Array, state: true }
};

renderContent() {
    return html`
        <div>
            ${this.messages.map(msg => html`
                <widget-row title="${msg.text}"></widget-row>
            `)}
        </div>
    `;
}
```

---

## 📋 Detailed Task Breakdown

### Task 1: Review and optimize dashboard.js
**Priority:** Medium  
**Issues:**
- Uses `querySelector()` to access child widgets
- Imperative `updateLocation()` calls on each widget
- Could use `@query` decorator for cleaner DOM access

**Opportunities:**
- Use `@query` or `@queryAll` decorators
- Consider reactive properties to trigger widget updates
- Review lifecycle methods for optimization

---

### Task 2: Review and optimize base-widget.js ✅ COMPLETED
**Priority:** High  
**Status:** ✅ DONE - Simplified by removing innerHTML support

**Changes made:**
- ✅ Removed `_usesInnerHTML` pattern completely
- ✅ Removed `updated()` lifecycle method that manually rendered innerHTML states
- ✅ Removed `getContentElement()` helper method
- ✅ Removed `afterRender()` hook (no longer needed)
- ✅ Simplified `render()` method - now only uses Lit templates
- ✅ All widgets now use consistent `renderContent()` pattern
- ✅ Cleaner, more maintainable code with ~40 lines removed

**Benefits:**
- Single rendering path - all widgets use Lit's reactive system
- No dual-mode complexity
- Better performance - Lit efficiently tracks all updates
- Easier to understand and maintain

---

### Task 3: Review and optimize address-input.js
**Priority:** Medium  
**Issues:**
- Manual event listener management
- Could use `@state` for internal state properties
- Some imperative DOM patterns

**Opportunities:**
- Use `@state` for `showSuggestions`, `errorMessage`, etc.
- Declarative event binding in templates
- Review property reactivity

---

### Task 4: Review and optimize theme-selector.js ✅ COMPLETED
**Priority:** Medium  
**Status:** ✅ DONE - Simplified with declarative event binding

**Changes made:**
- ✅ Removed manual event listener setup in `firstUpdated()`
- ✅ Removed `querySelector()` to access custom-select
- ✅ Added declarative `@change=${this.handleThemeChange}` in template
- ✅ Simplified `handleThemeChange()` to receive event directly
- ✅ Cleaner, more declarative code

**Benefits:**
- Declarative event binding - easier to see event flow in template
- No manual DOM queries needed
- Follows Lit best practices
- More maintainable

---

### Task 5: Review and optimize bus-widget.js ✅ COMPLETED
**Priority:** High (most complex widget)  
**Status:** ✅ DONE - Converted to Lit templates with reactive properties

**Changes made:**
- ✅ Removed manual `createElement()` and `appendChild()` calls
- ✅ Removed imperative DOM manipulation in `renderDepartures()`
- ✅ Moved inline `<style>` to `static styles` using Lit's `css`
- ✅ Added reactive properties:
  - `departures` - array of departure objects
  - `availableStops` - array of nearby bus stops
  - `selectedStopId` - currently selected stop ID
- ✅ Implemented `renderContent()` with declarative Lit templates
- ✅ Refactored `renderDepartures()` to `processDepartures()` - now sets reactive state
- ✅ Bus rows now rendered with `.map()` template
- ✅ Used `updated()` lifecycle to sync selector state
- ✅ Fully reactive - stop/departure updates trigger automatic re-rendering
- ✅ Interval cleanup works with Lit lifecycle (disconnectedCallback)

---

### Task 6: Review and optimize weather-right-now.js ✅ COMPLETED
**Priority:** High  
**Status:** ✅ DONE - Converted to Lit templates with reactive properties

**Changes made:**
- ✅ Removed `this._usesInnerHTML = true`
- ✅ Removed manual `createElement()` for weather-hour components
- ✅ Removed `afterRender()` style injection
- ✅ Moved inline styles to `static styles` using Lit's `css`
- ✅ Added reactive properties:
  - `currentWeather` - current weather data object
  - `hourlyForecast` - array of next 4 hours
- ✅ Implemented `renderContent()` with declarative Lit templates
- ✅ Refactored `renderWeather()` to `processWeather()` - now sets reactive state
- ✅ Weather hours now rendered with `.map()` template
- ✅ Fully reactive - weather updates trigger automatic re-rendering

---

### Task 7: Review and optimize weather-today.js ✅ COMPLETED
**Priority:** High  
**Status:** ✅ DONE - Converted to Lit templates with reactive properties

**Changes made:**
- ✅ Removed `this._usesInnerHTML = true`
- ✅ Removed manual style injection in `afterRender()`
- ✅ Moved inline styles to `static styles` using Lit's `css`
- ✅ Added reactive properties:
  - `todayData` - today's weather summary (min/max temps, symbol, precipitation)
  - `sunData` - sunrise/sunset information
- ✅ Implemented `renderContent()` with declarative Lit templates
- ✅ Refactored `renderWeather()` to `processWeather()` - now sets reactive state
- ✅ Fully reactive - weather updates trigger automatic re-rendering
- ✅ Conditional rendering for sun data using Lit's `html` conditionals

---

### Task 8: Review and optimize energy-widget.js ✅ COMPLETED
**Priority:** High  
**Status:** ✅ DONE - Converted to Lit templates with reactive properties

**Changes made:**
- ✅ Removed `this._usesInnerHTML = true`
- ✅ Converted innerHTML with template strings to `html` template
- ✅ Moved inline `<style>` to `static styles` using Lit's `css`
- ✅ Added reactive properties:
  - `currentPrice` - current hour's price object
  - `nextHours` - processed array of next 4 hours with trends
  - `priceArea` - energy price area (NO3, etc.)
- ✅ Implemented `renderContent()` with declarative Lit templates
- ✅ Refactored helper methods:
  - `processPrices()` - processes raw price data into reactive state
  - `fetchNextDayPrices()` - fetches next day if needed
  - `calculateNextHours()` - calculates trends and formats hours
- ✅ Fully reactive - price updates trigger automatic re-rendering
- ✅ Cleaner separation between data processing and rendering

---

### Task 9: Review and optimize trash-widget.js ✅ COMPLETED
**Priority:** High  
**Status:** ✅ DONE - Converted to Lit templates with reactive properties

**Changes made:**
- ✅ Removed `this._usesInnerHTML = true`
- ✅ Removed manual `createElement()` and `appendChild()` calls
- ✅ Removed manual style injection in `afterRender()`
- ✅ Moved inline styles to `static styles` using Lit's `css`
- ✅ Added reactive properties:
  - `collections` - array of upcoming collection items
  - `address` - current address string
- ✅ Implemented `renderContent()` with declarative Lit templates
- ✅ Refactored `renderSchedule()` to `processSchedule()` - now sets reactive state
- ✅ Collections are now rendered with `.map()` template
- ✅ Fully reactive - schedule updates trigger automatic re-rendering
- ✅ No more manual DOM manipulation

---

### Task 10: Review and optimize events-widget.js ✅ COMPLETED
**Priority:** High (uses innerHTML with manual HTML escaping)  
**Status:** ✅ DONE - Converted to Lit templates with reactive properties

**Changes made:**
- ✅ Removed `this._usesInnerHTML = true`
- ✅ Removed manual HTML escaping with `escapeAttr()` function
- ✅ Converted innerHTML to `html` template (auto-escaping!)
- ✅ Added reactive `events` and `selectedDate` properties with `state: true`
- ✅ Implemented `renderContent()` using `.map()` with Lit templates
- ✅ Moved inline styles to `static styles` using Lit's `css`
- ✅ Refactored helper functions to class methods:
  - `filterEventsByDate()` - filters events by selected date
  - `formatDate()` - formats date as "DD. Mon HH:MM"
  - `getEventDescription()` - builds venue + date description
  - `getEventUrl()` - generates trdevents.no URL
- ✅ Moved `setupDateSelector()` to `firstUpdated()` lifecycle
- ✅ Fully reactive - date changes trigger automatic re-filtering/re-rendering

---

### Task 11: Review and optimize police-widget.js ✅ COMPLETED
**Priority:** High (easiest innerHTML conversion)  
**Status:** ✅ DONE - Converted to Lit templates with reactive properties

**Changes made:**
- ✅ Removed `this._usesInnerHTML = true`
- ✅ Removed manual HTML escaping with `escapeAttr()` function
- ✅ Converted innerHTML to `html` template (auto-escaping!)
- ✅ Added reactive `messages` property with `state: true`
- ✅ Implemented `renderContent()` using `.map()` with Lit templates
- ✅ Moved `formatDate()` to class method for reuse
- ✅ Refactored inline helper functions to class methods:
  - `getLocation(msg)` - formats location from municipality/area
  - `getDescription(msg)` - builds full description string
  - `getThreadUrl(msg)` - generates politiet.no URL
- ✅ Simplified data flow - now fully reactive
- ✅ Cleaner, more testable code with separated concerns

---

### Task 12: Review and optimize nrk-widget.js
**Priority:** Low  
**Issues:**
- Already uses Lit templates well! ✨
- Minor: could review property declarations

**Opportunities:**
- Verify optimal use of `state: true`
- Check lifecycle methods
- This is a good reference for other widgets

---

### Task 13: Review and optimize custom-select.js
**Priority:** Medium  
**Issues:**
- Manual `querySelector()` in value getter/setter
- Could use `@query` decorator

**Opportunities:**
- Use `@query('select')` for element access
- Review property reactivity
- Simplify value getter/setter

---

### Task 14: Review and optimize input-field.js
**Priority:** Medium  
**Issues:**
- Manual `querySelector()` in `focus()` method

**Opportunities:**
- Use `@query('input')` for element access
- Review property binding patterns

---

### Task 15: Review and optimize button components
**Priority:** Low  
**Files:** base-button.js, primary-button.js, secondary-button.js, clear-button.js, refresh-button.js

**Opportunities:**
- Check for consistent patterns across all buttons
- Review property reactivity
- Verify event handling patterns

---

### Task 16: Review and optimize row components
**Priority:** Low  
**Files:** bus-row.js, trash-row.js, widget-row.js

**Opportunities:**
- Check for computed property opportunities
- Review reactive patterns
- Template optimization

---

### Task 17: Review and optimize weather sub-components
**Priority:** Low  
**Files:** weather-current.js, weather-hour.js, weather-detail.js

**Opportunities:**
- Review property reactivity
- Check template patterns
- Verify lifecycle usage

---

### Task 18: Review and optimize address-suggestion-item.js
**Priority:** Low  
**Issues:**
- Generally clean, minor review needed

**Opportunities:**
- Template optimization
- Property usage review

---

### Task 19: Review and optimize loading-spinner.js and error-message.js
**Priority:** Low  
**Issues:**
- Simple components, likely already optimal

**Opportunities:**
- Verify they're using Lit patterns optimally
- Check for any unnecessary complexity

---

## 🚀 Getting Started

**Recommended first task:** Task 11 - police-widget.js

This is the simplest innerHTML → Lit template conversion and will establish the pattern for the other 6 widgets.


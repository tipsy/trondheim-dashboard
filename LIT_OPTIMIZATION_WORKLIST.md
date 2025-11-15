# Lit Optimization Work List - Vanilla WC → Lit Rewrite Review

## Summary

Analyzed all 29 component files in the codebase and identified opportunities to use Lit features to simplify and clean up the code (reactive > imperative).

---

## 🔴 High Priority - Major Simplification Opportunities

### Widgets using innerHTML pattern (should convert to Lit templates)

1. **bus-widget.js** - Uses innerHTML + createElement, manual DOM manipulation, imperative event listeners
2. **weather-right-now.js** - Uses innerHTML + createElement for weather-hour components
3. **weather-today.js** - Uses innerHTML + manual style injection in afterRender()
4. **energy-widget.js** - Uses innerHTML with template strings (should use html``)
5. **trash-widget.js** - Uses innerHTML + createElement, manual style injection
6. **events-widget.js** - Uses innerHTML with manual HTML escaping (Lit auto-escapes!)
7. ~~**police-widget.js**~~ - ✅ **COMPLETED** - Converted to Lit templates

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

### Task 2: Review and optimize base-widget.js
**Priority:** High  
**Issues:**
- Complex `_usesInnerHTML` pattern to support both innerHTML and Lit templates
- Manual DOM access with `getElementById('content')`
- `updated()` lifecycle manually renders loading/error states for innerHTML widgets

**Opportunities:**
- Simplify by removing innerHTML support once all widgets are converted
- Use `@query` decorator for content element
- Clean up lifecycle methods

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

### Task 4: Review and optimize theme-selector.js
**Priority:** Medium  
**Issues:**
- Manual event listener setup in `firstUpdated()`
- `querySelector()` to access custom-select

**Opportunities:**
- Use `@change=${this.handleThemeChange}` directly in template
- Use `@query` decorator for select element access
- Simplify event handling

---

### Task 5: Review and optimize bus-widget.js
**Priority:** High  
**Issues:**
- Uses `this._usesInnerHTML = true`
- Manual `createElement()` and `appendChild()` for bus-row components
- Imperative DOM manipulation in `renderDepartures()`
- Manual interval cleanup

**Opportunities:**
- Convert to reactive properties for `departures` array
- Use `html` template with `.map()` for bus rows
- Use `renderContent()` instead of innerHTML
- Review interval cleanup patterns

---

### Task 6: Review and optimize weather-right-now.js
**Priority:** High  
**Issues:**
- Uses `this._usesInnerHTML = true`
- Manual `createElement()` for weather-hour components
- innerHTML for main content

**Opportunities:**
- Store forecast data in reactive property
- Use `html` template with `.map()` for hourly forecast
- Convert to `renderContent()` pattern

---

### Task 7: Review and optimize weather-today.js
**Priority:** High  
**Issues:**
- Uses `this._usesInnerHTML = true`
- Manual style injection in `afterRender()`
- innerHTML with template strings

**Opportunities:**
- Move styles to `static styles`
- Use `html` template for rendering
- Store weather data in reactive properties

---

### Task 8: Review and optimize energy-widget.js
**Priority:** High  
**Issues:**
- Uses `this._usesInnerHTML = true`
- innerHTML with template strings
- Manual HTML string concatenation with `.map().join('')`

**Opportunities:**
- Convert to `html` template with `.map()`
- Use reactive properties for price data
- Remove manual string concatenation

---

### Task 9: Review and optimize trash-widget.js
**Priority:** High  
**Issues:**
- Uses `this._usesInnerHTML = true`
- Manual `createElement()` and `appendChild()` for trash-row components
- Manual style injection in `afterRender()`

**Opportunities:**
- Store schedule in reactive property
- Use `html` template with `.map()`
- Move styles to `static styles`

---

### Task 10: Review and optimize events-widget.js
**Priority:** High  
**Issues:**
- Uses `this._usesInnerHTML = true`
- Manual HTML escaping with `escapeAttr()` function
- innerHTML with string concatenation
- Manual event listener management for date selector

**Opportunities:**
- Convert to `html` template (auto-escapes!)
- Remove manual `escapeAttr()` function
- Use reactive properties for events array
- Simplify date selector event handling

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


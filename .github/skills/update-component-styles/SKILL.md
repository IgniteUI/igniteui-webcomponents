---
name: update-component-styles
description: Update component styling following the SCSS to Lit CSS workflow with proper theme support
---

# Update Component Styles

This skill guides you through updating component styles following the project's SCSS workflow and theming system.

## Example Usage

- "Update the badge component border radius"
- "Add hover styles to the button component"
- "Change the card component padding"

## Related Skills

- [create-new-component](../create-new-component/) - Styling for new components

## When to Use

- User asks to modify component appearance
- Need to add or change CSS styles
- Updating theme-specific styles
- Adding new CSS custom properties

## Prerequisites

- [ ] Target component exists
- [ ] Style change requirements are clear
- [ ] Understand which theme files to modify

## Required Context

Gather or confirm:

- **Component name**: Which component to style
- **Style changes**: What CSS needs to change
- **Scope**: Base styles, theme-specific, or both
- **CSS parts**: Whether to add/modify exposed parts

## Steps

### 1. Identify Style Files to Modify

Component styles are organized as:

- `[component]/themes/[component].base.scss` - Base structural styles
- `[component]/themes/shared/[component].common.css.js` - Common cross-theme styles (if exists)
- `[component]/themes/shared/[component].bootstrap.scss` - Bootstrap theme
- `[component]/themes/shared/[component].material.scss` - Material theme
- `[component]/themes/shared/[component].fluent.scss` - Fluent theme
- `[component]/themes/shared/[component].indigo.scss` - Indigo theme
- `[component]/themes/light/[component].[theme].scss` - Light theme overrides
- `[component]/themes/dark/[component].[theme].scss` - Dark theme overrides

**Decision tree**:

- Structural changes (layout, display) → Edit base.scss
- Theme-agnostic styles → Edit shared/\*.scss
- Theme-specific styles → Edit specific theme file
- Light/dark variants → Edit light/_ or dark/_ files

### 2. Edit SCSS Files

**Base styles** (`themes/[component].base.scss`):

```scss
@use '../../../styles/utilities' as *;

:host {
  display: block;
}

[part='base'] {
  padding: 1rem;
  border-radius: 4px;
  // Structural styles here
}
```

**Theme-specific styles** (`themes/shared/[component].bootstrap.scss`):

```scss
@use '../../../../theming/functions' as *;

:host {
  // Use theming functions from igniteui-theming
  --component-color: #{color('primary', 500)};
}

[part='base'] {
  background: var(--component-color);
}
```

**Light/Dark overrides** (`themes/light/[component].bootstrap.scss`):

```scss
:host {
  --component-color: white;
}
```

### 3. Use CSS Parts for External Styling

If adding new styleable parts, update component render and JSDoc:

**Update render method**:

```typescript
protected override render() {
  return html`
    <div part="base new-part">
      <span part="content">Content</span>
    </div>
  `;
}
```

**Update JSDoc**:

```typescript
/**
 * ...
 * @csspart base - The main container
 * @csspart new-part - Description of new part
 * @csspart content - The content wrapper
 */
export default class IgcComponentComponent extends LitElement {
```

### 4. Add CSS Custom Properties (if needed)

For values that should be customizable:

**In SCSS**:

```scss
:host {
  --component-padding: 1rem;
  --component-radius: 4px;
}

[part='base'] {
  padding: var(--component-padding);
  border-radius: var(--component-radius);
}
```

**Document in JSDoc**:

```typescript
/**
 * ...
 * @cssproperty --component-padding - The internal padding
 * @cssproperty --component-radius - The border radius
 */
export default class IgcComponentComponent extends LitElement {
```

### 5. Transpile SCSS to TypeScript

After editing SCSS files, transpile them:

```bash
npm run build:styles
```

This converts `.scss` to `.css.js` files with Lit's `css` template literal.

**Verify**: Check that `.css.js` files are updated with your changes.

### 6. Test Style Changes

**Manual testing in Storybook**:

```bash
npm run storybook
```

Check:

- [ ] Styles render correctly in all theme variants
- [ ] Light and dark modes both work
- [ ] CSS parts are styleable from outside
- [ ] CSS custom properties work

**Automated testing** (if style affects behavior):

```typescript
it('should apply correct CSS class', async () => {
  const el = await fixture<IgcComponentComponent>(
    html`<igc-component variant="outlined"></igc-component>`
  );

  const part = el.shadowRoot?.querySelector('[part="base"]');
  // Test computed styles or classes if critical
});
```

### 7. Update Documentation (if needed)

If adding new CSS parts or custom properties:

1. JSDoc comments are automatically extracted
2. Verify in Storybook's "Docs" tab
3. Check that parts/properties appear in documentation

## Validation Checklist

- [ ] SCSS files edited correctly
- [ ] Styles transpiled (`npm run build:styles`)
- [ ] No TypeScript compilation errors
- [ ] Styles render correctly in Storybook
- [ ] All theme variants checked (bootstrap, material, fluent, indigo)
- [ ] Light and dark modes both work
- [ ] New CSS parts documented in JSDoc
- [ ] New CSS custom properties documented
- [ ] No visual regressions on other components

## Common Pitfalls

### 1. Forgetting to Transpile

**Problem**: Style changes don't appear
**Solution**: Always run `npm run build:styles` after editing SCSS

### 2. Editing .css.js Files Directly

**Problem**: Changes get overwritten on next build
**Solution**: Only edit `.scss` files, never `.css.js` files

### 3. Wrong Theme File

**Problem**: Styles appear in some themes but not others
**Solution**: Edit the correct theme file or shared file for all themes

### 4. Not Using Theming Functions

**Problem**: Hardcoded colors don't match theme
**Solution**: Use `color()`, `theme()` functions from igniteui-theming

### 5. Overly Specific Selectors

**Problem**: Users can't override styles
**Solution**: Keep selector specificity low, expose CSS parts

### 6. Missing :host Styles

**Problem**: Component doesn't display correctly
**Solution**: Always set `:host { display: block; }` or appropriate display value

## Reference Examples

### Simple Component Styles: Badge

See: `src/components/badge/themes/`

**Structure**:

- Base styles for structure
- Theme files for colors/variants
- Uses CSS custom properties
- Exposes `base` and `icon` parts

### Complex Component Styles: Textarea

See: `src/components/textarea/themes/`

**Structure**:

- More complex base styles
- Multiple CSS parts
- Theme-specific variants
- Light/dark overrides

## Theming System

### Available Functions

From igniteui-theming package:

- `color($palette, $variant)` - Get theme color
- `contrast-color($color)` - Get contrasting text color
- `theme($property)` - Get theme value

### Theme Structure

```scss
@use '../../../../theming/functions' as *;

:host {
  --bg: #{color('surface', 500)};
  --text: #{contrast-color(color('surface', 500))};
}
```

## Resources

- [Lit Styles](https://lit.dev/docs/components/styles/)
- [Shadow Parts](https://developer.mozilla.org/en-US/docs/Web/CSS/::part)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [igniteui-theming Package](https://www.npmjs.com/package/igniteui-theming)
- [Coding Guidelines](../../CODING_GUIDELINES.md) - Comprehensive coding standards

---
name: review-component-pr
description: Comprehensive code review checklist for component pull requests ensuring quality, accessibility, and adherence to project conventions
---

# Review Component PR

This skill provides a systematic checklist for reviewing pull requests that add or modify web components in the project.

## Example Usage

- "Review the new tooltip component PR"
- "Check if the badge component changes follow our conventions"
- "Perform a code review on PR #123"

## Related Skills

- [create-new-component](../create-new-component/) - Reference for new component structure
- [add-component-property](../add-component-property/) - Property implementation patterns

## When to Use

- Reviewing a PR that adds a new component
- Reviewing changes to an existing component
- Pre-merge quality gate check
- Onboarding new contributors

## Review Checklist

### 1. Project Structure & Files

- [ ] **Component directory** exists at `src/components/[component-name]/`
- [ ] **Component file** named correctly: `[component-name].ts`
- [ ] **Test file** exists: `[component-name].spec.ts`
- [ ] **Storybook story** exists: `stories/[component-name].stories.ts`
- [ ] **Theme files** present in `themes/` directory
  - `[component-name].base.scss`
  - `themes.ts` aggregator
  - All four theme files (bootstrap, material, fluent, indigo)
- [ ] **Export** added to `src/index.ts` in alphabetical order

### 2. TypeScript Quality

- [ ] **No `any` types** - Use `unknown` or proper types
- [ ] **Strict type checking** passes
- [ ] **Import paths** use `.js` extension (not `.ts`)
- [ ] **No native private fields** - Use `_prefix` or TypeScript `private`, not `#`
- [ ] **Internal API prefixed** with underscore: `_method()`, `_property`
- [ ] **readonly modifier** used for immutable properties
- [ ] **Explicit return types** on methods (unless obvious/cluttering)
- [ ] **Property decorators** used correctly (`@property`, `@query`, etc.)
- [ ] **Type annotations** present on all public APIs
- [ ] **Interfaces/types** defined for complex structures

**Good**:

```typescript
@property({ reflect: true })
public variant: StyleVariant = 'primary';

private _internalState: string = '';
```

**Bad**:

```typescript
@property()
public variant: any; // ❌ No any types

#privateField = ''; // ❌ No native private fields
```

### 3. Component Class Structure

- [ ] **Extends `LitElement`** or appropriate mixin
- [ ] **`tagName` static property** defined: `'igc-[component-name]'` with `readonly` modifier
- [ ] **`styles` static property** includes base and shared styles
- [ ] **`register()` static method** present
- [ ] **Region comments** organize code: Internal state, Public properties, Lit lifecycle, Event handlers, Internal API, Public API
- [ ] **Internal API prefixed** with underscore: `_internalMethod()`, `_privateState`
- [ ] **readonly modifier** used for immutable properties
- [ ] **Explicit return types** specified for methods (unless obvious)
- [ ] **Theming controller** added in constructor: `addThemingController(this, all)`
- [ ] **Constructor** calls `super()` first if overridden
- [ ] **Default export** used: `export default class`
- [ ] **Global declaration** included for TypeScript

**Template**:

```typescript
export default class IgcComponentComponent extends LitElement {
  public static readonly tagName = 'igc-component';
  public static override styles = [styles, shared];

  public static register(): void {
    registerComponent(IgcComponentComponent);
  }

  //#region Internal state

  private _internalState = '';

  //#endregion

  //#region Public properties

  @property({ reflect: true })
  public variant = 'primary';

  //#endregion

  constructor() {
    super();
    addThemingController(this, all);
  }

  //#region Lit lifecycle

  protected override render() {
    return html`<div part="base"><slot></slot></div>`;
  }

  //#endregion

  //#region Internal API

  private _handleChange(): void {
    // Internal helper
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-component': IgcComponentComponent;
  }
}
```

### 4. Properties & Attributes

- [ ] **Only primitives exposed as attributes** (string, number, boolean)
- [ ] **Complex types** use `attribute: false`
- [ ] **Boolean properties** use `{ type: Boolean, reflect: true }`
- [ ] **Number properties** use `{ type: Number }`
- [ ] **reflect: true** only for primitives that should be attributes
- [ ] **Default values** are appropriate
- [ ] **JSDoc comments** include `@attr` for reflected properties
- [ ] **JSDoc comments** include `@default` for default values

**Good**:

```typescript
/**
 * The variant style of the component
 * @attr variant
 * @default 'primary'
 */
@property({ reflect: true })
public variant: StyleVariant = 'primary';

/**
 * Complex configuration object
 */
@property({ attribute: false })
public config: Config = {};
```

**Bad**:

```typescript
@property({ reflect: true }) // ❌ Trying to reflect complex type
public config: Config = {};
```

### 5. Lifecycle & Reactivity

- [ ] **Lifecycle hooks** used correctly
  - `update()` for side effects (DOM available)
  - `willUpdate()` only for pre-render computation
  - `super.update()` called when overriding `update()`
- [ ] **`changedProperties.has()`** checked to avoid unnecessary work
- [ ] **No `@watch` decorator** used (prefer lifecycle hooks)
- [ ] **`requestUpdate()`** not called unnecessarily

**Good**:

```typescript
protected override update(changedProperties: PropertyValues<this>): void {
  if (changedProperties.has('disabled')) {
    // Update ARIA or other side effects
    this._internals.setARIA({ ariaDisabled: `${this.disabled}` });
  }
  super.update(changedProperties);
}
```

### 6. Shadow DOM & Styling

- [ ] **Shadow DOM** used (not open mode issues)
- [ ] **CSS parts** exposed with `part` attribute for external styling
- [ ] **CSS parts documented** in JSDoc with `@csspart`
- [ ] **CSS custom properties** documented with `@cssproperty`
- [ ] **SCSS files transpiled** to `.css.js` files
- [ ] **No direct `.css.js` edits** (only edit SCSS)
- [ ] **All themes implemented** (bootstrap, material, fluent, indigo)
- [ ] **Light and dark modes** considered
- [ ] **`:host` styles** include appropriate `display` value

**Good**:

```typescript
/**
 * @csspart base - The main container
 * @csspart content - The content wrapper
 * @cssproperty --padding - Internal padding
 */
protected override render() {
  return html`<div part="base"><slot></slot></div>`;
}
```

### 7. Accessibility (Critical)

- [ ] **Accessibility tests pass** - `await expect(el).to.be.accessible()`
- [ ] **Semantic HTML** used where appropriate
- [ ] **ARIA attributes** set correctly
- [ ] **`role` attribute** appropriate for component type
- [ ] **Keyboard navigation** implemented
- [ ] **Focus management** works correctly
- [ ] **`delegatesFocus`** used if component should delegate focus
- [ ] **Screen reader** announcements appropriate
- [ ] **Color contrast** meets WCAG standards
- [ ] **Focus indicators** visible
- [ ] **`addInternalsController`** used for ARIA management if needed

**Check**:

```typescript
// Should have accessibility test
it('passes the a11y audit', async () => {
  const el = await fixture<IgcComponentComponent>(
    html`<igc-component></igc-component>`
  );

  await expect(el).shadowDom.to.be.accessible();
  await expect(el).to.be.accessible();
});
```

### 8. Events

- [ ] **Events use EventEmitterMixin** if custom events needed
- [ ] **Event map interface** defined
- [ ] **Events documented** with `@event` in JSDoc
- [ ] **Event names** follow convention (lowercase, no `on` prefix)
- [ ] **Events composed** if they should cross Shadow DOM boundary
- [ ] **Events bubbling** configured appropriately
- [ ] **Event detail types** are properly typed

**Good**:

```typescript
export interface IgcComponentEventMap {
  igcChange: CustomEvent<string>;
}

/**
 * @event igcChange - Emitted when value changes
 */
export default class IgcComponentComponent extends EventEmitterMixin<
  IgcComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  // ...
  this.emitEvent('igcChange', { detail: newValue });
}
```

### 9. Tests

- [ ] **Accessibility test** included (required)
- [ ] **Default values tested**
- [ ] **Property changes tested**
- [ ] **Attribute reflection tested** (for reflected properties)
- [ ] **Events tested**
- [ ] **Slot content tested**
- [ ] **Edge cases covered**
- [ ] **`defineComponents()` called** in `before()` hook
- [ ] **`elementUpdated()` used** after programmatic changes
- [ ] **Tests use `@open-wc/testing`** framework
- [ ] **All tests pass** locally

**Minimum Required**:

```typescript
describe('Component', () => {
  before(() => {
    defineComponents(IgcComponentComponent);
  });

  it('passes the a11y audit', async () => {
    // Required accessibility test
  });

  it('should initialize with default values', async () => {
    // Test defaults
  });

  it('can change properties', async () => {
    // Test reactivity
  });
});
```

### 10. Storybook Stories

- [ ] **Story file exists** at `stories/[component-name].stories.ts`
- [ ] **Metadata defined** with title, component, description
- [ ] **argTypes** match component properties
- [ ] **args** provide default values
- [ ] **Controls** appropriate for property types
- [ ] **TypeScript interface** for args
- [ ] **At least one story** demonstrates basic usage
- [ ] **Multiple stories** for different variants (ideal)
- [ ] **Story renders correctly** in Storybook

### 11. Documentation

- [ ] **JSDoc comments** on component class
- [ ] **`@element` tag** with component tag name
- [ ] **`@slot` tags** for all slots (default and named)
- [ ] **`@csspart` tags** for all exposed parts
- [ ] **`@cssproperty` tags** for CSS custom properties
- [ ] **`@event` tags** for emitted events
- [ ] **Property descriptions** clear and complete
- [ ] **Examples** in JSDoc if complex usage

**Complete Example**:

```typescript
/**
 * A button component for user interactions.
 *
 * @element igc-button
 *
 * @slot - Default slot for button text
 * @slot prefix - Content before the button text
 *
 * @csspart base - The button element
 * @csspart content - The content wrapper
 *
 * @cssproperty --padding - Button padding
 *
 * @event igcClick - Emitted on click
 */
```

### 12. Form Integration (if applicable)

- [ ] **FormAssociatedRequiredMixin** used for form controls
- [ ] **Form value state** managed correctly
- [ ] **Validation** implemented if needed
- [ ] **`value` property** reactive and synced
- [ ] **Form reset** handled
- [ ] **Required/disabled states** work correctly
- [ ] **Labels associated** correctly

### 13. Build & Compilation

- [ ] **TypeScript compiles** without errors: `npm run build`
- [ ] **No linting errors**: Check biome/eslint output
- [ ] **SCSS transpiled** to `.css.js` files
- [ ] **All tests pass**: `npm run test`
- [ ] **No console errors/warnings** in Storybook
- [ ] **Bundle size** reasonable (check for large dependencies)

### 14. Code Quality

- [ ] **No commented-out code** (unless with explanation)
- [ ] **No debug statements** (`console.log`, `debugger`)
- [ ] **Consistent formatting** (should be auto-formatted)
- [ ] **Meaningful variable names**
- [ ] **No magic numbers** (use named constants)
- [ ] **Error handling** appropriate
- [ ] **Code is DRY** (Don't Repeat Yourself)

### 15. Project Conventions

- [ ] **Follows composition over inheritance**
- [ ] **No heavy third-party dependencies** unless necessary
- [ ] **Uses project utilities** from `common/` where applicable
- [ ] **Consistent with existing component patterns**
- [ ] **Theming uses igniteui-theming package**
- [ ] **Modern ECMAScript features** used appropriately

## Common Issues to Watch For

### Issue: Missing Theming Controller

**Problem**: Component doesn't respond to theme changes
**Fix**: Add `addThemingController(this, all)` in constructor

### Issue: Wrong Import Extensions

**Problem**: Using `.ts` instead of `.js` in imports
**Fix**: All TypeScript imports must use `.js` extension

### Issue: Exposing Complex Types as Attributes

**Problem**: Trying to reflect objects/arrays to HTML attributes
**Fix**: Use `attribute: false` for non-primitive types

### Issue: Missing Accessibility Tests

**Problem**: No a11y test in spec file
**Fix**: Always include accessibility audit test

### Issue: Forgot to Export Component

**Problem**: Component not available when importing from package
**Fix**: Add export to `src/index.ts` in alphabetical order

### Issue: Using @watch Decorator

**Problem**: Using deprecated pattern for property changes
**Fix**: Use `update()` or `willUpdate()` lifecycle hooks

### Issue: Native Private Fields

**Problem**: Using `#privateField` syntax
**Fix**: Use `_privateField` or TypeScript `private` keyword

## Review Process

1. **Start with structure** - Verify all required files exist
2. **Check TypeScript** - Ensure strict typing and no `any`
3. **Review accessibility** - This is critical, don't skip
4. **Test locally** - Run build and tests
5. **Check Storybook** - Verify visual behavior
6. **Review code quality** - Look for patterns and conventions
7. **Provide constructive feedback** - Be specific and helpful

## Quick Pass/Fail Criteria

**Immediate Reject if**:

- No accessibility tests
- Using `any` types extensively
- Native private fields (`#`)
- No tests at all
- TypeScript compilation errors

**Request Changes if**:

- Missing documentation
- Incomplete test coverage
- Accessibility issues
- Not following project conventions
- Missing theme files

**Approve if**:

- All checkboxes checked
- Tests pass
- Accessibility verified
- Code quality good
- Follows project patterns

## Resources

- [Coding Guidelines](../../CODING_GUIDELINES.md) - Comprehensive coding standards and best practices
- [Lit Best Practices](https://lit.dev/docs/components/best-practices/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Components Best Practices](https://web.dev/custom-elements-best-practices/)

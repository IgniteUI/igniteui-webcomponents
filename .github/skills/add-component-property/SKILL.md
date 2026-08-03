---
name: add-component-property
description: Add a reactive property to an existing Lit web component with proper decorators, types, tests, and documentation
---

# Add Component Property

This skill guides you through adding a new reactive property to an existing Lit web component.

## Example Usage

- "Add an 'orientation' property to the divider component"
- "Add a 'disabled' attribute to the button component"
- "Add a 'variant' property with multiple options"

## Related Skills

- [create-new-component](../create-new-component/) - Create a component first
- [update-component-styles](../update-component-styles/) - Style changes for properties

## When to Use

- User asks to add a new property or attribute to a component
- Component needs new configuration options
- Extending component functionality with new settings

## Prerequisites

- [ ] Target component exists
- [ ] Property name and type are determined
- [ ] Default value is decided
- [ ] Whether property should reflect to attribute is decided

## Required Context

Gather or confirm:

- **Component name**: Which component to modify
- **Property name**: camelCase for property, kebab-case for attribute
- **Property type**: Primitive (string, number, boolean) or complex (object, array)
- **Default value**: What value should it have initially
- **Reflect to attribute**: Should changes reflect to HTML attribute? (only for primitives)
- **Property purpose**: Brief description for documentation

## Steps

### 1. Add Property to Component Class

Add the property with appropriate decorator to the component class:

**For primitive types (reflect to attribute)**:

```typescript
/**
 * [Property description]
 * @attr [attribute-name]
 * @default [default-value]
 */
@property({ reflect: true })
public propertyName: PropertyType = defaultValue;
```

**For readonly properties**:

```typescript
/**
 * [Property description - read-only]
 */
@property({ attribute: false })
public readonly readonlyProp: PropertyType = defaultValue;
```

**For boolean types**:

```typescript
/**
 * [Property description]
 * @attr [attribute-name]
 * @default false
 */
@property({ type: Boolean, reflect: true })
public propertyName = false;
```

**For number types**:

```typescript
/**
 * [Property description]
 * @attr [attribute-name]
 */
@property({ type: Number, reflect: true })
public propertyName = 0;
```

**For complex types (no reflection)**:

```typescript
/**
 * [Property description]
 */
@property({ attribute: false })
public propertyName: ComplexType = defaultValue;
```

### 2. Write the Description

The JSDoc description is copied **verbatim** into `custom-elements.json`, the generated
Storybook `argTypes`/args interface, and the API docs of every framework wrapper
(Angular / React / Blazor). Write it as product documentation:

- **No `igc-` tag names in prose.** Use the plain-English component name — "the select
  component", "toggle buttons", "the tile manager" — not `igc-select` or
  `` `igc-toggle-button` ``. Tag names belong only in `@element` and fenced `@example`
  blocks.
- **Don't restate that it is an attribute.** `@attr` already says so.
  `The label of the control.` — not `The label attribute of the control.`
- **Don't use `Gets/Sets`.** State what the value is; if the setter has side effects, add a
  second sentence for the behavior.
- **Booleans start with "Whether …"** and must describe the `true` state accurately. Verify
  against the implementation — a `hide*`/`disable*` name inverts the sentence
  (`hideIndicators` → *"Whether the carousel should skip rendering of the indicator
  controls."*).
- **Present tense**, not "will" (`an empty value returns an empty string`).

```typescript
// ❌ Wrong
/**
 * The outlined attribute of the control.
 * @attr
 */

// ✅ Right
/**
 * Whether the control has an outlined appearance.
 * @attr
 */
```

Full reference: [create-new-component → Documentation Conventions](../create-new-component/SKILL.md#documentation-conventions)

### 3. Update Component Render Method

If the property affects rendering, update the `render()` method:

```typescript
protected override render() {
  return html`
    <div part="base" class=${this.propertyName}>
      <!-- Updated template using new property -->
    </div>
  `;
}
```

### 4. Add Property Change Handler (if needed)

If the property requires side effects or needs to sync computed/dependent properties, use Lit's lifecycle hooks.

**Preferred: Use `update()` hook** (DOM is available, best for side effects):

```typescript
protected override update(changedProperties: PropertyValues<this>): void {
  if (changedProperties.has('propertyName')) {
    // Handle property change with DOM access
    // Update dependent properties or trigger side effects
    // Example: Update ARIA attributes, sync internal state, etc.
  }
  super.update(changedProperties);
}
```

**If absolutely needed: Use `willUpdate()`** (before render, no DOM access):

```typescript
protected override willUpdate(changedProperties: PropertyValues<this>): void {
  if (changedProperties.has('propertyName')) {
    // Handle property change before rendering
    // Use only if you need to compute values before render
    // No DOM access available here
  }
}
```

**Best Practices**:

- Prefer `update()` for most cases - DOM is available for queries and side effects
- Use `willUpdate()` only when you need to compute derived state before rendering
- Always call `super.update(changedProperties)` when overriding `update()`
- Check `changedProperties.has()` to avoid unnecessary work

### 5. Update Tests

Add tests for the new property in `[component-name].spec.ts`:

```typescript
it('should have correct default value', async () => {
  const el = await fixture<IgcComponentComponent>(
    html`<igc-component></igc-component>`
  );

  expect(el.propertyName).to.equal(defaultValue);
});

it('can change property', async () => {
  const el = await fixture<IgcComponentComponent>(
    html`<igc-component></igc-component>`
  );

  el.propertyName = newValue;
  await elementUpdated(el);

  expect(el.propertyName).to.equal(newValue);
});

it('reflects to attribute', async () => {
  const el = await fixture<IgcComponentComponent>(
    html`<igc-component property-name="${value}"></igc-component>`
  );

  expect(el.propertyName).to.equal(value);
  expect(el.getAttribute('property-name')).to.equal(value);
});
```

### 6. Regenerate the Storybook Story Metadata

The `metadata` object, the `Igc[Component]Args` interface and their descriptions live inside
a **generated** `// region default … // endregion` block in
`stories/[component-name].stories.ts`. Do not hand-edit that block — regenerate it from the
JSDoc you just wrote:

```bash
npm run cem        # regenerates custom-elements.json from the source JSDoc
npm run build:meta # rewrites the `// region default` block of each story
```

This produces the `argTypes` entry, the `args` default and the args-interface comment for
the new property, all carrying the description verbatim:

```typescript
// region default
argTypes: {
  propertyName: {
    type: 'string', // or 'boolean', 'number'
    description: '[Property description]',
    control: 'text', // or 'boolean', 'number', 'select'
    table: { defaultValue: { summary: 'defaultValue' } },
  },
  // ... other properties
}
// ...
interface IgcComponentArgs {
  /** [Property description] */
  propertyName: PropertyType;
  // ... other properties
}
// endregion
```

If the generated description reads badly, fix the JSDoc in the component and regenerate —
never patch the story. (`stories/splitter.stories.ts` is the one exception: it has no
`// region default` markers and is maintained by hand.)

**Update the story template** — this part lives outside the generated region and is edited
by hand:

```typescript
export const Basic: Story = {
  render: (args) => html`
    <igc-component .propertyName=${args.propertyName}> Content </igc-component>
  `,
};
```

### 7. Verify and Test

Run tests and verify in Storybook:

```bash
# Run tests
npm run test

# Check that the project will transpile
npm run check-types

# Start Storybook
npm run storybook
```

## Validation Checklist

- [ ] Property added with `@property` decorator
- [ ] JSDoc comment includes `@attr` for primitives
- [ ] Description follows the [description rules](#2-write-the-description): no `igc-` tag
      names, no "… attribute of the control", no `Gets/Sets`, booleans start with "Whether"
      and describe the `true` state correctly
- [ ] Type annotation correct
- [ ] Default value appropriate
- [ ] `reflect: true` only for primitives
- [ ] Tests cover default value
- [ ] Tests cover property changes
- [ ] Tests cover attribute reflection (if applicable)
- [ ] `npm run cem && npm run build:meta` run; generated story region committed
- [ ] Story template uses new property
- [ ] All tests pass
- [ ] Property works in Storybook

## Common Pitfalls

### 1. Reflecting Non-Primitive Types

**Problem**: Trying to reflect objects/arrays to attributes
**Solution**: Use `attribute: false` for complex types

### 2. Wrong Attribute Name Conversion

**Problem**: camelCase not mapping to kebab-case
**Solution**: Lit auto-converts, or specify explicitly: `@property({ attribute: 'custom-name' })`

### 3. Missing Type Coercion

**Problem**: Boolean/number properties not converting from string attributes
**Solution**: Use `{ type: Boolean }` or `{ type: Number }` in decorator

### 4. Forgetting to Update Storybook

**Problem**: New property not controllable in Storybook
**Solution**: Run `npm run cem && npm run build:meta` to regenerate the `// region default`
block, then wire the property into the story template by hand

### 5. Hand-Editing the Generated Story Region

**Problem**: The `argTypes` description is fixed directly in the story; the next
`npm run build:meta` reverts it, or the story and the API docs disagree
**Solution**: The JSDoc in the component is the single source of truth — fix it there and
regenerate

### 6. Tag Names in the Description

**Problem**: A description like `Gets/Sets the name for all child igc-radio components.` ships
into `custom-elements.json`, the Storybook docs and every framework wrapper's API docs
**Solution**: `The name applied to all radio buttons in the group.` — see
[Write the Description](#2-write-the-description)

## Reference Examples

See `src/components/badge/badge.ts` for examples of:

- String property with reflection: `variant`
- Boolean property: `outlined`
- Enum-like property: `shape`

## Resources

- [Lit Reactive Properties](https://lit.dev/docs/components/properties/)
- [Lit Decorators](https://lit.dev/docs/api/decorators/)
- [Coding Guidelines](../../CODING_GUIDELINES.md) - Comprehensive coding standards

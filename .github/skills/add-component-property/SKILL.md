---
name: add-component-property
description: Add a reactive property to an existing Lit web component with proper decorators, types, tests, and documentation
---

# Add Component Property

Adds a reactive property to an existing component, with the documentation, tests and generated
metadata that go with it.

## When to Use

- "Add an 'orientation' property to the divider component"
- "Add a 'variant' property with multiple options"

## Related Skills

- [create-new-component](../create-new-component/) - Create a component first
- [update-component-styles](../update-component-styles/) - Style changes driven by the property

## Required Context

- **Component**: which component to modify
- **Name and type**: camelCase property, kebab-case attribute
- **Default value**: booleans must default to `false`
- **Reflection**: only for primitives that affect styling or accessibility
- **Purpose**: the description that ships in the public API docs

## Steps

### 1. Declare the property

Place it in the `//#region Public attributes and properties` section, in the shape that matches
its type:

```ts
/**
 * The style variant of the component.
 * @attr variant
 * @default 'primary'
 */
@property({ reflect: true })
public variant: StyleVariant = 'primary';

/**
 * Whether user interaction with the component is disabled.
 * @attr
 * @default false
 */
@property({ type: Boolean, reflect: true })
public disabled = false;

/**
 * The number of items rendered per page.
 * @attr items-per-page
 * @default 10
 */
@property({ type: Number, attribute: 'items-per-page' })
public itemsPerPage = 10;

/** The items rendered by the component. */
@property({ attribute: false })
public items: Array<Item> = [];
```

Rules that are easy to get wrong:

- **Booleans must default to `false`.** An attribute's presence equates to `true`, so a
  `true` default cannot be turned off from markup. Rename the property instead (`enabled` →
  `disabled`).
- **Never reflect objects or arrays**, and give them `attribute: false` so Lit doesn't try to
  serialize them.
- Lit derives the attribute name automatically, but spell it out for multi-word properties and
  for HTML look-alikes (`readOnly` → `readonly`, `minLength` → `minlength`).
- A read-only value is a getter, not a `readonly @property`.

### 2. Write the description

The JSDoc is copied **verbatim** into `custom-elements.json`, the generated Storybook metadata
and the Angular / React / Blazor wrapper docs.

- **No `igc-` tag names in prose** — "the select component", not `igc-select`.
- **Don't restate that it is an attribute.** `@attr` already says so.
- **No `Gets/Sets`.** State what the value is; add a second sentence for side effects.
- **Booleans start with "Whether …"** and must describe the `true` state accurately — verify
  against the implementation, since `hide*`/`disable*` names invert the sentence.
- **Present tense**, not "will".

```ts
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

Full reference:
[create-new-component → Documentation Conventions](../create-new-component/SKILL.md#documentation-conventions).

### 3. React to the change

If the property only affects the template, do nothing — just use it in `render()`. If it has
side effects or feeds derived state, use the Lit lifecycle hooks, not `@watch`:

```ts
// Derived state, before rendering
protected override willUpdate(changedProperties: PropertyValues<this>): void {
  if (changedProperties.has('value')) {
    this._normalized = this.value.trim();
  }
}

// Side effects that need DOM access
protected override update(changedProperties: PropertyValues<this>): void {
  if (changedProperties.has('disabled')) {
    this._internals.setARIA({ ariaDisabled: `${this.disabled}` });
  }
  super.update(changedProperties);
}
```

Always guard with `changedProperties.has()` and call `super.update()` when overriding `update`.

For a form-associated control, a property that participates in constraint validation
(`min`, `pattern`, `maxLength`, …) must call `this._validate()` from its setter.

### 4. Add tests

```ts
it('is initialized with the proper default value', async () => {
  const el = await fixture<IgcComponentComponent>(
    html`<igc-component></igc-component>`
  );

  expect(el.propertyName).to.equal(defaultValue);
});

it('updates on property change', async () => {
  const el = await fixture<IgcComponentComponent>(
    html`<igc-component></igc-component>`
  );

  el.propertyName = newValue;
  await elementUpdated(el);

  expect(el.propertyName).to.equal(newValue);
});

it('reflects to an attribute', async () => {
  const el = await fixture<IgcComponentComponent>(
    html`<igc-component property-name=${value}></igc-component>`
  );

  expect(el.propertyName).to.equal(value);
  expect(el.getAttribute('property-name')).to.equal(value);
});
```

If the property changes the rendered semantics, extend the a11y audit rather than adding a
separate one.

### 5. Regenerate the story metadata

The `argTypes`, `args` and the args interface live inside a **generated**
`// region default … // endregion` block in `stories/[component-name].stories.ts`. Never edit
it by hand:

```bash
npm run cem        # custom-elements.json from the source JSDoc
npm run build:meta # the `// region default` block of each story
```

If the generated description reads badly, fix the JSDoc and regenerate. If the property doesn't
appear at all, the story was skipped: the filename must match the tag name
(`igc-date-picker` → `date-picker.stories.ts`) and the region fence must be present — a missing
fence is a silent no-op.

Then wire the property into the story templates, which are hand-written:

```ts
export const Basic: Story = {
  render: (args) => html`
    <igc-component .propertyName=${args.propertyName}>Content</igc-component>
  `,
};
```

### 6. Verify

```bash
npm run check
npm run test
```

## Validation Checklist

- [ ] Property declared in the public properties region with the right decorator options
- [ ] Booleans default to `false`; complex types use `attribute: false`
- [ ] `@attr` and `@default` tags present; description follows the
      [description rules](#2-write-the-description)
- [ ] Lifecycle hook used for side effects, `super.update()` called
- [ ] `_validate()` called from setters affecting constraint validation
- [ ] Tests cover default, change and reflection
- [ ] `npm run cem && npm run build:meta` run; generated story region committed
- [ ] Story template uses the new property
- [ ] `npm run check` and `npm run test` pass
- [ ] CHANGELOG updated if the property is part of a feature or fix

## Common Pitfalls

| Symptom                                       | Cause / Fix                                                            |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| Attribute can't be turned off from markup     | Boolean defaults to `true` — rename so the default is `false`          |
| `[object Object]` in the DOM                  | Complex type without `attribute: false`                                |
| String `'false'` behaves as `true`            | Missing `{ type: Boolean }` in the decorator                           |
| Attribute name is `propertyname`              | Multi-word property without an explicit `attribute: 'property-name'`   |
| Story control missing after adding a property | `npm run build:meta` not run, or the story is being skipped silently   |
| Story description reverts                     | The generated region was hand-edited — fix the JSDoc instead           |

## Reference Examples

- `src/components/badge/badge.ts` — reflected string, boolean and union-typed properties
- `src/components/input/input.ts` — validation-affecting setters calling `_validate()`
- `src/components/combo/combo.ts` — complex, non-attribute properties
</content>

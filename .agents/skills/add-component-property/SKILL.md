---
name: add-component-property
description: Add a reactive property to an existing Lit web component with proper decorators, types, tests, specification updates, and documentation
---

# Add Component Property

Adds a reactive property together with its JSDoc, tests, spec update and generated metadata.
The rules are in [Properties and Attributes](../../../.github/CODING_GUIDELINES.md#properties-and-attributes)
and [API Documentation](../../../.github/CODING_GUIDELINES.md#api-documentation).

Related: [create-new-component](../create-new-component/),
[update-component-styles](../update-component-styles/).

## Required Context

- **Component** to change
- **Name and type**: camelCase property, kebab-case attribute
- **Default value**: booleans default to `false`
- **Reflection**: only for primitives that affect styling or accessibility
- **Description**: ships in the public API docs

## Steps

### 1. Declare the property

Put it in `//#region Public attributes and properties`:

```ts
/**
 * The style variant of the component.
 * @attr
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

- A `true` boolean default cannot be turned off from markup. Rename the property instead
  (`enabled` → `disabled`).
- Objects and arrays get `attribute: false` and are never reflected.
- Spell out the attribute for multi-word properties and HTML look-alikes
  (`readOnly` → `readonly`).
- A read-only value is a getter, not a `readonly @property`.

### 2. Write the description

The JSDoc goes as-is into `custom-elements.json`, Storybook and the framework wrappers:

- No `igc-` tag names in prose. Write "the select", not `igc-select`.
- No "The label _attribute_ of…" and no `Gets/Sets`.
- A boolean starts with "Whether …" and describes the `true` state. Check the implementation,
  because `hide*` and `disable*` names invert the sentence.
- Use present tense. Do not use "will".

### 3. React to the change

If only the template uses the value, read it in `render()`. For other cases:

| Need                                       | Use                                                    |
| ------------------------------------------ | ------------------------------------------------------ |
| Clamp, normalize or coerce incoming values | `@coercedProperty({ transform })` below `@property`    |
| Side effect on every set (e.g. validation) | `@coercedProperty({ onChange })` below `@property`     |
| Derived state before render                | `willUpdate()`, guarded by `changedProperties.has()`   |
| Side effect that needs the DOM             | `update()`, guarded, and call `super.update()`         |

```ts
import { coercedProperty } from '#internals/decorators/coerced-property.js';

@property({ type: Number })
@coercedProperty<number, IgcRatingComponent>({
  transform: ({ value }) => clamp(value, 0, 100),
})
public max = 100;
```

Use `@coercedProperty` instead of a hand-written backing-field accessor pair. Keep the field
initializer, because `onChange` does not run for it. Keep hand-written accessors only for a
computed getter.

In a form-associated control, a property that is part of constraint validation (`min`,
`pattern`, `maxLength`, …) must re-validate on change. Reuse the static
`_revalidate` config (`onChange: ({ host }) => host._validate()`) as
`src/components/input/input.ts` does.

### 4. Add tests

Test the default value and a programmatic change after `elementUpdated()`. Test the attribute
only as far as the decorator allows:

- An attribute property: setting the attribute updates the property.
- A property with `reflect: true`: a property change updates the attribute.
- `attribute: false`: no attribute tests.

If the property changes the rendered semantics, extend the existing a11y audit. Do not add a
separate one.

### 5. Update the specification

A new property changes the public API, so it also changes `src/components/[name]/spec.md`.
Use [Keeping it current](../../../.github/CODING_GUIDELINES.md#keeping-it-current):

- Add a row to `### Properties and attributes` with the name, attribute, reflects, type, default,
  and the same description as the JSDoc.
- Add the new tests to `## Test scenarios` under their `describe` block, and renumber.
- Add a row to `## Revision history`.
- If applicable, update the keyboard, ARIA, localization, developer experience, and
  assumptions and limitations sections, and the TOC entry of any new heading.

To deprecate a property, keep its row and mark it with the version and the replacement.

### 6. Regenerate the story metadata

```bash
npm run cem && npm run build:meta
```

Do not edit the `// region default` block of `stories/[name].stories.ts`. If the control does
not appear, the story was skipped: the filename does not match the tag, or the region fence is
missing (this fails with no warning). Then use the property in the hand-written story
templates.

### 7. Verify

```bash
npm run check && npm run test
```

## Validation Checklist

- [ ] Declared in the public region, with the correct decorator options
- [ ] Booleans default to `false`. Complex types use `attribute: false`.
- [ ] `@attr` and `@default` present. The description follows step 2.
- [ ] Coercion and validation use `@coercedProperty`. Lifecycle hooks are guarded.
- [ ] Tests cover the default, a change and, if the decorator allows, the attribute
- [ ] `spec.md`: API row, test scenarios renumbered, revision history row
- [ ] `cem` and `build:meta` run. The story template uses the property.
- [ ] `check` and `test` pass. CHANGELOG updated if the property is user-visible.

## Common Pitfalls

| Symptom                                   | Cause / Fix                                                        |
| ----------------------------------------- | ------------------------------------------------------------------ |
| Attribute cannot be turned off in markup  | The boolean defaults to `true`. Rename it.                         |
| `[object Object]` in the DOM              | A complex type without `attribute: false`                          |
| `'false'` behaves as `true`               | `{ type: Boolean }` is missing                                     |
| Attribute is `propertyname`               | Set `attribute: 'property-name'` explicitly                        |
| `onChange` skips the first real set       | The field initializer was removed. Keep `= undefined` or a default. |
| Story control missing or description old  | `build:meta` did not run, the story was skipped, or the region was edited |
| Spec numbering jumps                      | Scenarios were added without renumbering                           |

## Reference Examples

- `src/components/badge/badge.ts`: reflected string, boolean and union properties
- `src/components/input/input.ts`: `@coercedProperty` re-validation of constraint properties
- `src/components/rating/rating.ts`: `@coercedProperty` `transform` for clamping
- `src/components/combo/combo.ts`: complex, non-attribute properties
- `src/components/badge/spec.md`: a short spec whose API tables track the properties

---
name: create-new-component
description: Create a new Lit web component following project conventions, including component class, styles, tests, Storybook story, and proper exports
---

# Create New Component

Creates a new Lit web component that follows the project conventions. Read the
[Coding Guidelines](../../CODING_GUIDELINES.md) for the rules behind the steps below.

## When to Use

- "Create a new progress-bar component"
- "Add a new stepper component to the library"

## Related Skills

- [add-component-property](../add-component-property/) - Add properties after creating the component
- [update-component-styles](../update-component-styles/) - Modify component styles

## Required Context

Confirm with the user before starting:

- **Name**: `progress-bar` → tag `igc-progress-bar`, class `IgcProgressBarComponent`
- **Purpose**: one-line description used verbatim in the public API docs
- **Public API**: initial properties, events, slots, CSS parts
- **Kind**: plain display component, container, or form-associated control

## Steps

### 1. Create the directory structure

```bash
mkdir -p src/components/[name]/themes/{light,dark,shared}
```

### 2. Create the component class

`src/components/[name]/[name].ts`:

```ts
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles } from './themes/[name].base.css.js';
import { styles as shared } from './themes/shared/[name].common.css.js';
import { all } from './themes/themes.js';

/**
 * [One-line description of what the component is for.]
 *
 * @element igc-[name]
 *
 * @slot - [Default slot description]
 *
 * @csspart base - [Description of the CSS part]
 */
export default class Igc[Name]Component extends LitElement {
  public static readonly tagName = 'igc-[name]';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(Igc[Name]Component);
  }

  //#region Public attributes and properties

  /**
   * [Property description]
   * @attr some-prop
   * @default 'default-value'
   */
  @property({ reflect: true })
  public someProp = 'default-value';

  //#endregion

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override render() {
    return html`
      <div part="base">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-[name]': Igc[Name]Component;
  }
}
```

Key points:

- Cross-cutting imports go through `#internals/*`, `#theming/*` and `#animations/*`; component
  imports stay relative. All specifiers end in `.js`.
- `registerComponent(Self, ...dependencies)` — pass every component rendered in the template.
- Region fences and the member order follow the
  [component structure](../../CODING_GUIDELINES.md#components).
- Internal API is `_`-prefixed; no native private fields (`#`).
- Only primitives may be attributes; complex types get `attribute: false`.
- For ARIA use `addInternalsController`; for keyboard use `addKeybindings`; for slot state use
  `addSlotController`. See the [controllers table](../../CODING_GUIDELINES.md#controllers).

### 3. Create the SCSS files

SCSS resolves against the `src` and `node_modules` load paths — use package-style specifiers,
never relative ones. Indentation in SCSS is 4 spaces.

`themes/[name].base.scss` — structure and layout, theme-agnostic:

```scss
@use 'styles/common/component';
@use 'styles/utilities' as *;

:host {
    display: block;
}

[part~='base'] {
    // Structural styles
}
```

`themes/light/_themes.scss` — digest the schemas from `igniteui-theming`:

```scss
@use 'styles/utilities' as *;
@use 'igniteui-theming/sass/themes/schemas/components/light/[name]' as *;

$base: digest-schema($light-[name]);
$material: digest-schema($material-[name]);
$bootstrap: digest-schema($bootstrap-[name]);
$fluent: digest-schema($fluent-[name]);
$indigo: digest-schema($indigo-[name]);
```

`themes/dark/_themes.scss` mirrors it with the dark schemas (no `$base`).

Then, per theme:

- `themes/light/[name].shared.scss` — emits the full variable set from `$base`
- `themes/light/[name].{bootstrap,material,fluent,indigo}.scss` — `diff($base, $theme)`
- `themes/dark/[name].{bootstrap,material,fluent,indigo}.scss` — `diff(light.$base, $theme)`
- `themes/shared/[name].common.scss` — cross-theme styling that reads the variables
- `themes/shared/[name].{bootstrap,material,fluent,indigo}.scss` — per-theme structural tweaks
  (optional)

```scss
// themes/light/[name].bootstrap.scss
@use 'styles/utilities' as *;
@use 'themes' as *;

$theme: $bootstrap;

:host {
    @include css-vars-from-theme(diff($base, $theme));
}
```

> [!NOTE]
> A brand-new component only has schemas once they are added to `igniteui-theming`. Until
> then, declare the CSS variables directly in `themes/shared/[name].common.scss` and keep the
> light/dark files empty rather than inventing values per theme.

### 4. Create the theme aggregator

`themes/themes.ts` is the only hand-written TypeScript file in the directory:

```ts
import { css } from 'lit';
import type { Themes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/[name].bootstrap.css.js';
import { styles as fluentDark } from './dark/[name].fluent.css.js';
import { styles as indigoDark } from './dark/[name].indigo.css.js';
import { styles as materialDark } from './dark/[name].material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/[name].bootstrap.css.js';
import { styles as fluentLight } from './light/[name].fluent.css.js';
import { styles as indigoLight } from './light/[name].indigo.css.js';
import { styles as materialLight } from './light/[name].material.css.js';
import { styles as shared } from './light/[name].shared.css.js';

const light = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  fluent: css`
    ${fluentLight}
  `,
  indigo: css`
    ${indigoLight}
  `,
};

const dark = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrapDark}
  `,
  material: css`
    ${materialDark}
  `,
  fluent: css`
    ${fluentDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };
```

### 5. Transpile the styles

```bash
npm run build:styles
```

This generates a `.css.ts` next to each `.scss` (imported as `.css.js`). The generated files
are **gitignored** — never edit or commit them. Only files matching
`*.{base,common,shared,material,bootstrap,indigo,fluent}.scss` are picked up; anything else is
silently skipped.

### 6. Write the tests

`src/components/[name]/[name].spec.ts`:

```ts
import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import Igc[Name]Component from './[name].js';

describe('[Name]', () => {
  before(() => {
    defineComponents(Igc[Name]Component);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<Igc[Name]Component>(html`<igc-[name]></igc-[name]>`);

    await expect(el).shadowDom.to.be.accessible();
    await expect(el).to.be.accessible();
  });

  it('is initialized with the proper default values', async () => {
    const el = await fixture<Igc[Name]Component>(html`<igc-[name]></igc-[name]>`);

    expect(el.someProp).to.equal('default-value');
  });

  it('updates on property change', async () => {
    const el = await fixture<Igc[Name]Component>(html`<igc-[name]></igc-[name]>`);

    el.someProp = 'new-value';
    await elementUpdated(el);

    expect(el.someProp).to.equal('new-value');
  });
});
```

Drive user interaction through the shared simulators (`simulateClick`, `simulateKeyboard`, …)
from `#internals/testing/simulate.spec.js`, and use
`createFormAssociatedTestBed` from `#internals/testing/form-testbed.spec.js` for form-associated
controls.

### 7. Create the Storybook story

`stories/[name].stories.ts` — the filename must match the tag name, and the generated block
must be fenced by `// region default` / `// endregion`:

```ts
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { defineComponents, Igc[Name]Component } from 'igniteui-webcomponents';

defineComponents(Igc[Name]Component);

// region default
const metadata: Meta<Igc[Name]Component> = {
  title: '[Name]',
  component: 'igc-[name]',
};

export default metadata;

type Story = StoryObj<Igc[Name]Component>;
// endregion

export const Basic: Story = {
  render: (args) => html`
    <igc-[name] .someProp=${args.someProp}>Content</igc-[name]>
  `,
};
```

Everything inside the region is regenerated in the next step — write only the stories.

### 8. Export and generate metadata

Add the export to `src/index.ts` in alphabetical order:

```ts
export { default as Igc[Name]Component } from './components/[name]/[name].js';
```

Then regenerate the derived artifacts:

```bash
npm run cem        # custom-elements.json from the JSDoc
npm run build:meta # the `// region default` block of the story
```

### 9. Verify

```bash
npm run check  # aliases, dependency rules, types
npm run lint   # oxlint, lit-analyzer, oxfmt, stylelint
npm run test
```

Finally, add a CHANGELOG entry.

## Documentation Conventions

Every JSDoc description on a public class, property, method, event, slot, CSS part or CSS
custom property is consumed **verbatim** by `custom-elements.json`, the generated story
metadata, the published API docs and the Angular / React / Blazor wrappers. Write product
documentation, not internal notes.

**Never put `igc-` tag names in prose.** Refer to components by their plain-English name — "the
carousel", "the tile manager", "toggle buttons".

```ts
// ❌ Wrong — tag names leak into the docs of every framework wrapper
/**
 * The `igc-carousel` presents a set of `igc-carousel-slide`s.
 *
 * @slot - Renders `igc-toggle-button` component.
 * @csspart svg - The igc-circular-progress SVG element.
 */

// ✅ Right
/**
 * The carousel presents a set of slides.
 *
 * @slot - Renders the toggle buttons of the group.
 * @csspart svg - The circular progress SVG element.
 */
```

Tag names are allowed **only** in the `@element` tag, fenced `@example` blocks, literal
event/attribute names that contain `igc-` (e.g. the `"igc-change-theme"` window event), and
`@internal`/`@hidden` members or non-exported internals.

**Describe the thing, not the attribute.** `@attr` already says it is an attribute.

| ❌ Avoid                                    | ✅ Prefer                                                 |
| ------------------------------------------ | -------------------------------------------------------- |
| `The label attribute of the control.`      | `The label of the control.`                               |
| `The outlined attribute of the control.`   | `Whether the control has an outlined appearance.`         |
| `Gets/Sets the name for all child radios.` | `The name applied to all radio buttons in the group.`     |
| `an empty value will return an empty string` | `an empty value returns an empty string`                |

- Booleans start with **"Whether …"** and describe the `true` state accurately — check the
  implementation, don't trust the property name (`hideIndicators` is _"Whether the carousel
  should skip rendering of the indicator controls"_).
- Use present tense; avoid "will".
- Keep the description as the leading summary paragraph; don't append it to `@element`.
- Public methods that return something get an `@returns` tag.

## Validation Checklist

- [ ] Component at `src/components/[name]/[name].ts`, single default export
- [ ] `tagName`, `styles` and `register()` static members defined
- [ ] Cross-cutting imports use `#internals` / `#theming` / `#animations`
- [ ] Theming controller added in the constructor
- [ ] JSDoc with `@element`, `@slot`, `@csspart`, `@cssproperty`, `@event` as applicable
- [ ] No `igc-` tag names in description prose
- [ ] `HTMLElementTagNameMap` declaration present
- [ ] SCSS scaffold complete (base, shared, light, dark) and `themes.ts` aggregator wired
- [ ] Spec file with the mandatory a11y audit
- [ ] Story file named after the tag, with a `// region default` fence
- [ ] Exported from `src/index.ts` alphabetically
- [ ] `npm run cem && npm run build:meta` run, generated story region committed
- [ ] `npm run check`, `npm run lint` and `npm run test` pass
- [ ] CHANGELOG updated

## Common Pitfalls

| Symptom                                      | Cause / Fix                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| Cannot resolve `./themes/*.css.js`           | `npm run build:styles` not run, or the `.scss` filename doesn't match the glob   |
| Styles never apply in a theme                | Missing entry in `themes.ts`, or `addThemingController` not called               |
| Component ignores theme switching            | No `addThemingController(this, all)` in the constructor                          |
| `[part='base']` stops matching               | `partMap` emits multiple names — use `[part~='base']`                            |
| TypeScript doesn't know the tag              | Missing `declare global { interface HTMLElementTagNameMap { … } }`               |
| Story descriptions are stale                 | The `// region default` block was hand-edited — fix the JSDoc and regenerate     |
| Story never updates                          | Filename doesn't match the tag name, or the region fence is missing              |
| `npm run check` fails on imports             | A relative import into `internals`/`theming`/`animations`, or a missing alias in `scripts/_package.json` |

## Reference Examples

| Kind                | Component                          | Shows                                                     |
| ------------------- | ---------------------------------- | --------------------------------------------------------- |
| Simple display      | `src/components/badge/badge.ts`    | Theming, slot controller, `partMap`, internals ARIA        |
| Form-associated     | `src/components/input/input.ts`    | Form mixin, validators, `input-shell` template, ARIA target |
| Composite / overlay | `src/components/select/select.ts`  | ARIA projection, keybindings, popover                      |
| Container           | `src/components/card/card.ts`      | Registering sub-components, composition                    |

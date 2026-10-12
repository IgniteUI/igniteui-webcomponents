---
name: create-new-component
description: Create a new Lit web component following project conventions, including specification, component class, styles, tests, Storybook story, and exports
---

# Create New Component

Scaffolds a component. The rules behind each step are in the
[Coding Guidelines](../../../.github/CODING_GUIDELINES.md).

Related: [add-component-property](../add-component-property/),
[update-component-styles](../update-component-styles/).

## Required Context

Confirm with the user before you start:

- **Name**: `progress-bar` → tag `igc-progress-bar`, class `IgcProgressBarComponent`
- **Purpose**: one sentence, used as-is in the public API docs
- **Public API**: initial properties, events, slots, CSS parts
- **Kind**: display component, container, or form-associated control

## Steps

### 1. Write the specification

Write `src/components/[name]/spec.md` first. It decides the public API, the keyboard model and
the ARIA semantics. Copy the structure of `src/components/splitter/spec.md` and follow
[Specifications](../../../.github/CODING_GUIDELINES.md#specifications): one spec per directory, a
hand-maintained table of contents, a revision history that starts at version 1, and no
ownership sections. Fill in `## Test scenarios` in step 6.

### 2. Create the component class

`src/components/[name]/[name].ts`:

```ts
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '#internals/definitions/register.js';
import { all } from '#themes/[name]/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles } from './themes/[name].base.css.js';
import { styles as shared } from './themes/shared/[name].common.css.js';

/**
 * [One-sentence description.]
 *
 * @element igc-[name]
 *
 * @slot - [Default slot description]
 *
 * @csspart base - [Part description]
 */
export default class Igc[Name]Component extends LitElement {
  public static readonly tagName = 'igc-[name]';
  public static override styles = [componentBase, styles, shared];

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
  @property({ reflect: true, attribute: 'some-prop' })
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

- Pass every component that the template renders to `registerComponent(Self, ...deps)`,
  directly. Do not rely on a dependency that registers it. `npm run check` verifies this.
- `componentBase` holds the sizing, scrollbar and `[hidden]` rules that every component
  shares. Keep it first in `styles`.
- Import the theme aggregator through `#themes`, never with a relative path. The publish
  build fails on a relative import, because it bypasses the single-theme package conditions.
- Follow the [region layout](../../../.github/CODING_GUIDELINES.md#components) and the
  [import rules](../../../.github/CODING_GUIDELINES.md#imports).
- Before you write lifecycle code, look for a controller in the
  [controllers table](../../../.github/CODING_GUIDELINES.md#controllers) or in `src/internals`. Examples:
  `addRovingFocusController`, `addToggleController`, `addHostListeners`, and the `resizable()` /
  `draggable()` directives.
- Write JSDoc as product documentation. See
  [API Documentation](../../../.github/CODING_GUIDELINES.md#api-documentation).

### 3. Create the SCSS files

The layout is in [Styles and Theming](../../../.github/CODING_GUIDELINES.md#styles-and-theming).
`src/components/badge/themes/` is a complete example. Use 4-space indentation and load-path
specifiers.

```scss
// themes/[name].base.scss
@use 'styles/utilities' as *;

:host {
    display: block;
}
```

```scss
// themes/light/_themes.scss (dark/_themes.scss has no $base)
@use 'styles/utilities' as *;
@use 'igniteui-theming/sass/themes/schemas/components/light/[name]' as *;

$base: digest-schema($light-[name]);
$material: digest-schema($material-[name]);
$bootstrap: digest-schema($bootstrap-[name]);
$fluent: digest-schema($fluent-[name]);
$indigo: digest-schema($indigo-[name]);
```

```scss
// themes/light/[name].bootstrap.scss
// Dark files: add `@use '../light/themes' as light;` and use
// dark-overrides(light.$bootstrap, $theme).
@use 'styles/utilities' as *;
@use 'themes' as *;

$theme: $bootstrap;

:host {
    @include css-vars-from-theme(diff($base, $theme));
}
```

Also create `light/[name].shared.scss` (the full variable set from `$base`),
`shared/[name].common.scss`, and, if you need them, `shared/[name].[theme].scss`.

> [!NOTE]
> A new component has no schema until one is added to `igniteui-theming`. Until then, declare
> the CSS variables in `shared/[name].common.scss` and leave the light and dark files empty.

### 4. Create the theme aggregator

`themes/themes.ts` is the only hand-written TypeScript file in `themes/`:

```ts
import type { ComponentThemes } from '#theming/types.js';
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
  shared,
  bootstrap: bootstrapLight,
  material: materialLight,
  fluent: fluentLight,
  indigo: indigoLight,
};

const dark = {
  shared,
  bootstrap: [bootstrapLight, bootstrapDark],
  material: [materialLight, materialDark],
  fluent: [fluentLight, fluentDark],
  indigo: [indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };
```

An entry lists its sheets in cascade order. A dark entry starts with the light sheet of the same
theme, because the dark files emit only overrides. If you add `shared/[name].[theme].scss`
files, put each one first in both entries, for example `[bootstrap, bootstrapLight]` and
`[bootstrap, bootstrapLight, bootstrapDark]` (see `badge/themes/themes.ts`).

### 5. Transpile the styles

```bash
npm run build:styles
```

This generates the `.css.ts` files, which are gitignored. The build compiles only
`*.{base,common,shared,material,bootstrap,indigo,fluent}.scss` files. It skips other names and
does not warn.

### 6. Write the tests

`src/components/[name]/[name].spec.ts`:

```ts
import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import Igc[Name]Component from './[name].js';

describe('[Name]', () => {
  let element: Igc[Name]Component;

  before(() => {
    defineComponents(Igc[Name]Component);
  });

  beforeEach(async () => {
    element = await fixture<Igc[Name]Component>(html`<igc-[name]></igc-[name]>`);
  });

  it('passes the a11y audit', async () => {
    await expect(element).shadowDom.to.be.accessible();
    await expect(element).to.be.accessible();
  });

  it('is initialized with the proper default values', () => {
    expect(element.someProp).to.equal('default-value');
  });

  it('updates on property change', async () => {
    element.someProp = 'new-value';
    await elementUpdated(element);

    expect(element).to.have.attribute('some-prop', 'new-value');
  });
});
```

Use the shared helpers in `#internals/testing/` for interaction and forms (see
[Testing](../../../.github/CODING_GUIDELINES.md#testing)). Do not import one component spec from another,
because that runs the imported suite again.

Then fill in the `## Test scenarios` section of the spec: one subsection per `describe` block,
numbered contiguously. Name the shared runners that the suite uses. Put documented behavior
that the suite does not test under `### Not covered by the suite`.

### 7. Create the Storybook story

Create `stories/[name].stories.ts`. The filename must match the tag name. See
[Storybook](../../../.github/CODING_GUIDELINES.md#storybook) for the full template.

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
  render: (args) => html`<igc-[name] .someProp=${args.someProp}>Content</igc-[name]>`,
};
```

Step 8 regenerates the `// region default` block. Write only the stories.

### 8. Export and generate metadata

Add the export to `src/index.ts` in alphabetical order:

```ts
export { default as Igc[Name]Component } from './components/[name]/[name].js';
```

Also add the component to the list in `src/internals/definitions/defineAllComponents.ts`.

```bash
npm run public-api:update # custom-elements.json, and the new tag and export in public-api.json
npm run build:meta        # the story's `// region default` block
```

Commit `public-api.json` with the component.

### 9. Verify

```bash
npm run check && npm run lint && npm run test
```

Add a CHANGELOG entry.

## Validation Checklist

- [ ] `spec.md` follows the splitter structure. Its API tables match the code and its test
      scenarios match the suite.
- [ ] Single default export, with `tagName`, `styles` (`componentBase` first), `register()`
      and `HTMLElementTagNameMap`
- [ ] `addThemingController(this, all)` in the constructor
- [ ] JSDoc with `@element`, `@slot`, `@csspart`, `@cssproperty` and `@event` as applicable, and
      no `igc-` tag names in prose
- [ ] Complete SCSS scaffold, with every theme file in `themes.ts`, imported through `#themes`
- [ ] The a11y audit covers the shadow DOM and the light DOM
- [ ] The story is named after the tag and has the region fence
- [ ] Exported from `src/index.ts` and listed in `defineAllComponents.ts`. `public-api:update`
      and `build:meta` run.
- [ ] `check`, `lint` and `test` pass. CHANGELOG updated.

## Common Pitfalls

| Symptom                                | Cause / Fix                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| Cannot resolve `./themes/*.css.js`     | `build:styles` did not run, or the `.scss` name is outside the build glob           |
| Component ignores theme switching      | `addThemingController` is missing, or a file is missing from `themes.ts`            |
| `[part='base']` stops matching         | `partMap` emits multiple names. Use `[part~='base']`.                               |
| Story metadata is stale or never made  | The filename does not match the tag, the fence is missing, or the region was edited |
| `npm run check` fails on imports       | A relative import into `internals`/`theming`/`animations`                           |
| `npm run check` fails on registration  | `register()` lacks a rendered tag, or `defineAllComponents` lacks the component     |
| `build:publish` fails on theme entries | A relative aggregator import, or a theme sheet imported outside `themes.ts`         |
| Spec anchors do not resolve            | A TOC entry is missing, or the slug is wrong (`Undo / redo` → `undo--redo`)         |

## Reference Examples

| Kind            | Path                              | Shows                                                     |
| --------------- | --------------------------------- | --------------------------------------------------------- |
| Specification   | `src/components/splitter/spec.md` | The reference spec structure                              |
| Display         | `src/components/badge/badge.ts`   | Theming, slot controller, `partMap`, internals ARIA       |
| Form-associated | `src/components/input/input.ts`   | Form mixin, validators, `@coercedProperty`, `input-shell` |
| Composite       | `src/components/select/select.ts` | ARIA projection, keybindings, popover                     |
| Container       | `src/components/card/card.ts`     | Registering sub-components                                |

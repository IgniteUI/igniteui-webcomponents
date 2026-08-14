# Coding Guidelines

## General

1. Clear is better than clever. Optimize for simple, readable code first.
2. Prefer longer, more descriptive names, over shorter names.
3. Use web-compatible, full URLs as import specifiers, including file extensions:

   ```ts
   // ✅ DO
   import * as foo from './foo.js';

   // ❌ DON'T
   import * as foo from './foo';
   ```

4. We use TypeScript and have strict compiler options turned on. Do not change them.
5. Prefer the `unknown` type over `any`.
6. Prefer the `object` type over `Object`.
7. Prefer explicitly defining a function shape over using `Function` as a type.
8. Don't use TypeScript `namespace`.
9. Prefer simple union types over `enum`.
10. Internal API (properties, methods, getters, setters) should be prefixed with an underscore (`_`).
11. Use the `readonly` modifier for properties that should not be reassigned.
12. Specify return types for functions and methods explicitly rather than relying on inference, unless the type is obvious or causes unnecessary clutter in the source code.
13. Don't use native private fields (`#field`). Use TypeScript `private` with an `_` prefix.

## Project Structure

```
src/
├── animations/  # Animation players and presets            → #animations/*
├── components/  # One directory per component
├── extras/      # Opt-in add-ons, published as `igniteui-webcomponents/extras`
├── internals/   # Shared building blocks, never public API  → #internals/*
├── styles/      # Global SCSS: utilities, mixins, themes
├── theming/     # Theming controller and types             → #theming/*
└── index.ts     # Public entry point of the package
```

`src/internals` holds everything shared between components and nothing that ships
as public API:

| Directory      | Contents                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------- |
| `controllers/` | Reactive controllers — slots, ElementInternals, keybindings, observers, gestures, ARIA, etc.  |
| `date/`        | The `CalendarDay` model, date comparison and conversion helpers                               |
| `decorators/`  | `shadowOptions`, the Blazor markers, the legacy `watch`                                       |
| `definitions/` | `registerComponent`, `defineComponents`, `defineAllComponents`                                |
| `i18n/`        | Localization controller and the EN resource strings                                           |
| `mixins/`      | `EventEmitterMixin`, the form-associated mixins, mask behavior, combo box, alert              |
| `templates/`   | Shared render fragments (`input-shell`, `masked-input`)                                       |
| `testing/`     | Test-only helpers and shared suites — `*.spec.ts`, never imported by production code          |
| `utils/`       | Domain-split helpers: `arrays`, `dom`, `events`, `lit`, `math`, `objects`, `strings`, `types` |

Nothing under `src/internals` is exported from `src/index.ts`. If a helper has to
become part of the public API, it moves out of `internals` first.

## Components

- As a rule of thumb new components should be placed in the **components** sub-directory following the pattern below:

  `src/components/[component]/[component].ts`

- Stick to a single export from the component file, that is the component class itself.
- Testing file(s) should be also in the same directory following the `[component-name].spec.ts` pattern.
- CSS styles and theming assets usually live in `src/components/[component]/themes/*`.
- Anything else is a fair game as long as it has consistent and meaningful naming.

- When adding a new component or modifying an existing one, stick to the following code structure. Use region comments to clearly delineate sections of the component.

```ts
export default class IgcFooBarComponent extends LitElement {
  /** Static members */

  /**
   * Each component should define a valid custom element tag name.
   */
  public static readonly tagName = 'igc-foo-bar';
  public static override styles = [styles, shared];

  /**
   * Since Ignite UI web components are not self-registering by themselves,
   * each component should implement the `register` static method.
   * The `registerComponent` call will add the component to the custom elements
   * registry (if not already present) and all its dependent components.
   */
  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcFooBarComponent, IgcFooChildComponent);
  }

  //#region Internal state and properties

  private _foo = 0;
  private readonly _controller = addSomeController(this);

  @state()
  protected _invalid = false;

  @query('input')
  private _inputElement!: HTMLInputElement;

  @queryAssignedElements({ selector: IgcFooChildComponent.tagName })
  protected _fooChildren!: Array<IgcFooChildComponent>;

  protected get _bar(): number {
    return this._foo * 2;
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * The value of the component.
   * @attr
   */
  @property()
  public value = '';

  /**
   * Determines whether the component is disabled.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Returns whether the component is complete. */
  public get complete(): boolean {
    return this._invalid;
  }

  //#endregion

  constructor() {
    super();
    addThemingController(this, all);
    this.addEventListener('input', this._handleInput);
  }

  //#region Lit lifecycle methods

  public override connectedCallback(): void {
    super.connectedCallback();
    // ...
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    // Compute derived state before rendering
    if (changedProperties.has('value')) {
      this._invalid = !!this.value;
    }
  }

  protected override update(changedProperties: PropertyValues<this>): void {
    // Handle side effects or sync state with DOM access
    if (changedProperties.has('disabled')) {
      this._updateAriaDisabled();
    }
    super.update(changedProperties);
  }

  protected override firstUpdated(
    changedProperties: PropertyValues<this>
  ): void {
    // ...
  }

  //#endregion

  //#region Event handlers

  private _handleInput(event: InputEvent): void {
    // ...
  }

  //#endregion

  //#region Internal API

  private _resetState(): void {
    // ...
  }

  private _updateAriaDisabled(): void {
    // ...
  }

  protected _updateState(): void {
    // ...
  }

  //#endregion

  //#region Public API

  /** Resets the component to its initial state. */
  public reset(): void {
    this._resetState();
  }

  //#endregion

  protected _renderContainer() {
    // ...
  }

  protected _renderInput() {
    // ...
  }

  protected override render() {
    return html`${this._renderInput()}${this._renderContainer()}`;
  }
}

/**
 * TypeScript will infer the class of an HTML element returned from certain DOM APIs based on the tag name.
 * Add the `HTMLElementTagNameMap` for each component so it can be included in the `.d.ts` typings of the library
 * and it's properly type-checked.
 */

declare global {
  interface HTMLElementTagNameMap {
    'igc-foo-bar': IgcFooBarComponent;
  }
}
```

- **Component Structure Guidelines:**
  1. **Static members** come first (no region fence needed).
  2. Use `//#region Internal state and properties` for all internal reactive and non-reactive state, controllers, DOM queries, and internal getters/setters.
  3. Use `//#region Public attributes and properties` for all public reactive properties and read-only getters.
  4. **Constructor** follows the public properties section (no region fence).
  5. Use `//#region Lit lifecycle methods` for `connectedCallback`, `disconnectedCallback`, `willUpdate`, `update`, `firstUpdated`, etc.
  6. Use `//#region Event handlers` for all event handler methods.
  7. Group internal methods in appropriately named regions based on their behavior or function (e.g., `//#region Keyboard navigation`, `//#region Form integration`, `//#region Internal API`).
  8. Use `//#region Public API` for all public methods.
  9. **Rendering methods** and the `render()` override come last (no region fence needed).

- **Computed and Derived State:**

  Prefer using Lit's lifecycle methods (`update` or `willUpdate`) over the `@watch` decorator for handling property changes and computing derived state.
  - Use `update()` when you need DOM access or want to trigger side effects.
  - Use `willUpdate()` for computing derived state before rendering.
  - The `@watch` decorator should be avoided in new code.

  ```ts
  // ✅ DO
  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('value')) {
      this._invalid = this.value.length < this.minLength;
    }
  }

  protected override update(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('disabled')) {
      this._updateAriaAttributes();
    }
    super.update(changedProperties);
  }

  // ❌ DON'T
  @watch('value')
  protected valueChange(): void {
    this._invalid = this.value.length < this.minLength;
  }
  ```

- After adding new component(s) to the library, make sure to export them from the entry point of the package:

```ts
// in src/index.ts

/* ... */
export { default as IgcFooBarComponent } from './components/foobar/foobar.js';
/* ... */
```

## Imports

- The cross-cutting directories are imported through a `#` **subpath alias**, never relatively:

  | Directory        | Alias           |
  | ---------------- | --------------- |
  | `src/internals`  | `#internals/*`  |
  | `src/theming`    | `#theming/*`    |
  | `src/animations` | `#animations/*` |

  Everything else stays relative — including one component importing another (`../icon/icon.js`),
  which is both shorter and no less stable than an alias would be.

  The aliases are Node subpath imports, declared in the `imports` field of `package.json`
  (pointing at the sources) and of `scripts/_package.json` (the published manifest, where
  `dist` is the package root). They are plain ESM: nothing rewrites them, the specifier you
  write is the specifier that ships.

  A file inside an aliased directory keeps relative paths for its own siblings, but uses the
  alias to reach a different one. `npm run check` enforces all of this via dependency-cruiser.

  > [!WARNING]
  > Adding an alias means editing **both** manifests. Declaring it only in `package.json`
  > type-checks and tests green locally and breaks exclusively for consumers of the published
  > package; `npm run check` guards against that.

  ```ts
  // ✅ DO
  import { addSlotController } from '#internals/controllers/slot.js';

  // ❌ DON'T
  import { addSlotController } from '../../internals/controllers/slot.js';
  ```

- Ordering is handled by Biome (`biome check --fix`) and needs no manual grouping. It produces
  one contiguous block sorted by source: external packages, then `#` aliases, then `../`, then
  `./`, with type imports sorted by path alongside the rest rather than pushed to the end.

  ```ts
  // ✅ DO
  import { html, LitElement, type PropertyValues } from 'lit';
  import { property } from 'lit/decorators.js';
  import { addSlotController, setSlots } from '#internals/controllers/slot.js';
  import { registerComponent } from '#internals/definitions/register.js';
  import { addThemingController } from '#theming/theming-controller.js';
  import type { BadgeShape, StyleVariant } from '../types.js';
  import { styles } from './themes/badge.base.css.js';
  import { all } from './themes/themes.js';
  ```

## Controllers

Controllers are reusable pieces of logic that hook into a component's lifecycle. Reach for an
existing one before writing lifecycle code by hand:

| Controller                                                    | Module                                          | Use for                                                        |
| ------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| `addThemingController`                                        | `#theming/theming-controller.js`                | Theme resolution. **Required for every component.**            |
| `addSlotController` / `setSlots`                              | `#internals/controllers/slot.js`                | Observing and querying slotted content                         |
| `addInternalsController` / `internalsOf`                      | `#internals/controllers/internals.js`           | ElementInternals: ARIA, custom states, form value and validity |
| `addKeybindings`                                              | `#internals/controllers/key-bindings.js`        | Keyboard interaction and navigation                            |
| `addAriaTarget` / `addAriaProjector` / `ariaBindings`         | `#internals/controllers/aria-projection.js`     | Projecting composite ARIA across shadow roots                  |
| `addCommandController`                                        | `#internals/controllers/command.js`             | The native Invoker Commands API (`command` / `commandfor`)     |
| `addIdRefResolver`                                            | `#internals/controllers/id-resolver.js`         | Resolving IDREF attributes into elements                       |
| `addRootClickController` / `addRootScrollHandler`             | `#internals/controllers/root-*.js`              | Dismissing overlays on outside click / scroll                  |
| `createMutationController` / `createResizeObserverController` | `#internals/controllers/*-observer.js`          | Observing DOM mutations and size changes                       |
| `addDragController` / `addGesturesController`                 | `#internals/controllers/drag.js`, `gestures.js` | Pointer dragging and gestures                                  |
| `addKeyboardFocusRing`                                        | `#internals/controllers/focus-ring.js`          | Showing focus styling only for keyboard focus                  |
| `addFullscreenController`                                     | `#internals/controllers/fullscreen.js`          | Fullscreen state                                               |
| `addAdoptedStylesController`                                  | `#internals/controllers/adopt-styles.js`        | Adopting document styles into a shadow root                    |
| `addI18nController`                                           | `#internals/i18n/i18n-controller.js`            | Localized resource strings                                     |

- Controllers should be stored as `readonly` class fields and initialized inline, with the
  exception of `addThemingController` and `addKeybindings`, which are set up in the constructor:

  ```ts
  private readonly _slots = addSlotController(this, {
    slots: setSlots('prefix', 'suffix'),
    onChange: this._handleSlotChange,
  });
  ```

## Slots

- Use slots to allow content composition. Document all slots with `@slot` JSDoc tags.
- The default slot typically holds the main content.
- Named slots serve specific purposes (e.g., `prefix`, `suffix`, `header`).
- Use `addSlotController` to react to slot content changes. The default slot is queried
  through the `DefaultSlot` key (`'[default]'`):

  ```ts
  private readonly _slots = addSlotController(this, {
    slots: setSlots('prefix', 'suffix'),
    onChange: this._handleSlotChange,
  });

  private _handleSlotChange(): void {
    this._hasPrefix = this._slots.hasAssignedElements('prefix');
    this._hasIcon = this._slots.hasAssignedElements('[default]', {
      selector: 'igc-icon',
    });
  }
  ```

## Shadow DOM and CSS Parts

- All components use Shadow DOM for style encapsulation (mode: `'open'` by default).
- Expose internal elements as CSS parts using the `part` attribute to allow external styling:

  ```ts
  /**
   * @csspart base - The main container
   * @csspart input - The native input element
   */
  protected override render() {
    return html`
      <div part="base">
        <input part="input" />
      </div>
    `;
  }
  ```

- Use the `partMap` directive for conditional parts:

  ```ts
  import { partMap } from '#internals/part-map.js';

  protected override render() {
    return html`
      <div part=${partMap({ base: true, invalid: this._invalid })}>
        ...
      </div>
    `;
  }
  ```

- Match parts in SCSS with `[part~='base']`, not `[part='base']` — a `partMap` result is a
  space-separated list and an exact-match selector silently stops applying once a second
  part name is added.

- For delegating focus to internal elements, use the `@shadowOptions` decorator:

  ```ts
  import { shadowOptions } from '#internals/decorators/shadow-options.js';

  @shadowOptions({ delegatesFocus: true })
  export default class IgcInputComponent extends LitElement {
    // Focus is automatically delegated to the first focusable element
  }
  ```

## Styles and Theming

Styles are authored in SCSS and transpiled into Lit `css` tagged templates. A component's
`themes` directory follows a fixed layout:

```
themes/
├── [component].base.scss       # Structure and layout, theme-agnostic
├── shared/
│   ├── [component].common.scss # Cross-theme styling, sizing, CSS variables
│   └── [component].{bootstrap,material,fluent,indigo}.scss
├── light/
│   ├── _themes.scss            # digest-schema() of the light schemas
│   ├── [component].shared.scss # Base palette variables for all themes
│   └── [component].{bootstrap,material,fluent,indigo}.scss
├── dark/
│   ├── _themes.scss            # digest-schema() of the dark schemas
│   └── [component].{bootstrap,material,fluent,indigo}.scss
└── themes.ts                   # Aggregates everything into the `all` export
```

> [!IMPORTANT]
> `npm run build:styles` generates a `.css.ts` file next to each `.scss` one, imported from
> the component as `.css.js`. The generated files are gitignored — never edit or commit them.
> During development `npm run storybook` and `npm run test:watch` rebuild them automatically.

- Only files matching `*.{base,common,shared,material,bootstrap,indigo,fluent}.scss` under
  `src/components/**` are picked up by the build. A differently named partial is silently
  skipped — prefix shared partials with `_` and `@use` them instead.
- SCSS resolves against the `src` and `node_modules` load paths, so global helpers are
  imported by package-style specifiers, not relative paths:

  ```scss
  // ✅ DO
  @use 'styles/utilities' as *;
  @use 'igniteui-theming/sass/themes/schemas/components/light/badge' as *;

  // ❌ DON'T
  @use '../../../styles/utilities' as *;
  ```

- Theme values come from the `igniteui-theming` schemas, digested in `_themes.scss` and read
  through `var-get()`. Light theme files emit the full variable set, dark files emit only the
  `diff()` against light:

  ```scss
  // light/badge.bootstrap.scss
  @use 'styles/utilities' as *;
  @use 'themes' as *;

  $theme: $bootstrap;

  :host {
    @include css-vars-from-theme(diff($base, $theme));
  }
  ```

- Never hardcode colors or sizes. Use `var-get($theme, 'text-color')`, `contrast-color()`,
  `sizable()` and the `--ig-size` scale.
- Keep selector specificity low and expose CSS parts so consumers can style the component
  from the outside.
- `themes.ts` is the only hand-written TypeScript file in the directory; it composes the
  shared, light and dark styles into the `Themes` object passed to `addThemingController`.

## Accessibility

Accessibility is a first-class requirement for all components.

- **Always test accessibility** - Components must pass a11y audits in tests.
- Use semantic HTML elements where appropriate (`<button>`, `<input>`, not generic `<div>` with click handlers).
- Provide proper ARIA attributes using `addInternalsController`:

  ```ts
  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'button',
      ariaLabel: 'Close',
    },
  });

  // Update ARIA dynamically
  this._internals.setARIA({ ariaExpanded: `${this.open}` });
  ```

- When tooling that only reads content attributes (axe, for one) must see the
  role, enable `reflectRole` instead of writing `this.role = '…'` by hand:

  ```ts
  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'option' },
    reflectRole: true, // mirrors the internals role as a `role` content attribute
  });
  ```

  The controller reflects the current internals role on connect and whenever
  `setARIA()` changes it, and yields to an author-supplied `role` attribute.

- Internal code that needs another component's internals controller (composite
  hosts, specs) reaches it through the `internalsOf()` registry lookup in
  `#internals/controllers/internals.js`. Never add `public` members tagged
  `@hidden`/`@internal` for cross-component access — the registry keeps the
  compiled public API clean.

- **Keyboard navigation** is required for interactive components:
  - Tab navigation should work naturally
  - Arrow keys for list navigation
  - Enter/Space for activation
  - Escape to close/cancel
  - Home/End for first/last item

- Use `addKeybindings` for keyboard interaction:

  ```ts
  import {
    addKeybindings,
    arrowDown,
    arrowUp,
    enterKey,
  } from '#internals/controllers/key-bindings.js';

  constructor() {
    super();
    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowDown, this._navigateNext)
      .set(arrowUp, this._navigatePrevious)
      .set(enterKey, this._handleActivate);
  }
  ```

- Ensure **focus management** - visible focus indicators and logical focus order.
- Provide **text alternatives** for non-text content.
- Meet **WCAG 2.1 Level AA** standards minimum.

### ARIA across shadow boundaries

Shadow DOM breaks two things ARIA depends on: the identity of the focused
element, and IDREF resolution. Both matter for composite components (select,
combo, the date pickers) that wrap an input-shaped component:

- A host using `delegatesFocus` must **not** publish `role`/`aria-*` on itself
  or on the wrapper element — assistive technology reports from the native
  editor that actually receives focus, one shadow root deeper.
- IDREF-valued relations (`aria-controls`, `aria-describedby`,
  `aria-labelledby`, `aria-activedescendant`) resolve within a single tree
  scope, so a reference from the native editor to an element in the host's
  shadow root is silently dead. Such relations must travel as **element
  references** through ARIA element reflection (`ariaControlsElements`, …),
  which does resolve into ancestor tree scopes. For a given relation, the
  content attribute and the reflection property are two views of one
  association — assigning the property detaches the attribute — so a relation
  is either all IDREF or all element references.

`#internals/controllers/aria-projection.js` packages the solution as a
controller pair:

- **Editor side** — every input-shaped component (input, textarea, mask input,
  date-time input) registers as a projection target and applies the resolved
  bindings onto its native editor with the `ariaBindings()` element-expression
  directive:

  ```ts
  protected readonly _ariaTarget = addAriaTarget(this, {
    labels: () => this._internals.labels,
    description: () => this._helperText, // own helper-text element, or null
  });

  protected _renderInput() {
    return html`
      <input ${ariaBindings(this._ariaTarget.resolveBindings())} ... />
    `;
  }
  ```

- **Host side** — the composite component declares what it projects; after
  every host update the state is pushed onto the target (with an equality
  guard and a retry for targets that upgrade late):

  ```ts
  // in the select component
  private readonly _ariaProjector = addAriaProjector(this, {
    target: () => this._input,
    state: () => ({
      role: 'combobox',
      hasPopup: 'listbox',
      expanded: `${this.open}`,
      controls: this._list ? [this._list] : null,
      describedBy: this._container ? [this._container] : null,
      labelledBy: this._internals.labels,
    }),
  });
  ```

- The target mirrors the projected `role`/`hasPopup` as
  `data-role`/`data-haspopup` attributes on the input component itself. These
  are **styling hooks** for the themes — `:host()` selectors cannot observe
  ARIA living on the native editor inside the shadow root — so key theme
  selectors for composite anchors off the `data-*` attributes, never off
  `role`/`aria-*` host attributes.

Testing cross-root ARIA:

- Reuse the shared suites in `src/internals/testing/form-testbed.spec.ts`:
  `runExternalLabelAssociationTests` (external `<label>` association through
  `for`/nesting) and `runAriaProjectionTests` (host semantics landing on the
  native editor).
- Assert reflected relations by identity readback
  (`input.ariaControlsElements[0] === list`), never by content attribute —
  reflection blanks the attribute by spec.
- For the same reason axe reports `aria-controls` as missing on
  `role="combobox"` editors (`aria-required-attr`). Suppress that single rule
  with the shared `axeReflectedRelationsOptions` from
  `#internals/testing/helpers.spec.js`, next to a test asserting the real
  relation.

## Testing

All components must include comprehensive tests in `[component-name].spec.ts`.

- **Required tests:**
  1. Accessibility audit (mandatory):
     ```ts
     it('passes the a11y audit', async () => {
       const el = await fixture<IgcComponentComponent>(
         html`<igc-component></igc-component>`
       );
       await expect(el).shadowDom.to.be.accessible();
       await expect(el).to.be.accessible();
     });
     ```
  2. Default initialization
  3. Property/attribute setting and reflection
  4. Event emission
  5. User interactions (clicks, keyboard)
  6. Edge cases

- Use `defineComponents()` in the `before()` hook to register components:

  ```ts
  import { defineComponents } from '#internals/definitions/defineComponents.js';

  describe('Component', () => {
    before(() => {
      defineComponents(IgcComponentComponent);
    });
    // tests...
  });
  ```

- Use `elementUpdated()` after programmatic changes:

  ```ts
  element.value = 'new value';
  await elementUpdated(element);
  expect(element.value).to.equal('new value');
  ```

- Test both Light DOM and Shadow DOM:

  ```ts
  expect(element).dom.to.equal('<igc-component value="test"></igc-component>');
  expect(element).shadowDom.to.equal('<div part="base">...</div>');
  ```

- Reuse the shared test infrastructure under `#internals/testing/` instead of
  reimplementing it per component:

  | Module                     | Provides                                                                       |
  | -------------------------- | ------------------------------------------------------------------------------ |
  | `simulate.spec.js`         | `simulateClick`, `simulateKeyboard`, `simulatePointerDown`, `simulateInput`, … |
  | `form-testbed.spec.js`     | `createFormAssociatedTestBed` plus the shared label/ARIA-projection suites     |
  | `validity-helpers.spec.js` | Assertions for validity state, custom errors and the invalid custom state      |
  | `helpers.spec.js`          | Animation, focus, scroll and style helpers, `axeReflectedRelationsOptions`     |

  Prefer these simulated events over `element.click()` or hand-built `KeyboardEvent`s — they
  produce the full, ordered event sequence a real user interaction does.

## Properties and Attributes

- Property names should always be `camelCased` while the backing attribute, if present, should be `kebab-cased`. A special case are properties/attributes that mimic the standard HTML attributes, such as `readOnly/readonly`, `minLength/minlength`, etc.

  It is encouraged to explicitly specify the kebab cased attribute name in the `@property` decorator for such properties.

  ```ts
  // ✅ DO
  /**
   * Controls the orientation of the header.
   * @attr header-orientation
   */
  @property({ attribute: 'header-orientation' })
  public headerOrientation: 'vertical' | 'horizontal' = 'horizontal';

  // ❌ DON'T
  /**
   * Controls the orientation of the header.
   * @attr
   */
  @property({ attribute: 'headerOrientation' })
  public headerOrientation: 'vertical' | 'horizontal' = 'horizontal';
  ```

- For a boolean property to be configurable from an attribute, it must default to false. If it defaults to true, you cannot set it to false from markup, since the presence of the attribute, with or without a value, equates to true. This is the standard behavior for attributes in the web platform.

  If this behavior doesn't fit your use case, there are a couple of options:
  - Change the property name so it defaults to false.
  - Use a string-valued or number-valued attribute instead.

  ```ts
  // ✅ DO
  /**
   * Enables/disables user interaction with the component.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  // ❌ DON'T
  /**
   * Enables/disables user interaction with the component.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public enabled = true;
  ```

- Reflecting properties to attributes should be done sparingly. As a general guideline, primitive properties related to accessibility and/or styling should be reflected.

  **Do not reflect** properties of type object or array.

- For complex types (objects, arrays, functions), use `attribute: false` to prevent Lit from attempting to serialize them to attributes:

  ```ts
  // ✅ DO
  /** Configuration object for the component. */
  @property({ attribute: false })
  public config: ComponentConfig = {};

  /** Collection of items to display. */
  @property({ attribute: false })
  public items: Array<Item> = [];

  // ❌ DON'T — objects can't be attributes
  @property()
  public config: ComponentConfig = {};
  ```

## Custom Events

- Events are the standard way that elements communicate changes. These changes typically occur due to user interaction. As such, components
  should emit events only in response to an user interaction, not an API invocation (property changed, method called).

- In order to provide good TypeScript typings, components that emit custom events should derive from the
  `EventEmitterMixin` class and provide a type map for their events, which is passed to the mixin.

  ```ts
  /**
   * FooBar events
   */
  export interface IgcFooBarEventMap {
    igcFoo: CustomEvent<string>;
    igcBar: CustomEvent<void>;
    /* ... */
  }

  export default class IgcFooBarComponent extends EventEmitterMixin<
    IgcFooBarEventMap,
    Constructor<LitElement>
  >(LitElement) {
    /* ... */
  }
  ```

- Custom event names are `camelCase` with an **igc** prefix. Any cancelable events usually have an **-ing** suffix.

  ```ts
  export interface IgcFooBarEventMap {
    igcStateUpdating: CustomEvent<Record<string, unknown>>; // Cancelable
    igcStateChange: CustomEvent<Record<string, unknown>>;
    /* ... */
  }
  ```

- Calling `EventEmitterMixin.emitEvent` without modifying the `eventInitDict` parameter dispatches events that are non-cancelable, composed and bubble up the ancestor tree.

- For cancelable events (typically `-ing` suffix), check the return value to determine if the event was canceled:

  ```ts
  if (!this.emitEvent('igcOpening', { cancelable: true, detail: data })) {
    return; // Event was canceled, abort operation
  }
  // Proceed with operation
  ```

## Form Integration

Components that participate in forms extend one of the form-associated mixins from
`#internals/mixins/forms/`:

| Mixin                                 | Use for                                       |
| ------------------------------------- | --------------------------------------------- |
| `FormAssociatedMixin`                 | Value-based controls; adds `defaultValue`     |
| `FormAssociatedRequiredMixin`         | The same, plus a `required` attribute         |
| `FormAssociatedCheckboxMixin`         | Checked-based controls; adds `defaultChecked` |
| `FormAssociatedCheckboxRequiredMixin` | The same, plus a `required` attribute         |

The mixins supply `name`, `disabled`, `invalid`, `form`, `validity`,
`validationMessage`, `willValidate`, `checkValidity()`, `reportValidity()` and
`setCustomValidity()`. A component only has to provide its value state and its validators:

```ts
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import {
  maxLengthValidator,
  requiredValidator,
} from '#internals/validators.js';

const validators = [requiredValidator, maxLengthValidator];

export default class IgcInputComponent extends FormAssociatedRequiredMixin(
  LitElement
) {
  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
  });

  protected override get __validators() {
    return validators;
  }
}
```

- Prefer the shared validators in `#internals/validators.js` (`requiredValidator`,
  `minLengthValidator`, `patternValidator`, `minValidator`, `stepValidator`,
  `minDateValidator`, …) over hand-rolled checks. `valueMissing` short-circuits the rest,
  so a required control reports the required message first.
- Non-string values are mapped to their form representation through transformers passed to
  `createFormValueState` — see `FormValueDateTimeTransformers` in `form-transformers.ts`.

**Updating the value.** `setValueAndFormState()` is the single entry point that writes the
value, pushes it to the form and re-runs validation. Setting `_formValue.value` alone only
updates the component:

```ts
private _handleInput(event: InputEvent): void {
  const value = (event.target as HTMLInputElement).value;
  this._formValue.setValueAndFormState(value);
}

public get value(): string {
  return this._formValue.value;
}

public set value(val: string) {
  this._formValue.value = val;
  this._validate();
}
```

**Validation lifecycle.** The mixins model the native one; respect the seams instead of
duplicating them:

- `_validate()` runs the validators and updates the internals validity. Call it after any
  constraint-affecting property changes (`minLength`, `pattern`, `min`, …).
- Invalid **styling** is applied through the `ig-invalid` custom state, and only once the
  control has been touched — a blur or a failed submission. A disabled control is barred
  from constraint validation and never carries invalid styling.
- `invalid` is a visual state, is not reflected to an attribute, and its getter returns the
  _effective_ state — a touched, failing control keeps reading `true` after assigning `false`.
- Wire the native editor's `@blur` to `_handleBlur` (touches the control and validates) and
  its `@keydown` to `_handleEnterKeydown`, which submits through `form.requestSubmit()` so
  the browser runs its own validation feedback.
- `formResetCallback` restores the default through the public `value`/`checked` setter, so
  component-level clamping applies, and clears the pristine, touched and developer-set
  invalid states. Override it only to reset state the mixin cannot know about, and call
  `super.formResetCallback()`.

**Testing.** Use `createFormAssociatedTestBed` from
`#internals/testing/form-testbed.spec.js` together with the assertions in
`validity-helpers.spec.js` — it wires the control into a real `<form>` and gives you
submit, reset and restore helpers.

## Localization

Components with user-facing strings use `addI18nController`. Resource strings live in
`src/internals/i18n/EN/` and are keyed by a resource map name shared with the
`igniteui-i18n-core` package:

```ts
protected readonly _i18n = addI18nController<IgcChipResourceStrings>(this, {
  defaultEN: ChipResourceStringsEN,
  resourceMapName: 'chip',
});
```

- Never inline user-facing text in a template — read it from the controller so it follows the
  active locale and any consumer overrides.
- Format dates and times through `getDateTimeFormat` / `formatDisplayDate` from the same
  module rather than constructing `Intl` formatters ad hoc.

## Performance

- **Avoid unnecessary re-renders:**
  - Implement `shouldUpdate()` when you need to prevent updates based on specific conditions
  - Use `@state()` for internal reactive state, not `@property()`
  - Check `changedProperties.has()` in lifecycle methods to avoid unnecessary work

- **Optimize expensive operations:**
  - Use `cache()` directive for expensive template computation
  - Use `ifDefined()` for optional attributes, or `bindIf()` from `#internals/utils/lit.js`
    when the bound value differs from the condition being tested
  - Use `live()` directive for two-way binding scenarios

  ```ts
  import { cache } from 'lit/directives/cache.js';
  import { ifDefined } from 'lit/directives/if-defined.js';

  protected override render() {
    return html`
      <input
        type=${ifDefined(this.type)}
        .value=${this.value}
      />
      ${cache(this._renderExpensiveContent())}
    `;
  }
  ```

- **Avoid memory leaks:**

  Event listeners added in templates using `@event` syntax or directly on component instances are automatically managed by Lit and do not require manual cleanup.

  Only event listeners added dynamically (in `connectedCallback()`, other lifecycle methods, or event handlers) need explicit cleanup:

  ```ts
  import { addSafeEventListener } from '#internals/utils/events.js';

  constructor() {
    super();
    // addSafeEventListener prevents errors in SSR contexts
    // where addEventListener may not be available
    addSafeEventListener(this, 'click', this._handleClick);
  }

  // For dynamic listeners, clean up in disconnectedCallback
  private _handler = this._handleEvent.bind(this);

  public override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('resize', this._handler);
  }

  public override disconnectedCallback(): void {
    document.removeEventListener('resize', this._handler);
    super.disconnectedCallback();
  }
  ```

## Common Pitfalls

### 1. Forgetting to call super() in lifecycle methods

When overriding lifecycle methods, always call the super method:

```ts
protected override update(changedProperties: PropertyValues<this>): void {
  // Do work...
  super.update(changedProperties); // Don't forget!
}
```

### 2. Mutating objects/arrays directly

Lit cannot detect mutations to objects or arrays. Always create new instances:

```ts
// ❌ DON'T - Lit won't detect the change
this.items.push(newItem);

// ✅ DO - Lit detects the new array reference
this.items = [...this.items, newItem];
```

### 3. Accessing Shadow DOM too early

Shadow DOM elements are not available in `constructor()` or early lifecycle methods. Use `firstUpdated()` or later:

```ts
// ❌ DON'T - _inputElement is undefined
constructor() {
  super();
  this._inputElement.focus(); // Error!
}

// ✅ DO
protected override firstUpdated(): void {
  this._inputElement.focus(); // Works
}
```

### 4. Not handling async operations properly

When dealing with async operations in lifecycle methods, be careful about component state:

```ts
protected override async update(
  changedProperties: PropertyValues<this>
): Promise<void> {
  if (changedProperties.has('data')) {
    this._loading = true;
    await this._loadData();
    this._loading = false;
  }
  super.update(changedProperties);
}
```

### 5. Over-reflecting properties

Not every property needs to be reflected to an attribute. Only reflect when:

- It's a primitive type
- It affects styling (CSS attribute selectors)
- It's needed for accessibility

### 6. Forgetting the theming controller

All components must include the theming controller in the constructor:

```ts
constructor() {
  super();
  addThemingController(this, all); // Required for theme switching!
}
```

### 7. Misunderstanding event listener cleanup

Lit automatically manages event listeners added in templates or on component instances. You only need to clean up listeners added dynamically:

```ts
// NO CLEANUP NEEDED - Lit handles these automatically
protected override render() {
  return html`<button @click=${this._handleClick}>Click</button>`;
}

// NO CLEANUP NEEDED - Lit manages component instance listeners
constructor() {
  super();
  this.addEventListener('focus', this._handleFocus);
}

// CLEANUP REQUIRED - Dynamic external listeners
private _handler = this._handleResize.bind(this);

public override connectedCallback(): void {
  super.connectedCallback();
  window.addEventListener('resize', this._handler);
}

public override disconnectedCallback(): void {
  window.removeEventListener('resize', this._handler);
  super.disconnectedCallback();
}

// addSafeEventListener prevents SSR errors
constructor() {
  super();
  // Safe in SSR - won't error if addEventListener is unavailable
  addSafeEventListener(this, 'pointerdown', this._handlePointer);
}
```

### 8. Editing generated files

`.css.ts` files and the `// region default` block of a story are build output. Edit the
`.scss` source or the component's JSDoc instead — anything else is overwritten on the next
`npm run build:styles` / `npm run build:meta`.

## API Documentation

- API documentation is written by following standard JSDoc tags and idioms.

  Both TypeDoc and @custom-elements-manifest/analyzer are able to deduce most of the API by themselves. So tags such as `@param`, `@returns`, etc. are not required.

  The same goes for `@abstract`, `@static`, `@private`, `@protected` and related members
  since the documentation tools get this information directly from the TypeScript source code.

- For documenting things like CSS shadow parts, CSS custom properties and available slots, please
  check the official guidelines of the [CEM analyzer](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/#documenting-your-components).

- Every description is consumed **verbatim** by `custom-elements.json`, the generated
  Storybook metadata and the Angular / React / Blazor wrapper docs. Write them as product
  documentation:
  - **No `igc-` tag names in prose.** Say "the carousel", not `igc-carousel`. Tag names
    belong only in the `@element` tag, fenced `@example` blocks, literal event/attribute
    names that contain `igc-`, and `@internal`/`@hidden` members.
  - **Don't restate the tag.** `@attr` already says it is an attribute — write
    "The label of the control.", not "The label attribute of the control."
  - **No `Gets/Sets`.** State what the value is; add a second sentence for side effects.
  - **Booleans start with "Whether …"** and describe the `true` state accurately — verify
    against the implementation, since `hide*`/`disable*` names invert the sentence.
  - Use present tense.

- When documenting your code, put any JSDoc tags after the description of what the thing does

  ```ts
  // ✅ DO
  /**
   * Enables/disables user interaction with the component.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * An avatar component is used as a representation of a user identity
   * typically in a user profile.
   *
   * @element igc-avatar
   *
   * @slot - Renders an icon inside the default slot.
   *
   * @csspart base - The base wrapper of the avatar.
   * @csspart initials - The initials wrapper of the avatar.
   * @csspart image - The image wrapper of the avatar.
   * @csspart icon - The icon wrapper of the avatar.
   */
  export default class IgcAvatarComponent extends LitElement {}

  // ❌ DON'T
  /**
   * @attr
   * Enables/disables user interaction with the component.
   */
  @property({ type: Boolean, reflect: true })
  public enabled = true;
  ```

- When some API is deprecated, make sure to add a `@deprecated` tag with explanation when it was deprecated and what to use instead (if any). The deprecated message follows the following format:

  ``@deprecated since [SemVer]. Use the `[new API]` [type] instead.``

  ```ts
  // ✅ DO
  /**
   * Updates the state of the component.
   *
   * @deprecated since 1.2.3. Use the `setState()` method instead.
   */
  public updateState(state: T) {}

  // ❌ DON'T
  /**
   * @deprecated - Refer to the changelog for a migration guide.
   *
   * Updates the state of the component.
   */
  public updateState(state: T) {}
  ```

- After changing any description, regenerate the derived artifacts and commit them:

  ```bash
  npm run cem        # regenerates custom-elements.json from the JSDoc
  npm run build:meta # rewrites the `// region default` block of each story
  ```

## Storybook

All components should have a corresponding Storybook story in `stories/[component-name].stories.ts`.

- Stories provide interactive examples and documentation for components.
- The `metadata` object, the args interface and their descriptions live inside a **generated**
  `// region default … // endregion` block. Never hand-edit it — fix the component's JSDoc and
  run `npm run cem && npm run build:meta`.

  > [!CAUTION]
  > Two failure modes skip a story during generation: a filename that does not match the tag
  > name (`igc-date-picker` → `date-picker.stories.ts`), which warns, and a missing
  > `// region default` / `// endregion` pair, which is a **silent** no-op. Descriptions that
  > disagree with the source JSDoc are the symptom of both.

- Everything outside the generated region — the story templates themselves — is hand-written.
  Include multiple stories showcasing different component states and configurations.

```ts
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { defineComponents, IgcBadgeComponent } from 'igniteui-webcomponents';

defineComponents(IgcBadgeComponent);

// region default
const metadata: Meta<IgcBadgeComponent> = {
  title: 'Badge',
  component: 'igc-badge',
  argTypes: {
    variant: {
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
    },
  },
  args: { variant: 'primary' },
};

export default metadata;

type Story = StoryObj<IgcBadgeComponent>;
// endregion

export const Basic: Story = {
  render: (args) => html`<igc-badge .variant=${args.variant}>Badge</igc-badge>`,
};
```

## Verifying Your Work

| Command                | What it does                                                            |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run build:styles` | Transpiles SCSS into the generated `.css.ts` files                      |
| `npm run check`        | Import aliases, dependency-cruiser rules and TypeScript (`check-types`) |
| `npm run lint`         | Biome, lit-analyzer, Prettier and Stylelint                             |
| `npm run format`       | Applies Biome and Prettier fixes                                        |
| `npm run test`         | Builds styles and runs the Web Test Runner suite with coverage          |
| `npm run cem`          | Regenerates `custom-elements.json` from the sources                     |
| `npm run build:meta`   | Regenerates the story metadata regions                                  |
| `npm run storybook`    | Dev server with style, manifest and story watchers                      |

Run `npm run check`, `npm run lint` and `npm run test` before opening a PR.

## Changelog

- When adding a new component or fixing a bug make sure to update the [CHANGELOG](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md) file with the relevant changes.

## Resources

- **Project Documentation:** [README.md](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/README.md)
- **Lit Documentation:** [lit.dev](https://lit.dev/docs/)
- **Web Components:** [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- **Accessibility:** [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- **TypeScript:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Getting Help

- Review existing components in `src/components/` for patterns and examples
- Read the [LLM Skills](./skills/README.md) for guided workflows
- Ask questions in pull request reviews

## Checklist for New Components

Before submitting a PR for a new component, ensure:

- [ ] Component follows the standard structure with region fences
- [ ] All internal APIs prefixed with underscore (`_`)
- [ ] Theming controller added in constructor
- [ ] Cross-cutting imports use the `#internals` / `#theming` / `#animations` aliases
- [ ] Accessibility tested and passing
- [ ] All properties properly documented with JSDoc, no `igc-` tag names in prose
- [ ] Events use EventEmitterMixin with type map
- [ ] CSS parts exposed and documented
- [ ] Slots documented with `@slot` tags
- [ ] Comprehensive tests including a11y audit
- [ ] Storybook story created, generated region regenerated and committed
- [ ] Component exported from `src/index.ts`
- [ ] CHANGELOG updated
- [ ] `npm run check`, `npm run lint` and `npm run test` pass
</content>

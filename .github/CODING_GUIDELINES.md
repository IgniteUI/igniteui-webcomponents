# Coding Guidelines

## General

1. Clear is better than clever. Write simple, readable code first.
2. Prefer long, descriptive names to short ones.
3. Use full import specifiers, with the file extension:

   ```ts
   // ✅ DO
   import * as foo from './foo.js';

   // ❌ DON'T
   import * as foo from './foo';
   ```

4. The TypeScript compiler options are strict. Do not change them.
5. Use `unknown`, not `any`. Use `object`, not `Object`.
6. Give function types an explicit shape. Do not use `Function`.
7. Do not use `namespace` or `enum`. Use union types.
8. Prefix internal API (properties, methods, getters, setters) with `_`.
9. Use `readonly` for properties that are not reassigned.
10. Give functions and methods explicit return types, unless the type is obvious or adds noise.
11. Do not use native private fields (`#field`). Use TypeScript `private` with a `_` prefix.

## Project Structure

```
src/
├── animations/  # Animation players and presets            → #animations/*
├── components/  # One directory per component, each with its own spec.md
├── extras/      # Opt-in add-ons, published as `igniteui-webcomponents/extras`
├── internals/   # Shared building blocks, never public API  → #internals/*
├── styles/      # Global SCSS: utilities, mixins, themes
├── theming/     # Theming controller and types             → #theming/*
└── index.ts     # Public entry point of the package
```

`src/internals` holds the code that components share. None of it is public API:

| Path                | Contents                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `controllers/`      | Reactive controllers. See [Controllers](#controllers).                                             |
| `date/`             | The `CalendarDay` model, date comparison and conversion helpers                                    |
| `decorators/`       | `coercedProperty`, `shadowOptions`, the Blazor markers                                             |
| `definitions/`      | `registerComponent`, `defineComponents`, `defineAllComponents`                                     |
| `directives/`       | The `resizable()` and `draggable()` pointer directives                                             |
| `i18n/`             | The localization controller and the deprecated EN resource shapes                                  |
| `mixins/`           | `EventEmitterMixin`, `I18nMixin`, the form-associated mixins, mask behavior, combo box, group, option, alert |
| `templates/`        | Shared render fragments: `input-shell`, `masked-input`, `toggle-shell`, `slotted-icon`             |
| `testing/`          | Test helpers and shared suites. They are `*.spec.ts` files, and production code never imports them. |
| `utils/`            | Helpers split by domain: `arrays`, `dom`, `events`, `lit`, `math`, `objects`, `strings`, `types`   |
| `abort-handler.ts`  | `createAbortHandle`, a resettable `AbortController`                                                |
| `context.ts`        | The Lit context keys that components share                                                        |
| `part-map.ts`       | The `partMap` directive                                                                            |
| `timing.ts`         | `createTimer`, a restartable timeout                                                               |
| `validators.ts`     | The shared constraint validators                                                                   |

`src/index.ts` re-exports only a few approved symbols from `src/internals`:
`defineComponents`, `defineAllComponents`, the deprecated EN resource shapes, and the
`θ`-prefixed `@hidden @internal` helpers that sibling packages use. Do not add to that list.
To make a helper public, move it out of `internals` first.

## Components

- Put a component in `src/components/[component]/[component].ts`. The file has one export: the
  component class.
- Put its tests in `[component].spec.ts`, its specification in `spec.md` (see
  [Specifications](#specifications)) and its styles in `themes/`, all in the same directory.
- Use this structure and these region fences:

```ts
export default class IgcFooBarComponent extends LitElement {
  public static readonly tagName = 'igc-foo-bar';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    // Defines the component and every component that it renders.
    registerComponent(IgcFooBarComponent, IgcFooChildComponent);
  }

  //#region Internal state and properties

  private readonly _slots = addSlotController(this, { slots: setSlots('prefix') });

  @state()
  protected _invalid = false;

  @query('input')
  private readonly _input?: HTMLInputElement;

  //#endregion

  //#region Public attributes and properties

  /**
   * The value of the component.
   * @attr
   */
  @property()
  public value = '';

  /**
   * Whether the component is disabled.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  //#endregion

  constructor() {
    super();
    addThemingController(this, all);
    addSafeEventListener(this, 'input', this._handleInput);
  }

  //#region Lit lifecycle methods

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('value')) {
      this._invalid = !this.value;
    }
  }

  protected override update(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('disabled')) {
      this._updateAriaDisabled();
    }
    super.update(changedProperties);
  }

  //#endregion

  //#region Event handlers

  private _handleInput(event: InputEvent): void {}

  //#endregion

  //#region Internal API

  private _updateAriaDisabled(): void {}

  //#endregion

  //#region Public API

  /** Resets the component to its initial state. */
  public reset(): void {}

  //#endregion

  protected _renderInput() {}

  protected override render() {
    return html`${this._renderInput()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-foo-bar': IgcFooBarComponent;
  }
}
```

- Member order:
  1. Static members, with no region fence
  2. `Internal state and properties`: state, controllers, DOM queries, internal getters
  3. `Public attributes and properties`: public reactive properties and read-only getters
  4. The constructor, with no region fence
  5. `Lit lifecycle methods`
  6. `Event handlers`
  7. Regions named by behavior, such as `Keyboard navigation` or `Form integration`, and
     `Internal API`
  8. `Public API`
  9. Render methods and `render()`, with no region fence
- `HTMLElementTagNameMap` puts the element type into the `.d.ts` typings.
- React to property changes in the lifecycle:
  - `willUpdate()` computes derived state before render.
  - `update()` runs side effects that need the DOM. Call `super.update()`.
  - `@coercedProperty` coerces a value or runs a side effect on each set. See
    [Properties and Attributes](#properties-and-attributes).
  - Guard each branch with `changedProperties.has()`.
- Export a new component from `src/index.ts`, in alphabetical order:

  ```ts
  export { default as IgcFooBarComponent } from './components/foo-bar/foo-bar.js';
  ```

- A mixin takes the base class as its first argument. If a leading config argument comes
  first, the manifest analyzer drops every inherited member. After you change a base class
  or a mixin, compare `custom-elements.json` before and after the change.

## Imports

- Import the cross-cutting directories through their `#` subpath alias, never with a relative
  path:

  | Directory        | Alias           |
  | ---------------- | --------------- |
  | `src/internals`  | `#internals/*`  |
  | `src/theming`    | `#theming/*`    |
  | `src/animations` | `#animations/*` |

  All other imports are relative, including imports from one component to another
  (`../icon/icon.js`). A file in an aliased directory uses relative paths for its own
  directory and the alias for a different one.

- The aliases are Node subpath imports. They are declared in the `imports` field of
  `package.json` (the sources) and of `scripts/_package.json` (the published manifest, with
  `dist` as the root). No build step rewrites them. `npm run check` enforces the rules with
  dependency-cruiser.

  > [!WARNING]
  > A new alias goes into **both** manifests. If it is only in `package.json`, the local
  > checks and tests pass, but the published package breaks for consumers.

  ```ts
  // ✅ DO
  import { addSlotController } from '#internals/controllers/slot.js';

  // ❌ DON'T
  import { addSlotController } from '../../internals/controllers/slot.js';
  ```

- oxfmt (`npm run format`) sorts the imports into one block, in this order: packages, `#`
  aliases, `../`, `./`. Type imports are sorted by path together with the other imports.

## Controllers

Before you write lifecycle code, look for a controller that already does it:

| Controller                                                    | Module                                      | Use for                                                        |
| ------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| `addThemingController`                                        | `#theming/theming-controller.js`            | Theme resolution. **Required for every themed component.**     |
| `addSlotController` / `setSlots`                              | `#internals/controllers/slot.js`            | Observing and querying slotted content                         |
| `addInternalsController` / `internalsOf`                      | `#internals/controllers/internals.js`       | ElementInternals: ARIA, custom states, form value and validity |
| `addKeybindings`                                              | `#internals/controllers/key-bindings.js`    | Keyboard interaction. The key constants are in `keys.js`.      |
| `addRovingFocusController`                                    | `#internals/controllers/roving-focus.js`    | Arrow-key focus movement between items (roving tab index)      |
| `addAriaTarget` / `addAriaProjector` / `ariaBindings`         | `#internals/controllers/aria-projection.js` | Projecting composite ARIA across shadow roots                  |
| `addToggleController`                                         | `#internals/controllers/toggle.js`          | The open/close sequence and events of toggleable hosts         |
| `addHostListeners`                                            | `#internals/controllers/host-listeners.js`  | Listeners that exist while the host is connected               |
| `addCommandController`                                        | `#internals/controllers/command.js`         | The Invoker Commands API (`command` / `commandfor`)            |
| `addIdRefResolver`                                            | `#internals/controllers/id-resolver.js`     | Resolving IDREF attributes to elements                         |
| `addRootClickController`                                      | `#internals/controllers/root-click.js`      | Closing overlays on an outside click                           |
| `createMutationController` / `createResizeObserverController` | `#internals/controllers/*-observer.js`      | Observing DOM mutations and size changes                       |
| `addGesturesController`                                       | `#internals/controllers/gestures.js`        | Swipe gestures                                                 |
| `addKeyboardFocusRing`                                        | `#internals/controllers/focus-ring.js`      | Focus styles for keyboard focus only                           |
| `addFullscreenController`                                     | `#internals/controllers/fullscreen.js`      | Fullscreen state                                               |
| `addAdoptedStylesController`                                  | `#internals/controllers/adopt-styles.js`    | Adopting document styles into a shadow root                    |
| `addContextProvider` / `createAsyncContext`                   | `#internals/controllers/context-provider.js`, `async-consumer.js` | Sharing state between a parent and its children through Lit context |
| `createGroupRegistry`                                         | `#internals/controllers/group.js`           | Grouping peers by key, such as radios by `name`                |
| `addI18nController`                                           | `#internals/i18n/i18n-controller.js`        | Localized resource strings                                     |

For pointer resizing and dragging, use the `resizable()` and `draggable()` directives from
`#internals/directives/`.

Store a controller in a `readonly` field that is initialized inline. The exceptions are
`addThemingController` and `addKeybindings`, which you call in the constructor:

```ts
private readonly _slots = addSlotController(this, {
  slots: setSlots('prefix', 'suffix'),
  onChange: this._handleSlotChange,
});
```

## Slots

- Use slots for content composition and document each one with `@slot`. The default slot holds
  the main content. Named slots (`prefix`, `suffix`, `header`) have one purpose each.
- Use `addSlotController` to react to slot changes. Query the default slot with the
  `DefaultSlot` key (`'[default]'`):

  ```ts
  private _handleSlotChange(): void {
    this._hasPrefix = this._slots.hasAssignedElements('prefix');
    this._hasIcon = this._slots.hasAssignedElements('[default]', {
      selector: 'igc-icon',
    });
  }
  ```

## Shadow DOM and CSS Parts

- All components use an open shadow root.
- Expose internal elements as CSS parts. Use `partMap` for conditional parts:

  ```ts
  import { partMap } from '#internals/part-map.js';

  /**
   * @csspart base - The main container.
   * @csspart input - The native input element.
   */
  protected override render() {
    return html`
      <div part=${partMap({ base: true, invalid: this._invalid })}>
        <input part="input" />
      </div>
    `;
  }
  ```

- In SCSS, match parts with `[part~='base']`, not `[part='base']`. `partMap` emits a
  space-separated list, and an exact-match selector stops matching when a second name is added.
- To delegate focus to an inner element, use `@shadowOptions`:

  ```ts
  import { shadowOptions } from '#internals/decorators/shadow-options.js';

  @shadowOptions({ delegatesFocus: true })
  export default class IgcInputComponent extends LitElement {}
  ```

## Styles and Theming

Styles are written in SCSS and compiled to Lit `css` templates. The `themes` directory of a
component has this layout:

```
themes/
├── [component].base.scss       # Structure and layout, theme-agnostic
├── shared/
│   ├── [component].common.scss # Cross-theme styling, sizing, CSS variables
│   └── [component].{bootstrap,material,fluent,indigo}.scss
├── light/
│   ├── _themes.scss            # digest-schema() of the light schemas
│   ├── [component].shared.scss # The full variable set from $base
│   └── [component].{bootstrap,material,fluent,indigo}.scss
├── dark/
│   ├── _themes.scss            # digest-schema() of the dark schemas
│   └── [component].{bootstrap,material,fluent,indigo}.scss
└── themes.ts                   # Composes everything into the `all` export
```

> [!IMPORTANT]
> `npm run build:styles` generates a `.css.ts` file next to each `.scss` file. The component
> imports it as `.css.js`. The generated files are gitignored. Do not edit or commit them.
> `npm run storybook` and `npm run test:watch` rebuild them when you save.

- The build compiles only `*.{base,common,shared,material,bootstrap,indigo,fluent}.scss` under
  `src/components/**`. It skips other names and does not warn. Give shared partials a `_`
  prefix and `@use` them.
- SCSS resolves against the `src` and `node_modules` load paths. Import global helpers with
  package-style specifiers:

  ```scss
  // ✅ DO
  @use 'styles/utilities' as *;
  @use 'igniteui-theming/sass/themes/schemas/components/light/badge' as *;

  // ❌ DON'T
  @use '../../../styles/utilities' as *;
  ```

- Theme values come from the `igniteui-theming` schemas. `_themes.scss` digests them, and
  `var-get()` reads them. `light/[component].shared.scss` emits the full `$base` variable set.
  The per-theme overrides emit only a difference: `diff($base, $theme)` in `light/`, and
  `diff(light.$base, $theme)` in `dark/`:

  ```scss
  // light/badge.bootstrap.scss
  @use 'styles/utilities' as *;
  @use 'themes' as *;

  $theme: $bootstrap;

  :host {
      @include css-vars-from-theme(diff($base, $theme));
  }
  ```

- Do not hardcode colors or sizes. Use `var-get($theme, 'text-color')`, `contrast-color()`,
  `sizable()` and the `--ig-size` scale.
- Keep specificity low, and expose parts so that consumers can style the component.
- `themes.ts` is the only hand-written TypeScript file in `themes/`. It composes the styles
  into the `Themes` object for `addThemingController`.

## Accessibility

Accessibility is mandatory. Each component must pass an a11y audit in its tests and meet
WCAG 2.1 Level AA.

- Use semantic elements (`<button>`, `<input>`), not `<div>` elements with click handlers.
- Set ARIA with `addInternalsController`:

  ```ts
  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'button', ariaLabel: 'Close' },
  });

  this._internals.setARIA({ ariaExpanded: `${this.open}` });
  ```

- If tooling that reads only content attributes (such as axe) must see the role, set
  `reflectRole: true`. Do not write `this.role = '…'`. The controller writes the role
  attribute on connect and on each `setARIA()` role change. It does not override a `role`
  attribute that the author sets.
- To reach the internals of another component (composite hosts, specs), use `internalsOf()`.
  Do not add `public` members tagged `@hidden` or `@internal` for this.
- Interactive components need keyboard support: Tab, arrow keys, Enter/Space, Escape and
  Home/End, as applicable. Use `addKeybindings`:

  ```ts
  import { addKeybindings } from '#internals/controllers/key-bindings.js';
  import { arrowDown, arrowUp, enterKey } from '#internals/controllers/keys.js';

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

- For arrow-key focus movement between items, use `addRovingFocusController`. If an item uses
  `delegatesFocus`, put its roving tab index on the host. A `tabindex="-1"` on an inner element
  does not remove the item from the tab order.
- Make focus visible, and keep the focus order logical. Give text alternatives for non-text
  content.

### ARIA across shadow boundaries

Shadow DOM breaks two things that ARIA needs: the identity of the focused element, and IDREF
resolution. This affects composite components (select, combo, the date pickers) that wrap an
input-shaped component:

- A host with `delegatesFocus` must **not** set `role` or `aria-*` on itself or on its wrapper.
  Assistive technology reads the native editor that receives focus, one shadow root deeper.
- IDREF relations (`aria-controls`, `aria-describedby`, `aria-labelledby`,
  `aria-activedescendant`) resolve only in one tree scope. A reference from the native editor
  to an element in the shadow root of the host does not work. Send these relations as
  **element references** through ARIA element reflection (`ariaControlsElements`, …), which
  resolves into ancestor scopes. The attribute and the property are two views of one
  relation, and a set of the property clears the attribute. Use one form per relation, not
  both.

`#internals/controllers/aria-projection.js` implements this as a pair of controllers:

- **Editor side.** Each input-shaped component (input, textarea, mask input, date-time input)
  is a projection target. It applies the resolved bindings to its native editor with the
  `ariaBindings()` directive:

  ```ts
  protected readonly _ariaTarget = addAriaTarget(this, {
    labels: () => this._internals.labels,
    description: () => this._helperText, // own helper-text element, or null
  });

  protected _renderInput() {
    return html`<input ${ariaBindings(this._ariaTarget.resolveBindings())} />`;
  }
  ```

- **Host side.** The composite component declares the state that it projects. After each
  host update, the controller sends the state to the target. It skips equal state and retries
  for targets that upgrade late:

  ```ts
  // in the select component
  addAriaProjector(this, {
    target: () => this._input,
    state: () => ({
      role: 'combobox',
      hasPopup: 'listbox',
      expanded: `${this.open}`,
      controls: this._list ? [this._list] : null,
      describedBy: this._helperText ? [this._helperText] : null,
      labelledBy: this._internals.labels,
    }),
  });
  ```

- The target copies the projected `role` and `hasPopup` to `data-role` and `data-haspopup` on
  the input component. These are **styling hooks**, because `:host()` selectors cannot see
  ARIA on the native editor. Theme selectors for composite anchors use the `data-*`
  attributes, never `role` or `aria-*`.

Testing cross-root ARIA:

- Use the shared suites in `src/internals/testing/form-testbed.spec.ts`:
  `runExternalLabelAssociationTests` (an external `<label>` through `for` or nesting) and
  `runAriaProjectionTests` (the host semantics on the native editor).
- Check reflected relations by identity (`input.ariaControlsElements[0] === list`), not by
  the attribute. Reflection clears the attribute.
- For the same reason, axe reports `aria-required-attr` for `aria-controls` on
  `role="combobox"` editors. Suppress only that rule with `axeReflectedRelationsOptions` from
  `#internals/testing/helpers.spec.js`, next to a test that checks the real relation.

## Testing

Each component has tests in `[component].spec.ts`. They cover:

1. The a11y audit (mandatory):
   ```ts
   it('passes the a11y audit', async () => {
     const el = await fixture<IgcComponentComponent>(
       html`<igc-component></igc-component>`
     );
     await expect(el).shadowDom.to.be.accessible();
     await expect(el).to.be.accessible();
   });
   ```
2. The default values
3. Property and attribute sets, and reflection
4. Events
5. User interaction (pointer and keyboard)
6. Edge cases

- Call `defineComponents()` in `before()`:

  ```ts
  import { defineComponents } from '#internals/definitions/defineComponents.js';

  describe('Component', () => {
    before(() => {
      defineComponents(IgcComponentComponent);
    });
  });
  ```

- After a programmatic change, `await elementUpdated(element)` before you assert.
- Test the light DOM and the shadow DOM (`expect(el).dom…`, `expect(el).shadowDom…`).
- Use the shared helpers in `#internals/testing/`:

  | Module                     | Provides                                                                       |
  | -------------------------- | ------------------------------------------------------------------------------ |
  | `simulate.spec.js`         | `simulateClick`, `simulateKeyboard`, `simulatePointerDown`, `simulateInput`, … |
  | `form-testbed.spec.js`     | `createFormAssociatedTestBed` and the shared label and ARIA projection suites  |
  | `validity-helpers.spec.js` | Validity assertions and `runValidationContainerTests`                          |
  | `invoker-commands.spec.js` | `runInvokerCommandsTests`                                                      |
  | `helpers.spec.js`          | Animation, focus, scroll and style helpers, and `axeReflectedRelationsOptions` |

  Use the simulated events, not `element.click()` or a hand-built `KeyboardEvent`. They send
  the full event sequence of a real user interaction.

- Do not import one component spec from another, because that runs the imported suite again.
  Put shared helpers in `src/internals/testing/`.
- The `## Test scenarios` section of the [specification](#specifications) mirrors the suite.
  When you add or remove a test, update that section in the same change.

## Properties and Attributes

- Property names are camelCase. Attribute names are kebab-case. Properties that copy standard
  HTML attributes use the HTML name (`readOnly` → `readonly`, `minLength` → `minlength`). Write
  the attribute name explicitly for these properties and for multi-word properties:

  ```ts
  // ✅ DO
  /**
   * The orientation of the header.
   * @attr header-orientation
   */
  @property({ attribute: 'header-orientation' })
  public headerOrientation: 'vertical' | 'horizontal' = 'horizontal';

  // ❌ DON'T
  @property({ attribute: 'headerOrientation' })
  public headerOrientation: 'vertical' | 'horizontal' = 'horizontal';
  ```

- A boolean attribute must default to `false`. Any presence of the attribute means `true`, so a
  `true` default cannot be turned off from markup. Rename the property (`enabled` →
  `disabled`), or use a string or number attribute.

  ```ts
  // ✅ DO
  /**
   * Whether user interaction with the component is disabled.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  // ❌ DON'T
  @property({ type: Boolean, reflect: true })
  public enabled = true;
  ```

- Reflect only primitive properties that affect styling or accessibility. Never reflect
  objects or arrays.
- Give complex types (objects, arrays, functions) `attribute: false`:

  ```ts
  /** The items that the component renders. */
  @property({ attribute: false })
  public items: Array<Item> = [];
  ```

- To coerce a value or run a side effect on each set, use `@coercedProperty` below `@property`.
  Do not write a backing-field accessor pair:

  ```ts
  import { coercedProperty } from '#internals/decorators/coerced-property.js';

  @property({ type: Number })
  @coercedProperty<number, IgcRatingComponent>({
    transform: ({ value }) => clamp(value, 0, 100), // coerces each incoming value
    onChange: ({ host }) => host._validate(),       // runs after each later set
  })
  public max = 100;
  ```

  Keep the field initializer. It gives the default value, and `onChange` does not run for it.
  Use hand-written accessors only for a computed getter or for storage outside the instance.
  To share a config between properties, put it in a static field, as
  `IgcInputComponent._revalidate` does.

## Custom Events

- Emit events only for user interaction, not for property sets or method calls.
- Extend `EventEmitterMixin` with a typed event map:

  ```ts
  export interface IgcFooBarEventMap {
    igcStateChanging: CustomEvent<Record<string, unknown>>; // cancelable
    igcStateChange: CustomEvent<Record<string, unknown>>;
  }

  export default class IgcFooBarComponent extends EventEmitterMixin<
    IgcFooBarEventMap,
    Constructor<LitElement>
  >(LitElement) {}
  ```

- Event names are camelCase with an `igc` prefix. Cancelable events usually end in `-ing`.
- By default, `emitEvent` sends an event that bubbles, is composed and is not cancelable. For a
  cancelable event, check the return value:

  ```ts
  if (!this.emitEvent('igcOpening', { cancelable: true, detail: data })) {
    return; // canceled
  }
  ```

## Form Integration

Form controls extend a mixin from `#internals/mixins/forms/`:

| Mixin                                 | Use for                                       |
| ------------------------------------- | --------------------------------------------- |
| `FormAssociatedMixin`                 | Value-based controls. Adds `defaultValue`.     |
| `FormAssociatedRequiredMixin`         | The same, and a `required` attribute           |
| `FormAssociatedCheckboxMixin`         | Checked-based controls. Adds `defaultChecked`. |
| `FormAssociatedCheckboxRequiredMixin` | The same, and a `required` attribute           |

The mixins supply `name`, `disabled`, `invalid`, `form`, `validity`, `validationMessage`,
`willValidate`, `checkValidity()`, `reportValidity()` and `setCustomValidity()`. The component
supplies its value state and its validators:

```ts
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { maxLengthValidator, requiredValidator } from '#internals/validators.js';

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

- Use the validators in `#internals/validators.js` (`requiredValidator`, `minLengthValidator`,
  `patternValidator`, `minValidator`, `stepValidator`, `minDateValidator`, …). Do not write
  your own checks. `valueMissing` stops the other checks, so a required control shows the
  required message first.
- For non-string values, pass transformers to `createFormValueState`. See
  `form-transformers.ts` (`FormValueDateTimeTransformers`, `FormValueNumberTransformers`, …).

**Updating the value.** `setValueAndFormState()` writes the value, sends it to the form and
validates again. Use it in the public setter and in the input handlers. A set of
`_formValue.value` alone updates only the component, and the submitted value becomes stale:

```ts
private _handleInput(event: InputEvent): void {
  this._formValue.setValueAndFormState((event.target as HTMLInputElement).value);
}

/**
 * The value of the control.
 * @attr
 */
@property()
public set value(value: string) {
  this._formValue.setValueAndFormState(value);
}

public get value(): string {
  return this._formValue.value;
}
```

**Validation lifecycle.** The mixins copy the native lifecycle. Use their hooks and do not
duplicate them:

- `_validate()` runs the validators and updates the validity. Properties that affect
  constraints (`minLength`, `pattern`, `min`, …) call it through
  `@coercedProperty({ onChange })`.
- The `ig-invalid` custom state applies the invalid styles, but only after the control is
  touched: a blur or a failed submit. A disabled control is not validated and never shows
  invalid styles.
- `invalid` is a visual state and is not reflected. Its getter returns the effective state:
  a touched control that fails validation reads `true` after you set `false`.
- Bind `@blur` on the native editor to `_handleBlur` (touches and validates), and `@keydown`
  to `_handleEnterKeydown` (submits with `form.requestSubmit()`, so the browser shows its own
  validation feedback).
- `formResetCallback` restores the default through the public `value` or `checked` setter, so
  clamping applies. It also clears the pristine, touched and developer-set invalid states.
  Override it only for state that the mixin does not know, and call
  `super.formResetCallback()`.

**Testing.** Use `createFormAssociatedTestBed` from `#internals/testing/form-testbed.spec.js`
and the assertions in `validity-helpers.spec.js`. The test bed puts the control in a real
`<form>` and gives submit, reset and restore helpers.

## Localization

Default English strings come from `igniteui-i18n-core`. A component that exposes `locale` and
`resourceStrings` uses `I18nMixin`. The base class is the first argument:

```ts
import { ChipResourceStringsEN, type IChipResourceStrings } from 'igniteui-i18n-core';
import type { I18nControllerConfig } from '#internals/i18n/i18n-controller.js';
import { I18nMixin } from '#internals/mixins/i18n.js';

const i18n: I18nControllerConfig<IChipResourceStrings> = {
  defaultEN: ChipResourceStringsEN,
};

export default class IgcChipComponent extends I18nMixin(LitElement, i18n) {
  protected override render() {
    return html`<button aria-label=${this.resourceStrings.chip_remove}></button>`;
  }
}
```

- A component that only needs the locale, and no public resource API, calls
  `addI18nController` directly (see `date-time-input.base.ts`).
- Do not put user-facing text in a template. Read it from the resource strings, so that it
  follows the active locale and consumer overrides.
- Format dates and times with `getDateTimeFormat` / `formatDisplayDate` from
  `#internals/i18n/i18n-controller.js`. Do not create `Intl` formatters ad hoc.
- `src/internals/i18n/EN/` holds the resource shapes deprecated since 7.2.0. Do not add to it.

## Performance

- Prevent unnecessary renders:
  - Use `@state()` for internal reactive state, not `@property()`.
  - Guard lifecycle work with `changedProperties.has()`.
  - Implement `shouldUpdate()` only when a condition must block an update.
- Use the Lit directives where they fit: `cache()` for expensive template branches, `live()`
  for two-way bindings, and `ifDefined()` for optional attributes. Use `bindIf()` from
  `#internals/utils/lit.js` when the bound value is not the condition.
- Listeners:
  - Lit manages template listeners (`@event`) and listeners on the host. They need no clean-up.
    Add host listeners with `addSafeEventListener` from `#internals/utils/events.js`, which does
    nothing during SSR.
  - For listeners on other targets (`window`, `document`, the render root), use
    `addHostListeners`. It adds them on connect and removes them on disconnect with one abort
    signal. It does not bind the listener, so bind a method first:

    ```ts
    constructor() {
      super();
      addSafeEventListener(this, 'click', this._handleClick);

      this._handleResize = this._handleResize.bind(this);
      addHostListeners(this, {
        target: () => window,
        events: ['resize'],
        listener: this._handleResize,
      });
    }
    ```

## Common Pitfalls

### 1. Forgetting `super` in lifecycle methods

An override of `connectedCallback`, `disconnectedCallback`, `update` or `formResetCallback`
must call the `super` method.

### 2. Mutating objects or arrays in place

Lit does not detect mutations. Assign a new instance:

```ts
// ❌ DON'T
this.items.push(newItem);

// ✅ DO
this.items = [...this.items, newItem];
```

### 3. Accessing the shadow DOM too early

The shadow DOM does not exist in the constructor. Use `firstUpdated()` or later.

### 4. Awaiting in `update()`

`update()` is synchronous. If you await before `super.update()`, the render is late and the
result is not defined. Start the async work without an await, cancel the previous run, and
write the result to reactive state:

```ts
private readonly _abortHandle = createAbortHandle();

protected override update(changedProperties: PropertyValues<this>): void {
  if (changedProperties.has('src')) {
    this._abortHandle.abort();
    this._load(this._abortHandle.signal); // sets a @state() field when done
  }
  super.update(changedProperties);
}
```

See `src/components/qr-code/qr-code.ts`.

### 5. Forgetting the theming controller

A component with themed styles calls `addThemingController(this, all)` in its constructor.
Without it, the component does not react to theme changes. A component with no themed styles
does not need it, for example `slider-label.ts`, which renders only hidden light DOM.

### 6. Editing generated files

The `.css.ts` files and the `// region default` block of a story are build output. Edit the
`.scss` source or the JSDoc. `npm run build:styles` and `npm run build:meta` overwrite other
edits.

## API Documentation

- Use standard JSDoc. TypeDoc and the manifest analyzer infer most of the API from the
  TypeScript code, so `@param`, `@returns`, `@private`, `@static` and similar tags are not
  necessary.
- For slots, CSS parts and CSS custom properties, follow the
  [CEM analyzer guide](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/#documenting-your-components).
- `custom-elements.json`, Storybook and the Angular / React / Blazor wrapper docs copy each
  description as it is. Write product documentation:
  - **No `igc-` tag names in prose.** Write "the carousel", not `igc-carousel`. Tag names are
    allowed only in `@element`, fenced `@example` blocks, literal event or attribute names
    that contain `igc-`, and `@internal` / `@hidden` members. This rule does not apply to
    [specifications](#specifications).
  - **Do not repeat the tag.** Write "The label of the control.", not "The label attribute of
    the control."
  - **No `Gets/Sets`.** Say what the value is. Add a second sentence for side effects.
  - **Booleans start with "Whether …"** and describe the `true` state. Check the
    implementation, because `hide*` and `disable*` names invert the sentence.
  - Use present tense.
- Put the description first and the tags after it:

  ```ts
  // ✅ DO
  /**
   * Whether user interaction with the component is disabled.
   * @attr
   * @default false
   */

  /**
   * Shows the identity of a user, for example in a user profile.
   *
   * @element igc-avatar
   *
   * @slot - Renders an icon inside the default slot.
   *
   * @csspart base - The base wrapper of the avatar.
   * @csspart initials - The initials wrapper of the avatar.
   */

  // ❌ DON'T
  /**
   * @attr
   * Whether user interaction with the component is disabled.
   */
  ```

- A deprecated member uses this format:
  ``@deprecated since [SemVer]. Use the `[new API]` [type] instead.``

  ```ts
  /**
   * Updates the state of the component.
   *
   * @deprecated since 1.2.3. Use the `setState()` method instead.
   */
  public updateState(state: T) {}
  ```

- After you change a description, regenerate the derived files and commit them:

  ```bash
  npm run cem        # custom-elements.json
  npm run build:meta # the `// region default` block of each story
  ```

## Specifications

Each public component directory has a `spec.md`: the behavioral contract of the component.
JSDoc documents one API member. The specification documents the whole component: its purpose,
its behavior, its keyboard and assistive technology support, its test coverage, and its
limits.

[`src/components/splitter/spec.md`](../src/components/splitter/spec.md) is the structural
reference:

```markdown
# [Name] specification

- [table of contents]

## Revision history
## Overview
### Key features
### Acceptance criteria
## User stories
### End-user stories
### Developer stories
## Functionality
### End-user experience
### Developer experience
### Localization
### Keyboard interactions
## API
### Properties and attributes
### Methods
### Events
### Slots
### CSS Shadow parts
## Test scenarios
## Assumptions and limitations
## Accessibility
### ARIA roles and properties
### Keyboard support
### Right to Left support
```

The skeleton is a default, not a schema:

- If a section does not apply, write "None applicable." instead of removing it. Then a reader
  can see the difference between a missing feature and a missing document. Remove a section
  only if the whole area has no meaning for the component. For example, the splitter has no
  `## Assumptions and limitations`.
- Add sections where a component needs them: `### CSS custom properties` for the rating and
  the highlight, `### Terms` for the carousel.
- A directory with several components can split `## API` into one subsection for each
  component, as the card and the list do.

### Rules

- **One specification per directory.** It documents every component in the directory. The
  button and the icon button share `button/spec.md`.
- **Internal components get a specification** if other components depend on their behavior:
  the validation container, the popover and the focus trap.
- **The table of contents is maintained by hand.** Each `##` and `###` heading has an entry.
  Anchors follow the GitHub slug rules: lowercase, no punctuation, spaces to hyphens, and
  duplicates get `-1`, `-2`.
- **No ownership, approval or sign-off sections**, and no author column. Git records the
  authors.
- **The revision history is a table** of `Version | Date | Notes`. It starts at version 1. Each
  change to the specification adds a row.
- **Keep design hand-off links.** A Figma link goes under `### End-user experience`. If there
  is no link, say so. Do not leave a placeholder.
- **Tag names are allowed.** The `igc-` rule applies to JSDoc, not to repository documentation.
- **Link sibling specifications relatively**: `[the popover](../popover/spec.md)`, or
  `../popover/spec.md#keyboard-interactions` for a heading.
- **Test scenarios mirror the suite.** Use one subsection for each `describe` block, with the
  same name, and number the scenarios contiguously across the section. Name the shared runners
  that the suite uses. Do not repeat what they check.
- **State the gaps.** Put documented behavior that no test covers under
  `### Not covered by the suite`.
- **Describe the code as it is.** If the implementation differs from the design, correct the
  specification.

### Keeping it current

A behavior change is complete only when the specification describes it:

| Change                                               | Section to update                                               |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| Property, method, event, slot, part, custom property | The matching `## API` table, with the same wording as the JSDoc |
| New or changed keyboard interaction                  | `### Keyboard interactions` and `### Keyboard support`          |
| New or changed role or ARIA state                    | `### ARIA roles and properties`                                 |
| New behavior that needs an example                   | A subsection under `### Developer experience`                   |
| New or changed resource string                       | `### Localization`                                              |
| New constraint, precedence rule or unsupported case  | `## Assumptions and limitations`                                |
| New or removed tests                                 | `## Test scenarios`, renumbered                                 |
| Any of the above                                     | `## Revision history`                                           |

A deprecated member keeps its API row, with the version and the replacement, and gets a
revision history row.

## Storybook

Each component has a story in `stories/[component-name].stories.ts`.

- The `metadata` object, the args interface and their descriptions are **generated** into a
  `// region default … // endregion` block. Do not edit it. Fix the JSDoc and run
  `npm run cem && npm run build:meta`.

  > [!CAUTION]
  > The generator skips a story in two cases. If the filename does not match the tag name
  > (`igc-date-picker` → `date-picker.stories.ts`), it warns. If the region fence is missing,
  > it does **not** warn. In both cases, the story descriptions do not match the JSDoc.

- The stories outside the region are hand-written. Show the important states and
  configurations.

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
| `npm run build:styles` | Compiles SCSS into the generated `.css.ts` files                        |
| `npm run check`        | Import aliases, dependency-cruiser rules and TypeScript                 |
| `npm run lint`         | oxlint, lit-analyzer, oxfmt and Stylelint                               |
| `npm run format`       | Applies the oxlint and oxfmt fixes                                      |
| `npm run test`         | Builds the styles and runs the Web Test Runner suite with coverage      |
| `npm run cem`          | Regenerates `custom-elements.json`                                      |
| `npm run build:meta`   | Regenerates the story metadata regions                                  |
| `npm run storybook`    | Dev server with style, manifest and story watchers                      |

Before you open a PR, run `npm run check`, `npm run lint` and `npm run test`.

## Changelog

For a new component or a bug fix, update the
[CHANGELOG](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md).

## Resources

- [README.md](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/README.md)
- Component specifications: `src/components/[component]/spec.md`, with the
  [splitter](../src/components/splitter/spec.md) as the reference
- [LLM Skills](./skills/README.md) for guided workflows
- [Lit](https://lit.dev/docs/), [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components),
  [WCAG](https://www.w3.org/WAI/WCAG21/quickref/),
  [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Checklist for New Components

- [ ] `spec.md` follows the splitter structure, with a TOC and a version 1 revision history.
      Its API tables match the code, and its test scenarios match the suite.
- [ ] Standard structure and region fences. Internal API has the `_` prefix.
- [ ] `addThemingController` in the constructor (themed components)
- [ ] Cross-cutting imports use the `#internals` / `#theming` / `#animations` aliases
- [ ] The a11y audit passes
- [ ] JSDoc for properties, events, slots and parts, with no `igc-` tag names in prose
- [ ] Events use `EventEmitterMixin` with a typed map
- [ ] Tests cover the list in [Testing](#testing)
- [ ] A story with a regenerated `// region default` block
- [ ] Exported from `src/index.ts`
- [ ] CHANGELOG updated
- [ ] `npm run check`, `npm run lint` and `npm run test` pass

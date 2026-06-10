# Coding Guidelines

## General

1. Clear is better than clever. Optimize for simple, readable code first.
2. Prefer longer, more descriptive names, over shorter names.
3. Use web-compatible, full URLs as import specifiers, including file extensions:

   > [!TIP] DO
   >
   > ```ts
   > import * as foo from './foo.js';
   > ```

   > [!WARNING] DON'T
   >
   > ```ts
   > import * as foo from './foo';
   > ```

4. We use TypeScript and have strict compiler options turned on. Do not change them.
5. Prefer the `unknown` type over `any`.
6. Prefer the `object` type over `Object`.
7. Prefer explicitly defining a function shape over using `Function` as a type.
8. Don't use TypeScript `namespace`.
9. Prefer simple union types over `enum`.
10. Internal API (properties, methods, getters, setters) should be prefixed with an underscore (`_`).
11. Use the `readonly` modifier for properties that should not be reassigned.
12. Specify return types for functions and methods explicitly rather than relying on inference, unless the type is obvious or causes unnecessary clutter in the source code.

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
  public static override styles = [styles];

  /**
   * Since Ignite UI web components are not self-registering by themselves,
   * each component should implement the `register` static method.
   * The `registerComponent` call will add the component to the custom elements
   * registry (if not already present) and all its dependent components.
   */
  public static register(): void {
    registerComponent(IgcFooBarComponent, ...);
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

  protected override firstUpdated(changedProperties: PropertyValues<this>): void {
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

  > [!TIP] DO
  >
  > ```ts
  > protected override willUpdate(changedProperties: PropertyValues<this>): void {
  >   if (changedProperties.has('value')) {
  >     this._invalid = this.value.length < this.minLength;
  >   }
  > }
  >
  > protected override update(changedProperties: PropertyValues<this>): void {
  >   if (changedProperties.has('disabled')) {
  >     this._updateAriaAttributes();
  >   }
  >   super.update(changedProperties);
  > }
  > ```

  > [!WARNING] DON'T
  >
  > ```ts
  > @watch('value')
  > protected valueChange(): void {
  >   this._invalid = this.value.length < this.minLength;
  > }
  > ```

- After adding new component(s) to the library, make sure to export them from the entry point of the package:

```ts
// in src/index.ts

/* ... */
export { default as IgcFooBarComponent } from './components/foobar/foobar.js';
/* ... */
```

## Imports

- Organize imports in the following order, with blank lines between groups:
  1. Lit imports (`lit`, `lit/decorators.js`, `lit/directives/*`)
  2. Third-party library imports
  3. Internal utilities and controllers (`../common/*`)
  4. Component imports
  5. Type imports last (if not inline)

  > [!TIP] DO
  >
  > ```ts
  > import { html, LitElement } from 'lit';
  > import { property, query } from 'lit/decorators.js';
  >
  > import { addThemingController } from '../../theming/theming-controller.js';
  > import { addSlotController } from '../common/controllers/slot.js';
  > import { registerComponent } from '../common/definitions/register.js';
  >
  > import IgcIconComponent from '../icon/icon.js';
  >
  > import { styles } from './themes/badge.base.css.js';
  > import type { StyleVariant } from '../types.js';
  > ```

## Controllers

- Controllers are reusable pieces of logic that hook into a component's lifecycle. Use controllers from `src/components/common/controllers/` for common functionality:
  - `addThemingController` - Required for theme support
  - `addSlotController` - For managing slotted content
  - `addInternalsController` - For ElementInternals and ARIA management
  - `addKeybindings` - For keyboard navigation
  - And others as needed

- Controllers should be stored as `readonly` class fields and initialized inline:

  ```ts
  private readonly _slots = addSlotController(this, {
    slots: setSlots(),
    onChange: this._handleSlotChange,
  });
  ```

## Slots

- Use slots to allow content composition. Document all slots with `@slot` JSDoc tags.
- The default slot typically holds the main content.
- Named slots serve specific purposes (e.g., `prefix`, `suffix`, `header`).
- Use `addSlotController` to react to slot content changes:

  ```ts
  private readonly _slots = addSlotController(this, {
    slots: setSlots('prefix', 'suffix'),
    onChange: this._handleSlotChange,
  });

  private _handleSlotChange(): void {
    this._hasPrefix = this._slots.hasAssignedElements('prefix');
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
  import { partMap } from '../common/part-map.js';

  protected override render() {
    return html`
      <div part=${partMap({ base: true, invalid: this._invalid })}>
        ...
      </div>
    `;
  }
  ```

- For delegating focus to internal elements, use the `@shadowOptions` decorator:

  ```ts
  import { shadowOptions } from '../common/decorators/shadow-options.js';

  @shadowOptions({ delegatesFocus: true })
  export default class IgcInputComponent extends LitElement {
    // Focus is automatically delegated to the first focusable element
  }
  ```

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

- **Keyboard navigation** is required for interactive components:
  - Tab navigation should work naturally
  - Arrow keys for list navigation
  - Enter/Space for activation
  - Escape to close/cancel
  - Home/End for first/last item

- Use `addKeybindings` for keyboard interaction:

  ```ts
  import { addKeybindings, arrowDown, arrowUp, enterKey } from '../common/controllers/key-bindings.js';

  constructor() {
    super();
    addKeybindings(this)
      .set(arrowDown, this._navigateNext)
      .set(arrowUp, this._navigatePrevious)
      .set(enterKey, this._handleActivate);
  }
  ```

- Ensure **focus management** - visible focus indicators and logical focus order.
- Provide **text alternatives** for non-text content.
- Meet **WCAG 2.1 Level AA** standards minimum.

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
  import { defineComponents } from '../common/definitions/defineComponents.js';

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

## Properties and Attributes

- Property names should always be `camelCased` while the backing attribute, if present, should be `kebab-cased`. A special case are properties/attributes that mimic the standard HTML attributes, such as `readOnly/readonly`, `minLength/minlength`, etc.

  It is encouraged to explicitly specify the kebab cased attribute name in the `@property` decorator for such properties.

  > [!TIP] DO
  >
  > ```ts
  > /**
  >  * Controls the orientation of the header.
  >  * @attr
  >  */
  > @property({ attribute: 'header-orientation' })
  > public headerOrientation: 'vertical' | 'horizontal' = 'horizontal';
  > ```

  > [!WARNING] DON'T
  >
  > ```ts
  > /**
  >  * Controls the orientation of the header.
  >  * @attr
  >  */
  > @property({ attribute: 'headerOrientation' })
  > public headerOrientation: 'vertical' | 'horizontal' = 'horizontal';
  > ```

- For a boolean property to be configurable from an attribute, it must default to false. If it defaults to true, you cannot set it to false from markup, since the presence of the attribute, with or without a value, equates to true. This is the standard behavior for attributes in the web platform.

  If this behavior doesn't fit your use case, there are a couple of options:
  - Change the property name so it defaults to false.
  - Use a string-valued or number-valued attribute instead.

  > [!TIP] DO
  >
  > ```ts
  > /**
  >  * Enables/disables user interaction with the component.
  >  * @attr
  >  */
  > @property({ type: Boolean, reflect: true })
  > public disabled = false;
  > ```

  > [!WARNING] DON'T
  >
  > ```ts
  > /**
  >  * Enables/disables user interaction with the component.
  >  * @attr
  >  */
  > @property({ type: Boolean, reflect: true })
  > public enabled = true;
  > ```

- Reflecting properties to attributes should be done sparingly. As a general guideline, primitive properties related to accessibility and/or styling should be reflected.

  **Do not reflect** properties of type object or array.

- For complex types (objects, arrays, functions), use `attribute: false` to prevent Lit from attempting to serialize them to attributes:

  > [!TIP] DO
  >
  > ```ts
  > /**
  >  * Configuration object for the component.
  >  */
  > @property({ attribute: false })
  > public config: ComponentConfig = {};
  >
  > /**
  >  * Collection of items to display.
  >  */
  > @property({ attribute: false })
  > public items: Array<Item> = [];
  > ```

  > [!WARNING] DON'T
  >
  > ```ts
  > // This will cause issues - objects can't be attributes
  > @property()
  > public config: ComponentConfig = {};
  > ```

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

Components that participate in forms must use the `FormAssociatedRequiredMixin` and implement form-related behavior.

- **Form-associated components** (inputs, selects, etc.) should:
  1. Extend from `FormAssociatedRequiredMixin`
  2. Manage a form value via `createFormValueState`
  3. Implement validation if needed
  4. Handle form reset and restore

  ```ts
  import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
  import { createFormValueState } from '../common/mixins/form-value.js';

  export default class IgcInputComponent extends FormAssociatedRequiredMixin(
    LitElement
  ) {
    protected override readonly _formValue = createFormValueState(this, {
      initialValue: '',
    });

    protected override get __validators() {
      return [
        // Add validators here
      ];
    }
  }
  ```

- The `FormValue` instance provides:
  - `setValueAndFormState(value)` - Updates both the component's value and the form's data
  - `value` getter/setter - Accesses the value with appropriate transformers
  - `defaultValue` getter/setter - Manages the default value for form reset

  ```ts
  private _handleInput(event: InputEvent): void {
    const value = (event.target as HTMLInputElement).value;
    // Updates both value and form state
    this._formValue.setValueAndFormState(value);
  }

  // Direct value access (applies transformers)
  public get value(): string {
    return this._formValue.value;
  }

  public set value(val: string) {
    this._formValue.value = val;
  }
  ```

## Performance

- **Avoid unnecessary re-renders:**
  - Implement `shouldUpdate()` when you need to prevent updates based on specific conditions
  - Use `@state()` for internal reactive state, not `@property()`
  - Check `changedProperties.has()` in lifecycle methods to avoid unnecessary work

- **Optimize expensive operations:**
  - Use `cache()` directive for expensive template computation
  - Use `ifDefined()` for optional attributes
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
  import { addSafeEventListener } from '../common/util.js';

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

> [!WARNING]
>
> ```ts
> protected override update(changedProperties: PropertyValues<this>): void {
>   // Do work...
>   super.update(changedProperties); // Don't forget!
> }
> ```

### 2. Mutating objects/arrays directly

Lit cannot detect mutations to objects or arrays. Always create new instances:

> [!WARNING]
>
> ```ts
> // BAD - Lit won't detect the change
> this.items.push(newItem);
>
> // GOOD - Lit detects the new array reference
> this.items = [...this.items, newItem];
> ```

### 3. Accessing Shadow DOM too early

Shadow DOM elements are not available in `constructor()` or early lifecycle methods. Use `firstUpdated()` or later:

> [!WARNING]
>
> ```ts
> // BAD - _inputElement is undefined
> constructor() {
>   super();
>   this._inputElement.focus(); // Error!
> }
>
> // GOOD
> protected override firstUpdated(): void {
>   this._inputElement.focus(); // Works
> }
> ```

### 4. Not handling async operations properly

When dealing with async operations in lifecycle methods, be careful about component state:

> [!TIP]
>
> ```ts
> protected override async update(changedProperties: PropertyValues<this>): Promise<void> {
>   if (changedProperties.has('data')) {
>     this._loading = true;
>     await this._loadData();
>     this._loading = false;
>   }
>   super.update(changedProperties);
> }
> ```

### 5. Over-reflecting properties

Not every property needs to be reflected to an attribute. Only reflect when:

- It's a primitive type
- It affects styling (CSS attribute selectors)
- It's needed for accessibility

### 6. Forgetting theming controller

All components must include the theming controller in the constructor:

> [!WARNING]
>
> ```ts
> constructor() {
>   super();
>   addThemingController(this, all); // Required for theme switching!
> }
> ```

### 7. Misunderstanding event listener cleanup

Lit automatically manages event listeners added in templates or on component instances. You only need to clean up listeners added dynamically:

> [!TIP]
>
> ```ts
> // NO CLEANUP NEEDED - Lit handles these automatically
> protected override render() {
>   return html`<button @click=${this._handleClick}>Click</button>`;
> }
>
> // NO CLEANUP NEEDED - Lit manages component instance listeners
> constructor() {
>   super();
>   this.addEventListener('focus', this._handleFocus);
> }
>
> // CLEANUP REQUIRED - Dynamic external listeners
> private _handler = this._handleResize.bind(this);
>
> public override connectedCallback(): void {
>   super.connectedCallback();
>   window.addEventListener('resize', this._handler);
> }
>
> public override disconnectedCallback(): void {
>   window.removeEventListener('resize', this._handler);
>   super.disconnectedCallback();
> }
>
> // addSafeEventListener prevents SSR errors
> constructor() {
>   super();
>   // Safe in SSR - won't error if addEventListener is unavailable
>   addSafeEventListener(this, 'pointerdown', this._handlePointer);
> }
> ```

## API Documentation

- API documentation is written by following standard JSDoc tags and idioms.

  Both TypeDoc and @custom-elements-manifest/analyzer are able to deduce most of the API by themselves. So tags such as `@param`, `@returns`, etc. are not required.

  The same goes for `@abstract`, `@static`, `@private`, `@protected` and related members
  since the documentation tools get this information directly from the TypeScript source code.

- For documenting things like CSS shadow parts, CSS custom properties and available slots, please
  check the official guidelines of the [CEM analyzer](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/#documenting-your-components).

- When documenting your code, put any JSDoc tags after the description of what the things does

  > [!TIP] DO
  >
  > ```ts
  > /**
  >  * Enables/disables user interaction with the component.
  >  * @attr
  >  */
  > @property({ type: Boolean, reflect: true })
  > public disabled = false;
  >
  > /**
  >  * An avatar component is used as a representation of a user identity
  >  * typically in a user profile.
  >  *
  >  * @element igc-avatar
  >  *
  >  * @slot - Renders an icon inside the default slot.
  >  *
  >  * @csspart base - The base wrapper of the avatar.
  >  * @csspart initials - The initials wrapper of the avatar.
  >  * @csspart image - The image wrapper of the avatar.
  >  * @csspart icon - The icon wrapper of the avatar.
  >  */
  > export default class IgcAvatarComponent extends LitElement {}
  > ```

  > [!WARNING] DON'T
  >
  > ```ts
  > /**
  >  * @attr
  >  * Enables/disables user interaction with the component.
  >  */
  > @property({ type: Boolean, reflect: true })
  > public enabled = true;
  > ```

- When some API is deprecated, make sure to add a `@deprecated` tag with explanation when it was deprecated and what to use instead (if any). The deprecated message follows the following format:

  ``@deprecated since [SemVer]. Use the `[new API]` [type] instead.``

  > [!TIP] DO
  >
  > ```ts
  > /**
  >  * Updates the state of the component.
  >  *
  >  * @deprecated since 1.2.3. Use the `setState()` method instead.
  >  */
  > public updateState(state: T) {};
  > ```

  > [!WARNING] DON'T
  >
  > ```ts
  > /**
  >  * @deprecated - Refer to the changelog for a migration guide.
  >  *
  >  * Updates the state of the component.
  >  */
  > public updateState(state: T) {};
  > ```

## Changelog

- When adding a new component or fixing a bug make sure to update the [CHANGELOG](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md) file with the relevant changes.

## Storybook

All components should have a corresponding Storybook story in `stories/[component-name].stories.ts`.

- Stories provide interactive examples and documentation for components.
- Use Storybook controls to make all public properties configurable.
- Include multiple stories showcasing different component states and configurations.

```ts
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { IgcBadgeComponent, defineComponents } from 'igniteui-webcomponents';

defineComponents(IgcBadgeComponent);

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

export const Basic: StoryObj = {
  render: (args) => html`<igc-badge .variant=${args.variant}>Badge</igc-badge>`,
};
```

## Resources

- **Project Documentation:** [README.md](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/README.md)
- **Lit Documentation:** [lit.dev](https://lit.dev/docs/)
- **Web Components:** [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- **Accessibility:** [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- **TypeScript:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Getting Help

- Review existing components in `src/components/` for patterns and examples
- Read the [LLM Skills](../.github/skills/README.md) for guided workflows
- Ask questions in pull request reviews

## Checklist for New Components

Before submitting a PR for a new component, ensure:

- [ ] Component follows the standard structure with region fences
- [ ] All internal APIs prefixed with underscore (`_`)
- [ ] Theming controller added in constructor
- [ ] Accessibility tested and passing
- [ ] All properties properly documented with JSDoc
- [ ] Events use EventEmitterMixin with type map
- [ ] CSS parts exposed and documented
- [ ] Slots documented with `@slot` tags
- [ ] Comprehensive tests including a11y audit
- [ ] Storybook story created with controls
- [ ] Component exported from `src/index.ts`
- [ ] CHANGELOG updated
- [ ] No TypeScript errors or warnings
- [ ] Code formatted (auto-formatted on save)

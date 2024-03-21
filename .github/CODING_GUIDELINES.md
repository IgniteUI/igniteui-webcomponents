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

## Components

- As a rule of thumb new components should be placed in the **components** sub-directory following the pattern below:

  `src/components/[component]/[component].ts`

  Where

- Stick to a single export from the component file, that is the component class itself.
- Testing file(s) should be also in the same directory following the `[component-name].spec.ts` pattern.
- CSS styles and theming assets usually live in `src/components/[component]/themes/*`.
- Anything else is a fair game as long as it has consistent and meaningful naming.

- When adding a new component or modifying an existing one, try to stick to the following code structure:

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
   * registry (if not already present) and all its dependant components.
   */
  public static register() {
    registerComponent(IgcFooBarComponent, ...);
  }

  /* ... */

  /** Internal non-reactive members. */

  private foo = 0;

  protected get bar() {
    return this.foo * 2;
  }

  /* ... */

  /** References to internal DOM nodes */

  @query('input')
  private inputElement!: HTMLInputElement;

  @queryAssignedElements({ selector: IgcFooChildComponent.tagName })
  protected fooChildren!: Array<IgcFooChildComponent>;

  /* ... */

  /** Internal reactive members */

  @state()
  protected invalid = false;

  /* ... */

  /** Public reactive properties */

  @property()
  public value = '';

  /* ... */

  /** Public non reactive properties */

  public get complete() {
    return this.invalid;
  }

  /* ... */

  /** Observed/Computed properties handlers */

  @watch('value')
  protected valueChange() {
    this.invalid = !!this.value;
  }

  /* ... */

  /** Constructor if initialization logic is required */

  constructor() {
    super();
    this.addEventListener('input', this.handleInput);
  }

  /** Custom element/Lit lifecycle methods if required */

  public override connectedCallback() {
    super.connectedCallback();
    // ...
  }

  protected override firstUpdated(changedProperties) {
    // ...
  }

  /* ... */

  /** Internal event handlers */

  private handleInput(event: InputEvent) {
    // ...
  }

  /* ... */

  /** Internal methods */

  private resetState() {
    // ...
  }

  protected updateState() {
    // ...
  }

  /* ... */

  /** Public methods */

  public reset() {
    this.resetState();
  }

  /* ... */

  /** Renderer helper methods */

  protected renderContainer() {
    // ...
  }

  protected renderInput() {
    // ...
  }


  /** The overridden `render` method */
  protected override render() {
    return html`${this.renderInput()}${this.renderContainer()}`;
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

- After adding new component(s) to the library, make sure to export them from the entry point of the package:

```ts
// in src/index.ts

/* ... */
export { default as IgcFooBarComponent } from './components/foobar/foobar.js';
/* ... */
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

- Calling `EventEmitterMixin.emitEvent` without modifying the `eventInitDict` parameter dispatches events that are non-cancelable, composed and bubble up the the ancestor tree.

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

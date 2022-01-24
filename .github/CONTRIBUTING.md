# Overview  
Ignite UI for Web Components version accepts contributions, as long as they follow the guidelines explained below. When contributing you would have to follow these steps:

1. Fork the repository or make a branch (if you have the necessary rights)
2. Perform the changes in your fork/branch
3. Create a pull request with your changes and reference the issue you're working on

Your pull request will undergo a review and if approved will be merged. All checks for the pull request should pass before a pull request is merged.

In order to perform all the necessary checks before pulling your changes in, you need to run

    npm install
    npm test

# Coding Guidelines

## Component Structure

When adding a new component make sure to order the class members like this:

```ts
export default class IgcSomethingComponent extends LitElement {
  /**
   * 1. Static members
   */
  /** @private */
  public static readonly tagName = 'igc-something';

  /** @private */
  public static override styles = [styles];

  /**
   * 2. Private/protected members and properties
   */
  private num = 0;
  protected text = 'text';

  private get roundedNum() {
    return Math.round(this.num);
  }

  /**
   * 3. @query members
   */
  @query('[part="base"]', true)
  private baseElement!: HTMLElement;

  /**
   * 4. @state members
   */
  @state()
  private hasError = false;

  /**
   * 5. @property members
   */
  @property()
  public label!: string;

  /**
   * 6. @watch methods
   */
  @watch('label')
  protected labelChange() {
    this.hasError = false;
  }

  /**
   * 7. Constructor
   */
  constructor() {
    super();
    this.addEventListener('click', this.handleClick);
  }

  /**
   * 8. Lifecycle hooks
   */
  public override connectedCallback() {
    super.connectedCallback();
    // ...
  }

  protected override firstUpdated() {
    // ...
  }

  /**
   * 9. Event handlers
   */
  private handleClick = () => {
    // ...
  }

  /**
   * 10. Private/protected methods
   */
  private updateState() {
    // ...
  }

  protected resetState() {
    // ...
  }

  /**
   * 11. Public methods
   */
  /**
   * Resets the component.
   */
  public reset() {
    // ...
  }

  /**
   * 12. Render helper methods
   */
  private renderHeader() {
    // ...
  }

  private renderFooter() {
    // ...
  }

  /**
   * 13. Render method
   */
  protected override render() {
    return html`
      ${this.renderHeader()}
      ${this.renderFooter()}
    `;
  }
}
```

## Events

When you need to raise custom events in a component, make sure to derive from the `EventEmitterMixin` and add an event map class like this:

```ts
export interface IgcCheckboxEventMap {
  igcChange: CustomEvent<boolean>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

export class IgcCheckboxBaseComponent extends EventEmitterMixin<
  IgcCheckboxEventMap,
  Constructor<LitElement>
>(LitElement) {
  // ...
}

```

Please note that events are emitted only for user interactions with the component. If a property is changed via API, no events should be emitted.

Events should be propagated from the child components to the parent components.

## Properties and Attributes

Complex property names should use `camelCase` while its corresponding attribute should use `kebab-case`.

```ts
  @property({ attribute: 'header-text' })
  public headerText = '';
```

Please note that boolean attributes should always default to `false`, otherwise there is no way to remove them in the html markup.

```ts
  @property({ type: Boolean, reflect: true })
  public disabled = false;
```

Properties should be propagated from the parent components to the child components.

## Component API Documentation

You could find a component documentation guide [here](https://github.com/IgniteUI/igniteui-webcomponents/wiki/How-to-document-your-component).

## Changelog

When adding a new component or fixing an issue make sure to update the [CHANGELOG](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md) file.

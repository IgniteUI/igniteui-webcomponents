import { ContextProvider } from '@lit/context';
import {
  css,
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import { type ThemeContext, themeContext } from '../../theming/context.js';
import type { Theme, ThemeVariant } from '../../theming/types.js';
import { registerComponent } from '../common/definitions/register.js';

/**
 * A theme provider component that uses Lit context to provide theme information
 * to descendant components.
 *
 * This component allows you to scope a theme to a specific part of the page.
 * All library components within this provider will use the specified theme
 * instead of the global theme.
 *
 * @element igc-theme-provider
 *
 * @slot - Default slot for content that should receive the provided theme.
 *
 * @example
 * ```html
 * <!-- Scope material theme to a section -->
 * <igc-theme-provider theme="material" variant="dark">
 *   <igc-button>Material Dark Button</igc-button>
 *   <igc-input label="Material Dark Input"></igc-input>
 * </igc-theme-provider>
 *
 * <!-- Use different theme in another section -->
 * <igc-theme-provider theme="fluent" variant="light">
 *   <igc-button>Fluent Light Button</igc-button>
 * </igc-theme-provider>
 * ```
 */
export default class IgcThemeProviderComponent extends LitElement {
  public static readonly tagName = 'igc-theme-provider';

  public static override styles = css`
    :host {
      display: contents;
    }
  `;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcThemeProviderComponent);
  }

  private readonly _provider: ContextProvider<typeof themeContext>;

  /**
   * The theme to provide to descendant components.
   *
   * @attr
   * @default 'bootstrap'
   */
  @property({ reflect: true })
  public theme: Theme = 'bootstrap';

  /**
   * The theme variant to provide to descendant components.
   *
   * @attr
   * @default 'light'
   */
  @property({ reflect: true })
  public variant: ThemeVariant = 'light';

  constructor() {
    super();

    this._provider = new ContextProvider(this, {
      context: themeContext,
      initialValue: this._getContextValue(),
    });
  }

  protected override update(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('theme') || changedProperties.has('variant')) {
      this._provider.setValue(this._getContextValue());
    }

    super.update(changedProperties);
  }

  protected override firstUpdated(): void {
    this.updateComplete.then(() => {
      this._provider.setValue(this._getContextValue());
    });
  }

  private _getContextValue(): ThemeContext {
    return {
      theme: this.theme,
      variant: this.variant,
    };
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

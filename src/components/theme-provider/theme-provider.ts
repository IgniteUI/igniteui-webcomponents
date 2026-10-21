import { css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { addContextProvider } from '#internals/controllers/context-provider.js';
import { registerComponent } from '#internals/definitions/register.js';
import { themeContext } from '#theming/context.js';
import type { Theme, ThemeVariant } from '#theming/types.js';

/**
 * Provides a theme to its descendant components through Lit context.
 *
 * Use it to scope a theme to a part of the page. The library components in
 * the provider use its theme instead of the global theme.
 *
 * @element igc-theme-provider
 *
 * @slot - The content that receives the provided theme.
 *
 * @remarks
 * Register the theme provider **before** the descendant components that consume the theme
 * context. Then the context provider is available when the descendant components request it.
 *
 * ```typescript
 * import { defineComponents, IgcThemeProviderComponent, IgcButtonComponent } from 'igniteui-webcomponents';
 *
 * // Register theme provider first, then descendant components
 * defineComponents(IgcThemeProviderComponent, IgcButtonComponent);
 * ```
 *
 * The provider changes the styles of the components only. The colors, the
 * typography and the elevations are CSS custom properties that the theme file
 * sets on `:root`. To change them for the content of the provider too, set
 * them on the provider, for example with the `palette()`, `typography()` and
 * `elevations()` mixins of `igniteui-theming` in a selector. The host renders
 * as `display: contents`, but its content still inherits them.
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

  constructor() {
    super();

    addContextProvider(this, {
      context: themeContext,
      watch: ['theme', 'variant'],
      value: () => ({ theme: this.theme, variant: this.variant }),
    });
  }

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

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-theme-provider': IgcThemeProviderComponent;
  }
}

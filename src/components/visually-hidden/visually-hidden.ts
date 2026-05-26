import { css, html, LitElement } from 'lit';
import { registerComponent } from '../common/definitions/register.js';

/* blazorSuppress */
/**
 * A utility component that visually hides its content while keeping it
 * accessible to screen readers and other assistive technologies.
 *
 * The content is only visible when it receives focus, making it ideal for
 * skip navigation links and other focus-based accessibility patterns.
 *
 * @element igc-visually-hidden
 *
 * @slot - Default slot for the visually hidden content.
 *
 * @example
 * ```html
 * <!-- Hide a label visually while keeping it accessible -->
 * <igc-visually-hidden>
 *   <label for="search">Search</label>
 * </igc-visually-hidden>
 * <input id="search" type="search" placeholder="Search..." />
 * ```
 *
 * @example
 * ```html
 * <!-- Skip navigation link that becomes visible on focus -->
 * <igc-visually-hidden>
 *   <a href="#main-content">Skip to main content</a>
 * </igc-visually-hidden>
 * ```
 *
 * @example
 * ```html
 * <!-- Provide additional context for icon-only buttons -->
 * <button>
 *   <igc-icon name="close"></igc-icon>
 *   <igc-visually-hidden>Close dialog</igc-visually-hidden>
 * </button>
 * ```
 */
export default class IgcVisuallyHiddenComponent extends LitElement {
  public static readonly tagName = 'igc-visually-hidden';

  public static override styles = css`
    :host(:not(:focus-within)) {
      position: absolute;
      width: 1px;
      height: 1px;
      border: 0;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      white-space: nowrap;
      clip: rect(0, 0, 0, 0);
      clip-path: inset(50%);
    }
  `;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcVisuallyHiddenComponent);
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-visually-hidden': IgcVisuallyHiddenComponent;
  }
}

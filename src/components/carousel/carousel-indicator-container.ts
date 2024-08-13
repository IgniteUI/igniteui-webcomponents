import { LitElement, html } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { registerComponent } from '../common/definitions/register.js';
import { partNameMap } from '../common/util.js';
import IgcCarouselIndicatorComponent from './carousel-indicator.js';
import { styles } from './themes/carousel-indicator-container.base.css.js';
import { all } from './themes/indicator-container.js';
import { styles as shared } from './themes/shared/indicator-container/indicator-container.common.css.js';

@themes(all)
export default class IgcCarouselIndicatorContainerComponent extends LitElement {
  public static readonly tagName = 'igc-carousel-indicator-container';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcCarouselIndicatorContainerComponent);
  }

  private _kbFocus = addKeyboardFocusRing(this);

  private handleFocusOut(event: FocusEvent) {
    const target = event.relatedTarget as HTMLElement;
    if (
      target &&
      target.tagName.toLowerCase() === IgcCarouselIndicatorComponent.tagName
    ) {
      return;
    }
    this._kbFocus.reset();
  }

  protected override render() {
    return html`
      <div
        part=${partNameMap({
          base: true,
          focused: this._kbFocus.focused,
        })}
        @click=${this._kbFocus.reset}
        @focusout=${this.handleFocusOut}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-carousel-indicator-container': IgcCarouselIndicatorContainerComponent;
  }
}
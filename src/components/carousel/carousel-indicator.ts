import { LitElement, html } from 'lit';
import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { registerComponent } from '../common/definitions/register.js';
import { partNameMap } from '../common/util.js';

export default class IgcCarouselIndicatorComponent extends LitElement {
  public static readonly tagName = 'igc-carousel-indicator';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcCarouselIndicatorComponent);
  }

  private _kbFocus = addKeyboardFocusRing(this);

  private handleFocusOut(event: FocusEvent) {
    if (this.contains(event.relatedTarget as Node)) {
      return;
    }
    this._kbFocus.reset();
  }

  protected override render() {
    return html`
      <div
        part=${partNameMap({
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
    'igc-carousel-indicator': IgcCarouselIndicatorComponent;
  }
}

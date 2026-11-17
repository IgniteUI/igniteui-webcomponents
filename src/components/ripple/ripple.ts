import { LitElement, nothing } from 'lit';
import { getPrefersReducedMotion } from '#animations/player.js';
import { registerComponent } from '#internals/definitions/register.js';
import { getScaleFactor, setStyles } from '#internals/utils/dom.js';
import { addSafeEventListener } from '#internals/utils/events.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles } from './ripple.material.css.js';

const rippleFrames: Keyframe[] = [
  { opacity: 0.5, transform: 'scale(.3)' },
  { opacity: 0, transform: 'scale(2)' },
];

const rippleAnimation: KeyframeAnimationOptions = {
  duration: 600, // --igc-ripple-duration
  fill: 'forwards',
  easing: 'linear', // --igc-ripple-easing
};

/**
 * Shows a ripple wave on a pointer press, to mark an element as an
 * interactive surface.
 *
 * @element igc-ripple
 *
 * @cssproperty --color - The color of the ripple wave.
 */
export default class IgcRippleComponent extends LitElement {
  public static readonly tagName = 'igc-ripple';
  public static override styles = [componentBase, styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcRippleComponent);
  }

  constructor() {
    super();
    addSafeEventListener(this, 'pointerdown', this._handler);
  }

  private async _handler(event: PointerEvent): Promise<void> {
    if (event.button !== 0) {
      return;
    }

    const element = document.createElement('span');
    const { radius, top, left } = this._getDimensions(
      event.clientX,
      event.clientY
    );

    // The stylesheet has the rest of the wave styles.
    setStyles(element, {
      width: `${radius}px`,
      height: `${radius}px`,
      top: `${top}px`,
      left: `${left}px`,
    });
    this.renderRoot.appendChild(element);

    const wave = element.animate(rippleFrames, {
      ...rippleAnimation,
      duration: getPrefersReducedMotion() ? 0 : rippleAnimation.duration,
    });

    // A cancel rejects `finished`. The wave must go in that case too.
    await wave.finished.catch(() => {});
    element.remove();
  }

  private _getDimensions(x: number, y: number) {
    const rect = this.getBoundingClientRect();
    const factor = getScaleFactor(this);
    const radius = Math.max(rect.width, rect.height);
    const halfRadius = radius / 2;

    return {
      radius,
      top: Math.round((y - rect.top) * factor.y - halfRadius),
      left: Math.round((x - rect.left) * factor.x - halfRadius),
    };
  }

  protected override render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-ripple': IgcRippleComponent;
  }
}

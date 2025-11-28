import { LitElement, nothing } from 'lit';
import { registerComponent } from '../common/definitions/register.js';
import {
  addSafeEventListener,
  getScaleFactor,
  setStyles,
} from '../common/util.js';
import { styles } from './ripple.material.css.js';

const rippleFrames: Keyframe[] = [
  { opacity: 0.5, transform: 'scale(.3)' },
  { opacity: 0, transform: 'scale(2)' },
];

const rippleAnimation: KeyframeAnimationOptions = {
  duration: 600, // --igc-ripple-duration,
  fill: 'forwards',
  easing: 'linear', // --igc-ripple-easing
};

let rippleElement: HTMLElement;

function getRippleElement(): HTMLSpanElement {
  if (!rippleElement) {
    rippleElement = document.createElement('span');
  }
  return rippleElement.cloneNode() as HTMLElement;
}

/**
 * A ripple can be applied to an element to represent
 * interactive surface.
 *
 * @element igc-ripple
 */
export default class IgcRippleComponent extends LitElement {
  public static readonly tagName = 'igc-ripple';
  public static override styles = styles;

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

    const element = getRippleElement();
    const { radius, top, left } = this._getDimensions(
      event.clientX,
      event.clientY
    );

    const styles: Partial<CSSStyleDeclaration> = {
      position: 'absolute',
      display: 'block',
      pointerEvents: 'none',
      transformOrigin: 'center',
      transform: 'translate3d(0, 0, 0) scale(0)',
      willChange: 'opacity, transform',
      margin: '0',
      border: 'none',
      width: `${radius}px`,
      height: `${radius}px`,
      borderRadius: '50%',
      top: `${top}px`,
      left: `${left}px`,
      background: 'var(--color, var(--ig-gray-800))',
    };

    setStyles(element, styles);
    this.renderRoot.appendChild(element);

    await element.animate(rippleFrames, rippleAnimation).finished;
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

import { html, LitElement } from 'lit';

import { registerComponent } from '../common/definitions/register.js';
import { addSafeEventListener } from '../common/util.js';
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

function getRippleElement() {
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
    addSafeEventListener(this, 'pointerdown', this.handler);
  }

  private handler = ({ clientX, clientY }: PointerEvent) => {
    const element = getRippleElement();
    const { radius, top, left } = this.getDimensions(clientX, clientY);

    const styles: Partial<CSSStyleDeclaration> = {
      position: 'absolute',
      display: 'block',
      pointerEvents: 'none',
      transformOrigin: 'center',
      transform: 'translate3d(0, 0, 0) scale(0)',
      willChange: 'opacity, transform',
      margin: '0 !important',
      border: 'none !important',
      width: `${radius}px`,
      height: `${radius}px`,
      borderRadius: '50%',
      top: `${top}px`,
      left: `${left}px`,
      background: 'var(--color, var(--ig-gray-800))',
    };

    Object.assign(element.style, styles);
    this.renderRoot.appendChild(element);

    element
      .animate(rippleFrames, rippleAnimation)
      .finished.then(() => element.remove());
  };

  private getDimensions(x: number, y: number) {
    const rect = this.getBoundingClientRect();
    const radius = Math.max(rect.width, rect.height);
    const halfRadius = radius / 2;

    return {
      radius,
      top: Math.round(y - rect.top - halfRadius),
      left: Math.round(x - rect.left - halfRadius),
    };
  }

  protected override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-ripple': IgcRippleComponent;
  }
}

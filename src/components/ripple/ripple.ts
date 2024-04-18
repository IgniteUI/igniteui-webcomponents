import { LitElement, html } from 'lit';

import { registerComponent } from '../common/definitions/register.js';
import { styles } from './ripple.material.css.js';

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
  public static register() {
    registerComponent(this);
  }

  constructor() {
    super();
    this.addEventListener('mousedown', this.handler);
  }

  private handler = ({ clientX, clientY }: MouseEvent) => {
    const element = document.createElement('span');
    const { radius, top, left } = this.getDimensions(clientX, clientY);

    const styles: Partial<CSSStyleDeclaration> = {
      position: 'absolute',
      display: 'block',
      pointerEvents: 'none',
      transformOrigin: 'center',
      transform: `translate3d(0, 0, 0) scale(0)`,
      willChange: 'opacity, transform',
      margin: `0 !important`,
      border: 'none !important',
      width: `${radius}px`,
      height: `${radius}px`,
      borderRadius: '50%',
      top: `${top}px`,
      left: `${left}px`,
      background: 'var(--color, hsl(var(--ig-gray-800)))',
    };
    const frames: Keyframe[] = [
      { opacity: 0.5, transform: 'scale(.3)' },
      { opacity: 0, transform: 'scale(2)' },
    ];
    const opts: KeyframeAnimationOptions = {
      duration: 600, // --igc-ripple-duration,
      fill: 'forwards',
      easing: 'linear', // --igc-ripple-easing
    };

    Object.assign(element.style, styles);
    this.shadowRoot?.appendChild(element);
    element.animate(frames, opts).finished.then(() => element.remove());
  };

  private getDimensions(x: number, y: number) {
    const { width, height, left, top } = this.getBoundingClientRect();
    const radius = Math.max(width, height);
    const _left = Math.round(x - left - radius / 2);
    const _top = Math.round(y - top - radius / 2);
    return { radius, top: _top, left: _left };
  }

  protected override render() {
    return html`<div></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-ripple': IgcRippleComponent;
  }
}

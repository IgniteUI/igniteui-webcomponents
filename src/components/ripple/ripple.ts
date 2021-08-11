import { css, html, LitElement } from 'lit';

export class IgcRippleComponent extends LitElement {
  static styles = css`
    :host {
      contain: content;
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: block;
      overflow: hidden;
    }
    :host::before,
    :host::after {
      box-sizing: border-box;
    }
  `;

  constructor() {
    super();
    this.addEventListener('mousedown', this.handler);
  }

  private handler = ({ clientX, clientY }: MouseEvent) => {
    const element = document.createElement('span');
    const { radius, top, left } = this.getDimensions(clientX, clientY);

    const styles: Partial<CSSStyleDeclaration> = {
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
      background: 'var(--igc-primary-500-contrast)',
      position: 'absolute',
    };
    const frames: Keyframe[] = [
      { opacity: 0.5, transform: 'scale(.3)' },
      { opacity: 0, transform: 'scale(2)' },
    ];
    const opts: KeyframeAnimationOptions = {
      duration: 600, // --igc-ripple-duration,
      fill: 'forwards',
      easing: 'linear', // --ic-ripple-easing
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

  render() {
    return html`<div></div>`;
  }
}

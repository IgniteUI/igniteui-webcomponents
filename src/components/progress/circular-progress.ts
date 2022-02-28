import { html, svg } from 'lit';
import { query, queryAssignedElements } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { styleMap } from 'lit/directives/style-map.js';
import { asPercent, partNameMap } from '../common/util';
import { IgcProgressBaseComponent } from './base';
import { styles } from './themes/circular/circular.progress.material.css';
import IgcCircularGradientComponent from './circular-gradient';

/**
 * A circular progress indicator used to express unspecified wait time or display
 * the length of a process.
 *
 * @element igc-circular-progress
 *
 * @slot - The text area container.
 *
 * @csspart track
 * @csspart indicator
 */
export default class IgcCircularProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-circular-progress';
  public static override styles = styles;

  @queryAssignedElements({ slot: 'gradient' })
  protected gradientElements!: Array<IgcCircularGradientComponent>;

  @query('#circle', true)
  protected svgCircle!: SVGCircleElement;

  protected gradientId = Date.now().toString(16);

  protected get isLTR() {
    return window.getComputedStyle(this).getPropertyValue('direction') == 'ltr';
  }

  protected get stroke() {
    return { stroke: `url(#${this.gradientId})` };
  }

  protected get svgParts() {
    return {
      indeterminate: this.indeterminate,
    };
  }

  private get circumference(): number {
    const radiusInPixels = getComputedStyle(this.svgCircle).getPropertyValue(
      'r'
    );
    const radius = parseInt(radiusInPixels, 10);
    return radius * 2 * Math.PI;
  }

  protected override indeterminateChange(): void {
    if (this.indeterminate) {
      this.svgCircle.getAnimations().forEach((animation) => animation.cancel());
    } else {
      this.runAnimation(0, this.value, true);
    }
  }

  private gradientChange() {
    this.requestUpdate();
  }

  protected getOffset(val: number) {
    return this.isLTR
      ? this.circumference -
          (asPercent(val, this.max) / 100) * this.circumference
      : this.circumference +
          (asPercent(val, this.max) / 100) * this.circumference;
  }

  protected override runAnimation(
    start: number,
    end: number,
    indeterminateChange = false
  ): void {
    this.animation?.finish();

    const opacity = asPercent(end, this.max) + 0.2;
    const offset0 = this.getOffset(start);
    const offset1 = this.getOffset(end);

    const frames = [
      { strokeDashoffset: offset0, strokeOpacity: 1 },
      { strokeDashoffset: offset1, strokeOpacity: opacity },
    ];

    const animOptions = {
      ...this.animationOptions,
      duration: indeterminateChange ? 0 : this.animationDuration,
    };
    this.animation = this.svgCircle.animate(frames, animOptions);
    cancelAnimationFrame(this.tick);
    this.animateLabelTo(start, end, animOptions.duration);
  }

  protected renderSvg() {
    return svg`
      <circle part="inner"/>
      <circle id="circle" style="${styleMap(this.stroke)}" part="outer"/>

      <defs>
          <linearGradient id=${this.gradientId} gradientTransform="rotate(90)">
          ${when(
            this.gradientElements.length,
            () =>
              this.gradientElements.map((el: IgcCircularGradientComponent) => {
                return svg`<stop offset=${el.offset} stop-color=${el.color} opacity=${el.opacity}/>`;
              }),
            () => svg`
              <stop offset="0%" part="gradient_start" />
              <stop offset="100%" part="gradient_end" />
          `
          )}
          </linearGradient>
      </defs>
    `;
  }

  protected renderWrapper() {
    return html`
      <div part="wrapper">
        <svg
          part="svg ${partNameMap(this.svgParts)}"
          aria-valuemin="0"
          aria-valuemax=${this.max}
          aria-valuenow=${this.value}
        >
          ${this.renderSvg()}
        </svg>
      </div>
      <slot name="gradient" @slotchange=${this.gradientChange}></slot>
      ${this.renderDefaultSlot()}
    `;
  }

  protected override render() {
    return this.renderWrapper();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-circular-progress': IgcCircularProgressComponent;
  }
}

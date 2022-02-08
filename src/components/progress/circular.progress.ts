import { html, svg } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styles } from './circular.progress.material.css';
import { IgcProgressBaseComponent, toPercent } from './common/progress-base';

let NEXT_CIRCULAR_ID = 0;
let NEXT_GRADIENT_ID = 0;

export default class IgcCircularProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-circular-bar';
  public static styles = styles;

  public override id = `igx-circular-bar-${NEXT_CIRCULAR_ID++}`;
  public gradientId = `igx-circular-gradient-${NEXT_GRADIENT_ID++}`;

  private readonly STROKE_OPACITY_DVIDER = 100;
  private readonly STROKE_OPACITY_ADDITION = 0.2;

  private _circleRadius = 46;
  private _circumference = 2 * Math.PI * this._circleRadius;
  private animationState = {
    strokeDashoffset: 289,
    strokeOpacity: 1,
  };

  @query('#circle')
  private _svgCircle!: HTMLElement;

  @property({ reflect: true, attribute: true })
  public text!: string;

  private slotChange(): void {
    this._svgCircle.style.stroke = `url(#${this.gradientId})`;
  }

  private getProgress(percentage: number) {
    // return this._directionality.rtl
    //   ? this._circumference + (percentage * this._circumference) / 100
    //   : this._circumference - (percentage * this._circumference) / 100;

    return this._circumference - (percentage * this._circumference) / 100;
  }

  public override runAnimation(value: number): void {
    if (this._animation && this._animation.playState !== 'finished') {
      return;
    }

    const valueInPercent = this.max <= 0 ? 0 : toPercent(value, this.max);

    const FRAMES = [];
    FRAMES[0] = { ...this.animationState };
    this.animationState.strokeDashoffset = this.getProgress(valueInPercent);
    this.animationState.strokeOpacity =
      toPercent(value, this.max) / this.STROKE_OPACITY_DVIDER +
      this.STROKE_OPACITY_ADDITION;

    FRAMES[1] = {
      ...this.animationState,
    };

    this._animation = this._svgCircle.animate(FRAMES, {
      easing: 'ease-out',
      fill: 'forwards',
      duration: this.animationDuration,
    });
  }

  protected override render() {
    return html`
      <div part="wrapper ${this.indeterminate ? 'indeterminate' : ''}">
        <slot @slotchange=${this.slotChange}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            version="1.1"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            role="progressbar"
            part="svg"
            aria-valuemin="0"
            aria-valuemax=${this.max}
            aria-valuenow=${this.value}
          >
            <circle cx="50" cy="50" r="46" part="inner" />
            <circle
              id="circle"
              style="stroke: url(#${this.gradientId})"
              part="outer"
              cx="50"
              cy="50"
              r="46"
            />

            ${this.textVisibility
              ? svg`
                  <text text-anchor="middle" x="50" y="60">
                    <!-- <slot name="textTemplate"> -->
                      <tspan part="text">
                        ${this.text ? this.text : this.valueInPercent + '%'}
                      </tspan>
                    <!-- </slot> -->
                  </text>
                `
              : ''}

            <defs>
              <!-- <slot name="gardientTemplate"> -->
              <linearGradient
                id=${this.gradientId}
                gradientTransform="rotate(90)"
              >
                <stop offset="0%" part="gradient_start" />
                <stop offset="100%" part="gradient_end" />
              </linearGradient>
              <!-- </slot> -->
            </defs>
          </svg>
        </slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-circular-bar': IgcCircularProgressComponent;
  }
}

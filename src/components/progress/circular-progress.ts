import { html, nothing, svg } from 'lit';
import { queryAssignedElements } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';

import { IgcProgressBaseComponent } from './base.js';
import IgcCircularGradientComponent from './circular-gradient.js';
import { styles } from './themes/circular/circular.progress.base.css.js';
import { all } from './themes/circular/themes.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { asPercent, partNameMap } from '../common/util.js';

/**
 * A circular progress indicator used to express unspecified wait time or display
 * the length of a process.
 *
 * @element igc-circular-progress
 *
 * @slot - The text area container.
 * @slot gradient - Customize the progress bar in order to use a color gradient instead of a solid color. Accepts `igc-circular-gradient` elements.
 *
 * @csspart svg
 * @csspart gradient_start
 * @csspart gradient_end
 * @csspart track
 * @csspart fill
 * @csspart label
 * @csspart value
 * @csspart indeterminate
 * @csspart primary
 * @csspart danger
 * @csspart warning
 * @csspart info
 * @csspart success
 */
@themes(all, true)
export default class IgcCircularProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-circular-progress';
  public static override styles = styles;

  public static register() {
    registerComponent(this, IgcCircularGradientComponent);
  }

  protected gradientId = Date.now().toString(16);

  @queryAssignedElements({ slot: 'gradient' })
  protected gradientElements!: Array<IgcCircularGradientComponent>;

  protected get stroke() {
    return {
      stroke: `url(#${this.gradientId})`,
      '--percentage': (asPercent(this.value, this.max) / 100).toString(),
      '--duration': this.animationDuration + 'ms',
    };
  }

  protected get svgParts() {
    return {
      indeterminate: this.indeterminate,
    };
  }

  private gradientChange() {
    this.requestUpdate();
  }

  protected renderSvg() {
    return svg`
      <circle part="track ${partNameMap(this.svgParts)}"/>
      <circle style="${styleMap(this.stroke)}" part="fill"/>

      <defs>
          <linearGradient id=${this.gradientId} gradientTransform="rotate(90)">
          ${when(
            this.gradientElements.length,
            () =>
              this.gradientElements.map((el: IgcCircularGradientComponent) => {
                return svg`<stop offset=${el.offset} stop-color=${el.color} stop-opacity=${el.opacity}/>`;
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
      <svg
        part="svg ${partNameMap(this.svgParts)}"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this.indeterminate ? nothing : this.value}
      >
        ${this.renderSvg()}
      </svg>
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

import { html, svg } from 'lit';
import { queryAssignedElements } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { createCounter, partNameMap } from '../common/util.js';
import { IgcProgressBaseComponent } from './base.js';
import IgcCircularGradientComponent from './circular-gradient.js';
import { styles } from './themes/circular/circular.progress.base.css.js';
import { styles as shared } from './themes/circular/shared/circular.progress.common.css.js';
import { all } from './themes/circular/themes.js';

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
@themes(all)
export default class IgcCircularProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-circular-progress';
  public static override styles = [styles, shared];

  private static readonly increment = createCounter();

  /* blazorSuppress */
  public static register() {
    registerComponent(this, IgcCircularGradientComponent);
  }

  private _gradientId = `circular-progress-${IgcCircularProgressComponent.increment()}`;

  @queryAssignedElements({ slot: 'gradient' })
  private _assignedGradients!: Array<IgcCircularGradientComponent>;

  protected renderSvg() {
    const parts = { indeterminate: this.indeterminate, track: true };
    const styles = {
      stroke: `url(#${this._gradientId})`,
      '--percentage': `${this.progress}`,
      '--duration': `${this.animationDuration}ms`,
    };

    const gradients = this._assignedGradients.length
      ? this._assignedGradients.map(
          ({ offset, color, opacity }) =>
            svg`<stop offset=${offset} stop-color=${color} stop-opacity=${opacity}/>`
        )
      : svg`
        <stop offset="0%" part="gradient_start" />
        <stop offset="100%" part="gradient_end" />
      `;

    return svg`
      <circle part=${partNameMap(parts)}/>
      <circle style=${styleMap(styles)} part="fill"/>

      <defs>
          <linearGradient id=${this._gradientId} gradientTransform="rotate(90)">
          ${gradients}
          </linearGradient>
      </defs>
    `;
  }

  protected renderWrapper() {
    const parts = {
      svg: true,
      indeterminate: this.indeterminate,
    };

    return html`
      <svg part=${partNameMap(parts)}>${this.renderSvg()}</svg>
      <slot name="gradient" @slotchange=${this.slotChanged}></slot>
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

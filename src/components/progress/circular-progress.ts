import { html, svg } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { IgcProgressBaseComponent } from './base.js';
import IgcCircularGradientComponent from './circular-gradient.js';
import { styles } from './themes/circular/circular.progress.base.css.js';
import { styles as shared } from './themes/circular/shared/circular.progress.common.css.js';
import { all } from './themes/circular/themes.js';

let nextId = 1;

/**
 * A circular progress indicator used to express unspecified wait time or display
 * the length of a process.
 *
 * @element igc-circular-progress
 *
 * @slot - The text area container.
 * @slot gradient - Customize the progress bar in order to use a color gradient instead of a solid color. Accepts `igc-circular-gradient` elements.
 *
 * @csspart svg - The igc-circular-progress SVG element.
 * @csspart gradient_start - The igc-circular-progress linear-gradient start color.
 * @csspart gradient_end - The igc-circular-progress linear-gradient end color.
 * @csspart track - The igc-circular-progress ring track area.
 * @csspart fill - The igc-circular-progress indicator area.
 * @csspart label - The igc-circular-progress label.
 * @csspart value - The igc-circular-progress label value.
 * @csspart indeterminate - The igc-circular-progress indeterminate state.
 * @csspart primary - The igc-circular-progress primary state.
 * @csspart danger - The igc-circular-progress error state.
 * @csspart warning - The igc-circular-progress warning state.
 * @csspart info - The igc-circular-progress info state.
 * @csspart success - The igc-circular-progress success state.
 */
export default class IgcCircularProgressComponent extends IgcProgressBaseComponent {
  public static readonly tagName = 'igc-circular-progress';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcCircularProgressComponent,
      IgcCircularGradientComponent
    );
  }

  private readonly _gradientId = `circular-progress-${nextId++}`;
  protected override readonly _slots = addSlotController(this, {
    slots: setSlots('gradient'),
  });

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected _renderSvg() {
    const gradients = this._slots.hasAssignedElements('gradient')
      ? this._slots
          .getAssignedElements<IgcCircularGradientComponent>('gradient', {
            selector: IgcCircularGradientComponent.tagName,
          })
          .map(
            ({ offset, color, opacity }) =>
              svg`<stop offset=${offset} stop-color=${color} stop-opacity=${opacity}/>`
          )
      : svg`
        <stop offset="0%" part="gradient_start" />
        <stop offset="100%" part="gradient_end" />
      `;

    return svg`
      <circle part=${partMap({ track: true, indeterminate: this.indeterminate })}/>
      <circle style=${styleMap({ stroke: `url(#${this._gradientId})` })} part="fill"/>

      <defs>
          <linearGradient id=${this._gradientId} gradientTransform="rotate(90)">
          ${gradients}
          </linearGradient>
      </defs>
    `;
  }

  protected override render() {
    return html`
      <div part="base" style=${styleMap(this._styleInfo)}>
        <svg part=${partMap({ svg: true, indeterminate: this.indeterminate })}>
          ${this._renderSvg()}
        </svg>
        <slot name="gradient"></slot>
        ${this._renderDefaultSlot()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-circular-progress': IgcCircularProgressComponent;
  }
}

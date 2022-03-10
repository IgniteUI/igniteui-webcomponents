import { html, nothing, PropertyValueMap, svg } from 'lit';
import { queryAssignedElements, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { styleMap } from 'lit/directives/style-map.js';
import { asPercent, partNameMap } from '../common/util';
import { IgcProgressBaseComponent } from './base';
import { styles } from './themes/circular/circular.progress.base.css';
import { styles as bootstrap } from './themes/circular/circular.progress.bootstrap.css';
import { styles as fluent } from './themes/circular/circular.progress.fluent.css';
import IgcCircularGradientComponent from './circular-gradient';
import { ReactiveTheme, Theme, ThemeController, themes } from '../../theming';
import { watch } from '../common/decorators';

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

@themes({ bootstrap, fluent })
export default class IgcCircularProgressComponent
  extends IgcProgressBaseComponent
  implements ReactiveTheme
{
  public static readonly tagName = 'igc-circular-progress';
  public static override styles = styles;

  protected gradientId = Date.now().toString(16);
  protected themeController!: ThemeController;

  @state()
  public theme!: Theme;

  @watch('theme', { waitUntilFirstUpdate: true })
  public func() {
    this.runAnimation(0, this.value);
  }

  @queryAssignedElements({ slot: 'gradient' })
  protected gradientElements!: Array<IgcCircularGradientComponent>;

  private get circumference(): number {
    const radiusInPixels = getComputedStyle(
      this.progressIndicator
    ).getPropertyValue('r');
    const radius = parseInt(radiusInPixels, 10);
    return radius * 2 * Math.PI;
  }

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

  protected override willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.willUpdate(_changedProperties);
    this.theme = this.themeController.theme;
  }

  public themeAdopted(controller: ThemeController): void {
    this.themeController = controller;
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

  protected override runAnimation(start: number, end: number): void {
    this.animation?.finish();

    const opacity = asPercent(end, this.max) + 0.2;
    const offset0 = this.getOffset(start);
    const offset1 = this.getOffset(end);

    const frames = [
      { strokeDashoffset: offset0, strokeOpacity: 1 },
      { strokeDashoffset: offset1, strokeOpacity: opacity },
    ];

    this.animation = this.progressIndicator.animate(
      frames,
      this.animationOptions
    );
    cancelAnimationFrame(this.tick);
    this.animateLabelTo(start, end);
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

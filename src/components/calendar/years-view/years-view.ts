import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { range } from 'lit/directives/range.js';

import { addThemingController } from '../../../theming/theming-controller.js';
import { addKeybindings } from '../../common/controllers/key-bindings.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { registerComponent } from '../../common/definitions/register.js';
import type { Constructor } from '../../common/mixins/constructor.js';
import { EventEmitterMixin } from '../../common/mixins/event-emitter.js';
import { partMap } from '../../common/part-map.js';
import { chunk } from '../../common/util.js';
import { getViewElement, getYearRange, YEARS_PER_ROW } from '../helpers.js';
import { CalendarDay } from '../model.js';
import { all } from '../themes/year-month.js';
import { styles } from '../themes/year-month-view.base.css.js';
import type { IgcCalendarComponentEventMap } from '../types.js';

/**
 * Instantiate a years view as a separate component in the calendar.
 *
 * @element igc-years-view
 *
 * @csspart years-row - The years row container.
 * @csspart year - The year container.
 * @csspart year-inner - The inner year container.
 */
@blazorIndirectRender
@blazorSuppressComponent
export default class IgcYearsViewComponent extends EventEmitterMixin<
  IgcCalendarComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-years-view';
  public static styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcYearsViewComponent);
  }

  @state()
  private _value = CalendarDay.today;

  @query('[tabindex="0"]')
  private activeYear!: HTMLElement;

  /** Тhe current value of the calendar. */
  @property({ attribute: false })
  public set value(value: Date) {
    this._value = CalendarDay.from(value);
  }

  public get value() {
    return this._value.native;
  }

  /**
   * Sets how many years are displayed on a single page.
   * @attr years-per-page
   */
  @property({ type: Number, attribute: 'years-per-page' })
  public yearsPerPage = 15;

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      bindingDefaults: { preventDefault: true },
    }).setActivateHandler(this.handleInteraction);

    this.addEventListener('click', this.handleInteraction);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.role = 'grid';
  }

  public focusActiveDate(options?: FocusOptions) {
    this.activeYear.focus(options);
  }

  protected handleInteraction(event: Event) {
    const value = getViewElement(event);

    if (value !== -1) {
      this._value = this._value.set({
        year: value,
      });
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  protected renderYear(year: number, now: CalendarDay) {
    const selected = this._value.year === year;
    const current = year === now.year;

    return html`
      <span part=${partMap({ year: true, selected, current })}>
        <span
          role="gridcell"
          data-value=${year}
          part=${partMap({ 'year-inner': true, selected, current })}
          aria-selected=${selected}
          tabindex=${selected ? 0 : -1}
        >
          ${year}
        </span>
      </span>
    `;
  }

  protected override *render() {
    const now = CalendarDay.today;
    const { start } = getYearRange(this._value, this.yearsPerPage);
    const years = Array.from(range(start, start + this.yearsPerPage));

    for (const row of chunk(years, YEARS_PER_ROW)) {
      yield html`
        <div part="years-row" role="row">
          ${row.map((year) => this.renderYear(year, now))}
        </div>
      `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-years-view': IgcYearsViewComponent;
  }
}

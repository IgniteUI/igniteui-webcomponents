import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { range } from 'lit/directives/range.js';

import { themes } from '../../../theming/theming-decorator.js';
import { addKeybindings } from '../../common/controllers/key-bindings.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { registerComponent } from '../../common/definitions/register.js';
import { Constructor } from '../../common/mixins/constructor.js';
import { EventEmitterMixin } from '../../common/mixins/event-emitter.js';
import {
  asNumber,
  getElementsFromEventPath,
  partNameMap,
} from '../../common/util.js';
import {
  IgcCalendarBaseEventMap,
  YEARS_PER_ROW,
} from '../common/calendar-base.js';
import { CalendarDay, chunk } from '../common/day.js';
import { styles } from '../themes/year-month-view.base.css.js';
import { all } from '../themes/year-month.js';

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
@themes(all)
export default class IgcYearsViewComponent extends EventEmitterMixin<
  IgcCalendarBaseEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-years-view';
  public static styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(this);
  }

  @state()
  private _value = CalendarDay.today;

  @query(`[tabindex='0']`)
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

    addKeybindings(this, {
      bindingDefaults: { preventDefault: true },
    }).setActivateHandler(this.handleInteraction);

    this.addEventListener('click', this.handleInteraction);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.role = 'grid';
  }

  public focusActiveDate() {
    this.activeYear.focus();
  }

  protected handleInteraction(event: Event) {
    const source = getElementsFromEventPath(event).find((item) =>
      item.matches('[data-year]')
    );

    if (source) {
      this._value = this._value.replace({
        year: asNumber(source.dataset.year),
      });
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  protected renderYear(year: number, now: CalendarDay) {
    const selected = this._value.year === year;
    const current = year === now.year;
    const parts = { selected, current };

    return html`
      <span part=${partNameMap({ year: true, ...parts })}>
        <span
          role="gridcell"
          data-year=${year}
          part=${partNameMap({ 'year-inner': true, ...parts })}
          aria-selected=${selected}
          tabindex=${selected ? 0 : -1}
        >
          ${year}
        </span>
      </span>
    `;
  }

  protected override render() {
    const now = CalendarDay.today;
    const start =
      Math.floor(this._value.year / this.yearsPerPage) * this.yearsPerPage;
    const years = Array.from(range(start, start + this.yearsPerPage));

    return Array.from(chunk(years, YEARS_PER_ROW)).map(
      (row) => html`
        <div part="years-row" role="row">
          ${row.map((year) => this.renderYear(year, now))}
        </div>
      `
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-years-view': IgcYearsViewComponent;
  }
}

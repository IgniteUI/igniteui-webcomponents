import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { themes } from '../../../theming/theming-decorator.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { watch } from '../../common/decorators/watch.js';
import { Constructor } from '../../common/mixins/constructor.js';
import { EventEmitterMixin } from '../../common/mixins/event-emitter.js';
import { partNameMap } from '../../common/util.js';
import {
  IgcCalendarBaseEventMap,
  MONTHS_PER_ROW,
} from '../common/calendar-base.js';
import { Calendar, TimeDeltaInterval } from '../common/calendar.model.js';
import { setDateSafe } from '../common/utils.js';
import { styles as bootstrap } from '../themes/bootstrap/year-month-view.bootstrap.css.js';
import { styles as fluent } from '../themes/fluent/year-month-view.fluent.css.js';
import { styles } from '../themes/year-month-view.base.css.js';

/**
 * Instantiate a months view as a separate component in the calendar.
 *
 * @element igc-months-view
 *
 * @csspart months-row - The months row container.
 * @csspart month - The month container.
 * @csspart month-inner - The inner month container.
 */
@customElement('igc-months-view')
@blazorIndirectRender
@blazorSuppressComponent
@themes({
  bootstrap,
  fluent,
})
export default class IgcMonthsViewComponent extends EventEmitterMixin<
  IgcCalendarBaseEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static styles = styles;
  private calendarModel = new Calendar();
  private monthFormatter: any;

  @query('[tabindex="0"]')
  private activeMonth!: HTMLElement;

  /** Тhe current value of the calendar. */
  @property({ attribute: false })
  public value = new Date();

  /** Sets the locale used for formatting and displaying the dates. */
  @property()
  public locale = 'en';

  /** The format of the month. Defaults to long. */
  @property({ attribute: 'month-format' })
  public monthFormat:
    | 'numeric'
    | '2-digit'
    | 'long'
    | 'short'
    | 'narrow'
    | undefined = 'long';

  @watch('locale')
  @watch('monthFormat')
  protected formatChange() {
    this.initMonthFormatter();
  }

  constructor() {
    super();
    this.setAttribute('role', 'grid');
    this.initMonthFormatter();
  }

  /** Focuses the active date. */
  public focusActiveDate() {
    this.activeMonth.focus();
  }

  private initMonthFormatter() {
    this.monthFormatter = new Intl.DateTimeFormat(this.locale, {
      month: this.monthFormat,
    });
  }

  private formattedMonth(value: Date) {
    return this.monthFormatter.format(value);
  }

  private get months(): Date[][] {
    let date = new Date(this.value.getFullYear(), 0, 1);
    const result = [];

    const rowsCount = 12 / MONTHS_PER_ROW;

    for (let i = 0; i < rowsCount; i++) {
      const row: Date[] = [];

      for (let j = 0; j < MONTHS_PER_ROW; j++) {
        row.push(date);
        date = this.calendarModel.timedelta(date, TimeDeltaInterval.Month, 1);
      }
      result.push(row);
    }

    return result;
  }

  private resolveMonthPartName(date: Date) {
    const today = new Date();
    return {
      month: true,
      selected: date.getMonth() === this.value.getMonth(),
      current:
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth(),
    };
  }

  private selectMonth(month: Date) {
    const value = new Date(month);
    setDateSafe(value, this.value.getDate());
    this.value = value;
    this.emitEvent('igcChange', { detail: this.value });
  }

  private monthKeyDown(event: KeyboardEvent, month: Date) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectMonth(month);
    }
  }

  protected override render() {
    return html`${this.months.map((row) => {
      return html`<div part="months-row" role="row">
        ${row.map((month) => {
          const monthPartName = partNameMap(this.resolveMonthPartName(month));
          const monthInnerPartName = monthPartName.replace(
            'month',
            'month-inner'
          );

          return html`<span part=${monthPartName}>
            <span
              part=${monthInnerPartName}
              role="gridcell"
              aria-label=${month.toLocaleString(this.locale, {
                month: 'long',
                year: 'numeric',
              })}
              aria-selected=${month.getMonth() === this.value.getMonth()}
              tabindex="${month.getFullYear() === this.value.getFullYear() &&
              month.getMonth() === this.value.getMonth()
                ? 0
                : -1}"
              @click=${() => this.selectMonth(month)}
              @keydown=${(event: KeyboardEvent) =>
                this.monthKeyDown(event, month)}
            >
              ${this.formattedMonth(month)}
            </span>
          </span>`;
        })}
      </div>`;
    })}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-months-view': IgcMonthsViewComponent;
  }
}

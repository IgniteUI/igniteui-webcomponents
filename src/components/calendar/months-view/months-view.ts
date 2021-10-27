import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { watch } from '../../common/decorators';
import { Constructor } from '../../common/mixins/constructor';
import { EventEmitterMixin } from '../../common/mixins/event-emitter';
import { Calendar, TimeDeltaInterval } from '../common/calendar.model';
import { IgcCalendarBaseEventMap } from '../common/calendar-base';
import { styles } from './months-view.css';
import { partNameMap } from '../../common/util';
import { setDateSafe } from '../common/utils';
import { MONTHS_PER_ROW } from '../calendar';

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
export default class IgcMonthsViewComponent extends EventEmitterMixin<
  IgcCalendarBaseEventMap,
  Constructor<LitElement>
>(LitElement) {
  /**
   * @private
   */
  public static styles = [styles];

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
  public monthFormat: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' =
    'long';

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
    this.emitEvent('igcChange');
  }

  private monthKeyDown(event: KeyboardEvent, month: Date) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectMonth(month);
    }
  }

  protected render() {
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

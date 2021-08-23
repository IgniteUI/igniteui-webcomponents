import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../../common/decorators';
import { Constructor } from '../../common/mixins/constructor';
import { EventEmitterMixin } from '../../common/mixins/event-emitter';
import { Calendar } from '../common/calendar.model';
import { IgcCalendarBaseEventMap } from '../common/calendar-base';
import { styles } from './months-view.css';
import { partNameMap } from '../../common/util';

/**
 * Months view component
 *
 * @element igc-months-view
 */
export class IgcMonthsViewComponent extends EventEmitterMixin<
  IgcCalendarBaseEventMap,
  Constructor<LitElement>
>(LitElement) {
  /**
   * @private
   */
  static styles = [styles];

  private calendarModel = new Calendar();
  private monthFormatter: any;

  @property({ attribute: false })
  value = new Date();

  @property()
  locale = 'en';

  @property()
  monthFormat: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' = 'short';

  @watch('locale')
  @watch('monthFormat')
  formatChange() {
    this.initMonthFormatter();
  }

  constructor() {
    super();
    this.initMonthFormatter();
  }

  private initMonthFormatter() {
    this.monthFormatter = new Intl.DateTimeFormat(this.locale, {
      month: this.monthFormat,
    });
  }

  private formattedMonth(value: Date) {
    return this.monthFormatter.format(value);
  }

  private get months() {
    let start = new Date(this.value.getFullYear(), 0, 1);
    const result = [];

    for (let i = 0; i < 12; i++) {
      result.push(start);
      start = this.calendarModel.timedelta(start, 'month', 1);
    }

    return result;
  }

  private resolveMonthPartName(date: Date) {
    return {
      month: true,
      selected: date.getMonth() === this.value.getMonth(),
    };
  }

  private monthClick(month: Date) {
    this.value = new Date(
      month.getFullYear(),
      month.getMonth(),
      this.value.getDate()
    );
    this.emitEvent('igcChange');
  }

  render() {
    return html`${this.months.map(
      (month) =>
        html`<span
          part=${partNameMap(this.resolveMonthPartName(month))}
          @click=${() => this.monthClick(month)}
          >${this.formattedMonth(month)}</span
        >`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-months-view': IgcMonthsViewComponent;
  }
}

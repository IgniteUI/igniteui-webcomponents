import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { watch } from '../../common/decorators';
import { Constructor } from '../../common/mixins/constructor';
import { EventEmitterMixin } from '../../common/mixins/event-emitter';
import { partNameMap } from '../../common/util';
import { IgcCalendarBaseEventMap } from '../common/calendar-base';
import { calculateYearsRangeStart, setDateSafe } from '../common/utils';
import { styles } from './years-view.css';

export class IgcYearsViewComponent extends EventEmitterMixin<
  IgcCalendarBaseEventMap,
  Constructor<LitElement>
>(LitElement) {
  /**
   * @private
   */
  static styles = [styles];

  private years!: Date[];
  // private calendarModel = new Calendar();
  // private yearFormatter: any;

  @query('[tabindex="0"]')
  activeYear!: HTMLElement;

  @property({ attribute: false })
  value = new Date();

  @property({ type: Number, attribute: 'years-per-page' })
  yearsPerPage = 15;

  @watch('value')
  @watch('yearsPerPage')
  datesChange() {
    this.years = this.generateYears();
  }

  // @property()
  // locale = 'en';

  // @property()
  // yearFormat: 'numeric' | '2-digit' = 'numeric';

  // @watch('locale')
  // @watch('yearFormat')
  // formatChange() {
  //   this.initYearFormatter();
  // }

  // constructor() {
  //   super();
  //   this.initYearFormatter();
  // }

  // private initYearFormatter() {
  //   this.yearFormatter = new Intl.DateTimeFormat(this.locale, {
  //     year: this.yearFormat,
  //   });
  // }

  focusActiveDate() {
    this.activeYear.focus();
  }

  private formattedYear(value: Date) {
    return `${value.getFullYear()}`;
  }

  private generateYears() {
    const startYear = calculateYearsRangeStart(this.value, this.yearsPerPage);
    const month = this.value.getMonth();
    const result = [];

    for (let i = 0; i < this.yearsPerPage; i++) {
      const year = startYear + i;
      const date = new Date(year, month, 1);
      // fix year since values between 0 and 100 results in 1900s
      date.setFullYear(year);
      result.push(date);
    }

    return result;
  }

  private resolveYearPartName(date: Date) {
    const today = new Date();
    return {
      year: true,
      selected: date.getFullYear() === this.value.getFullYear(),
      current: date.getFullYear() === today.getFullYear(),
    };
  }

  private selectYear(year: Date) {
    const value = new Date(year);
    setDateSafe(value, this.value.getDate());
    this.value = value;
    this.emitEvent('igcChange');
  }

  private yearKeyDown(event: KeyboardEvent, year: Date) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectYear(year);
    }
  }

  render() {
    return html`${this.years.map((year) => {
      const yearPartName = partNameMap(this.resolveYearPartName(year));
      const yearInnerPartName = yearPartName.replace('year', 'year-inner');

      return html`<span part=${yearPartName}>
        <span
          part=${yearInnerPartName}
          tabindex="${year.getFullYear() === this.value.getFullYear() ? 0 : -1}"
          @click=${() => this.selectYear(year)}
          @keydown=${(event: KeyboardEvent) => this.yearKeyDown(event, year)}
        >
          ${this.formattedYear(year)}
        </span>
      </span>`;
    })}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-years-view': IgcYearsViewComponent;
  }
}

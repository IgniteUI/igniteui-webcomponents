import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { Constructor } from '../../common/mixins/constructor';
import { EventEmitterMixin } from '../../common/mixins/event-emitter';
import { IgcCalendarBaseEventMap } from '../common/calendar-base';
import { calculateYearsRangeStart } from '../common/utils';
import { styles } from './years-view.css';

export const YEARS_PER_PAGE = 20;

export class IgcYearsViewComponent extends EventEmitterMixin<
  IgcCalendarBaseEventMap,
  Constructor<LitElement>
>(LitElement) {
  /**
   * @private
   */
  static styles = [styles];

  // private calendarModel = new Calendar();
  // private yearFormatter: any;

  @property({ attribute: false })
  value = new Date();

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

  private formattedYear(value: Date) {
    return `${value.getFullYear()}`;
  }

  private get years() {
    const startYear = calculateYearsRangeStart(this.value, YEARS_PER_PAGE);
    const month = this.value.getMonth();
    const result = [];

    for (let i = 0; i < YEARS_PER_PAGE; i++) {
      result.push(new Date(startYear + i, month, 1));
    }

    return result;
  }

  private resolveYearClasses(date: Date) {
    return {
      year: true,
      'year--current': date.getFullYear() === this.value.getFullYear(),
    };
  }

  private yearClick(year: Date) {
    this.value = year;
    this.emitEvent('igcChange');
  }

  render() {
    return html`${this.years.map(
      (year) =>
        html`<span
          class=${classMap(this.resolveYearClasses(year))}
          @click=${() => this.yearClick(year)}
          >${this.formattedYear(year)}</span
        >`
    )}`;
  }
}

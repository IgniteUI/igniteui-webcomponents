import { html } from 'lit';
import { property, query } from 'lit/decorators.js';
import {
  IgcCalendarBaseComponent,
  IgcCalendarBaseEventMap,
} from './common/calendar-base';
import { IgcMonthsViewComponent } from './months-view/months-view';
import { IgcYearsViewComponent } from './years-view/years-view';
import { styles } from './calendar.css';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { Constructor } from '../common/mixins/constructor';
import { IgcDaysViewComponent } from './days-view/days-view';
import { ICalendarDate } from './common/calendar.model';

export class IgcCalendarComponent extends EventEmitterMixin<
  IgcCalendarBaseEventMap,
  Constructor<IgcCalendarBaseComponent<IgcCalendarBaseEventMap>>
>(IgcCalendarBaseComponent) {
  /**
   * @private
   */
  static styles = [styles];

  @query('igc-days-view')
  daysView!: IgcDaysViewComponent;

  @query('igc-months-view')
  monthsView!: IgcMonthsViewComponent;

  @query('igc-years-view')
  yearsView!: IgcYearsViewComponent;

  @property()
  activeView: 'days' | 'months' | 'years' = 'days';

  private changeValue() {
    this.value = this.daysView.value;
  }

  private changeMonth() {
    this.viewDate = this.monthsView.value;
    this.activeView = 'days';
  }

  private changeYear() {
    this.viewDate = this.yearsView.value;
    this.activeView = 'months';
  }

  private renderNavigation() {
    return html`<div class="navigation">${this.viewDate.toDateString()}</div>`;
  }

  private outsideDaySelected(event: CustomEvent<ICalendarDate>) {
    const date = event.detail;
    if (date.isNextMonth) {
      this.nextMonth();
    } else if (date.isPrevMonth) {
      this.previousMonth();
    }
  }

  private nextMonth() {
    this.viewDate = this.calendarModel.getNextMonth(this.viewDate);
  }

  private previousMonth() {
    this.viewDate = this.calendarModel.getPrevMonth(this.viewDate);
  }

  render() {
    return html`
      ${this.renderNavigation()}
      ${this.activeView === 'days'
        ? html`<igc-days-view
            .viewDate=${this.viewDate}
            .weekStart=${this.weekStart}
            .formatOptions=${this.formatOptions}
            .locale=${this.locale}
            .selection=${this.selection}
            .value=${this.value}
            .hideOutsideDays=${this.hideOutsideDays}
            .showWeekNumbers=${this.showWeekNumbers}
            .disabledDates=${this.disabledDates}
            .specialDates=${this.specialDates}
            @igcChange=${this.changeValue}
            @igcOutsideDaySelected=${this.outsideDaySelected}
          ></igc-days-view>`
        : ''}
      ${this.activeView === 'months'
        ? html`<igc-months-view
            .value=${this.viewDate}
            .locale=${this.locale}
            .monthFormat=${this.formatOptions.month}
            @igcChange=${this.changeMonth}
          ></igc-months-view>`
        : ''}
      ${this.activeView === 'years'
        ? html`<igc-years-view
            .value=${this.viewDate}
            @igcChange=${this.changeYear}
          ></igc-years-view>`
        : ''}
    `;
  }
}

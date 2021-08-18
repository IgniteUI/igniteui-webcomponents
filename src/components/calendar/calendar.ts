import { html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { IgcCalendarBaseComponent } from './common/calendar-base';
import { IgcMonthsViewComponent } from './months-view/months-view';
import { IgcYearsViewComponent } from './years-view/years-view';
import { styles } from './calendar.css';

export class IgcCalendarComponent extends IgcCalendarBaseComponent {
  /**
   * @private
   */
  static styles = [styles];

  @query('igc-months-view')
  monthsView!: IgcMonthsViewComponent;

  @query('igc-years-view')
  yearsView!: IgcYearsViewComponent;

  @property()
  activeView: 'days' | 'months' | 'years' = 'days';

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

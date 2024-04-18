import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';

import { themes } from '../../../theming/theming-decorator.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { watch } from '../../common/decorators/watch.js';
import { registerComponent } from '../../common/definitions/register.js';
import type { Constructor } from '../../common/mixins/constructor.js';
import { EventEmitterMixin } from '../../common/mixins/event-emitter.js';
import { partNameMap } from '../../common/util.js';
import {
  type IgcCalendarBaseEventMap,
  YEARS_PER_ROW,
} from '../common/calendar-base.js';
import { calculateYearsRangeStart, setDateSafe } from '../common/utils.js';
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
    registerComponent(IgcYearsViewComponent);
  }

  private years!: Date[][];

  @query('[tabindex="0"]')
  private activeYear!: HTMLElement;

  /** Тhe current value of the calendar. */
  @property({ attribute: false })
  public value = new Date();

  /** Sets how many years are displayed on a single page. */
  @property({ type: Number, attribute: 'years-per-page' })
  public yearsPerPage = 15;

  @watch('value')
  @watch('yearsPerPage')
  protected datesChange() {
    this.years = this.generateYears();
  }

  constructor() {
    super();
    this.setAttribute('role', 'grid');
  }

  /** Focuses the active date. */
  public focusActiveDate() {
    this.activeYear.focus();
  }

  private formattedYear(value: Date) {
    return `${value.getFullYear()}`;
  }

  private generateYears() {
    const startYear = calculateYearsRangeStart(this.value, this.yearsPerPage);
    const month = this.value.getMonth();
    const result = [];

    const rows = this.yearsPerPage / YEARS_PER_ROW;

    for (let i = 0; i < rows; i++) {
      const row: Date[] = [];
      for (let j = 0; j < YEARS_PER_ROW; j++) {
        const year = startYear + i * YEARS_PER_ROW + j;
        const date = new Date(year, month, 1);
        // fix year since values between 0 and 100 results in 1900s
        date.setFullYear(year);
        row.push(date);
      }
      result.push(row);
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
    this.emitEvent('igcChange', { detail: this.value });
  }

  private yearKeyDown(event: KeyboardEvent, year: Date) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectYear(year);
    }
  }

  protected override render() {
    return html`${this.years.map((row) => {
      return html`<div part="years-row" role="row">
        ${row.map((year) => {
          const yearPartName = partNameMap(this.resolveYearPartName(year));
          const yearInnerPartName = yearPartName.replace('year', 'year-inner');

          return html`<span part=${yearPartName}>
            <span
              part=${yearInnerPartName}
              role="gridcell"
              aria-selected=${year.getFullYear() === this.value.getFullYear()}
              tabindex="${year.getFullYear() === this.value.getFullYear()
                ? 0
                : -1}"
              @click=${() => this.selectYear(year)}
              @keydown=${(event: KeyboardEvent) =>
                this.yearKeyDown(event, year)}
            >
              ${this.formattedYear(year)}
            </span>
          </span>`;
        })}
      </div>`;
    })}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-years-view': IgcYearsViewComponent;
  }
}

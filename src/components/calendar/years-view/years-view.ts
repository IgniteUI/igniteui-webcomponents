import { property } from 'lit/decorators.js';
import type { CalendarDay } from '#internals/date/model.js';
import { blazorIndirectRender } from '#internals/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '#internals/decorators/blazorSuppressComponent.js';
import { registerComponent } from '#internals/definitions/register.js';
import { getYearRange, YEARS_PER_ROW } from '../helpers.js';
import {
  IgcYearMonthViewBaseComponent,
  type YearMonthViewCell,
} from '../year-month-view.base.js';

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
export default class IgcYearsViewComponent extends IgcYearMonthViewBaseComponent {
  public static readonly tagName = 'igc-years-view';

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcYearsViewComponent);
  }

  //#region Internal state

  protected override readonly _cellPart = 'year';
  protected override readonly _cellsPerRow = YEARS_PER_ROW;

  //#endregion

  //#region Public attributes and properties

  /**
   * Sets how many years are displayed on a single page.
   * @attr years-per-page
   */
  @property({ type: Number, attribute: 'years-per-page' })
  public yearsPerPage = 15;

  //#endregion

  //#region Internal API

  protected override _valueFromCell(value: number): CalendarDay {
    return this._value.set({ year: value });
  }

  protected override _getCells(today: CalendarDay): YearMonthViewCell[] {
    const { start } = getYearRange(this._value, this.yearsPerPage);

    return Array.from({ length: this.yearsPerPage }, (_, i) => {
      const year = start + i;

      return {
        value: year,
        label: `${year}`,
        selected: this._value.year === year,
        current: year === today.year,
      };
    });
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-years-view': IgcYearsViewComponent;
  }
}

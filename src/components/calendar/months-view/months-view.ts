import { getDateFormatter } from 'igniteui-i18n-core';
import { property } from 'lit/decorators.js';
import type { CalendarDay } from '#internals/date/model.js';
import { blazorIndirectRender } from '#internals/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '#internals/decorators/blazorSuppressComponent.js';
import { registerComponent } from '#internals/definitions/register.js';
import { areSameMonth, MONTHS_PER_ROW } from '../helpers.js';
import {
  IgcYearMonthViewBaseComponent,
  type YearMonthViewCell,
} from '../year-month-view.base.js';

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

/**
 * Instantiate a months view as a separate component in the calendar.
 *
 * @element igc-months-view
 *
 * @csspart months-row - The months row container.
 * @csspart month - The month container.
 * @csspart month-inner - The inner month container.
 */
@blazorIndirectRender
@blazorSuppressComponent
export default class IgcMonthsViewComponent extends IgcYearMonthViewBaseComponent {
  public static readonly tagName = 'igc-months-view';

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcMonthsViewComponent);
  }

  //#region Internal state

  protected override readonly _cellPart = 'month';
  protected override readonly _cellsPerRow = MONTHS_PER_ROW;

  //#endregion

  //#region Public attributes and properties

  /** Sets the locale used for formatting and displaying the dates. */
  @property()
  public locale = 'en';

  /** The format of the month. Defaults to long. */
  @property({ attribute: 'month-format' })
  public monthFormat: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' =
    'long';

  //#endregion

  //#region Internal API

  protected override _valueFromCell(value: number): CalendarDay {
    return this._value.set({ month: value });
  }

  protected override _getCells(today: CalendarDay): YearMonthViewCell[] {
    const formatter = getDateFormatter();
    const aria = formatter.getIntlFormatter(this.locale, {
      month: 'long',
      year: 'numeric',
    });
    const label = formatter.getIntlFormatter(this.locale, {
      month: this.monthFormat,
    });

    return MONTHS.map((month) => {
      const date = this._value.set({ month }).native;

      return {
        value: month,
        label: label.format(date),
        ariaLabel: aria.format(date),
        selected: this._value.month === month,
        current: areSameMonth(today, date),
      };
    });
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-months-view': IgcMonthsViewComponent;
  }
}

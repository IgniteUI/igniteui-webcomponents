import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { blazorDeepImport } from '../../common/decorators/blazorDeepImport.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppress } from '../../common/decorators/blazorSuppress.js';
import { watch } from '../../common/decorators/watch.js';
import { Calendar, type DateRangeDescriptor } from './calendar.model.js';
import { getWeekDayNumber } from './utils.js';

export const MONTHS_PER_ROW = 3;
export const YEARS_PER_ROW = 3;

export interface IgcCalendarBaseEventMap {
  igcChange: CustomEvent<Date | Date[]>;
}

@blazorIndirectRender
@blazorDeepImport
export class IgcCalendarBaseComponent extends LitElement {
  private _activeDate = new Date();
  private _activeDateSetFlag = false;
  protected calendarModel = new Calendar();

  /**
   * The current value of the calendar.
   * Used when selection is set to single.
   */
  @blazorSuppress()
  @property({
    converter: {
      fromAttribute: (value: string) => (value ? new Date(value) : undefined),
      toAttribute: (value: Date) => value.toISOString(),
    },
  })
  public value?: Date;
  //we suppress value for blazor since we need to expose it on the leaves with the events for now.

  /**
   * The current values of the calendar.
   * Used when selection is set to multiple or range.
   */
  @blazorSuppress()
  @property({
    converter: {
      fromAttribute: (value: string) =>
        !value
          ? undefined
          : value
              .split(',')
              .map((v) => v.trim())
              .filter((v) => v)
              .map((v) => new Date(v)),
      toAttribute: (value: Date[]) =>
        value.map((v) => v.toISOString()).join(','),
    },
  })
  public values?: Date[];

  /** Sets the type of date selection. */
  @property()
  public selection: 'single' | 'multiple' | 'range' = 'single';

  /** Show/hide the week numbers. */
  @property({ type: Boolean, attribute: 'show-week-numbers', reflect: true })
  public showWeekNumbers = false;

  /** Sets the start day of the week. */
  @property({ attribute: 'week-start' })
  public weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday' = 'sunday';

  /** Sets the date which is shown in view and is highlighted. By default it is the current date. */
  public set activeDate(val: Date) {
    const oldVal = this._activeDate;
    this._activeDate = val;
    this._activeDateSetFlag = true;
    this.requestUpdate('activeDate', oldVal);
  }

  @blazorSuppress()
  @property({
    attribute: 'active-date',
    converter: {
      fromAttribute: (value: string) => (value ? new Date(value) : new Date()),
      toAttribute: (value: Date) => value.toISOString(),
    },
  })
  public get activeDate(): Date {
    return this._activeDate;
  }

  /** Sets the locale used for formatting and displaying the dates in the calendar. */
  @property()
  public locale = 'en';

  /** Gets/sets disabled dates. */
  @property({ attribute: false })
  public disabledDates!: DateRangeDescriptor[];

  /** Gets/sets special dates. */
  @property({ attribute: false })
  public specialDates!: DateRangeDescriptor[];

  @watch('weekStart')
  protected weekStartChange() {
    this.calendarModel.firstWeekDay = getWeekDayNumber(this.weekStart);
  }

  @watch('selection', { waitUntilFirstUpdate: true })
  protected selectionChange() {
    this.value = undefined;
  }

  protected override async firstUpdated() {
    if (this._activeDateSetFlag) {
      return;
    }
    if (this.selection === 'single') {
      this.activeDate = this.value ?? this.activeDate;
    } else {
      this.activeDate = this.values ? this.values[0] : this.activeDate;
    }
  }
}

import { html, LitElement, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addKeybindings } from '#internals/controllers/key-bindings.js';
import { CalendarDay } from '#internals/date/model.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { partMap } from '#internals/part-map.js';
import { chunk } from '#internals/utils/arrays.js';
import { addSafeEventListener } from '#internals/utils/events.js';
import { addThemingController } from '#theming/theming-controller.js';
import { getViewElement } from './helpers.js';
import { all } from './themes/year-month.js';
import { styles } from './themes/year-month-view.base.css.js';
import type { IgcCalendarViewComponentEventMap } from './types.js';

/** A single cell of a year/month view. */
export interface YearMonthViewCell {
  /** The value the cell represents - a month index or a year. */
  value: number;
  label: string;
  /** Announced instead of {@link YearMonthViewCell.label}, when it is not descriptive on its own. */
  ariaLabel?: string;
  selected: boolean;
  current: boolean;
}

/**
 * Base class of the year and month calendar views.
 *
 * @remarks
 * Both are grids of single values derived from the current one, so everything except
 * which cells to render is shared.
 */
export abstract class IgcYearMonthViewBaseComponent extends EventEmitterMixin<
  IgcCalendarViewComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static styles = styles;

  //#region Internal state

  @state()
  protected _value = CalendarDay.today;

  @query('[tabindex="0"]')
  private _activeCell?: HTMLElement;

  /** The `part` name of the cells of the view. The row and inner parts are derived from it. */
  protected abstract readonly _cellPart: 'month' | 'year';

  protected abstract readonly _cellsPerRow: number;

  //#endregion

  //#region Public attributes and properties

  /** The current value of the calendar. */
  @property({ attribute: false })
  public set value(value: Date) {
    this._value = CalendarDay.from(value);
  }

  public get value(): Date {
    return this._value.native;
  }

  //#endregion

  //#region Lifecycle methods

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: { role: 'grid' },
      reflectRole: true,
    });
    addThemingController(this, all);
    addKeybindings(this).setActivateHandler(this._handleInteraction);
    addSafeEventListener(this, 'click', this._handleInteraction);
  }

  //#endregion

  //#region Event handlers

  protected _handleInteraction(event: Event): void {
    const value = getViewElement(event);

    if (value !== -1) {
      this._value = this._valueFromCell(value);
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  //#endregion

  //#region Internal API

  /** The cells rendered for the current value, given the current date. */
  protected abstract _getCells(today: CalendarDay): YearMonthViewCell[];

  /** The value of the view after the cell holding `value` is activated. */
  protected abstract _valueFromCell(value: number): CalendarDay;

  //#endregion

  //#region Public methods

  /** Focuses the active date. */
  public focusActiveDate(options?: FocusOptions): void {
    this._activeCell?.focus(options);
  }

  //#endregion

  protected _renderCell({
    value,
    label,
    ariaLabel,
    selected,
    current,
  }: YearMonthViewCell): TemplateResult {
    const part = this._cellPart;
    const inner = `${part}-inner`;

    return html`
      <span part=${partMap({ [part]: true, selected, current })}>
        <span
          role="gridcell"
          data-value=${value}
          part=${partMap({ [inner]: true, selected, current })}
          aria-selected=${selected}
          aria-label=${ifDefined(ariaLabel)}
          tabindex=${selected ? 0 : -1}
        >
          ${label}
        </span>
      </span>
    `;
  }

  protected override *render(): Generator<TemplateResult> {
    const cells = this._getCells(CalendarDay.today);
    const rowPart = `${this._cellPart}s-row`;

    for (const row of chunk(cells, this._cellsPerRow)) {
      yield html`
        <div part=${rowPart} role="row">
          ${row.map((cell) => this._renderCell(cell))}
        </div>
      `;
    }
  }
}

import { html, LitElement, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { addThemingController } from '../../../theming/theming-controller.js';
import { addKeybindings } from '../../common/controllers/key-bindings.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { registerComponent } from '../../common/definitions/register.js';
import type { Constructor } from '../../common/mixins/constructor.js';
import { EventEmitterMixin } from '../../common/mixins/event-emitter.js';
import { partMap } from '../../common/part-map.js';
import { addSafeEventListener, chunk } from '../../common/util.js';
import { getViewElement, getYearRange, YEARS_PER_ROW } from '../helpers.js';
import { CalendarDay } from '../model.js';
import { all } from '../themes/year-month.js';
import { styles } from '../themes/year-month-view.base.css.js';
import type { IgcCalendarComponentEventMap } from '../types.js';

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
export default class IgcYearsViewComponent extends EventEmitterMixin<
  IgcCalendarComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-years-view';
  public static styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcYearsViewComponent);
  }

  //#region Internal State

  @state()
  private _value = CalendarDay.today;

  @query('[tabindex="0"]')
  private _activeYear?: HTMLElement;

  //#endregion

  //#region Public attributes and properties

  /** Тhe current value of the calendar. */
  @property({ attribute: false })
  public set value(value: Date) {
    this._value = CalendarDay.from(value);
  }

  public get value(): Date {
    return this._value.native;
  }

  /**
   * Sets how many years are displayed on a single page.
   * @attr years-per-page
   */
  @property({ type: Number, attribute: 'years-per-page' })
  public yearsPerPage = 15;

  //#endregion

  //#region Lifecycle

  constructor() {
    super();

    addThemingController(this, all);
    addKeybindings(this).setActivateHandler(this._handleInteraction);
    addSafeEventListener(this, 'click', this._handleInteraction);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.role = 'grid';
  }

  //#endregion

  //#region Event Handlers

  protected _handleInteraction(event: Event): void {
    const value = getViewElement(event);

    if (value !== -1) {
      this._value = this._value.set({ year: value });
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  //#endregion

  //#region Public Methods

  /** Focuses the active year element. */
  public focusActiveDate(options?: FocusOptions): void {
    this._activeYear?.focus(options);
  }

  //#endregion

  protected _renderYear(year: number, now: CalendarDay): TemplateResult {
    const selected = this._value.year === year;
    const current = year === now.year;

    return html`
      <span part=${partMap({ year: true, selected, current })}>
        <span
          role="gridcell"
          data-value=${year}
          part=${partMap({ 'year-inner': true, selected, current })}
          aria-selected=${selected}
          tabindex=${selected ? 0 : -1}
        >
          ${year}
        </span>
      </span>
    `;
  }

  protected override *render(): Generator<TemplateResult> {
    const now = CalendarDay.today;
    const { start } = getYearRange(this._value, this.yearsPerPage);
    const years = Array.from(
      { length: this.yearsPerPage },
      (_, i) => start + i
    );

    for (const row of chunk(years, YEARS_PER_ROW)) {
      yield html`
        <div part="years-row" role="row">
          ${row.map((year) => this._renderYear(year, now))}
        </div>
      `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-years-view': IgcYearsViewComponent;
  }
}

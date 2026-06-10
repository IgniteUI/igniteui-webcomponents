import { getDateFormatter } from 'igniteui-i18n-core';
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
import { areSameMonth, getViewElement, MONTHS_PER_ROW } from '../helpers.js';
import { CalendarDay } from '../model.js';
import { all } from '../themes/year-month.js';
import { styles } from '../themes/year-month-view.base.css.js';
import type { IgcCalendarComponentEventMap } from '../types.js';

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
export default class IgcMonthsViewComponent extends EventEmitterMixin<
  IgcCalendarComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-months-view';
  public static styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcMonthsViewComponent);
  }

  //#region Internal State

  @state()
  private _value = CalendarDay.today;

  @query('[tabindex="0"]')
  private _activeMonth?: HTMLElement;

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

  /** Sets the locale used for formatting and displaying the dates. */
  @property()
  public locale = 'en';

  /** The format of the month. Defaults to long. */
  @property({ attribute: 'month-format' })
  public monthFormat: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' =
    'long';

  //#endregion

  //#region Lifecycle methods

  constructor() {
    super();

    addThemingController(this, all);
    addKeybindings(this).setActivateHandler(this._handleInteraction);
    addSafeEventListener(this, 'click', this._handleInteraction);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.role = 'grid';
  }

  //#endregion

  //#region Event Handlers

  protected _handleInteraction(event: Event): void {
    const value = getViewElement(event);

    if (value !== -1) {
      this._value = this._value.set({ month: value });
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  //#endregion

  //#region Public Methods

  /** Focuses the active date. */
  public focusActiveDate(options?: FocusOptions): void {
    this._activeMonth?.focus(options);
  }

  //#endregion

  protected _renderMonth(
    month: CalendarDay,
    now: CalendarDay,
    ariaFormatter: Intl.DateTimeFormat,
    labelFormatter: Intl.DateTimeFormat
  ): TemplateResult {
    const active = areSameMonth(this._value, month);
    const current = areSameMonth(now, month);
    const selected = this._value.month === month.month;

    return html`
      <span part=${partMap({ month: true, selected, current })}>
        <span
          role="gridcell"
          data-value=${month.month}
          part=${partMap({ 'month-inner': true, selected, current })}
          aria-selected=${selected}
          aria-label=${ariaFormatter.format(month.native)}
          tabindex=${active ? 0 : -1}
        >
          ${labelFormatter.format(month.native)}
        </span>
      </span>
    `;
  }

  protected override *render(): Generator<TemplateResult> {
    const now = CalendarDay.today;

    const ariaFormatter = getDateFormatter().getIntlFormatter(this.locale, {
      month: 'long',
      year: 'numeric',
    });
    const labelFormatter = getDateFormatter().getIntlFormatter(this.locale, {
      month: this.monthFormat,
    });

    for (const row of chunk(MONTHS, MONTHS_PER_ROW)) {
      yield html`
        <div part="months-row" role="row">
          ${row.map((month) =>
            this._renderMonth(
              this._value.set({ month }),
              now,
              ariaFormatter,
              labelFormatter
            )
          )}
        </div>
      `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-months-view': IgcMonthsViewComponent;
  }
}

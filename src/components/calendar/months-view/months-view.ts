import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { range } from 'lit/directives/range.js';

import { addThemingController } from '../../../theming/theming-controller.js';
import { addKeybindings } from '../../common/controllers/key-bindings.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { watch } from '../../common/decorators/watch.js';
import { registerComponent } from '../../common/definitions/register.js';
import { createDateTimeFormatters } from '../../common/localization/intl-formatters.js';
import type { Constructor } from '../../common/mixins/constructor.js';
import { EventEmitterMixin } from '../../common/mixins/event-emitter.js';
import { partMap } from '../../common/part-map.js';
import { addSafeEventListener, chunk } from '../../common/util.js';
import { areSameMonth, getViewElement, MONTHS_PER_ROW } from '../helpers.js';
import { CalendarDay } from '../model.js';
import { all } from '../themes/year-month.js';
import { styles } from '../themes/year-month-view.base.css.js';
import type { IgcCalendarComponentEventMap } from '../types.js';

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
  public static register() {
    registerComponent(IgcMonthsViewComponent);
  }

  @state()
  private _value = CalendarDay.today;

  @query('[tabindex="0"]')
  private activeMonth!: HTMLElement;

  /** Тhe current value of the calendar. */
  @property({ attribute: false })
  public set value(value: Date) {
    this._value = CalendarDay.from(value);
  }

  public get value() {
    return this._value.native;
  }

  /** Sets the locale used for formatting and displaying the dates. */
  @property()
  public locale = 'en';

  /** The format of the month. Defaults to long. */
  @property({ attribute: 'month-format' })
  public monthFormat: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' =
    'long';

  private _intl = createDateTimeFormatters(this.locale, {
    month: { month: this.monthFormat },
    ariaMonth: { month: 'long', year: 'numeric' },
  });

  @watch('locale')
  protected localeChange() {
    this._intl.locale = this.locale;
  }

  @watch('monthFormat')
  protected formatChange() {
    this._intl.update({ month: { month: this.monthFormat } });
  }

  constructor() {
    super();

    addThemingController(this, all);
    addKeybindings(this).setActivateHandler(this.handleInteraction);
    addSafeEventListener(this, 'click', this.handleInteraction);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.role = 'grid';
  }

  /** Focuses the active date. */
  public focusActiveDate(options?: FocusOptions) {
    this.activeMonth.focus(options);
  }

  protected handleInteraction(event: Event) {
    const value = getViewElement(event);

    if (value !== -1) {
      this._value = this._value.set({ month: value });
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  protected renderMonth(entry: CalendarDay, now: CalendarDay) {
    const ariaLabel = this._intl.get('ariaMonth').format(entry.native);
    const value = this._intl.get('month').format(entry.native);

    const active = areSameMonth(this._value, entry);
    const current = areSameMonth(now, entry);
    const selected = this._value.month === entry.month;

    return html`
      <span part=${partMap({ month: true, selected, current })}>
        <span
          role="gridcell"
          data-value=${entry.month}
          part=${partMap({ 'month-inner': true, selected, current })}
          aria-selected=${selected}
          aria-label=${ariaLabel}
          tabindex=${active ? 0 : -1}
        >
          ${value}
        </span>
      </span>
    `;
  }

  protected override *render() {
    const now = CalendarDay.today;
    const months = Array.from(range(12));

    for (const row of chunk(months, MONTHS_PER_ROW)) {
      yield html`
        <div part="months-row" role="row">
          ${row.map((month) =>
            this.renderMonth(this._value.set({ month }), now)
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

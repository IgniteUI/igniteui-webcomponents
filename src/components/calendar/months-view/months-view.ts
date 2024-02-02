import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { range } from 'lit/directives/range.js';

import { themes } from '../../../theming/theming-decorator.js';
import { addKeybindings } from '../../common/controllers/key-bindings.js';
import { blazorIndirectRender } from '../../common/decorators/blazorIndirectRender.js';
import { blazorSuppressComponent } from '../../common/decorators/blazorSuppressComponent.js';
import { watch } from '../../common/decorators/watch.js';
import { registerComponent } from '../../common/definitions/register.js';
import { Constructor } from '../../common/mixins/constructor.js';
import { EventEmitterMixin } from '../../common/mixins/event-emitter.js';
import {
  asNumber,
  getElementsFromEventPath,
  partNameMap,
} from '../../common/util.js';
import {
  IgcCalendarBaseEventMap,
  MONTHS_PER_ROW,
} from '../common/calendar-base.js';
import { CalendarDay, areSameMonth, chunk } from '../common/day.js';
import { createDateTimeFormatters } from '../common/intl-formatters.js';
import { styles } from '../themes/year-month-view.base.css.js';
import { all } from '../themes/year-month.js';

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
@themes(all)
export default class IgcMonthsViewComponent extends EventEmitterMixin<
  IgcCalendarBaseEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-months-view';
  public static styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(this);
  }

  @state()
  private _value = CalendarDay.today;

  @query(`[tabindex='0']`)
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

    addKeybindings(this, {
      bindingDefaults: { preventDefault: true },
    }).setActivateHandler(this.handleInteraction);

    this.addEventListener('click', this.handleInteraction);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.role = 'grid';
  }

  /** Focuses the active date. */
  public focusActiveDate() {
    this.activeMonth.focus();
  }

  protected handleInteraction(event: Event) {
    const source = getElementsFromEventPath(event).find((item) =>
      item.matches('[data-month]')
    );

    if (source) {
      this._value = this._value.replace({
        month: asNumber(source.dataset.month),
      });
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  protected renderMonth(entry: CalendarDay, now: CalendarDay) {
    const ariaLabel = this._intl.getFormatter('ariaMonth').format(entry.native);
    const value = this._intl.getFormatter('month').format(entry.native);

    const selected = this._value.month === entry.month;

    const current = areSameMonth(now, entry);
    const active = areSameMonth(this._value, entry) ? 0 : -1;

    const parts = partNameMap({
      month: true,
      selected,
      current,
    });

    const partsInner = parts.replace('month', 'month-inner');

    return html`
      <span part=${parts}>
        <span
          role="gridcell"
          data-month=${entry.month}
          part=${partsInner}
          aria-selected=${selected}
          aria-label=${ariaLabel}
          tabindex=${active}
        >
          ${value}
        </span>
      </span>
    `;
  }

  protected override render() {
    const now = CalendarDay.today;
    const months = Array.from(range(12));

    return Array.from(chunk(months, MONTHS_PER_ROW)).map(
      (row) => html`
        <div part="months-row" role="row">
          ${row.map((month) =>
            this.renderMonth(this._value.replace({ month }), now)
          )}
        </div>
      `
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-months-view': IgcMonthsViewComponent;
  }
}

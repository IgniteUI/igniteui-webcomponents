import { LitElement, html, nothing } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { convertToDate } from '../calendar/helpers.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { createCounter } from '../common/util.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';

export const setInputFormat = Symbol();
export const setDisplayFormat = Symbol();

export interface IgcDatePickerComponentEventMap {
  igcToggleIconClicked: CustomEvent<void>;
  igcClearIconClicked: CustomEvent<void>;
  igcChange: CustomEvent<Date | null>;
  igcInput: CustomEvent<Date | null>;
}

// should this be form associated?
export default class IgcDateRangeInputComponent extends EventEmitterMixin<
  IgcDatePickerComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-date-range-input';

  private static readonly increment = createCounter();
  public inputId = `date-range-input-${IgcDateRangeInputComponent.increment()}`;

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcDateRangeInputComponent);
  }

  @query(IgcDateTimeInputComponent.tagName)
  private _input!: IgcDateTimeInputComponent;

  @queryAssignedElements({ slot: 'prefix' })
  private prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  private suffixes!: Array<HTMLElement>;

  private _open = false;
  private _value: Date | null = null;

  /**
   * The value of the picker
   * @attr
   */
  @property({ converter: convertToDate })
  public set value(value: Date | string | null | undefined) {
    this._value = value as Date | null;
  }

  public get value(): Date | null {
    return this._value;
  }

  /**
   * The label of the datepicker.
   * @attr label
   */
  @property()
  public label!: string;

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  private handleAnchorClick() {
    this.emitEvent('igcToggleIconClicked');
  }

  private clearIconClick() {
    this.emitEvent('igcClearIconClicked');
  }

  /** @private @hidden @internal */
  public async [setInputFormat](value: string) {
    this._input.inputFormat = value;
  }

  /** @private @hidden @internal */
  public async [setDisplayFormat](value: string) {
    this._input.displayFormat = value;
  }

  public clear() {
    this.value = null;
    this._input.clear();
  }

  protected handleInputChangeEvent(event: CustomEvent<Date>) {
    event.stopPropagation();
    this.value = (event.target as IgcDateTimeInputComponent).value!;
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected handleInputEvent(event: CustomEvent<Date>) {
    event.stopPropagation();
    this.value = (event.target as IgcDateTimeInputComponent).value!;
    this.emitEvent('igcInput', { detail: this.value });
  }

  private renderClearIcon() {
    return !this.value
      ? nothing
      : html`
          <span slot="suffix" part="clear-icon" @click=${this.clearIconClick}>
            <slot name="clear-icon">
              <igc-icon
                name="input_clear"
                collection="default"
                aria-hidden="true"
              ></igc-icon>
            </slot>
          </span>
        `;
  }

  private renderCalendarIcon() {
    const defaultIcon = html`
      <igc-icon name="today" collection="default" aria-hidden="true"></igc-icon>
    `;

    const state = this._open ? 'calendar-icon-open' : 'calendar-icon';

    return html`
      <span slot="prefix" part=${state} @click=${this.handleAnchorClick}>
        <slot name=${state}>${defaultIcon}</slot>
      </span>
    `;
  }

  protected override render() {
    return html`
      <igc-date-time-input
        id=${this.inputId}
        .value=${this.value}
        .label=${this.label}
        @igcChange=${this.handleInputChangeEvent}
        @igcInput=${this.handleInputEvent}
      >
        ${this.renderCalendarIcon()}
        <slot
          name="prefix"
          slot=${ifDefined(!this.prefixes.length ? undefined : 'prefix')}
        ></slot>
        ${this.renderClearIcon()}
        <slot
          name="suffix"
          slot=${ifDefined(!this.suffixes.length ? undefined : 'suffix')}
        ></slot>
      </igc-date-time-input>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-date-range-input': IgcDateRangeInputComponent;
  }
}

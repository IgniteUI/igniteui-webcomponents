import { LitElement, html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import IgcCalendarComponent from '../calendar/calendar.js';
import {
  addKeybindings,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { addRootClickHandler } from '../common/controllers/root-click.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcBaseComboBoxLikeComponent } from '../common/mixins/combo-box.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
import { createCounter } from '../common/util.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import IgcFocusTrapComponent from '../focus-trap/focus-trap.js';
import IgcPopoverComponent from '../popover/popover.js';

export interface IgcDatepickerEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
  igcChange: CustomEvent<Date>;
  igcInput: CustomEvent<Date>;
}

/**
 * @element igc-datepicker
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after the input.
 * @slot helper-text - Renders content below the input.
 * @slot title - Renders content in the calendar title.
 *
 * @fires igcOpening - Emitted just before the calendar dropdown is shown.
 * @fires igcOpened - Emitted after the calendar dropdown is shown.
 * @fires igcClosing - Emitted just before the calendar dropdown is hidden.
 * @fires igcClosed - Emitted after the calendar dropdown is hidden.
 * @fires igcChange - Emitted when the user modifies and commits the elements's value.
 * @fires igcInput - Emitted when when the user types in the element.
 */
export default class IgcDatepickerComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<
    IgcDatepickerEventMap,
    Constructor<IgcBaseComboBoxLikeComponent>
  >(IgcBaseComboBoxLikeComponent)
) {
  public static readonly tagName = 'igc-datepicker';

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private static readonly increment = createCounter();
  protected inputId = `datepicker-${IgcDatepickerComponent.increment()}`;

  private predefinedDisplayFormatsMap = new Map([
    ['short', 'shortDate'],
    ['medium', 'mediumDate'],
    ['long', 'longDate'],
    ['full', 'fullDate'],
  ]);

  public static register() {
    registerComponent(
      this,
      IgcCalendarComponent,
      IgcDateTimeInputComponent,
      IgcFocusTrapComponent,
      IgcPopoverComponent
    );
  }

  private _rootClickController = addRootClickHandler(this, {
    hideCallback: () => this._hide(true),
  });

  @query(IgcDateTimeInputComponent.tagName, true)
  private _input!: IgcDateTimeInputComponent;

  private _displayFormat!: string;

  /**
   * Whether the calendar dropdown should be kept open on clicking outside of it.
   * @attr keep-open-on-outside-click
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'keep-open-on-outside-click',
  })
  public override keepOpenOnOutsideClick = false;

  /**
   * Sets the state of the datepicker dropdown.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public override open = false;

  /**
   * The label of the datepicker.
   * @attr label
   */
  @property()
  public label!: string;

  /**
   * Makes the control a readonly field.
   * @attr readonly
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  public readOnly = false;

  @property({
    converter: {
      fromAttribute: (value: string) => (value ? new Date(value) : undefined),
      toAttribute: (value: Date) => value.toISOString(),
    },
  })
  public value!: Date;

  /**
   * Controls the visibility of the dates that do not belong to the current month.
   * @attr hide-outside-days
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-outside-days' })
  public hideOutsideDays = false;

  /**
   * The number of months displayed in the calendar.
   * @attr visible-months
   */
  @property({ type: Number, attribute: 'visible-months' })
  public visibleMonths = 1;

  /**
   * Whether to show the number of the week in the calendar.
   * @attr show-week-numbers
   */
  @property({ type: Boolean, reflect: true, attribute: 'show-week-numbers' })
  public showWeekNumbers = false;

  /**
   * Format to display the value in when not editing.
   * Defaults to the input format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format' })
  public get displayFormat(): string {
    return (
      this._displayFormat ?? this._input?.displayFormat ?? this.inputFormat
    );
  }

  public set displayFormat(value: string) {
    if (!value) {
      return;
    }
    this._displayFormat = value;
    if (this.predefinedDisplayFormatsMap.has(value)) {
      value = this.predefinedDisplayFormatsMap.get(value)!;
    }
    if (this._input) {
      this._input.displayFormat = value;
    }
  }

  /**
   * The date format to apply on the input.
   * Defaults to the current locale Intl.DateTimeFormat
   * @attr input-format
   */
  @property({ attribute: 'input-format' })
  public get inputFormat(): string {
    return this._input?.inputFormat;
  }

  public set inputFormat(value: string) {
    if (value && this._input) {
      this._input.inputFormat = value;
    }
  }

  /**
   * The locale settings used to display the value.
   * @attr
   */
  @property()
  public locale = 'en';

  @watch('open')
  protected openChange() {
    this._rootClickController.update();
  }

  constructor() {
    super();

    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true },
    }).set(escapeKey, this.onEscapeKey);
  }

  protected async onEscapeKey() {
    if (await this._hide(true)) {
      this._input.focus();
    }
  }

  private async _shouldCloseCalendarDropdown() {
    if (!this.keepOpenOnSelect && (await this._hide(true))) {
      this._input.focus();
      this._input.select();
    }
  }

  protected handleInputChangeEvent(event: CustomEvent<Date>) {
    event.stopPropagation();
    this.value = (event.target as IgcDateTimeInputComponent).value!;
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected handleCalendarChangeEvent(event: CustomEvent<Date>) {
    event.stopPropagation();

    this.value = (event.target as IgcCalendarComponent).value!;
    this.emitEvent('igcChange', { detail: this.value });

    this._shouldCloseCalendarDropdown();
  }

  protected handleInputEvent(event: CustomEvent<Date>) {
    event.stopPropagation();

    this.value = (event.target as IgcDateTimeInputComponent).value!;
    this.emitEvent('igcInput', { detail: this.value });
  }

  protected override render() {
    const id = this.id || this.inputId;
    const calendarDisabled = !this.open || this.disabled;

    return html`
      <igc-date-time-input
        id=${id}
        aria-haspopup="true"
        ?disabled=${this.disabled}
        ?readonly=${this.readOnly}
        ?required=${this.required}
        label=${ifDefined(this.label)}
        aria-expanded=${this.open ? 'true' : 'false'}
        .value=${this.value}
        .locale=${this.locale}
        @igcChange=${this.handleInputChangeEvent}
        @igcInput=${this.handleInputEvent}
      >
        <slot name="prefix" slot="prefix"></slot>
        <span slot="suffix" @click=${this.handleAnchorClick}>📅</span>
        <slot name="suffix" slot="suffix"></slot>
        <slot name="helper-text" slot="helper-text"></slot>
      </igc-date-time-input>

      <igc-popover
        ?open=${this.open}
        anchor=${id}
        strategy="fixed"
        flip
        shift
        same-width
      >
        <igc-focus-trap ?disabled=${calendarDisabled}>
          <igc-calendar
            aria-labelledby=${id}
            .inert=${calendarDisabled}
            hide-header
            ?show-week-numbers=${this.showWeekNumbers}
            ?hide-outside-days=${this.hideOutsideDays}
            .visibleMonths=${this.visibleMonths}
            .value=${this.value}
            .locale=${this.locale}
            .activeDate=${this.value ?? nothing}
            @igcChange=${this.handleCalendarChangeEvent}
          >
            <slot name="title" slot="title"></slot>
          </igc-calendar>
        </igc-focus-trap>
      </igc-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-datepicker': IgcDatepickerComponent;
  }
}

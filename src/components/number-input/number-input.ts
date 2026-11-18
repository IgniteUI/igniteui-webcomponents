import { getCurrentI18n } from 'igniteui-i18n-core';
import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { eventOptions, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import {
  addAriaTarget,
  ariaBindings,
  helperText,
} from '#internals/controllers/aria-projection.js';
import {
  addKeybindings,
  arrowDown,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
  isComposingKey,
  isKey,
  pageDownKey,
  pageUpKey,
  shiftKey,
} from '#internals/controllers/key-bindings.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import {
  coercedProperty,
  type CoercedPropertyConfig,
} from '#internals/decorators/coerced-property.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { cancelDeferredFocus, deferFocus } from '#internals/deferred-focus.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import type { FormValueTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { partMap } from '#internals/part-map.js';
import {
  isPointerPressed,
  trackPointerPress,
} from '#internals/pointer-press.js';
import {
  nextInputId,
  renderInputShell,
  resolveInputPartFlags,
} from '#internals/templates/input-shell.js';
import { renderSlottedIcon } from '#internals/templates/slotted-icon.js';
import { createTimer } from '#internals/timing.js';
import { hasNegativeTabIndex } from '#internals/utils/dom.js';
import { preventDefault } from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import { addSteps } from '#internals/utils/math.js';
import { equal } from '#internals/utils/objects.js';
import { all } from '#themes/input/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconComponent from '../icon/icon.js';
import { styles } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { NumberInputResourceStringsEN } from './i18n.js';
import {
  formatFormValue,
  getNumberInputFormat,
  type NumberInputFormat,
  type NumberInputFormatOptions,
} from './number-format.js';
import { styles as numberInputStyles } from './themes/number-input.base.css.js';
import { numberInputValidators } from './validators.js';

export interface IgcNumberInputComponentEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<number | null>;
  /* blazorSuppress */
  igcChange: CustomEvent<number | null>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

/** The delay before a held spin button repeats, and the interval of the repeats, in milliseconds. */
const SPIN_HOLD_DELAY = 400;
const SPIN_REPEAT_INTERVAL = 60;

const Slots = setSlots(
  'prefix',
  'suffix',
  'helper-text',
  'increment-icon',
  'decrement-icon',
  'value-missing',
  'range-overflow',
  'range-underflow',
  'custom-error',
  'invalid'
);

/** Reads a number, or a numeric string as `Number()` does. Anything else is `null`. */
function toNumberValue(value: unknown): number | null {
  const number =
    typeof value === 'string' && value.trim() ? Number(value) : value;

  return typeof number === 'number' && Number.isFinite(number)
    ? number || 0
    : null;
}

function spinDirection(button: Element): 1 | -1 {
  return button.part.contains('increment') ? 1 : -1;
}

const formValueTransformers: Partial<FormValueTransformers<number | null>> = {
  setValue: toNumberValue,
  setDefaultValue: toNumberValue,
  setFormValue: (value) => (value === null ? null : formatFormValue(value)),
};

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
/**
 * A single-line field for a number. It shows the value formatted for the
 * locale, reads what the user types in the locale, and steps the value with
 * the arrow keys, the spin buttons and the mouse wheel. It supports prefix and
 * suffix content, helper text, form integration and built-in validation.
 *
 * @element igc-number-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after the input.
 * @slot helper-text - Renders content below the input.
 * @slot increment-icon - Renders the icon of the increment button.
 * @slot decrement-icon - Renders the icon of the decrement button.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot range-overflow - Renders content when the max validation fails.
 * @slot range-underflow - Renders content when the min validation fails.
 * @slot custom-error - Renders content when a custom message is set with `setCustomValidity()`.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcInput - Emitted when the user changes the value.
 * @fires igcChange - Emitted when the user commits a changed value, on Enter or when the control loses focus.
 *
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart label - The native label element.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 * @csspart prefixed - Added to the container and the input when an element that is not hidden is in the prefix slot.
 * @csspart suffixed - Added to the container and the input when an element that is not hidden is in the suffix slot, or while the spin buttons show.
 * @csspart filled - Added to the container and the input when the control has text.
 * @csspart spin-buttons - The wrapper of the spin buttons, at the end of the suffix wrapper.
 * @csspart increment - The button that increments the value.
 * @csspart decrement - The button that decrements the value.
 * @csspart labelled - Added to the container in the material theme when the control has a label.
 * @csspart start - The wrapper of the prefix in the material theme.
 * @csspart notch - The wrapper of the label in the material theme.
 * @csspart filler - The outline segment between the notch and the end in the material theme.
 * @csspart end - The wrapper of the suffix in the material theme.
 *
 * @cssstate ig-invalid - Set while the control shows its invalid state, that is while `invalid` returns `true`.
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcNumberInputComponent extends I18nMixin(
  FormAssociatedRequiredMixin(
    EventEmitterMixin<IgcNumberInputComponentEventMap>(LitElement)
  ),
  { defaultEN: NumberInputResourceStringsEN }
) {
  public static readonly tagName = 'igc-number-input';
  public static override styles = [
    componentBase,
    styles,
    shared,
    numberInputStyles,
  ];

  /**
   * The bounds: a numeric string, as an attribute or a framework gives it,
   * reads as a number, anything else that is not a finite number sets no
   * bound, and a change revalidates.
   */
  private static readonly _bound: CoercedPropertyConfig<
    unknown,
    IgcNumberInputComponent
  > = {
    transform: ({ value }) => toNumberValue(value) ?? undefined,
    onChange: ({ host }) => host._validate(),
  };

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcNumberInputComponent,
      IgcIconComponent,
      IgcValidationContainerComponent
    );
  }

  //#region Internal state

  private readonly _themes = addThemingController(this, all);
  private readonly _slots = addSlotController(this, { slots: Slots });
  private readonly _inputId = nextInputId();

  private readonly _spinTimer = createTimer(() => this._repeatSpin());

  private _spinPress?: {
    button: HTMLButtonElement;
    touch: boolean;
    repeated: boolean;
  };

  /** Names and describes the native input, and applies the host ARIA. */
  private readonly _ariaTarget = addAriaTarget(this, () =>
    helperText(this, this._slots)
  );

  protected override readonly _formValue = createFormValueState<number | null>(
    this,
    { initialValue: null, transformers: formValueTransformers }
  );

  /** Part flags of the current render, shared by the container and the input. */
  private _partFlags: Record<string, boolean> = {};

  /** The `igcChange` baseline: the value at the last commit or write from code. */
  private _committedValue: number | null = null;

  /** The text before an IME composition, restored when the result is not a number. */
  private _compositionText = '';

  /**
   * Set from a focus that did not select all the text, until the next `select`
   * event, key or input. In Chromium, `select()` on an input without focus
   * moves the focus before it selects, so the text swap of the focus collapses
   * the selection to the end. Its `select` event then finds the caret there.
   */
  private _selectMayBeLost = false;

  /** Whether the user edits the value: the input has focus and is not read-only. */
  @state()
  private _editing = false;

  @state()
  private _editText = '';

  @query('input')
  private readonly _input?: HTMLInputElement;

  protected override get __validators() {
    return numberInputValidators;
  }

  protected override get _blocksImplicitSubmission(): boolean {
    return true;
  }

  private _formatMemo?: {
    locale: string;
    options?: NumberInputFormatOptions;
    global: string;
    format: NumberInputFormat;
  };

  private get _format(): NumberInputFormat {
    const { locale, valueFormatOptions: options } = this;
    const global = getCurrentI18n();
    const memo = this._formatMemo;

    if (
      memo?.locale === locale &&
      memo.options === options &&
      memo.global === global
    ) {
      return memo.format;
    }

    const format = getNumberInputFormat(locale, options);
    this._formatMemo = { locale, options, global, format };
    return format;
  }

  private get _stepSize(): number {
    const step = this.step;

    if (step !== undefined && step > 0) {
      return step;
    }

    return this.valueFormatOptions?.style === 'percent' ? 0.01 : 1;
  }

  private get _allowsNegative(): boolean {
    const min = this.min;
    return this.validateOnly || min === undefined || min < 0;
  }

  /** Whether the edit has changed the value or the text since the last commit. */
  private get _hasPendingEdit(): boolean {
    return (
      this._editing &&
      (this.value !== this._committedValue ||
        this._editText !== this._format.formatEdit(this._committedValue))
    );
  }

  //#endregion

  //#region Public properties

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the control, or `null` when it is empty. A numeric string
   * reads as `Number()` reads it. `NaN` and infinite values are `null`.
   * @attr
   */
  @property({ converter: { fromAttribute: toNumberValue } })
  public set value(value: number | null) {
    const previous = this.value;
    this._setValue(value);

    // A value from code, a form reset included, is not an edit. A write of the
    // current value changes nothing, as a framework repeats it on each render.
    if (this.value !== previous) {
      this._committedValue = this.value;
    }
  }

  public get value(): number | null {
    return this._formValue.value;
  }

  /**
   * The minimum value of the control. A numeric string reads as a number, and
   * a value that is not a finite number sets no minimum.
   * @attr
   */
  @property({ converter: { fromAttribute: toNumberValue } })
  @coercedProperty(IgcNumberInputComponent._bound)
  public min?: number = undefined;

  /**
   * The maximum value of the control. A numeric string reads as a number, and
   * a value that is not a finite number sets no maximum.
   * @attr
   */
  @property({ converter: { fromAttribute: toNumberValue } })
  @coercedProperty(IgcNumberInputComponent._bound)
  public max?: number = undefined;

  /**
   * The amount by which a step changes the value. A step does not snap to a
   * grid of steps. Default is `1`, or `0.01` for the `percent` style, also for
   * a value that is not a positive number. A numeric string reads as a number.
   * @attr
   */
  @property({ converter: { fromAttribute: toNumberValue } })
  @coercedProperty<unknown, IgcNumberInputComponent>({
    transform: ({ value }) => toNumberValue(value) ?? undefined,
  })
  public step?: number;

  /**
   * The format of the value: the options of `Intl.NumberFormat` that the
   * control can read back, such as a currency, a percent or the number of
   * fraction digits. A committed value rounds to the shown fraction digits.
   */
  @property({
    attribute: false,
    hasChanged: (value: unknown, old: unknown) => !equal(value, old),
  })
  public valueFormatOptions?: NumberInputFormatOptions;

  /**
   * Whether the spin buttons are hidden. The keys and the mouse wheel still
   * step the value.
   *
   * @attr hide-spin-buttons
   * @default false
   */
  @property({ type: Boolean, attribute: 'hide-spin-buttons' })
  public hideSpinButtons = false;

  /**
   * Whether a value out of range only fails validation. The user can type it,
   * and the commit does not clamp it. A step still stops at `min` and `max`.
   *
   * @attr validate-only
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'validate-only' })
  public validateOnly = false;

  /**
   * Whether the control has an outlined appearance.
   *
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * Whether the control is read-only.
   *
   * @attr readonly
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  @coercedProperty<boolean, IgcNumberInputComponent>({
    onChange: ({ host }) => host._syncEdit(),
  })
  public readOnly = false;

  /**
   * The placeholder text of the control.
   * @attr
   */
  @property()
  public placeholder?: string;

  /**
   * The label for the control.
   * @attr
   */
  @property()
  public label?: string;

  /**
   * Whether the control receives focus automatically.
   * @attr
   * @default false
   */
  @property({ type: Boolean })
  public override autofocus = false;

  /**
   * A hint for the browser on how to autofill the control.
   * @attr
   */
  @property()
  public autocomplete?: string;

  /**
   * A hint to the browser for which virtual keyboard layout to display. Default
   * is `numeric` for a format without fraction digits and without negative
   * values, else `decimal`.
   * @attr inputmode
   */
  @property({ attribute: 'inputmode' })
  public override inputMode = '';

  //#endregion

  constructor() {
    super();
    trackPointerPress();

    const step = (count: number) => () => this._stepByUser(count);

    // Keys from the prefix and suffix content belong to that content.
    addKeybindings(this, {
      skip: (_, event) =>
        this.readOnly || event.composedPath()[0] !== this._input,
      bindingDefaults: { repeat: true },
    })
      .set(arrowUp, step(1))
      .set(arrowDown, step(-1))
      .set([shiftKey, arrowUp], step(10))
      .set([shiftKey, arrowDown], step(-10))
      .set(pageUpKey, step(10))
      .set(pageDownKey, step(-10))
      .set(homeKey, () => this._setValueByUser(this._fit(this.min!)), {
        when: () => this.min !== undefined,
      })
      .set(endKey, () => this._setValueByUser(this._fit(this.max!)), {
        when: () => this.max !== undefined,
      })
      .set(escapeKey, this._revert, {
        repeat: false,
        when: () => this._hasPendingEdit,
      });
  }

  //#region Lit lifecycle

  protected override willUpdate(props: PropertyValues<this>): void {
    if (
      this._editing &&
      (props.has('locale') || props.has('valueFormatOptions'))
    ) {
      this._editText = this._format.formatEdit(this.value);
    }
  }

  protected override _restoreDefaultValue(): void {
    super._restoreDefaultValue();

    // A reset replaces the edit text also when the value does not change.
    if (this._editing) {
      this._editText = this._format.formatEdit(this.value);
    }
  }

  /** @internal */
  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopSpin();
    // Firefox and WebKit send no blur when a focused element is removed.
    this._endEdit();
  }

  //#endregion

  //#region Event handlers

  private _handleFocus(): void {
    const input = this._input!;

    if (this.readOnly) {
      return;
    }

    const selectsAll =
      !!input.value &&
      input.selectionStart === 0 &&
      input.selectionEnd === input.value.length;

    this._beginEdit();

    // Swap the text now, so that a selection of all the text stays.
    input.value = this._editText;
    if (selectsAll) {
      input.select();
    }

    this._selectMayBeLost = !selectsAll;
  }

  private _handleSelect(): void {
    const input = this._input!;
    const end = input.value.length;
    const lost =
      this._selectMayBeLost &&
      input.selectionStart === end &&
      input.selectionEnd === end;

    this._selectMayBeLost = false;

    if (lost) {
      input.select();
    }
  }

  protected override _handleBlur(): void {
    this._stopSpin();
    this._endEdit();
    super._handleBlur();
  }

  private _handleBeforeInput(event: InputEvent): void {
    const { inputType, data, dataTransfer } = event;
    const input = this._input!;

    this._selectMayBeLost = false;

    // Deletions are left alone, and a composition is checked when it ends.
    if (
      !inputType.startsWith('insert') ||
      inputType === 'insertCompositionText' ||
      event.isComposing
    ) {
      return;
    }

    const text = data ?? dataTransfer?.getData('text/plain') ?? '';
    // A drop lands at the pointer, not at the selection, so it replaces the text.
    const drop = inputType === 'insertFromDrop';
    const next = drop ? text : this._replaceSelection(text);

    if (!drop && this._isValidEdit(next, input.value)) {
      return;
    }

    event.preventDefault();

    // A pasted or dropped number in the display format replaces the text.
    if (inputType !== 'insertText') {
      const value = this._format.parse(next);

      if (
        value !== null &&
        !Number.isNaN(value) &&
        (value >= 0 || this._allowsNegative)
      ) {
        input.value = this._format.formatEdit(value);
        this._applyText(input.value);

        if (!this._editing) {
          this._commit();
        }
      }
    }
  }

  private _handleInput(event: InputEvent): void {
    if (event.isComposing) {
      return;
    }

    this._applyText(this._input!.value);

    // An autofill can change a control without focus, and no blur follows.
    if (!this._editing) {
      this._commit();
    }
  }

  private _handleCompositionStart(): void {
    this._compositionText = this._input!.value;
  }

  private _handleCompositionEnd(): void {
    const input = this._input!;

    if (!this._isValidEdit(input.value, this._compositionText)) {
      input.value = this._compositionText;
    }

    this._applyText(input.value);
  }

  private _handleKeydown(event: KeyboardEvent): void {
    this._selectMayBeLost = false;

    // The decimal key of the keypad gives the separator of the keyboard layout.
    if (
      event.code === 'NumpadDecimal' &&
      event.key.length === 1 &&
      !this.readOnly &&
      !isComposingKey(event)
    ) {
      const separator = this._format.decimalSeparator;

      if (event.key !== separator) {
        event.preventDefault();
        this._insertText(separator);
      }
    }

    if (
      isKey(event, enterKey) &&
      this._hasPendingEdit &&
      !isComposingKey(event)
    ) {
      this._commit();
    }

    this._handleEnterKey(event);
  }

  /** Bound only during an edit, so that a page scroll does not wait for it. */
  @eventOptions({ passive: false })
  private _handleWheel(event: WheelEvent): void {
    if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();
    this._stepByUser(event.deltaY > 0 ? -1 : 1);
  }

  private _handleSpinPointerDown(event: PointerEvent): void {
    const button = event.currentTarget as HTMLButtonElement;

    // No press moves the focus to the button, also one that does not step.
    event.preventDefault();

    if (!event.isPrimary || event.button !== 0 || button.disabled) {
      return;
    }

    // A synthetic event, as from a test tool, has no active pointer to capture.
    if (event.isTrusted) {
      button.setPointerCapture(event.pointerId);
    }

    const touch = event.pointerType === 'touch';
    this._spinPress = { button, touch, repeated: false };

    // A touch steps on release, so that a scroll that starts on the button does
    // not step. It does not focus the input, so that no virtual keyboard opens.
    if (!touch) {
      if (!this._editing) {
        this._input!.focus();
      }
      this._spin(spinDirection(button));
    }

    this._spinTimer.start(SPIN_HOLD_DELAY);
  }

  private _handleSpinPointerUp(): void {
    const press = this._spinPress;

    if (press?.touch && !press.repeated) {
      this._spin(spinDirection(press.button));
    }

    this._stopSpin();
  }

  /**
   * The `click` of a pointer press does not step again. A click without a
   * press, as from assistive technology, steps one time.
   */
  private _handleSpinClick(event: MouseEvent): void {
    if (!isPointerPressed()) {
      this._spin(spinDirection(event.currentTarget as Element));
    }
  }

  //#endregion

  //#region Internal API

  /**
   * Steps from a spin button. Without focus, a click commits at once, and a
   * press, as a touch, commits at its end.
   */
  private _spin(direction: 1 | -1): boolean {
    const changed = this._stepByUser(direction);

    if (changed && !this._editing && !this._spinPress) {
      this._commit();
    }

    return changed;
  }

  private _repeatSpin(): void {
    const press = this._spinPress!;

    // A render that removes the buttons ends no press on them.
    if (!press.button.isConnected) {
      this._stopSpin();
      return;
    }

    press.repeated = true;
    if (this._spin(spinDirection(press.button))) {
      this._spinTimer.start(SPIN_REPEAT_INTERVAL);
    }
  }

  private _stopSpin(): void {
    const press = this._spinPress;

    this._spinTimer.stop();
    this._spinPress = undefined;

    if (press && !this._editing && this.value !== this._committedValue) {
      this._commit();
    }
  }

  /** Starts an edit: the edit text replaces the display text. */
  private _beginEdit(): void {
    this._editing = true;
    this._editText = this._format.formatEdit(this.value);
  }

  /** Commits and ends the edit, if any. */
  private _endEdit(): void {
    this._selectMayBeLost = false;

    if (this._editing) {
      const pending = this._hasPendingEdit;
      // First, so that the commit builds no edit text.
      this._editing = false;

      // Without an edit, a value from code stays, also out of range.
      if (pending) {
        this._commit();
      }
    }
  }

  /** Starts or ends the edit when `readOnly` changes while the input has focus. */
  private _syncEdit(): void {
    if (!this._input || this.shadowRoot?.activeElement !== this._input) {
      return;
    }

    if (this.readOnly) {
      this._endEdit();
    } else if (!this._editing) {
      this._beginEdit();
    }
  }

  /**
   * Whether `text`, a change of `before`, can still become a number. A minus
   * sign counts when `min` allows negative values, or when `before` has one
   * already, as a value from code can.
   */
  private _isValidEdit(text: string, before: string): boolean {
    const format = this._format;

    return (
      format.isValidPartial(text, this._allowsNegative) ||
      (!this._allowsNegative &&
        !format.isValidPartial(before, false) &&
        format.isValidPartial(text, true))
    );
  }

  /** Sets the value. During an edit, a new value also sets the edit text. */
  private _setValue(value: number | null, editText?: string): void {
    const previous = this.value;
    this._formValue.setValueAndFormState(value);

    if (this._editing && this.value !== previous) {
      this._editText = editText ?? this._format.formatEdit(this.value);
    }

    // As the `value` accessor does.
    this.requestUpdate('value', previous);
  }

  /** Returns the text of the input with `text` in place of its selection. */
  private _replaceSelection(text: string): string {
    // A text input always has a selection.
    const { value, selectionStart, selectionEnd } = this._input!;
    return value.slice(0, selectionStart!) + text + value.slice(selectionEnd!);
  }

  /** Inserts `text` at the selection when the result can still be a number. */
  private _insertText(text: string): void {
    const input = this._input!;

    if (this._isValidEdit(this._replaceSelection(text), input.value)) {
      input.setRangeText(
        text,
        input.selectionStart!,
        input.selectionEnd!,
        'end'
      );
      this._applyText(input.value);
    }
  }

  /** Takes the text of the input. A number in it becomes the value. */
  private _applyText(text: string): void {
    const value = this._format.parse(text);

    this._setTouchedState();

    if (Number.isNaN(value) || !this._setValueByUser(value, text)) {
      this._editText = text;
    }
  }

  /**
   * Rounds the value to the shown digits, keeps it in range unless
   * `validateOnly`, shows it, and emits `igcChange` when it changed.
   */
  private _commit(): void {
    const format = this._format;
    const current = this.value;
    const value =
      current === null
        ? null
        : this.validateOnly
          ? format.round(current)
          : this._fit(current);

    // An unchanged value is not written, so a focus and blur keep the control pristine.
    if (value !== current) {
      this._setValue(value);
    } else if (this._editing) {
      this._editText = format.formatEdit(value);
    }

    if (value !== this._committedValue) {
      this._committedValue = value;
      this._emitTouchedEvent('igcChange', { detail: value });
    }
  }

  /**
   * The value `count` steps away, within `min` and `max`. The same value while
   * the control is read-only or disabled.
   */
  private _steppedValue(count: number): number | null {
    const value = this.value;

    if (!count || this.readOnly || this.disabled) {
      return value;
    }

    // A step finer than the last shown digit steps by that digit, so that it shows.
    const size = Math.max(this._stepSize, this._format.smallestStep);
    const next = this._fit(value === null ? 0 : addSteps(value, size, count));

    // No step moves against its direction, as from a value out of range.
    return value !== null && (count > 0 ? next < value : next > value)
      ? value
      : next;
  }

  /** Clamps `value` to `min` and `max`, and rounds it to a shown value. */
  private _fit(value: number): number {
    return this._format.fit(value, this.min, this.max);
  }

  private _emitInput(): void {
    this._emitTouchedEvent('igcInput', { detail: this.value });
  }

  /** Sets a value from the user and emits `igcInput`. Returns whether the value changed. */
  private _setValueByUser(value: number | null, editText?: string): boolean {
    if (value === this.value) {
      return false;
    }

    this._setValue(value, editText);
    this._emitInput();
    return true;
  }

  private _stepByUser(count: number): boolean {
    return this._setValueByUser(this._steppedValue(count));
  }

  /** A step from code goes through the setter, as it is not an edit. */
  private _stepFromCode(count: number): void {
    const next = this._steppedValue(count);

    if (next !== this.value) {
      this.value = next;
    }
  }

  /** Reverts the edit to the last committed value. */
  private _revert(): void {
    if (!this._setValueByUser(this._committedValue)) {
      this._editText = this._format.formatEdit(this._committedValue);
    }
  }

  private _resolvePartNames(base: string): Record<string, boolean> {
    return { [base]: true, ...this._partFlags };
  }

  //#endregion

  //#region Public API

  /** Increments the value by `n` steps. A step stops at `max`. */
  public stepUp(n = 1): void {
    // As the native method, which reads `n` as an integer.
    this._stepFromCode(Math.trunc(n) || 0);
  }

  /** Decrements the value by `n` steps. A step stops at `min`. */
  public stepDown(n = 1): void {
    this._stepFromCode(-Math.trunc(n) || 0);
  }

  /** Focuses the control and selects all the text inside the input. */
  public select(): void {
    // The focus first swaps the display text for the edit text, which would
    // collapse a selection made before it.
    this._input?.focus();
    this._input?.select();
  }

  /* alternateName: focusComponent */
  /** Sets focus on the control. */
  public override focus(options?: FocusOptions): void {
    this._input?.focus(options);
    deferFocus(this, options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the control. */
  public override blur(): void {
    cancelDeferredFocus(this);
    this._input?.blur();
  }

  //#endregion

  //#region Render

  private _renderInput(
    format: NumberInputFormat,
    text: string
  ): TemplateResult {
    const value = this.value;
    const valueText =
      value === null || !this._editing ? text : format.formatDisplay(value);
    const integer = format.maximumFractionDigits === 0 && !this._allowsNegative;

    return html`
      <input
        ${ariaBindings({
          ...this._ariaTarget.resolveBindings(),
          role: 'spinbutton',
          required: this.required ? 'true' : undefined,
        })}
        id=${this._inputId}
        type="text"
        part=${partMap(this._resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        placeholder=${ifDefined(this.placeholder)}
        .value=${live(text)}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        ?autofocus=${this.autofocus}
        .autocomplete=${(this.autocomplete ?? '') as AutoFill}
        inputmode=${this.inputMode || (integer ? 'numeric' : 'decimal')}
        tabindex=${bindIf(hasNegativeTabIndex(this), -1)}
        aria-valuenow=${ifDefined(value ?? undefined)}
        aria-valuemin=${ifDefined(this.min)}
        aria-valuemax=${ifDefined(this.max)}
        aria-valuetext=${ifDefined(value === null ? undefined : valueText)}
        aria-invalid=${bindIf(this.invalid, 'true')}
        @beforeinput=${this._handleBeforeInput}
        @input=${this._handleInput}
        @compositionstart=${this._handleCompositionStart}
        @compositionend=${this._handleCompositionEnd}
        @keydown=${this._handleKeydown}
        @select=${this._handleSelect}
        @keypress=${this._handleEnterKey}
        @wheel=${this._editing ? this._handleWheel : nothing}
        @focus=${this._handleFocus}
        @blur=${this._handleBlur}
      />
    `;
  }

  private _renderSpinButton(
    part: 'increment' | 'decrement',
    disabled: boolean
  ): TemplateResult {
    const strings = this.resourceStrings;

    return html`
      <button
        type="button"
        part=${part}
        tabindex="-1"
        aria-label=${
          part === 'increment'
            ? strings.number_input_increment
            : strings.number_input_decrement
        }
        aria-controls=${this._inputId}
        ?disabled=${disabled}
        @pointerdown=${this._handleSpinPointerDown}
        @pointerup=${this._handleSpinPointerUp}
        @pointercancel=${this._stopSpin}
        @lostpointercapture=${this._stopSpin}
        @click=${this._handleSpinClick}
        @contextmenu=${preventDefault}
      >
        ${renderSlottedIcon({ slot: `${part}-icon`, icon: `input_${part}` })}
      </button>
    `;
  }

  private _renderSpinButtons(): TemplateResult | typeof nothing {
    if (this.hideSpinButtons) {
      return nothing;
    }

    const value = this.value;

    // A button that cannot step, at a bound or while locked, is disabled.
    return html`
      <span part="spin-buttons">
        ${this._renderSpinButton('increment', this._steppedValue(1) === value)}
        ${this._renderSpinButton('decrement', this._steppedValue(-1) === value)}
      </span>
    `;
  }

  protected override render(): ReturnType<typeof renderInputShell> {
    const format = this._format;
    const text = this._editing
      ? this._editText
      : format.formatDisplay(this.value);

    this._partFlags = resolveInputPartFlags(this._slots, !!text);
    // The themes show the suffix wrapper, which holds the spin buttons, only when suffixed.
    this._partFlags.suffixed ||= !this.hideSpinButtons;

    return renderInputShell(this, {
      theme: this._themes.theme,
      label: this.label,
      labelId: this._inputId,
      containerParts: this._resolvePartNames('container'),
      renderInput: () => this._renderInput(format, text),
      renderSuffixParts: this._renderSpinButtons,
      helperText: IgcValidationContainerComponent.create(this),
    });
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-number-input': IgcNumberInputComponent;
  }
}

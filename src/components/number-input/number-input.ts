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
import { createRef, ref } from 'lit/directives/ref.js';
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
import { coercedProperty } from '#internals/decorators/coerced-property.js';
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
  nextInputId,
  renderInputShell,
  resolveInputPartFlags,
} from '#internals/templates/input-shell.js';
import { renderSlottedIcon } from '#internals/templates/slotted-icon.js';
import { hasNegativeTabIndex } from '#internals/utils/dom.js';
import { bindIf } from '#internals/utils/lit.js';
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
  getHostFormat,
  type NumberInputFormat,
  type NumberInputFormatOptions,
} from './number-format.js';
import { addSpinPress, type SpinDirection } from './spin-press.js';
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

/** The steps of Page Up, Page Down and Shift with an arrow key. */
const PAGE_STEPS = 10;

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

/** A bound or a step: `undefined` for no value. */
function toBound({ value }: { value: unknown }): number | undefined {
  return toNumberValue(value) ?? undefined;
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

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcNumberInputComponent,
      IgcIconComponent,
      IgcValidationContainerComponent
    );
  }

  //#region Internal state and properties

  private readonly _themes = addThemingController(this, all);
  private readonly _slots = addSlotController(this, { slots: Slots });
  private readonly _inputId = nextInputId();

  private readonly _spinPress = addSpinPress(this, {
    step: (direction) => this._spin(direction),
    start: () => {
      if (!this._editing) {
        this._input!.focus();
      }
    },
    end: () => {
      // A press without focus commits its steps once, at its end.
      if (!this._editing && this.value !== this._reportedValue) {
        this._commit();
      }
    },
  });

  private readonly _ariaTarget = addAriaTarget(this, () =>
    helperText(this, this._slots)
  );

  protected override readonly _formValue = createFormValueState<number | null>(
    this,
    { initialValue: null, transformers: formValueTransformers }
  );

  /** Restored when a composition gives no number. */
  private _compositionText = '';

  /**
   * Chromium `select()` on an input without focus focuses first, so the text
   * swap of the focus collapses the selection. Its `select` event repairs it.
   */
  private _selectMayBeLost = false;

  /** Whether the user edits the value: the input has focus and is not read-only. */
  @state()
  private _editing = false;

  @state()
  private _editText = '';

  /** For the key bindings only: a `ref()` is empty while disconnected. */
  private readonly _inputRef = createRef<HTMLInputElement>();

  @query('input')
  private readonly _input?: HTMLInputElement;

  protected override get __validators() {
    return numberInputValidators;
  }

  protected override get _blocksImplicitSubmission(): boolean {
    return true;
  }

  protected override get _reportedValue(): number | null {
    return super._reportedValue as number | null;
  }

  private get _format(): NumberInputFormat {
    return getHostFormat(this);
  }

  private get _allowsNegative(): boolean {
    const min = this.min;
    return this.validateOnly || min === undefined || min < 0;
  }

  /** Whether the edit has changed the value or the text since the last report. */
  private get _hasPendingEdit(): boolean {
    const reported = this._reportedValue;

    return (
      this._editing &&
      (this.value !== reported ||
        this._editText !== this._format.formatEdit(reported))
    );
  }

  //#endregion

  //#region Public attributes and properties

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the control, or `null` when it is empty. A numeric string
   * reads as `Number()` reads it. `NaN` and infinite values are `null`.
   * @attr
   */
  @property({ converter: { fromAttribute: toNumberValue } })
  public set value(value: number | null) {
    // A write of the current value changes nothing, as a framework repeats it
    // on each render. It keeps the field pristine and a pending `igcChange`.
    if (toNumberValue(value) !== this.value) {
      this._formValue.setValueAndFormState(value);
      this._resetEditText();
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
  @coercedProperty<unknown, IgcNumberInputComponent>({
    transform: toBound,
    onChange: ({ host }) => host._validate(),
  })
  public min?: number = undefined;

  /**
   * The maximum value of the control. A numeric string reads as a number, and
   * a value that is not a finite number sets no maximum.
   * @attr
   */
  @property({ converter: { fromAttribute: toNumberValue } })
  @coercedProperty<unknown, IgcNumberInputComponent>({
    transform: toBound,
    onChange: ({ host }) => host._validate(),
  })
  public max?: number = undefined;

  /**
   * The amount by which a step changes the value. A step does not snap to a
   * grid of steps. Default is `1`, or `0.01` for the `percent` style, also for
   * a value that is not a positive number. A numeric string reads as a number.
   * @attr
   */
  @property({ converter: { fromAttribute: toNumberValue } })
  @coercedProperty<unknown, IgcNumberInputComponent>({ transform: toBound })
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
  @property({ type: Boolean, attribute: 'validate-only' })
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

  /* blazorCSSuppress */
  /**
   * The default value of the control. A form reset restores the value to it.
   * While the value is unchanged since the start or the last form reset, a
   * new default also sets the value. The `value` attribute also sets it.
   */
  public override set defaultValue(value: number | null) {
    super.defaultValue = value;
  }

  public override get defaultValue(): number | null {
    return super.defaultValue as number | null;
  }

  //#endregion

  constructor() {
    super();

    const step = (count: number) => () => this._stepByUser(count);

    // Keys from the prefix and suffix content belong to that content.
    addKeybindings(this, {
      ref: this._inputRef,
      skip: () => this.readOnly,
      bindingDefaults: { repeat: true },
    })
      .set(arrowUp, step(1))
      .set(arrowDown, step(-1))
      .set([shiftKey, arrowUp], step(PAGE_STEPS))
      .set([shiftKey, arrowDown], step(-PAGE_STEPS))
      .set(pageUpKey, step(PAGE_STEPS))
      .set(pageDownKey, step(-PAGE_STEPS))
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

  //#region Lit lifecycle methods

  protected override willUpdate(props: PropertyValues<this>): void {
    if (props.has('locale') || props.has('valueFormatOptions')) {
      this._resetEditText();
    }
  }

  /** @internal */
  public override disconnectedCallback(): void {
    // Ends a held spin press first, through its controller.
    super.disconnectedCallback();
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
    this._spinPress.stop();
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

    if (inputType === 'insertText') {
      return;
    }

    // A pasted or dropped number in the display format replaces the text.
    const value = this._format.parse(text);

    if (
      value === null ||
      Number.isNaN(value) ||
      (value < 0 && !this._allowsNegative)
    ) {
      return;
    }

    input.value = this._format.formatEdit(value);
    this._applyText(input.value);

    if (!this._editing) {
      this._commit();
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

  //#endregion

  //#region Form integration

  protected override _restoreDefaultValue(): void {
    super._restoreDefaultValue();
    // Also when the value does not change, as for a partial text.
    this._resetEditText();
  }

  //#endregion

  //#region Internal API

  /**
   * Steps from a spin button. Without focus, a click commits at once, and a
   * press, as a touch, commits at its end.
   */
  private _spin(direction: SpinDirection): boolean {
    const changed = this._stepByUser(direction);

    if (changed && !this._editing && !this._spinPress.pressed) {
      this._commit();
    }

    return changed;
  }

  private _beginEdit(): void {
    this._editing = true;
    this._resetEditText();
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

  /** During an edit, shows the value in the edit text. */
  private _resetEditText(): void {
    if (this._editing) {
      this._editText = this._format.formatEdit(this.value);
    }
  }

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

  /** A number in `text` becomes the value. */
  private _applyText(text: string): void {
    const value = this._format.parse(text);

    this._setTouchedState();

    if (Number.isNaN(value) || !this._setValueByUser(value, text)) {
      this._editText = text;
    }
  }

  /**
   * Rounds the value to the shown digits, keeps it in range unless
   * `validateOnly`, shows it, and emits `igcChange` when it differs from the
   * reported value.
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
      this._writeUserValue(value);
    }

    this._resetEditText();
    this._reportChange(value);
  }

  /**
   * The value `count` steps away, within `min` and `max`. The same value while
   * the control is read-only or disabled.
   */
  private _steppedValue(count: number): number | null {
    const { value, step, min, max } = this;

    return this.readOnly || this.disabled
      ? value
      : this._format.spin(value, { count, step, min, max });
  }

  private _fit(value: number): number {
    return this._format.fit(value, this.min, this.max);
  }

  /** Sets a value from the user and emits `igcInput`. Returns whether the value changed. */
  private _setValueByUser(value: number | null, editText?: string): boolean {
    if (value === this.value) {
      return false;
    }

    this._writeUserValue(value);
    // Before the event, so that a value that a listener writes replaces it.
    if (editText !== undefined) {
      this._editText = editText;
    }
    this.emitEvent('igcInput', { detail: this.value });
    return true;
  }

  private _writeUserValue(value: number | null): void {
    this._writeFrom('user', () => {
      this.value = value;
    });
  }

  private _stepByUser(count: number): boolean {
    return this._setValueByUser(this._steppedValue(count));
  }

  /** Reverts the edit to the reported value. */
  private _revert(): void {
    this._setValueByUser(this._reportedValue);
    this._resetEditText();
  }

  //#endregion

  //#region Public API

  /** Increments the value by `n` steps, 1 by default. A step stops at `max`. */
  public stepUp(n?: number): void {
    // As the native method, which reads `n` as an integer.
    this.value = this._steppedValue(Math.trunc(n === undefined ? 1 : n) || 0);
  }

  /** Decrements the value by `n` steps, 1 by default. A step stops at `min`. */
  public stepDown(n?: number): void {
    this.stepUp(n === undefined ? -1 : -n);
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

  private _renderInput(
    format: NumberInputFormat,
    text: string,
    flags: Record<string, boolean>
  ): TemplateResult {
    const value = this.value;
    const valueText = this._editing ? format.formatDisplay(value) : text;
    const integer = format.maximumFractionDigits === 0 && !this._allowsNegative;

    return html`
      <input
        ${ariaBindings({
          ...this._ariaTarget.resolveBindings(),
          role: 'spinbutton',
          required: this.required ? 'true' : undefined,
        })}
        ${ref(this._inputRef)}
        id=${this._inputId}
        type="text"
        part=${partMap({ input: true, ...flags })}
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
    const press = this._spinPress[part];

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
        @pointerdown=${press}
        @pointerup=${press}
        @pointercancel=${press}
        @lostpointercapture=${press}
        @click=${press}
        @contextmenu=${press}
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
      <span
        part="spin-buttons"
        @wheel=${this._editing ? this._handleWheel : nothing}
      >
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

    const flags = resolveInputPartFlags(this._slots, !!text);
    // The themes show the suffix wrapper, which holds the spin buttons, only when suffixed.
    flags.suffixed ||= !this.hideSpinButtons;

    return renderInputShell(this, {
      theme: this._themes.theme,
      label: this.label,
      labelId: this._inputId,
      containerParts: { container: true, ...flags },
      renderInput: () => this._renderInput(format, text, flags),
      renderSuffixParts: this._renderSpinButtons,
      helperText: IgcValidationContainerComponent.create(this),
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-number-input': IgcNumberInputComponent;
  }
}

import { getDateFormatter } from 'igniteui-i18n-core';
import { LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { eventOptions, property, query, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import type { ThemingController } from '../../theming/theming-controller.js';
import { convertToDate } from '../calendar/helpers.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
} from '../common/controllers/key-bindings.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
import {
  addI18nController,
  getDefaultDateTimeFormat,
} from '../common/i18n/i18n-controller.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import {
  MaskBehaviorMixin,
  type MaskSelection,
} from '../common/mixins/mask-behavior.js';
import {
  nextInputId,
  renderInputShell,
} from '../common/templates/input-shell.js';
import { renderMaskedNativeInput } from '../common/templates/masked-input.js';
import { equal } from '../common/util.js';
import type { RangeTextSelectMode } from '../types.js';
import type { DatePartDeltas } from './date-part.js';
import { dateTimeInputValidators } from './validators.js';

export type { MaskSelection };

const Slots = setSlots(
  'prefix',
  'suffix',
  'helper-text',
  'value-missing',
  'range-overflow',
  'range-underflow',
  'custom-error',
  'invalid'
);

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
/* omitModule */
@blazorDeepImport
@shadowOptions({ delegatesFocus: true })
export abstract class IgcDateTimeInputBaseComponent<
  T,
> extends MaskBehaviorMixin(FormAssociatedRequiredMixin(LitElement)) {
  // #region Internal state and properties

  protected abstract readonly _themes: ThemingController;

  protected readonly _slots = addSlotController(this, { slots: Slots });

  protected readonly _inputId = nextInputId();

  @query('input')
  protected override readonly _input?: HTMLInputElement;

  /**
   * Externally supplied label elements forwarded by a composite host (e.g. `igc-date-picker`)
   * so that the host's associated labels reach the inner native input. When set, these take
   * precedence over the component's own `ElementInternals` labels.
   *
   * @hidden @internal
   */
  @state()
  public _labelElements: ReadonlyArray<Element> | null = null;

  /**
   * Resolves the label elements applied to the native input as `aria-labelledby` targets,
   * preferring forwarded labels over the component's own `ElementInternals` labels.
   *
   * @hidden @internal
   */
  protected get _resolvedLabelElements(): ReadonlyArray<Element> | null {
    return this._labelElements ?? this._internals.labels;
  }

  protected override get __validators() {
    return dateTimeInputValidators;
  }

  private readonly _i18nController = addI18nController(this, {
    defaultEN: {},
    onResourceChange: this._handleResourceChange,
  });

  protected _min: Date | null = null;
  protected _max: Date | null = null;

  protected _defaultMask!: string;

  protected _defaultDisplayFormat = '';
  protected _displayFormat?: string;
  protected _inputFormat?: string;

  /**
   * Whether the user has an uncommitted edit in progress.
   *
   * While set, the masked text - not the public `value` - is the source of truth:
   * typing updates the mask only, and the parsed result reaches `value` (together
   * with `igcChange`) when the edit is committed on blur. Keeping `value` in sync
   * with the last emitted `igcChange` is what stops a host that two-way binds the
   * property from clobbering a half-typed mask on an unrelated re-render.
   */
  protected _isEditing = false;

  /** The value the input was focused with, used to detect a committed change. */
  protected _oldValue: T | null = null;

  /**
   * The value currently in the editor - the parsed draft while an edit is in
   * progress, otherwise the committed public value.
   *
   * @hidden @internal
   */
  public get _uncommittedValue(): T | null {
    return this._isEditing ? this._parseMask(true) : this.value;
  }

  protected get _targetDatePart(): unknown {
    return this._focused
      ? this._getDatePartAtCursor()
      : this._getDefaultDatePart();
  }

  // #endregion

  // #region Public attributes and properties

  /**
   * Whether the control will have outlined appearance.
   *
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * The placeholder text of the control.
   * @attr
   */
  @property()
  public placeholder!: string;

  /**
   * The label for the control.
   * @attr
   */
  @property()
  public label!: string;

  /**
   * The date format to apply on the input.
   * @attr input-format
   */
  @property({ attribute: 'input-format' })
  public get inputFormat(): string {
    return this._inputFormat || this._parser.mask;
  }

  public set inputFormat(val: string) {
    if (val) {
      this._applyMask(val);
      this._inputFormat = val;
      this._updateMaskDisplay();
    }
  }

  /**
   * The minimum value required for the input to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set min(value: Date | string | null | undefined) {
    this._min = convertToDate(value);
    this._validate();
  }

  public get min(): Date | null {
    return this._min;
  }

  /**
   * The maximum value required for the input to remain valid.
   * @attr
   */
  @property({ converter: convertToDate })
  public set max(value: Date | string | null | undefined) {
    this._max = convertToDate(value);
    this._validate();
  }

  public get max(): Date | null {
    return this._max;
  }

  /**
   * Format to display the value in when not editing.
   * Defaults to the locale format if not set.
   * @attr display-format
   */
  @property({ attribute: 'display-format' })
  public set displayFormat(value: string) {
    this._displayFormat = value;
  }

  public get displayFormat(): string {
    return (
      this._displayFormat ?? this._inputFormat ?? this._defaultDisplayFormat
    );
  }

  /**
   * Delta values used to increment or decrement each date part on step actions.
   * All values default to `1`.
   */
  @property({ attribute: false })
  public spinDelta?: DatePartDeltas;

  /**
   * Sets whether to loop over the currently spun segment.
   * @attr spin-loop
   */
  @property({ type: Boolean, attribute: 'spin-loop' })
  public spinLoop = true;

  /**
   * Gets/Sets the locale used for formatting the display value.
   * @attr locale
   */
  @property()
  public set locale(value: string) {
    this._i18nController.locale = value;
  }

  public get locale(): string {
    return this._i18nController.locale;
  }

  // #endregion

  //#region Lifecycle Hooks

  constructor() {
    super();

    addKeybindings(this, {
      skip: () => this.readOnly,
      bindingDefaults: { repeat: true },
    })
      .set([ctrlKey, ';'], this._setCurrentDateTime)
      .set(arrowUp, this._keyboardSpin.bind(this, 'up'))
      .set(arrowDown, this._keyboardSpin.bind(this, 'down'))
      .set([ctrlKey, arrowLeft], this._navigateParts.bind(this, 0))
      .set([ctrlKey, arrowRight], this._navigateParts.bind(this, 1));
  }

  protected override update(props: PropertyValues<this>): void {
    if (props.has('displayFormat')) {
      this._updateDefaultDisplayFormat();
    }

    if (props.has('locale')) {
      this._initializeDefaultMask();
    }

    if (props.has('displayFormat') || props.has('locale')) {
      this._updateMaskDisplay();
    }

    super.update(props);
  }

  //#endregion

  // #region Event handlers

  private _handleResourceChange(): void {
    this._initializeDefaultMask();
    this._updateMaskDisplay();
  }

  protected _handleDragLeave(): void {
    if (!this._focused) {
      this._updateMaskDisplay();
    }
  }

  protected _handleDragEnter(): void {
    if (!this._focused) {
      this._maskedValue = this._buildMaskedValue();
    }
  }

  protected override _handleBlur(): void {
    this._focused = false;
    this._commitEdit();
    super._handleBlur();
  }

  /**
   * Handles wheel events for spinning date parts.
   */
  @eventOptions({ passive: false })
  protected async _handleWheel(event: WheelEvent): Promise<void> {
    if (!this._focused || this.readOnly) return;

    event.preventDefault();
    event.stopPropagation();

    const { start, end } = this._inputSelection;
    event.deltaY > 0 ? this.stepDown() : this.stepUp();
    this._emitInputEvent();

    await this.updateComplete;
    this.setSelectionRange(start, end);
  }

  // #endregion

  //#region Keybindings

  /**
   * Navigates to the previous or next date part.
   */
  protected _navigateParts(direction: number): void {
    const position = this._calculatePartNavigationPosition(
      this._input?.value ?? '',
      direction
    );
    this.setSelectionRange(position, position);
  }

  /**
   * Handles keyboard-triggered spinning (arrow up/down).
   */
  protected async _keyboardSpin(direction: 'up' | 'down'): Promise<void> {
    direction === 'up' ? this.stepUp() : this.stepDown();
    this._emitInputEvent();
    await this.updateComplete;
    this.setSelectionRange(this._maskSelection.start, this._maskSelection.end);
  }

  // #endregion

  //#region Internal API

  /**
   * Common logic for stepping up or down a date part.
   * @internal
   */
  protected _performStep(
    datePart: unknown,
    delta: number | undefined,
    isDecrement: boolean
  ): void {
    const part = datePart || this._targetDatePart;
    if (!part) return;

    const { start, end } = this._inputSelection;
    this._setDraftValue(this._calculateSpunValue(part, delta, isDecrement));
    this.updateComplete.then(() => this._input?.setSelectionRange(start, end));
  }

  /**
   * Updates the displayed mask value based on focus state.
   * When focused, shows the editable mask. When unfocused, defers to the leaf's display formatter.
   */
  protected _updateMaskDisplay(): void {
    if (!this._focused) {
      this._maskedValue = this._buildDisplayValue();
    } else if (!this._isEditing) {
      // An edit in progress owns the masked text. Rebuilding it from `value` here
      // would discard whatever the user has typed so far.
      this._maskedValue = this._buildMaskedValue();
    }
  }

  /** Builds the editable mask shown while the input is focused. */
  protected _buildMaskedValue(): string {
    const masked = this._formatValue(this.value);

    // A value-less mask formats to the empty mask; prefer whatever is already in
    // the editor so that a partially typed mask survives a re-render.
    return masked === this._parser.emptyMask
      ? this._maskedValue || masked
      : masked;
  }

  /**
   * Applies a value produced by an interactive edit (spinning, `Ctrl + ;`).
   * While focused this only moves the draft; outside of an editing session - e.g. a
   * programmatic `stepUp()` - there is no blur coming to commit it.
   */
  protected _setDraftValue(value: T): void {
    if (!this._focused) {
      this.value = value;
      return;
    }

    const next = this._formatValue(value);

    this._recordHistory('atomic', next, this._inputSelection.start);

    this._isEditing = true;
    this._maskedValue = next;
    this.requestUpdate();
  }

  /** Applies the masked text to the public value without emitting anything. */
  protected _applyDraft(): void {
    this._isEditing = false;
    this.value = this._parseMask(true);
    this._updateMaskDisplay();
  }

  /**
   * Commits the current draft to the public value, emitting `igcChange` when the
   * committed value differs from the one the input was focused with.
   */
  protected _commitEdit(): void {
    // Only an actual edit is re-parsed. Without this guard a mask holding a
    // display-formatted value - a read-only or untouched input - would be read back
    // under the input format and mangled.
    if (this._isEditing) {
      this._isEditing = false;

      // A partially filled mask is parsed leniently, missing parts falling back to
      // their defaults; only a mask that resolves to nothing clears the value.
      const parsed = this._parseMask(false);

      if (parsed === null) {
        this.clear();
      } else {
        this.value = parsed;
      }
    }

    // The assignments above are no-ops when the value did not change, so the mask
    // still has to be flipped back to the display format explicitly.
    this._updateMaskDisplay();

    // The value can also have moved without an edit - `clear()` or a programmatic
    // assignment while focused - and that is a committed change just the same.
    if (!this.readOnly && !equal(this._oldValue, this.value)) {
      this._oldValue = this.value;
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  /**
   * Marks the masked text as an uncommitted edit. The parsed result deliberately
   * does not reach the public `value` here - that happens on commit - so that the
   * property stays in sync with the last emitted `igcChange`. See {@link _isEditing}.
   */
  protected override _syncValueFromMask(): void {
    if (this._focused) {
      this._isEditing = true;
      return;
    }

    // A mask mutation outside of an editing session - e.g. text dropped onto an
    // unfocused input - has no blur coming to commit it.
    this._applyDraft();
  }

  protected override _restoreDefaultValue(): void {
    this._isEditing = false;
    super._restoreDefaultValue();
    this._updateMaskDisplay();
  }

  /**
   * Checks if all mask positions are filled (no prompt characters remain).
   */
  protected _isMaskComplete(): boolean {
    return !this._maskedValue.includes(this.prompt);
  }

  /**
   * Applies a mask pattern to the input, parsing the format string into date parts.
   */
  protected _applyMask(formatString: string): void {
    const previous = this._parser.mask;
    this._parser.mask = formatString;

    // Update placeholder if not set or if it matches the old format
    if (!this.placeholder || previous === this.placeholder) {
      this.placeholder = this._parser.mask;
    }
  }

  /**
   * Updates the default display format based on current locale.
   */
  private _updateDefaultDisplayFormat(): void {
    this._defaultDisplayFormat = getDateFormatter().getLocaleDateTimeFormat(
      this.locale
    );
  }

  protected _initializeDefaultMask(): void {
    this._updateDefaultDisplayFormat();

    if (!this._inputFormat) {
      this._applyMask(getDefaultDateTimeFormat(this.locale));
    }
  }

  /**
   * Resolves the part names for the container based on the current state.
   */
  protected _resolvePartNames(base: string): Record<string, boolean> {
    return {
      [base]: true,
      prefixed: this._slots.hasAssignedElements('prefix', {
        selector: '[slot="prefix"]:not([hidden])',
      }),
      suffixed: this._slots.hasAssignedElements('suffix', {
        selector: '[slot="suffix"]:not([hidden])',
      }),
      filled: !this._isEmptyMask,
    };
  }

  // #endregion

  // #region Public API

  /** Selects all the text inside the input. */
  public select(): void {
    this._input?.select();
  }

  /* alternateName: focusComponent */
  /** Sets focus on the control. */
  public override focus(options?: FocusOptions): void {
    this._input?.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the control. */
  public override blur(): void {
    this._input?.blur();
  }

  /* blazorSuppress */
  /** Increments a date/time portion. */
  public stepUp(datePart?: unknown, delta?: number): void {
    this._performStep(datePart, delta, false);
  }

  /* blazorSuppress */
  /** Decrements a date/time portion. */
  public stepDown(datePart?: unknown, delta?: number): void {
    this._performStep(datePart, delta, true);
  }

  /* blazorSuppress */
  /** Replaces the selected text in the control and re-applies the mask. */
  public override setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectMode?: RangeTextSelectMode
  ): void {
    super.setRangeText(replacement, start, end, selectMode);
    this._applyDraft();
  }

  /** Clears the input element of user input. */
  public clear(): void {
    this._isEditing = false;
    this._maskedValue = '';
    this.value = null;
    this._updateMaskDisplay();
  }

  //#endregion

  //#region Render

  protected _renderInput(): TemplateResult {
    const hasNegativeTabIndex = this.getAttribute('tabindex') === '-1';
    const hasHelperText = this._slots.hasAssignedElements('helper-text');

    return renderMaskedNativeInput({
      id: this._inputId,
      partNames: this._resolvePartNames('input'),
      name: this.name,
      value: this._maskedValue,
      placeholder: this.placeholder || this._parser.emptyMask,
      readOnly: this.readOnly,
      disabled: this.disabled,
      tabindex: hasNegativeTabIndex ? -1 : undefined,
      ariaDescribedBy: hasHelperText ? 'helper-text' : undefined,
      ariaLabelledByElements: this._resolvedLabelElements,
      onInput: this._handleInput,
      onBeforeInput: this._handleBeforeInput,
      onFocus: this._handleFocus,
      onBlur: this._handleBlur,
      onClick: this._handleClick,
      onSetMaskSelection: this._setMaskSelection,
      onCompositionStart: this._handleCompositionStart,
      onCompositionEnd: this._handleCompositionEnd,
      onWheel: this._handleWheel,
      onDragEnter: this._handleDragEnter,
      onDragLeave: this._handleDragLeave,
    });
  }

  protected override render() {
    return cache(
      renderInputShell(this, {
        theme: this._themes.theme,
        label: this.label,
        labelId: this._inputId,
        containerParts: this._resolvePartNames('container'),
        renderInput: this._renderInput,
      })
    );
  }

  //#endregion

  // #region Abstract methods and properties

  protected abstract get _datePartDeltas(): DatePartDeltas;

  /** Provided by `EventEmitterMixin` in the concrete components. */
  public abstract emitEvent(name: string, init?: CustomEventInit): boolean;

  /** The committed value of the input. */
  public abstract get value(): T | null;
  public abstract set value(value: T | null);

  /**
   * Parses the current masked text into the leaf's value type.
   *
   * A `strict` parse mirrors the committed value semantics - an incomplete mask has
   * no value yet and resolves to `null` rather than to a defaults-filled one.
   */
  protected abstract _parseMask(strict: boolean): T | null;

  /** Formats a value into the editable mask. */
  protected abstract _formatValue(value: T | null): string;

  protected abstract _buildDisplayValue(): string;
  protected abstract _calculatePartNavigationPosition(
    value: string,
    direction: number
  ): number;
  protected abstract _calculateSpunValue(
    part: unknown,
    delta: number | undefined,
    isDecrement: boolean
  ): T;
  protected abstract _setCurrentDateTime(): void;
  protected abstract _handleFocus(): Promise<void>;
  protected abstract _getDatePartAtCursor(): unknown;
  protected abstract _getDefaultDatePart(): unknown;

  public abstract hasDateParts(): boolean;
  public abstract hasTimeParts(): boolean;

  // #endregion
}

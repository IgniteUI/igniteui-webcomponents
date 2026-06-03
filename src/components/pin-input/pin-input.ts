import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addThemingController } from '../../theming/theming-controller.js';
import {
  addKeybindings,
  arrowLeft,
  arrowRight,
  backspaceKey,
  deleteKey,
} from '../common/controllers/key-bindings.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import {
  addSafeEventListener,
  bindIf,
  clamp,
  getElementFromPath,
  stopPropagation,
} from '../common/util.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles } from './themes/pin-input.base.css.js';
import { all } from './themes/themes.js';
import { pinRequiredValidator } from './validators.js';

export interface IgcPinInputComponentEventMap {
  igcInput: CustomEvent<string>;
  igcChange: CustomEvent<string>;
  igcComplete: CustomEvent<string>;
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

const MIN_LENGTH = 1;
const MAX_LENGTH = 8;
const IS_DIGIT = /^\d$/;
const IS_ALPHANUMERIC = /^[a-zA-Z0-9]$/;

const Slots = setSlots(
  'helper-text',
  'value-missing',
  'custom-error',
  'invalid'
);

/**
 * A PIN/OTP input component that renders individual character cells.
 *
 * @element igc-pin-input
 *
 * @slot helper-text - Renders content below the input.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcInput - Emitted when the value of the control changes through user interaction.
 * @fires igcChange - Emitted when the control loses focus and its value has changed.
 * @fires igcComplete - Emitted when all cells are filled.
 *
 * @csspart label - The label element.
 * @csspart inputs - The container wrapping all cell inputs.
 * @csspart input - Each individual cell input element.
 * @csspart separator - The separator element rendered between cell groups.
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcPinInputComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcPinInputComponentEventMap, Constructor<LitElement>>(
    LitElement
  )
) {
  public static readonly tagName = 'igc-pin-input';
  public static styles = [styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcPinInputComponent, IgcValidationContainerComponent);
  }

  //#region Internal state

  protected readonly _slots = addSlotController(this, { slots: Slots });
  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
  });

  protected override get __validators() {
    return [pinRequiredValidator];
  }

  private _length = 4;
  private _groups: number[] = [];
  private _lastValue = '';

  @queryAll('[part~="input"]')
  private readonly _inputs!: NodeListOf<HTMLInputElement>;

  @state()
  private _cells: string[] = Array(4).fill('');

  private get _cellsValue(): string {
    return this._cells.join('');
  }

  private get _isNumeric(): boolean {
    return this.mode === 'numeric';
  }

  //#endregion

  //#region Public properties

  /**
   * The label for the control.
   * @attr label
   */
  @property()
  public label?: string;

  /**
   * The placeholder character shown in each empty cell.
   * @attr placeholder
   */
  @property()
  public placeholder?: string;

  /**
   * The number of input cells. Clamped between 1 and 8.
   * @attr
   * @default 4
   */
  @property({ type: Number, reflect: true })
  public set length(value: number) {
    if (this._groups.length > 0) return;
    const clamped = clamp(value, MIN_LENGTH, MAX_LENGTH);
    if (clamped === this._length) return;

    this._cells = Array.from(
      { length: clamped },
      (_, i) => this._cells[i] ?? ''
    );
    this._length = clamped;
    this._syncFormValue();
  }

  public get length(): number {
    return this._length;
  }

  /**
   * The type of allowed input.
   * - `numeric` — only digits (0-9)
   * - `alphanumeric` — letters and digits
   * @attr mode
   * @default 'numeric'
   */
  @property({ reflect: true })
  public mode: 'numeric' | 'alphanumeric' = 'numeric';

  /**
   * When set, the entered characters are visually hidden (displayed as password dots).
   * @attr mask
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public mask = false;

  /**
   * The character(s) rendered between cell groups when `groups` is configured.
   * Has no effect unless `groups` is also set.
   * @attr
   * @default ''
   */
  @property()
  public separator = '';

  /**
   * Defines visual groupings of cells separated by `separator`.
   * Each element in the array is the number of cells in that group.
   * When set, `length` is derived from the sum of the group sizes (clamped to 1–8).
   *
   * @example
   * ```html
   * <igc-pin-input .groups=${[3, 2, 3]} separator="-"></igc-pin-input>
   * <!-- Renders 8 cells with a dash between the 3rd and 4th, and 5th and 6th cells -->
   * ```
   */
  @property({ attribute: false })
  public set groups(value: number[]) {
    this._groups = value;
    const clamped =
      value.length > 0
        ? clamp(
            value.reduce((a, b) => a + b, 0),
            MIN_LENGTH,
            MAX_LENGTH
          )
        : this._length;
    this._cells = Array.from(
      { length: clamped },
      (_, i) => this._cells[i] ?? ''
    );
    this._length = clamped;
    this._syncFormValue();
  }

  public get groups(): number[] {
    return this._groups;
  }

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The concatenated value of all cells. Empty string when not all cells are filled.
   * @attr value
   */
  @property()
  public set value(value: string) {
    const chars = value.split('');
    this._cells = Array.from({ length: this._length }, (_, i) =>
      this._filterChar(chars[i] ?? '')
    );
    this._syncFormValue();
    this._lastValue = this.value;
  }

  public get value(): string {
    return this._cells.every(Boolean) ? this._cellsValue : '';
  }

  //#endregion

  //#region Lit lifecycle

  constructor() {
    super();

    addThemingController(this, all);
    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true, repeat: true },
    })
      .set(backspaceKey, this._handleBackspace)
      .set(deleteKey, this._handleDelete)
      .set(arrowLeft, this._handleArrowLeft)
      .set(arrowRight, this._handleArrowRight);

    addSafeEventListener(this, 'focusin', this._handleCellFocus);
    addSafeEventListener(this, 'focusout', this._handleFocusOut);
    addSafeEventListener(this, 'input', this._handleInput);
    addSafeEventListener(this, 'paste', this._handlePaste);
    addSafeEventListener(this, 'change', stopPropagation);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this._syncFormValue();
  }

  protected override _restoreDefaultValue(): void {
    super._restoreDefaultValue();
    this._cells = Array(this._length).fill('');
    this._lastValue = '';
  }

  //#endregion

  //#region Event handlers

  private _getCellIndex(event: Event): number {
    const cell = getElementFromPath<HTMLInputElement>('[part="input"]', event);
    return cell ? Array.prototype.indexOf.call(this._inputs, cell) : -1;
  }

  private _handleBackspace(event: KeyboardEvent): void {
    const index = this._getCellIndex(event);
    if (index === -1 || (index === 0 && !this._cells[0])) return;

    this._cells = this._shiftDeleteAt(this._cells[index] ? index : index - 1);
    this._syncFormValue();
    this._emitInputEvent(this._cellsValue);
    this._focusCell(Math.max(0, index - 1));
  }

  private _handleDelete(event: KeyboardEvent): void {
    const index = this._getCellIndex(event);
    if (index === -1) return;

    let input: HTMLInputElement;

    if (this._cells[index]) {
      this._cells = this._shiftDeleteAt(index);
      input = this._inputs[index];
    } else if (index < this._length - 1) {
      this._cells = this._shiftDeleteAt(index + 1);
      input = this._inputs[index + 1];
    } else {
      return;
    }

    this._syncFormValue();
    this._emitInputEvent(this._cellsValue);
    this.updateComplete.then(() => input.select());
  }

  private _handleArrowLeft(event: KeyboardEvent): void {
    const index = this._getCellIndex(event);
    if (index > 0) {
      this._focusCell(index - 1);
    }
  }

  private _handleArrowRight(event: KeyboardEvent): void {
    const index = this._getCellIndex(event);
    if (index > -1 && index < this._length - 1) {
      this._focusCell(index + 1);
    }
  }

  private _handleInput(event: Event): void {
    const index = this._getCellIndex(event);
    if (index === -1) return;

    const input = this._inputs[index];
    const rawValue = input.value.slice(-1);
    const filtered = this._filterChar(rawValue);

    // Keep the displayed value consistent
    input.value = filtered;

    const prev = this._cells[index];
    this._cells = this._cells.map((c, i) => (i === index ? filtered : c));
    this._syncFormValue();

    if (filtered && filtered !== prev) {
      const value = this._cellsValue;
      this._emitInputEvent(value);

      if (index < this._length - 1) {
        this._focusCell(index + 1);
      }

      this._emitCompleteIfFull(value);
    }
  }

  private _handlePaste(event: ClipboardEvent): void {
    const index = this._getCellIndex(event);
    const text = event.clipboardData?.getData('text');

    if (index === -1 || !text) return;
    event.preventDefault();

    const chars = Iterator.from(text.split(''))
      .map((c) => this._filterChar(c))
      .filter(Boolean)
      .toArray();

    if (!chars.length) return;

    const updated = [...this._cells];
    let lastFilled = index;

    for (let i = 0; i < chars.length && index + i < this._length; i++) {
      updated[index + i] = chars[i];
      lastFilled = index + i;
    }

    this._cells = updated;
    this._syncFormValue();

    const nextIdx = Math.min(lastFilled + 1, this._length - 1);
    this._focusCell(nextIdx);

    const value = this._cellsValue;
    this._emitInputEvent(value);
    this._emitCompleteIfFull(value);
  }

  private _handleFocusOut({ relatedTarget }: FocusEvent): void {
    if (this.contains(relatedTarget as Node)) return;

    super._handleBlur();

    if (this.value !== this._lastValue) {
      this._lastValue = this.value;
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  private _handleCellFocus(event: FocusEvent): void {
    const index = this._getCellIndex(event);
    if (index !== -1 && this._cells[index]) {
      this._inputs[index].select();
    }
  }

  //#endregion

  //#region Internal API

  private _emitInputEvent(value: string): void {
    this.emitEvent('igcInput', { detail: value });
  }

  private _emitCompleteIfFull(value: string): void {
    if (this._cells.every(Boolean)) {
      this.emitEvent('igcComplete', { detail: value });
    }
  }

  /** Removes the cell at `idx`, shifts subsequent cells left, and appends an empty cell at the end. */
  private _shiftDeleteAt(idx: number): string[] {
    return [...this._cells.toSpliced(idx, 1), ''];
  }

  private _filterChar(char: string): string {
    if (!char) return '';
    if (this._isNumeric) return IS_DIGIT.test(char) ? char : '';
    return IS_ALPHANUMERIC.test(char) ? char : '';
  }

  private _syncFormValue(): void {
    this._formValue.setValueAndFormState(this.value);
    this._validate();
  }

  private _focusCell(idx: number, options?: FocusOptions): void {
    this._inputs[idx]?.focus(options);
  }

  //#endregion

  //#region Public API

  /* alternateName: focusComponent */
  /** Sets focus on the first empty cell, or the last cell if all are filled. */
  public override focus(options?: FocusOptions): void {
    const firstEmpty = this._cells.findIndex((c) => !c);
    const index = firstEmpty === -1 ? this._length - 1 : firstEmpty;
    this._focusCell(index, options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the currently focused cell. */
  public override blur(): void {
    this.renderRoot.querySelector<HTMLInputElement>(':focus')?.blur();
  }

  /** Clears all cells. */
  public clear(): void {
    this._cells = Array(this._length).fill('');
    this._syncFormValue();
    this._lastValue = '';
  }

  //#endregion

  private _renderLabel() {
    return this.label
      ? html`<label part="label" for=${`${this.id || this.tagName}-cell-0`}
          >${this.label}</label
        >`
      : nothing;
  }

  private _renderCell(value: string, index: number): TemplateResult {
    const inputId = `${this.id || this.tagName}-cell-${index}`;
    const type = this.mask ? 'password' : 'text';
    const cellInputMode = this._isNumeric ? 'numeric' : 'text';

    return html`
      <input
        id=${inputId}
        part="input"
        type=${type}
        inputmode=${cellInputMode}
        maxlength="1"
        autocomplete="one-time-code"
        ?disabled=${this.disabled}
        .value=${value}
        placeholder=${ifDefined(this.placeholder)}
        aria-label=${`${this._isNumeric ? 'Digit' : 'Character'} ${index + 1} of ${this._length}`}
      />
    `;
  }

  private _renderCellGroup(
    groupIndex: number,
    start: number,
    size: number
  ): TemplateResult {
    const cells = this._cells.slice(start, start + size);
    return html`
      ${cells.map((value, i) => this._renderCell(value, start + i))}
      ${groupIndex < this._groups.length - 1 && this.separator
        ? html`<span part="separator" aria-hidden="true"
            >${this.separator}</span
          >`
        : nothing}
    `;
  }

  private _renderCellGroups(): TemplateResult {
    if (!this._groups.length) {
      return html`${this._cells.map((value, i) => this._renderCell(value, i))}`;
    }

    let cellIdx = 0;
    return html`${this._groups.map((size, groupIndex) => {
      const start = cellIdx;
      cellIdx += size;
      return this._renderCellGroup(
        groupIndex,
        start,
        Math.min(size, this._length - start)
      );
    })}`;
  }

  protected override render(): TemplateResult {
    const hasHelperText = this._slots.hasAssignedElements('helper-text');

    return html`
      ${this._renderLabel()}
      <div
        part="inputs"
        role="group"
        aria-label=${this.label ?? 'PIN input'}
        aria-describedby=${bindIf(hasHelperText, 'helper-text')}
      >
        ${this._renderCellGroups()}
      </div>
      ${IgcValidationContainerComponent.create(this, {
        id: 'helper-text',
        hasHelperText: true,
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-pin-input': IgcPinInputComponent;
  }
}

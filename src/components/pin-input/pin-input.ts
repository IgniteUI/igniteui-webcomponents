import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addThemingController } from '../../theming/theming-controller.js';
import {
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
    return this.inputMode === 'numeric';
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
   * @attr input-mode
   * @default 'numeric'
   */
  @property({ reflect: true, attribute: 'input-mode' })
  public override inputMode: 'numeric' | 'alphanumeric' = 'numeric';

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
   * @example // Two groups of three cells with a separator between them
   * element.groups = [3, 3];
   */
  @property({ attribute: false })
  public set groups(value: number[]) {
    this._groups = value;
    if (value.length > 0) {
      const total = value.reduce((a, b) => a + b, 0);
      const clamped = clamp(total, MIN_LENGTH, MAX_LENGTH);
      this._cells = Array.from(
        { length: clamped },
        (_, i) => this._cells[i] ?? ''
      );
      this._length = clamped;
      this._syncFormValue();
    }
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
    addSafeEventListener(this, 'focusout', this._handleFocusOut);
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

  private _handleBackspace(index: number, event: KeyboardEvent): void {
    event.preventDefault();

    if (index === 0 && !this._cells[0]) return;

    this._cells = this._shiftDeleteAt(this._cells[index] ? index : index - 1);
    this._syncFormValue();
    this._emitInputEvent(this._cellsValue);
    this._focusCell(Math.max(0, index - 1));
  }

  private _handleDelete(index: number, event: KeyboardEvent): void {
    event.preventDefault();

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

  private _handleArrowLeft(index: number, event: KeyboardEvent): void {
    if (index > 0) {
      event.preventDefault();
      this._focusCell(index - 1);
    }
  }

  private _handleArrowRight(index: number, event: KeyboardEvent): void {
    if (index < this._length - 1) {
      event.preventDefault();
      this._focusCell(index + 1);
    }
  }

  private _handleKeydown(index: number, event: KeyboardEvent): void {
    const { key } = event;

    switch (key) {
      case backspaceKey:
        this._handleBackspace(index, event);
        break;
      case deleteKey:
        this._handleDelete(index, event);
        break;
      case arrowLeft:
        this._handleArrowLeft(index, event);
        break;
      case arrowRight:
        this._handleArrowRight(index, event);
        break;
    }
  }

  private _handleInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
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

  private _handlePaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text');
    if (!text) return;

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

  private _handleCellFocus(index: number, event: FocusEvent): void {
    if (this._cells[index]) {
      const target = event.target as HTMLInputElement;
      target.select();
    }
  }

  //#endregion

  //#region Internal API

  private _emitInputEvent(value: string): void {
    this.emitEvent('igcInput', { detail: value });
  }

  private _emitCompleteIfFull(value: string): void {
    if (value.length === this._length) {
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
        @keydown=${(e: KeyboardEvent) => this._handleKeydown(index, e)}
        @focus=${(e: FocusEvent) => this._handleCellFocus(index, e)}
        @input=${(e: Event) => this._handleInput(index, e)}
        @change=${stopPropagation}
        @paste=${(e: ClipboardEvent) => this._handlePaste(index, e)}
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

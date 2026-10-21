import { html, isServer, LitElement, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  addAriaTarget,
  ariaBindings,
  helperText,
} from '#internals/controllers/aria-projection.js';
import { addResizeObserverController } from '#internals/controllers/resize-observer.js';
import {
  addSlotController,
  DefaultSlot,
  type InferSlotNames,
  setSlots,
  type SlotChangeCallbackParameters,
} from '#internals/controllers/slot.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import {
  renderInputShell,
  resolveInputPartFlags,
} from '#internals/templates/input-shell.js';
import { addSafeEventListener } from '#internals/utils/events.js';
import { asNumber } from '#internals/utils/math.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { all } from '#themes/textarea/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type {
  RangeTextSelectMode,
  SelectionRangeDirection,
  TextareaResize,
} from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles as shared } from './themes/shared/textarea.common.css.js';
import { styles } from './themes/textarea.base.css.js';
import { textAreaValidators } from './validators.js';

export interface IgcTextareaComponentEventMap {
  igcInput: CustomEvent<string>;
  igcChange: CustomEvent<string>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

const nextId = createIdGenerator('textarea');
const Slots = setSlots(
  'prefix',
  'suffix',
  'helper-text',
  'value-missing',
  'too-long',
  'too-short',
  'custom-error',
  'invalid'
);

/**
 * A multi-line plain-text field for a large amount of free-form text,
 * for example a comment in a review or feedback form.
 *
 * @element igc-textarea
 *
 * @slot - The text content of the default slot sets the value of the component.
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after the input.
 * @slot helper-text - Renders content below the input.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot too-long - Renders content when the maxlength validation fails.
 * @slot too-short - Renders content when the minlength validation fails.
 * @slot custom-error - Renders content when a custom message is set with `setCustomValidity()`.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcInput - Emitted when the control receives user input.
 * @fires igcChange - Emitted when a change to the control value is committed by the user.
 *
 * @csspart container - The main wrapper that holds all main input elements of the textarea.
 * @csspart input - The native textarea element.
 * @csspart label - The native label element of the textarea.
 * @csspart prefix - The prefix wrapper of the textarea.
 * @csspart suffix - The suffix wrapper of the textarea.
 * @csspart helper-text - The helper text wrapper of the textarea.
 * @csspart prefixed - Added to the container when an element that is not hidden is in the prefix slot.
 * @csspart suffixed - Added to the container when an element that is not hidden is in the suffix slot.
 * @csspart filled - Added to the container when the textarea has a value.
 * @csspart placeholder - Added to the container in the material theme when the textarea has a placeholder.
 * @csspart labelled - Added to the container in the material theme when the control has a label.
 * @csspart start - The wrapper of the prefix in the material theme.
 * @csspart notch - The wrapper of the label in the material theme.
 * @csspart filler - The outline segment between the notch and the end in the material theme.
 * @csspart end - The wrapper of the suffix in the material theme.
 *
 * @cssstate ig-invalid - Set while the control shows its invalid state, that is while `invalid` returns `true`.
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcTextareaComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcTextareaComponentEventMap>(LitElement)
) {
  public static readonly tagName = 'igc-textarea';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcTextareaComponent, IgcValidationContainerComponent);
  }

  //#region Private properties and state

  private readonly _inputId = nextId();

  private readonly _themes = addThemingController(this, all);

  /** With CSS field sizing, `resize="auto"` needs no height measurement. */
  private readonly _fieldSizing =
    !isServer &&
    typeof CSS !== 'undefined' &&
    CSS.supports('field-sizing: content');

  private readonly _slots = addSlotController(this, {
    slots: Slots,
    onChange: this._handleSlotChange,
  });

  /** Names and describes the native textarea. See {@link addAriaTarget}. */
  private readonly _ariaTarget = addAriaTarget(this, () =>
    helperText(this, this._slots)
  );

  @query('textarea')
  private readonly _input?: HTMLTextAreaElement;

  /** The text of the default slot that was applied last. */
  private _projectedValue = '';

  private _maxLength!: number;
  private _minLength!: number;

  protected override get __validators() {
    return textAreaValidators;
  }

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
  });

  //#endregion

  //#region Public properties and attributes

  /**
   * A hint for the browser on how to autofill the control.
   * Refer to [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for additional information.
   *
   * @attr
   */
  @property()
  public autocomplete!: string;

  /**
   * Whether and how the browser capitalizes the text that the user enters.
   *
   * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).
   *
   * @attr
   */
  @property()
  public override autocapitalize!: string;

  /**
   * A hint to the browser for which virtual keyboard layout to display.
   *
   * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
   *
   * @attr inputmode
   */
  @property({ attribute: 'inputmode' })
  public override inputMode!: string;

  /**
   * The label for the control.
   *
   * @attr
   */
  @property()
  public label!: string;

  /**
   * The maximum number of characters (UTF-16 code units) that the user can enter.
   * If this value isn't specified, the user can enter an unlimited number of characters.
   *
   * @attr maxlength
   */
  @property({ type: Number, attribute: 'maxlength' })
  public set maxLength(value: number) {
    this._maxLength = value;
    this._validate();
  }

  public get maxLength(): number {
    return this._maxLength;
  }

  /**
   * The minimum number of characters (UTF-16 code units) that the value must have.
   *
   * @attr minlength
   */
  @property({ type: Number, attribute: 'minlength' })
  public set minLength(value: number) {
    this._minLength = value;
    this._validate();
  }

  public get minLength(): number {
    return this._minLength;
  }

  /**
   * Whether the control has an outlined appearance.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * The placeholder text of the control.
   *
   * @attr
   */
  @property()
  public placeholder!: string;

  /**
   * Whether the control is read-only.
   *
   * @attr readonly
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  public readOnly = false;

  /**
   * How the user can resize the control.
   * With `auto`, the height of the control fits its content and the resize handle is hidden.
   *
   * @attr
   */
  @property()
  public resize: TextareaResize = 'vertical';

  /**
   * The number of visible text lines of the control. As in the native textarea, a value
   * less than 1 shows 2 lines.
   *
   * @attr
   */
  @property({ type: Number })
  public rows = 3;

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the component.
   *
   * @attr
   */
  @property()
  public set value(value: string) {
    this._formValue.setValueAndFormState(value);
  }

  public get value(): string {
    return this._formValue.value;
  }

  /**
   * Whether the browser checks the spelling of the value. As for the native attribute,
   * only the `"false"` attribute value turns the check off.
   *
   * @attr
   */
  @property({
    type: Boolean,
    converter: {
      // As the native attribute: only "false" turns the check off.
      fromAttribute: (value) => value?.toLowerCase() !== 'false',
    },
  })
  public override spellcheck = true;

  /**
   * How the control wraps long lines of text. With `off`, the lines do not wrap.
   * Unlike the native element, `hard` does not add line breaks to the submitted value.
   * Refer to [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes)
   * for explanation of the available values.
   *
   * @attr
   */
  @property()
  public wrap: 'hard' | 'soft' | 'off' = 'soft';

  /**
   * Whether the validation rules apply without restricting user input. The user can type past `maxLength`.
   *
   * @attr validate-only
   */
  @property({ type: Boolean, reflect: true, attribute: 'validate-only' })
  public validateOnly = false;

  /**
   * The offset of the start of the text selection, in UTF-16 code units.
   * Equals `selectionEnd` when no text is selected.
   */
  public get selectionStart(): number {
    return this._input?.selectionStart ?? 0;
  }

  /** The offset of the end of the text selection, in UTF-16 code units. */
  public get selectionEnd(): number {
    return this._input?.selectionEnd ?? 0;
  }

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();

    if (!this._fieldSizing) {
      addResizeObserverController(this, {
        callback: this._setAreaHeight,
      });
    }

    addSafeEventListener(this, 'blur', this._handleBlur);
  }

  protected override updated(props: PropertyValues<this>): void {
    // A new mode starts from the `rows` height. This also removes a height
    // that the end-user set with the resize handle.
    if (props.has('resize')) {
      this._input?.style.removeProperty('height');
    }

    if (
      !this._fieldSizing &&
      (props.has('rows') || props.has('resize') || props.has('value'))
    ) {
      this._setAreaHeight();
    }
  }

  //#endregion

  //#region Internal methods

  protected _setAreaHeight(): void {
    const input = this._input;

    if (!input || this.resize !== 'auto') {
      return;
    }

    input.style.height = 'auto';

    // The auto size mode uses the content box.
    const { paddingTop, paddingBottom } = getComputedStyle(input);
    const height =
      input.scrollHeight - asNumber(paddingTop) - asNumber(paddingBottom);

    input.style.height = `${height}px`;
  }

  //#endregion

  //#region Event handlers

  private _handleSlotChange({
    isDefault,
  }: SlotChangeCallbackParameters<InferSlotNames<typeof Slots>>): void {
    if (!isDefault) {
      return;
    }

    const value = this._slots
      .getAssignedNodes(DefaultSlot, true)
      .map((node) => node.textContent?.trim())
      .filter(Boolean)
      .join('\r\n');

    // Whitespace around slotted elements is not projected text, so it keeps
    // the value from the attribute, the property or the user.
    if (value === this._projectedValue) {
      return;
    }

    this._projectedValue = value;

    if (value === this.value) {
      return;
    }

    if (this._pristine) {
      this.defaultValue = value;
    } else {
      this.value = value;
    }
  }

  protected _handleInput(): void {
    this._commitValue(this._input?.value ?? '', 'igcInput');
  }

  protected _handleChange(): void {
    this._commitValue(this._input?.value ?? '', 'igcChange');
  }

  //#endregion

  //#region Public methods

  /** Selects all text within the control. */
  public select(): void {
    this._input?.select();
  }

  /* blazorSuppress */
  /** Sets the text selection range of the control. */
  public setSelectionRange(
    start: number,
    end: number,
    direction: SelectionRangeDirection = 'none'
  ): void {
    this._input?.setSelectionRange(start, end, direction);
  }

  /* blazorSuppress */
  /**
   * Replaces the text from `start` to `end` in the control. Without `start` and
   * `end`, replaces the selected text.
   */
  public setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectMode: RangeTextSelectMode = 'preserve'
  ): void {
    this._input?.setRangeText(
      replacement,
      start ?? this._input.selectionStart,
      end ?? this._input.selectionEnd,
      selectMode
    );
    this.value = this._input?.value ?? '';
  }

  /* blazorSuppress */
  /** Scrolls the text of the control to the given position. */
  public override scrollTo(options?: ScrollToOptions | undefined): void;
  /* blazorSuppress */
  /** Scrolls the text of the control to the given `x` and `y` coordinates. */
  public override scrollTo(x: number, y: number): void;
  /** Scrolls the text of the control to the given position. */
  public override scrollTo(x?: unknown, y?: unknown): void {
    x != null && y != null
      ? this._input?.scrollTo(x as number, y as number)
      : this._input?.scrollTo(x as ScrollToOptions);
  }

  //#endregion

  //#region Renderers

  protected _renderInput() {
    const autoSize = this.resize === 'auto';
    // As the native control, use two rows for a value that is not positive.
    const rows = this.rows >= 1 ? Math.trunc(this.rows) : 2;

    return html`
      <slot style="display: none"></slot>
      <textarea
        ${ariaBindings(this._ariaTarget.resolveBindings())}
        id=${this._inputId}
        part="input"
        style=${styleMap({
          resize: autoSize ? 'none' : this.resize,
          '--_rows': rows,
        })}
        ?data-auto-size=${autoSize}
        @input=${this._handleInput}
        @change=${this._handleChange}
        placeholder=${ifDefined(this.placeholder)}
        .rows=${this.rows}
        .value=${live(this.value)}
        .wrap=${this.wrap}
        autocomplete=${ifDefined(this.autocomplete as any)}
        autocapitalize=${ifDefined(this.autocapitalize as any)}
        inputmode=${ifDefined(this.inputMode)}
        spellcheck=${ifDefined(this.spellcheck)}
        minlength=${ifDefined(this.minLength)}
        maxlength=${ifDefined(this.validateOnly ? undefined : this.maxLength)}
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?readonly=${this.readOnly}
      ></textarea>
    `;
  }

  protected override render() {
    return renderInputShell(this, {
      theme: this._themes.theme,
      label: this.label,
      labelId: this._inputId,
      containerParts: {
        container: true,
        ...resolveInputPartFlags(this._slots, !!this.value),
        placeholder: this._themes.theme === 'material' && !!this.placeholder,
      },
      hideEmptyAffixes: true,
      renderInput: this._renderInput,
      helperText: IgcValidationContainerComponent.create(this),
    });
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-textarea': IgcTextareaComponent;
  }
}

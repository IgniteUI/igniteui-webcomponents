import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, query } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { createResizeObserverController } from '../common/controllers/resize-observer.js';
import {
  addSlotController,
  type InferSlotNames,
  type SlotChangeCallbackParameters,
  setSlots,
} from '../common/controllers/slot.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import { addSafeEventListener, asNumber } from '../common/util.js';
import type {
  RangeTextSelectMode,
  SelectionRangeDirection,
  TextareaResize,
} from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles as shared } from './themes/shared/textarea.common.css.js';
import { styles } from './themes/textarea.base.css.js';
import { all } from './themes/themes.js';
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

let nextId = 1;
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
 * This element represents a multi-line plain-text editing control,
 * useful when you want to allow users to enter a sizeable amount of free-form text,
 * for example a comment on a review or feedback form.
 *
 * @element igc-textarea
 *
 * @slot - Text content from the default slot will be used as the value of the component.
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot too-long - Renders content when the maxlength validation fails.
 * @slot too-short - Renders content when the minlength validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcInput - Emitted when the control receives user input.
 * @fires igcChange - Emitted when the a change to the control value is committed by the user.
 *
 * @csspart container - The main wrapper that holds all main input elements of the textarea.
 * @csspart input - The native input element of the igc-textarea.
 * @csspart label - The native label element of the igc-textarea.
 * @csspart prefix - The prefix wrapper of the igc-textarea.
 * @csspart suffix - The suffix wrapper of the igc-textarea.
 * @csspart helper-text - The helper text wrapper of the igc-textarea.
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcTextareaComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcTextareaComponentEventMap, Constructor<LitElement>>(
    LitElement
  )
) {
  public static readonly tagName = 'igc-textarea';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcTextareaComponent, IgcValidationContainerComponent);
  }

  //#region Private properties and state

  private readonly _inputId = `textarea-${nextId++}`;

  private readonly _themes = addThemingController(this, all);

  private readonly _slots = addSlotController(this, {
    slots: Slots,
    onChange: this._handleSlotChange,
  });

  @query('textarea')
  private readonly _input!: HTMLTextAreaElement;

  protected override get __validators() {
    return textAreaValidators;
  }

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
  });

  //#endregion

  //#region Public properties and attributes

  /**
   * Specifies what if any permission the browser has to provide for automated assistance in filling out form field values,
   * as well as guidance to the browser as to the type of information expected in the field.
   * Refer to [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for additional information.
   *
   * @attr
   */
  @property()
  public autocomplete!: string;

  /**
   * Controls whether and how text input is automatically capitalized as it is entered/edited by the user.
   *
   * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).
   *
   * @attr
   */
  @property()
  public override autocapitalize!: string;

  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents.
   * This allows a browser to display an appropriate virtual keyboard.
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
  public maxLength!: number;

  /**
   * The minimum number of characters (UTF-16 code units) required that the user should enter.
   *
   * @attr minlength
   */
  @property({ type: Number, attribute: 'minlength' })
  public minLength!: number;

  /**
   * Whether the control will have outlined appearance.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * The placeholder attribute of the control.
   *
   * @attr
   */
  @property()
  public placeholder!: string;

  /**
   * Makes the control a readonly field.
   *
   * @attr readonly
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  public readOnly = false;

  /**
   * Controls whether the control can be resized.
   * When `auto` is set, the control will try to expand and fit its content.
   *
   * @attr
   */
  @property()
  public resize: TextareaResize = 'vertical';

  /**
   * The number of visible text lines for the control. If it is specified, it must be a positive integer.
   * If it is not specified, the default value is 3.
   *
   * @attr
   */
  @property({ type: Number })
  public rows = 3;

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the component
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
   * Controls whether the element may be checked for spelling errors.
   *
   * @attr
   */
  @property({
    type: Boolean,
    converter: {
      fromAttribute: (value) => !(!value || value === 'false'),
      toAttribute: (value) => (value ? 'true' : 'false'),
    },
  })
  public override spellcheck = true;

  /**
   * Indicates how the control should wrap the value for form submission.
   * Refer to [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes)
   * for explanation of the available values.
   *
   * @attr
   */
  @property()
  public wrap: 'hard' | 'soft' | 'off' = 'soft';

  /**
   * Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property
   * when it is defined.
   *
   * @attr validate-only
   */
  @property({ type: Boolean, reflect: true, attribute: 'validate-only' })
  public validateOnly = false;

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();

    createResizeObserverController(this, {
      callback: this._setAreaHeight,
    });

    addSafeEventListener(this, 'blur', this._handleBlur);
  }

  protected override updated(props: PropertyValues<this>): void {
    if (props.has('rows') || props.has('resize') || props.has('value')) {
      this._setAreaHeight();
    }
  }

  //#endregion

  //#region Internal methods

  private _setAutoHeight(): number {
    const { borderTopWidth, borderBottomWidth } = getComputedStyle(this._input);
    return (
      this._input.scrollHeight +
      asNumber(borderTopWidth) +
      asNumber(borderBottomWidth)
    );
  }

  protected _setAreaHeight(): void {
    if (this.resize === 'auto') {
      this._input.style.height = 'auto';
      this._input.style.height = `${this._setAutoHeight()}px`;
    } else {
      Object.assign(this._input.style, { height: undefined });
    }
  }

  protected _resolvePartNames() {
    return {
      container: true,
      prefixed: this._slots.hasAssignedElements('prefix', {
        selector: ':not([hidden])',
      }),
      suffixed: this._slots.hasAssignedElements('suffix', {
        selector: ':not([hidden])',
      }),
      filled: !!this.value,
    };
  }

  //#endregion

  //#region Event handlers

  private _handleSlotChange({
    isDefault,
  }: SlotChangeCallbackParameters<InferSlotNames<typeof Slots>>): void {
    if (isDefault) {
      const value = this._slots
        .getAssignedNodes('[default]', true)
        .map((node) => node.textContent?.trim())
        .filter((node) => Boolean(node))
        .join('\r\n');

      if (value !== this.value) {
        this.value = value;
      }
    }
  }

  protected _handleInput(): void {
    this._setTouchedState();
    this.value = this._input.value;
    this.emitEvent('igcInput', { detail: this.value });
  }

  protected _handleChange(): void {
    this._setTouchedState();
    this.value = this._input.value;
    this.emitEvent('igcChange', { detail: this.value });
  }

  //#endregion

  //#region Public methods

  /** Selects all text within the control. */
  public select(): void {
    this._input.select();
  }

  /** Sets the text selection range of the control */
  public setSelectionRange(
    start: number,
    end: number,
    direction: SelectionRangeDirection = 'none'
  ): void {
    this._input.setSelectionRange(start, end, direction);
  }

  /** Replaces the selected text in the control. */
  public setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: RangeTextSelectMode = 'preserve'
  ): void {
    this._input.setRangeText(replacement, start, end, selectMode);
    this.value = this._input.value;
  }

  /* blazorSuppress */
  public override scrollTo(options?: ScrollToOptions | undefined): void;
  /* blazorSuppress */
  public override scrollTo(x: number, y: number): void;
  public override scrollTo(x?: unknown, y?: unknown): void {
    x != null && y != null
      ? this._input.scrollTo(x as number, y as number)
      : this._input.scrollTo(x as ScrollToOptions);
  }

  //#endregion

  //#region Renderers

  protected _renderSlot(name: InferSlotNames<typeof Slots>) {
    const isHidden = !this._slots.hasAssignedElements(name, {
      selector: ':not([hidden])',
    });

    return html`
      <div part=${name} ?hidden=${isHidden}>
        <slot name=${name}></slot>
      </div>
    `;
  }

  protected _renderLabel() {
    return this.label
      ? html`
          <label part="label" for=${this.id || this._inputId}>
            ${this.label}
          </label>
        `
      : nothing;
  }

  protected _renderStandard() {
    return html`
      ${this._renderLabel()}
      <div part=${partMap(this._resolvePartNames())}>
        ${this._renderSlot('prefix')} ${this._renderInput()}
        ${this._renderSlot('suffix')}
      </div>
      ${this._renderValidationContainer()}
    `;
  }

  protected _renderMaterial() {
    return html`
      <div
        part=${partMap({
          ...this._resolvePartNames(),
          labelled: !!this.label,
          placeholder: !!this.placeholder,
        })}
      >
        <div part="start">${this._renderSlot('prefix')}</div>
        ${this._renderInput()}
        <div part="notch">${this._renderLabel()}</div>
        <div part="filler"></div>
        <div part="end">${this._renderSlot('suffix')}</div>
      </div>
      ${this._renderValidationContainer()}
    `;
  }

  protected _renderInput() {
    const describedBy = this._slots.hasAssignedElements('helper-text')
      ? 'helper-text'
      : nothing;

    return html`
      <slot style="display: none"></slot>
      <textarea
        id=${this.id || this._inputId}
        part="input"
        style=${styleMap({
          resize: this.resize === 'auto' ? 'none' : this.resize,
        })}
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
        aria-describedby=${describedBy}
      ></textarea>
    `;
  }

  protected _renderValidationContainer(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected override render() {
    return cache(
      this._themes.theme === 'material'
        ? this._renderMaterial()
        : this._renderStandard()
    );
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-textarea': IgcTextareaComponent;
  }
}

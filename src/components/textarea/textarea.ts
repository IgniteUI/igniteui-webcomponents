import { LitElement, type TemplateResult, html, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  queryAssignedNodes,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { createResizeObserverController } from '../common/controllers/resize-observer.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import {
  type FormValueOf,
  createFormValueState,
} from '../common/mixins/forms/form-value.js';
import { partMap } from '../common/part-map.js';
import { asNumber, createCounter, isEmpty } from '../common/util.js';
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

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  //#region Private properties and state

  private static readonly increment = createCounter();

  private readonly _themes = addThemingController(this, all);

  protected override get __validators() {
    return textAreaValidators;
  }

  protected override readonly _formValue: FormValueOf<string> =
    createFormValueState(this, { initialValue: '' });

  protected readonly _inputId = `textarea-${IgcTextareaComponent.increment()}`;

  @queryAssignedNodes({ flatten: true })
  private readonly _projected!: Node[];

  @queryAssignedElements({
    slot: 'prefix',
    selector: '[slot="prefix"]:not([hidden])',
  })
  protected readonly _prefixes!: HTMLElement[];

  @queryAssignedElements({
    slot: 'suffix',
    selector: '[slot="suffix"]:not([hidden])',
  })
  protected readonly _suffixes!: HTMLElement[];

  @query('textarea', true)
  private readonly _input!: HTMLTextAreaElement;

  private get _resizeStyles(): StyleInfo {
    return {
      resize: this.resize === 'auto' ? 'none' : this.resize,
    };
  }

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
   * If it is not specified, the default value is 2.
   *
   * @attr
   */
  @property({ type: Number })
  public rows = 2;

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the component
   *
   * @attr
   */
  @property()
  public set value(value: string) {
    this._formValue.setValueAndFormState(value);
    this._validate();
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

  //#region Watchers

  @watch('value')
  protected async _valueChanged(): Promise<void> {
    await this.updateComplete;
    this._setAreaHeight();
  }

  @watch('rows', { waitUntilFirstUpdate: true })
  @watch('resize', { waitUntilFirstUpdate: true })
  protected _setAreaHeight(): void {
    if (this.resize === 'auto') {
      this._input.style.height = 'auto';
      this._input.style.height = `${this._setAutoHeight()}px`;
    } else {
      Object.assign(this._input.style, { height: undefined });
    }
  }

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();

    createResizeObserverController(this, {
      callback: this._setAreaHeight,
    });

    this.addEventListener('focus', this._handleFocus);
    this.addEventListener('blur', this._handleBlur);
  }

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', (event) =>
      this._handleSlotChange(event)
    );
    return root;
  }

  //#endregion

  //#region Internal methods

  protected _resolvePartNames() {
    return {
      container: true,
      prefixed: this._prefixes.length > 0,
      suffixed: this._suffixes.length > 0,
      filled: !!this.value,
    };
  }

  private _setAutoHeight(): number {
    const { borderTopWidth, borderBottomWidth } = getComputedStyle(this._input);
    return (
      this._input.scrollHeight +
      asNumber(borderTopWidth) +
      asNumber(borderBottomWidth)
    );
  }

  //#endregion

  //#region Event handlers

  protected _handleSlotChange({ target }: Event): void {
    const slot = target as HTMLSlotElement;

    // Default slot used for declarative value projection
    if (!slot.name) {
      const value = this._projected
        .map((node) => node.textContent?.trim())
        .filter((node) => Boolean(node))
        .join('\r\n');

      if (value !== this.value) {
        this.value = value;
      }
    }

    this.requestUpdate();
  }

  protected _handleInput(): void {
    this.value = this._input.value;
    this.emitEvent('igcInput', { detail: this.value });
  }

  protected _handleChange(): void {
    this.value = this._input.value;
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected _handleFocus(): void {
    this._dirty = true;
  }

  protected _handleBlur(): void {
    this._validate();
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

  protected _renderPrefix() {
    return html`
      <div part="prefix" .hidden=${isEmpty(this._prefixes)}>
        <slot name="prefix"></slot>
      </div>
    `;
  }

  protected _renderSuffix() {
    return html`
      <div part="suffix" .hidden=${isEmpty(this._suffixes)}>
        <slot name="suffix"></slot>
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
        ${this._renderPrefix()} ${this._renderInput()} ${this._renderSuffix()}
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
        <div part="start">${this._renderPrefix()}</div>
        ${this._renderInput()}
        <div part="notch">${this._renderLabel()}</div>
        <div part="filler"></div>
        <div part="end">${this._renderSuffix()}</div>
      </div>
      ${this._renderValidationContainer()}
    `;
  }

  protected _renderInput() {
    return html`
      <slot style="display: none"></slot>
      <textarea
        id=${this.id || this._inputId}
        part="input"
        style=${styleMap(this._resizeStyles)}
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
        aria-invalid=${this.invalid ? 'true' : 'false'}
      ></textarea>
    `;
  }

  protected _renderValidationContainer(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected override render() {
    return this._themes.theme === 'material'
      ? this._renderMaterial()
      : this._renderStandard();
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-textarea': IgcTextareaComponent;
  }
}

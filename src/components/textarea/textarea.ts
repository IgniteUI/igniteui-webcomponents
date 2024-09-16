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

import { getThemeController, themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
import { asNumber, createCounter, partNameMap } from '../common/util.js';
import type { RangeTextSelectMode, SelectionRangeDirection } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles as shared } from './themes/shared/textarea.common.css.js';
import { styles } from './themes/textarea.base.css.js';
import { all } from './themes/themes.js';
import { textAreaValidators } from './validators.js';

export interface IgcTextareaEventMap {
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
@themes(all, { exposeController: true })
export default class IgcTextareaComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcTextareaEventMap, Constructor<LitElement>>(LitElement)
) {
  public static readonly tagName = 'igc-textarea';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTextareaComponent, IgcValidationContainerComponent);
  }

  protected override get __validators() {
    return textAreaValidators;
  }

  private static readonly increment = createCounter();
  protected inputId = `textarea-${IgcTextareaComponent.increment()}`;

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private _value = '';
  private observer!: ResizeObserver;

  @queryAssignedNodes({ flatten: true })
  private projected!: Array<Node>;

  @queryAssignedElements({ slot: 'prefix' })
  protected prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  protected suffixes!: Array<HTMLElement>;

  @query('textarea', true)
  private input!: HTMLTextAreaElement;

  private get resizeStyles(): StyleInfo {
    return {
      resize: this.resize === 'auto' ? 'none' : this.resize,
    };
  }

  protected get _isMaterial() {
    return getThemeController(this)?.theme === 'material';
  }

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
  public override autocapitalize!:
    | 'off'
    | 'none'
    | 'on'
    | 'sentences'
    | 'words'
    | 'characters';

  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents.
   * This allows a browser to display an appropriate virtual keyboard.
   *
   * [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
   *
   * @attr inputmode
   */
  @property({ attribute: 'inputmode' })
  public override inputMode!:
    | 'none'
    | 'text'
    | 'decimal'
    | 'numeric'
    | 'tel'
    | 'search'
    | 'email'
    | 'url';

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
  public resize: 'auto' | 'vertical' | 'none' = 'vertical';

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
    this._value = value ?? '';
    this.setFormValue(this._value ? this._value : null);
    this.updateValidity();
    this.setInvalidState();
  }

  public get value(): string {
    return this._value;
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

  @watch('value')
  protected async valueChanged() {
    await this.updateComplete;
    this.setAreaHeight();
  }

  @watch('rows', { waitUntilFirstUpdate: true })
  @watch('resize', { waitUntilFirstUpdate: true })
  protected setAreaHeight() {
    if (this.resize === 'auto') {
      this.input.style.height = 'auto';
      this.input.style.height = `${this.setAutoHeight()}px`;
    } else {
      Object.assign(this.input.style, { height: undefined });
    }
  }

  constructor() {
    super();
    this.addEventListener('focus', this.handleFocus);
    this.addEventListener('blur', this.handleBlur);
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this._defaultValue = this.value;
  }

  public override async connectedCallback() {
    super.connectedCallback();
    this.updateValidity();

    await this.updateComplete;

    this.setAreaHeight();
    this.observer = new ResizeObserver(() => this.setAreaHeight());
    this.observer.observe(this.input);
  }

  public override disconnectedCallback(): void {
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  /** Selects all text within the control. */
  public select() {
    this.input.select();
  }

  /** Sets the text selection range of the control */
  public setSelectionRange(
    start: number,
    end: number,
    direction: SelectionRangeDirection = 'none'
  ) {
    this.input.setSelectionRange(start, end, direction);
  }

  /** Replaces the selected text in the control. */
  public setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: RangeTextSelectMode = 'preserve'
  ) {
    this.input.setRangeText(replacement, start, end, selectMode);
    this.value = this.input.value;
  }

  /* blazorSuppress */
  public override scrollTo(options?: ScrollToOptions | undefined): void;
  /* blazorSuppress */
  public override scrollTo(x: number, y: number): void;
  public override scrollTo(x?: unknown, y?: unknown): void {
    x !== undefined && y !== undefined
      ? this.input.scrollTo(x as number, y as number)
      : this.input.scrollTo(x as ScrollToOptions);
  }

  protected resolvePartNames() {
    return {
      container: true,
      prefixed: this.prefixes.length > 0,
      suffixed: this.suffixes.length > 0,
      filled: !!this.value,
    };
  }

  private setAutoHeight() {
    const { borderTopWidth, borderBottomWidth } = getComputedStyle(this.input);
    return (
      this.input.scrollHeight +
      asNumber(borderTopWidth) +
      asNumber(borderBottomWidth)
    );
  }

  protected handleInput() {
    this.value = this.input.value;
    this.emitEvent('igcInput', { detail: this.value });
  }

  protected handleChange() {
    this.value = this.input.value;
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected handleFocus() {
    this._dirty = true;
  }

  protected handleBlur() {
    this.updateValidity();
    this.setInvalidState();
  }

  protected valueSlotChange() {
    const value = this.projected
      .map((node) => node.textContent?.trim())
      .filter((node) => Boolean(node));

    if (value.length) {
      this.value = value.join('\r\n');
    }
  }

  protected renderValueSlot() {
    return html`
      <slot style="display: none" @slotchange=${this.valueSlotChange}></slot>
    `;
  }

  protected renderValidationContainer(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected renderPrefix() {
    return html`
      <div part="prefix" .hidden=${this.prefixes.length < 1}>
        <slot name="prefix"></slot>
      </div>
    `;
  }

  protected renderSuffix() {
    return html`
      <div part="suffix" .hidden=${this.suffixes.length < 1}>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  protected renderLabel() {
    return this.label
      ? html`
          <label part="label" for=${this.id || this.inputId}>
            ${this.label}
          </label>
        `
      : nothing;
  }

  protected renderStandard() {
    return html`
      ${this.renderLabel()}
      <div part=${partNameMap(this.resolvePartNames())}>
        ${this.renderPrefix()} ${this.renderInput()} ${this.renderSuffix()}
      </div>
      ${this.renderValidationContainer()}
    `;
  }

  protected renderMaterial() {
    return html`
      <div
        part=${partNameMap({
          ...this.resolvePartNames(),
          labelled: this.label,
        })}
      >
        <div part="start">${this.renderPrefix()}</div>
        <div part="notch">${this.renderLabel()}</div>
        ${this.renderInput()}
        <div part="filler"></div>
        <div part="end">${this.renderSuffix()}</div>
      </div>
      ${this.renderValidationContainer()}
    `;
  }

  protected renderInput() {
    return html`
      ${this.renderValueSlot()}
      <textarea
        id=${this.id || this.inputId}
        part="input"
        style=${styleMap(this.resizeStyles)}
        @input=${this.handleInput}
        @change=${this.handleChange}
        placeholder=${ifDefined(this.placeholder)}
        .rows=${this.rows}
        .value=${live(this.value)}
        .wrap=${this.wrap}
        autocomplete=${ifDefined(this.autocomplete as any)}
        autocapitalize=${ifDefined(this.autocapitalize)}
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

  protected override render() {
    return this._isMaterial ? this.renderMaterial() : this.renderStandard();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-textarea': IgcTextareaComponent;
  }
}

import { LitElement, type TemplateResult, html, nothing } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';

import { themeSymbol, themes } from '../../theming/theming-decorator.js';
import type { Theme } from '../../theming/types.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/form-associated-required.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { createCounter, partNameMap } from '../common/util.js';
import { styles } from './themes/input.base.css.js';
import { styles as shared } from './themes/shared/input.common.css.js';
import { all } from './themes/themes.js';

export interface IgcInputEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  /* blazorSuppress */
  igcChange: CustomEvent<string>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

@themes(all, true)
@blazorDeepImport
export abstract class IgcInputBaseComponent extends FormAssociatedRequiredMixin(
  SizableMixin(
    EventEmitterMixin<IgcInputEventMap, Constructor<LitElement>>(LitElement)
  )
) {
  private declare readonly [themeSymbol]: Theme;

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  public static styles = [styles, shared];
  private static readonly increment = createCounter();

  protected inputId = `input-${IgcInputBaseComponent.increment()}`;

  /* blazorSuppress */
  /** The value attribute of the control. */
  public abstract value: string | Date | null;

  @query('input')
  protected input!: HTMLInputElement;

  @queryAssignedElements({ slot: 'prefix' })
  protected prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  protected suffixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'helper-text' })
  protected helperText!: Array<HTMLElement>;

  /**
   * Whether the control will have outlined appearance.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /**
   * Makes the control a readonly field.
   * @attr readonly
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  public readOnly = false;

  /* blazorCSSuppress */
  /**
   * Makes the control a readonly field.
   * @prop
   *
   * @deprecated since v4.4.0. Use the `readOnly` property instead.
   */
  @property({ attribute: false })
  public set readonly(value: boolean) {
    this.readOnly = value;
  }

  public get readonly() {
    return this.readOnly;
  }

  /**
   * The placeholder attribute of the control.
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

  constructor() {
    super();
    this.size = 'medium';
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.shadowRoot!.addEventListener('slotchange', this.handleSlotChange);
  }

  public override disconnectedCallback() {
    this.shadowRoot!.removeEventListener('slotchange', this.handleSlotChange);
    super.disconnectedCallback();
  }

  /** Sets focus on the control. */
  @alternateName('focusComponent')
  public override focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the control. */
  @alternateName('blurComponent')
  public override blur() {
    this.input.blur();
  }

  protected abstract renderInput(): TemplateResult;
  protected handleSlotChange = () => this.requestUpdate();

  protected resolvePartNames(base: string) {
    return {
      [base]: true,
      prefixed: this.prefixes.length > 0,
      suffixed: this.suffixes.length > 0,
      filled: !!this.value,
    };
  }

  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
  }

  /** Sets the text selection range of the control */
  public setSelectionRange(
    start: number,
    end: number,
    direction: 'backward' | 'forward' | 'none' = 'none'
  ) {
    this.input.setSelectionRange(start, end, direction);
  }

  /** Replaces the selected text in the input. */
  public setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    this.input.setRangeText(replacement, start, end, selectMode);
  }

  private renderPrefix() {
    return html`<div part="prefix">
      <slot name="prefix"></slot>
    </div>`;
  }

  private renderSuffix() {
    return html`<div part="suffix">
      <slot name="suffix"></slot>
    </div>`;
  }

  private renderLabel() {
    return this.label
      ? html`<label part="label" for="${this.inputId}"> ${this.label} </label>`
      : nothing;
  }

  private renderMaterial() {
    return html`
      <div
        part="${partNameMap({
          ...this.resolvePartNames('container'),
          labelled: this.label,
        })}"
      >
        <div part="start">${this.renderPrefix()}</div>
        ${this.renderInput()}
        <div part="notch">${this.renderLabel()}</div>
        <div part="filler"></div>
        <div part="end">${this.renderSuffix()}</div>
      </div>
      <div part="helper-text" .hidden="${this.helperText.length === 0}">
        <slot name="helper-text"></slot>
      </div>
    `;
  }

  private renderStandard() {
    return html`${this.renderLabel()}
      <div part="${partNameMap(this.resolvePartNames('container'))}">
        ${this.renderPrefix()} ${this.renderInput()} ${this.renderSuffix()}
      </div>
      <div part="helper-text" .hidden="${this.helperText.length === 0}">
        <slot name="helper-text"></slot>
      </div>`;
  }

  protected override render() {
    return html`
      ${this[themeSymbol] === 'material'
        ? this.renderMaterial()
        : this.renderStandard()}
    `;
  }
}

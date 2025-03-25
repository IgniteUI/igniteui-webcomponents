import { LitElement, type TemplateResult, html, nothing } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';

import { getThemeController, themes } from '../../theming/theming-decorator.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import { createCounter, partNameMap } from '../common/util.js';
import type { RangeTextSelectMode, SelectionRangeDirection } from '../types.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles } from './themes/input.base.css.js';
import { styles as shared } from './themes/shared/input.common.css.js';
import { all } from './themes/themes.js';

export interface IgcInputComponentEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  /* blazorSuppress */
  igcChange: CustomEvent<string>;
  /* blazorSuppress */
  igcCancel: CustomEvent<object>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

@blazorDeepImport
@themes(all, { exposeController: true })
export abstract class IgcInputBaseComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcInputComponentEventMap, Constructor<LitElement>>(
    LitElement
  )
) {
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

  @queryAssignedElements({ slot: 'helper-text' })
  protected _helperText!: Array<HTMLElement>;

  @queryAssignedElements({
    slot: 'prefix',
    selector: '[slot="prefix"]:not([hidden])',
  })
  protected prefixes!: Array<HTMLElement>;

  @queryAssignedElements({
    slot: 'suffix',
    selector: '[slot="suffix"]:not([hidden])',
  })
  protected suffixes!: Array<HTMLElement>;

  protected get _isMaterial() {
    return getThemeController(this)?.theme === 'material';
  }

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

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  /* alternateName: focusComponent */
  /** Sets focus on the control. */
  public override focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the control. */
  public override blur() {
    this.input.blur();
  }

  protected abstract renderInput(): TemplateResult;

  protected renderValidatorContainer(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  protected resolvePartNames(base: string) {
    return {
      [base]: true,
      prefixed: this.prefixes.length > 0,
      suffixed: this.suffixes.length > 0,
      filled: !!this.value,
    };
  }

  protected renderFileParts(): TemplateResult | typeof nothing {
    return nothing;
  }

  /** Sets the text selection range of the control */
  public setSelectionRange(
    start: number,
    end: number,
    direction: SelectionRangeDirection = 'none'
  ) {
    this.input.setSelectionRange(start, end, direction);
  }

  /** Replaces the selected text in the input. */
  public setRangeText(
    replacement: string,
    start: number,
    end: number,
    selectMode: RangeTextSelectMode = 'preserve'
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
      ? html`<label part="label" for=${this.inputId}> ${this.label} </label>`
      : nothing;
  }

  private renderMaterial() {
    return html`
      <div
        part=${partNameMap({
          ...this.resolvePartNames('container'),
          labelled: this.label,
        })}
      >
        <div part="start">${this.renderPrefix()}</div>
        ${this.renderInput()} ${this.renderFileParts()}
        <div part="notch">${this.renderLabel()}</div>
        <div part="filler"></div>
        <div part="end">${this.renderSuffix()}</div>
      </div>
      ${this.renderValidatorContainer()}
    `;
  }

  private renderStandard() {
    return html`${this.renderLabel()}
      <div part=${partNameMap(this.resolvePartNames('container'))}>
        ${this.renderPrefix()} ${this.renderFileParts()} ${this.renderInput()}
        ${this.renderSuffix()}
      </div>
      ${this.renderValidatorContainer()}`;
  }

  protected override render() {
    return this._isMaterial ? this.renderMaterial() : this.renderStandard();
  }
}

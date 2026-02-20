import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import type { ThemingController } from '../../theming/theming-controller.js';
import type { SlotController } from '../common/controllers/slot.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import { partMap } from '../common/part-map.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';

export interface IgcInputComponentEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  /* blazorSuppress */
  igcChange: CustomEvent<string>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

let nextId = 1;

@blazorDeepImport
@shadowOptions({ delegatesFocus: true })
export abstract class IgcInputBaseComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcInputComponentEventMap, Constructor<LitElement>>(
    LitElement
  )
) {
  protected abstract readonly _themes: ThemingController;
  protected abstract readonly _slots: SlotController<any>;

  protected readonly _inputId = `input-${nextId++}`;

  @query('input')
  protected readonly _input?: HTMLInputElement;

  /* blazorSuppress */
  /** The value attribute of the control.
   * Type varies based on the input type and can be string, Date or null.
   */
  public abstract value: string | Date | null;

  /**
   * Whether the control will have outlined appearance.
   *
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

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

  /**
   * Resolves the part names for the container based on the current state.
   * Used to apply conditional styling via CSS parts.
   */
  protected _resolvePartNames(base: string) {
    return {
      [base]: true,
      prefixed: this._slots.hasAssignedElements('prefix', {
        selector: '[slot="prefix"]:not([hidden])',
      }),
      suffixed: this._slots.hasAssignedElements('suffix', {
        selector: '[slot="suffix"]:not([hidden])',
      }),
      filled: !!this.value,
    };
  }

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

  protected abstract _renderInput(): TemplateResult;

  protected _renderFileParts(): TemplateResult | typeof nothing {
    return nothing;
  }

  private _renderValidatorContainer(): TemplateResult {
    return IgcValidationContainerComponent.create(this);
  }

  private _renderPrefix() {
    return html`
      <div part="prefix">
        <slot name="prefix"></slot>
      </div>
    `;
  }

  private _renderSuffix() {
    return html`
      <div part="suffix">
        <slot name="suffix"></slot>
      </div>
    `;
  }

  private _renderLabel() {
    return this.label
      ? html`<label part="label" for=${this._inputId}>${this.label}</label>`
      : nothing;
  }

  private _renderMaterial() {
    return html`
      <div
        part=${partMap({
          ...this._resolvePartNames('container'),
          labelled: !!this.label,
        })}
      >
        <div part="start">${this._renderPrefix()}</div>
        ${this._renderInput()} ${this._renderFileParts()}
        <div part="notch">${this._renderLabel()}</div>
        <div part="filler"></div>
        <div part="end">${this._renderSuffix()}</div>
      </div>
      ${this._renderValidatorContainer()}
    `;
  }

  private _renderStandard() {
    return html`
      ${this._renderLabel()}
      <div part=${partMap(this._resolvePartNames('container'))}>
        ${this._renderPrefix()}${this._renderFileParts()}
        ${this._renderInput()}${this._renderSuffix()}
      </div>
      ${this._renderValidatorContainer()}
    `;
  }

  protected override render() {
    return cache(
      this._themes.theme === 'material'
        ? this._renderMaterial()
        : this._renderStandard()
    );
  }
}

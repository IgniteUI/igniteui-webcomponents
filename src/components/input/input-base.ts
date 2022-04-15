import { html, LitElement, nothing, TemplateResult } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import type { ReactiveTheme, ThemeController } from '../../theming/types.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { partNameMap } from '../common/util.js';
import { styles } from './themes/light/input.base.css.js';
import { styles as bootstrap } from './themes/light/input.bootstrap.css.js';
import { styles as fluent } from './themes/light/input.fluent.css.js';
import { styles as indigo } from './themes/light/input.indigo.css.js';
import { styles as material } from './themes/light/input.material.css.js';

let nextId = 0;

export interface IgcInputEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  /* blazorSuppress */
  igcChange: CustomEvent<string>;
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

@themes({ bootstrap, material, fluent, indigo })
export abstract class IgcInputBaseComponent
  extends SizableMixin(
    EventEmitterMixin<IgcInputEventMap, Constructor<LitElement>>(LitElement)
  )
  implements ReactiveTheme
{
  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  public static styles = styles;

  protected inputId = `input-${nextId++}`;

  /** The value attribute of the control. */
  @blazorSuppress()
  public abstract value: string;

  @query('input', true)
  protected input!: HTMLInputElement;

  @queryAssignedElements({ slot: 'prefix' })
  protected prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  protected suffixes!: Array<HTMLElement>;

  protected themeController!: ThemeController;

  /** The name attribute of the control. */
  @property()
  public name!: string;

  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /** Makes the control a required field. */
  @property({ reflect: true, type: Boolean })
  public required = false;

  /** Makes the control a disabled field. */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /** Makes the control a readonly field. */
  @property({ reflect: true, type: Boolean })
  public readonly = false;

  /** The placeholder attribute of the control. */
  @property({ type: String })
  public placeholder!: string;

  /** The label for the control. */
  @property({ type: String })
  public label!: string;

  constructor() {
    super();
    this.size = 'medium';
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.shadowRoot!.addEventListener('slotchange', () => this.requestUpdate());
  }

  public themeAdopted(controller: ThemeController): void {
    this.themeController = controller;
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

  protected handleChange() {
    this.value = this.input.value;
    this.emitEvent('igcChange', { detail: this.value });
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
      <div part="helper-text">
        <slot name="helper-text"></slot>
      </div>
    `;
  }

  private renderStandard() {
    return html`${this.renderLabel()}
      <div part="${partNameMap(this.resolvePartNames('container'))}">
        ${this.renderPrefix()} ${this.renderInput()} ${this.renderSuffix()}
      </div>
      <div part="helper-text">
        <slot name="helper-text"></slot>
      </div>`;
  }

  protected override render() {
    return html`${this.themeController.theme === 'material'
      ? this.renderMaterial()
      : this.renderStandard()}`;
  }
}

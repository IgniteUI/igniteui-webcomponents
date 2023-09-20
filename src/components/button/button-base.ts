import { html, LitElement, TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { EventEmitterMixin } from '../common//mixins/event-emitter.js';
import { alternateName } from '../common/decorators/alternateName.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { Constructor } from '../common/mixins/constructor.js';
import { SizableMixin } from '../common/mixins/sizable.js';

export interface IgcButtonEventMap {
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

@blazorDeepImport
export abstract class IgcButtonBaseComponent extends SizableMixin(
  EventEmitterMixin<IgcButtonEventMap, Constructor<LitElement>>(LitElement)
) {
  public static readonly formAssociated = true;
  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  private __internals: ElementInternals;

  @query('[part="base"]', true)
  private nativeElement!: HTMLElement;

  protected _disabled = false;

  /**
   * The type of the button. Defaults to undefined.
   * @attr
   */
  @alternateName('displayType')
  @property()
  public type!: 'button' | 'reset' | 'submit';

  /**
   * The URL the button points to.
   * @attr
   */
  @property()
  public href!: string;

  /**
   * Prompts to save the linked URL instead of navigating to it.
   * @attr
   */
  @property()
  public download!: string;

  /**
   * Where to display the linked URL, as the name for a browsing context.
   * @attr
   */
  @property()
  public target!: '_blank' | '_parent' | '_self' | '_top' | undefined;

  /**
   * The relationship of the linked URL.
   * See https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types
   * @attr
   */
  @property()
  public rel!: string;

  /**
   * The disabled state of the component
   * @attr [disabled=false]
   */
  @property({ type: Boolean, reflect: true })
  public get disabled() {
    return this._disabled;
  }

  public set disabled(value: boolean) {
    const prev = this._disabled;
    this._disabled = value;
    this.toggleAttribute('disabled', Boolean(this._disabled));
    this.requestUpdate('disabled', prev);
  }

  /** Returns the HTMLFormElement associated with this element. */
  public get form() {
    return this.__internals.form;
  }

  constructor() {
    super();
    this.__internals = this.attachInternals();
  }

  /** Sets focus in the button. */
  @alternateName('focusComponent')
  public override focus(options?: FocusOptions) {
    this.nativeElement.focus(options);
  }

  /** Simulates a mouse click on the element */
  public override click() {
    this.nativeElement.click();
  }

  /** Removes focus from the button. */
  @alternateName('blurComponent')
  public override blur() {
    this.nativeElement.blur();
  }

  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
  }

  protected get classes() {
    return {};
  }

  protected handleClick() {
    switch (this.type) {
      case 'submit':
        return this.form?.requestSubmit();
      case 'reset':
        return this.form?.reset();
      default:
        return;
    }
  }

  protected formDisabledCallback(state: boolean) {
    this._disabled = state;
    this.requestUpdate();
  }

  private renderButton() {
    return html`
      <button
        part="base"
        .ariaLabel=${this.ariaLabel}
        .disabled=${this.disabled}
        class=${classMap(this.classes)}
        type=${ifDefined(this.type)}
        @click=${this.handleClick}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
      >
        ${this.renderContent()}
      </button>
    `;
  }

  private renderLinkButton() {
    return html`
      <a
        part="base"
        role="button"
        href=${ifDefined(this.href)}
        target=${ifDefined(this.target)}
        download=${ifDefined(this.download)}
        rel=${ifDefined(this.rel)}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        .ariaLabel=${this.ariaLabel}
        class=${classMap(this.classes)}
        @focus=${!this.disabled && this.handleFocus}
        @blur=${!this.disabled && this.handleBlur}
      >
        ${this.renderContent()}
      </a>
    `;
  }

  protected abstract renderContent(): TemplateResult;

  protected override render() {
    const link = this.href !== undefined;
    return link ? this.renderLinkButton() : this.renderButton();
  }
}

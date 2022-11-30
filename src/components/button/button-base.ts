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
  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @query('[part="base"]', true)
  private nativeElement!: HTMLElement;

  private _ariaLabel!: string;

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
   * Determines whether the button is disabled.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  public override set ariaLabel(value: string) {
    const oldVal = this._ariaLabel;
    this._ariaLabel = value;

    if (this.hasAttribute('aria-label')) {
      this.removeAttribute('aria-label');
    }
    this.requestUpdate('ariaLabel', oldVal);
  }

  @property({ attribute: 'aria-label' })
  public override get ariaLabel() {
    return this._ariaLabel;
  }

  /** Sets focus in the button. */
  @alternateName('focusComponent')
  public override focus(options?: FocusOptions) {
    this.nativeElement.focus(options);
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

  private renderButton() {
    return html`
      <button
        part="base"
        aria-label=${ifDefined(this.ariaLabel)}
        .disabled=${this.disabled}
        class=${classMap(this.classes)}
        type=${ifDefined(this.type)}
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
        aria-label=${ifDefined(this.ariaLabel)}
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

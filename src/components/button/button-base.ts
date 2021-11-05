import { html, LitElement, TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { EventEmitterMixin } from '../common//mixins/event-emitter.js';
import { alternateName } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor.js';
import { SizableMixin } from '../common/mixins/sizable.js';

export interface IgcButtonEventMap {
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

export abstract class IgcButtonBaseComponent extends SizableMixin(
  EventEmitterMixin<IgcButtonEventMap, Constructor<LitElement>>(LitElement)
) {
  /**
   * @private
   */
  @query('[part="base"]', true)
  private nativeElement!: HTMLElement;

  /**
   * The type of the button. Defaults to undefined.
   */
  @alternateName('displayType')
  @property()
  public type!: 'button' | 'reset' | 'submit';

  /** The URL the button points to. */
  @property()
  public href!: string;

  /** Prompts to save the linked URL instead of navigating to it. */
  @property()
  public download!: string;

  /** Where to display the linked URL, as the name for a browsing context. */
  @property()
  public target!: '_blank' | '_parent' | '_self' | '_top' | undefined;

  /**
   * The relationship of the linked URL.
   * See https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types
   */
  @property()
  public rel!: string;

  /**
   * Determines whether the button is disabled.
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Sets focus in the button. */
  @alternateName('focusComponent')
  public focus(options?: FocusOptions) {
    this.nativeElement.focus(options);
  }

  /** Removes focus from the button. */
  @alternateName('blurComponent')
  public blur() {
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

  protected renderButton() {
    return html`
      <button
        part="base"
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

  protected renderLinkButton() {
    return html`
      <a
        part="base"
        role="button"
        href=${ifDefined(this.href)}
        target=${ifDefined(this.target)}
        download=${ifDefined(this.download)}
        rel=${ifDefined(this.rel)}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        class=${classMap(this.classes)}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
      >
        ${this.renderContent()}
      </a>
    `;
  }

  protected abstract renderContent(): TemplateResult;

  protected render() {
    const link = !!this.href;
    return link ? this.renderLinkButton() : this.renderButton();
  }
}

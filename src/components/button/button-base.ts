import { LitElement, type TemplateResult, html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { EventEmitterMixin } from '../common//mixins/event-emitter.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { partNameMap } from '../common/util.js';

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

  protected __internals: ElementInternals;
  protected _disabled = false;

  @query('[part="base"]', true)
  private _nativeButton!: HTMLButtonElement;

  @state()
  protected focused = false;

  /* alternateName: displayType */
  /**
   * The type of the button. Defaults to `button`.
   * @attr
   */
  @property({ reflect: true })
  public type: 'button' | 'reset' | 'submit' = 'button';

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
  public target?: '_blank' | '_parent' | '_self' | '_top';

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
  public get disabled(): boolean {
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
    this.addEventListener('keyup', this.handleKeyUp);
    this.size = 'medium';
  }

  /* alternateName: focusComponent */
  /** Sets focus in the button. */
  public override focus(options?: FocusOptions) {
    this._nativeButton.focus(options);
  }

  /** Simulates a mouse click on the element */
  public override click() {
    this._nativeButton.click();
  }

  /* alternateName: blurComponent */
  /** Removes focus from the button. */
  public override blur() {
    this._nativeButton.blur();
  }

  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
    this.focused = false;
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

  protected handleMouseDown(event: PointerEvent) {
    event.preventDefault();
    this.focused = false;
  }

  protected handleKeyUp() {
    if (!this.focused) {
      this.focused = true;
    }
  }

  protected formDisabledCallback(state: boolean) {
    this._disabled = state;
    this.requestUpdate();
  }

  private renderButton() {
    return html`
      <button
        part=${partNameMap({
          base: true,
          focused: this.focused,
        })}
        aria-label=${ifDefined(this.ariaLabel ?? nothing)}
        ?disabled=${this.disabled}
        type=${ifDefined(this.type)}
        @click=${this.handleClick}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
        @pointerdown=${this.handleMouseDown}
      >
        ${this.renderContent()}
      </button>
    `;
  }

  private renderLinkButton() {
    return html`
      <a
        part=${partNameMap({
          base: true,
          focused: this.focused,
        })}
        role="button"
        aria-label=${ifDefined(this.ariaLabel ?? nothing)}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        href=${ifDefined(this.href)}
        target=${ifDefined(this.target)}
        download=${ifDefined(this.download)}
        rel=${ifDefined(this.rel)}
        @focus=${this.disabled ? nothing : this.handleFocus}
        @blur=${this.disabled ? nothing : this.handleBlur}
        @pointerdown=${this.disabled ? nothing : this.handleMouseDown}
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

import { LitElement, type TemplateResult, html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { EventEmitterMixin } from '../common//mixins/event-emitter.js';
import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { partNameMap } from '../common/util.js';

export interface IgcButtonEventMap {
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

@blazorDeepImport
export abstract class IgcButtonBaseComponent extends EventEmitterMixin<
  IgcButtonEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly formAssociated = true;

  protected static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  protected readonly __internals: ElementInternals;

  private readonly _focusRingManager = addKeyboardFocusRing(this);

  protected _disabled = false;

  @query('[part="base"]', true)
  private readonly _nativeButton!: HTMLButtonElement;

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
  public set disabled(value: boolean) {
    this._disabled = value;
    this.toggleAttribute('disabled', Boolean(this._disabled));
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  /* blazorCSSuppress */
  /* alternateType: object */
  /** Returns the HTMLFormElement associated with this element. */
  public get form(): HTMLFormElement | null {
    return this.__internals.form;
  }

  constructor() {
    super();
    this.__internals = this.attachInternals();
  }

  /* alternateName: focusComponent */
  /** Sets focus in the button. */
  public override focus(options?: FocusOptions): void {
    this._nativeButton.focus(options);
  }

  /** Simulates a mouse click on the element */
  public override click(): void {
    this._nativeButton.click();
  }

  /* alternateName: blurComponent */
  /** Removes focus from the button. */
  public override blur(): void {
    this._nativeButton.blur();
  }

  protected _handleClick(): void {
    if (this.type === 'submit') {
      this.form?.requestSubmit();
    } else if (this.type === 'reset') {
      this.form?.reset();
    }
  }

  protected formDisabledCallback(state: boolean): void {
    this._disabled = state;
    this.requestUpdate();
  }

  private renderButton() {
    return html`
      <button
        part=${partNameMap({
          base: true,
          focused: this._focusRingManager.focused,
        })}
        aria-label=${ifDefined(this.ariaLabel ?? nothing)}
        ?disabled=${this.disabled}
        type=${ifDefined(this.type)}
        @click=${this._handleClick}
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
          focused: this._focusRingManager.focused,
        })}
        role="button"
        aria-label=${ifDefined(this.ariaLabel ?? nothing)}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        href=${ifDefined(this.href)}
        target=${ifDefined(this.target)}
        download=${ifDefined(this.download)}
        rel=${ifDefined(this.rel)}
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

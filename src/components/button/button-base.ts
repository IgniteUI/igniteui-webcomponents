import { html, LitElement, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { addIdRefResolver } from '../common/controllers/id-resolver.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import { bindIf, getElementByIdFromRoot } from '../common/util.js';

export interface IgcButtonEventMap {
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

/**
 * Abstract base class shared by `igc-button` and `igc-icon-button`.
 *
 * Provides common form-association behavior, link-button rendering
 * (renders as `<a>` when `href` is set), keyboard focus-ring management,
 * and the Invoker Commands API (`command` / `commandfor`).
 *
 * Concrete subclasses must implement `_renderContent()` to supply the
 * visual content projected inside the native `<button>` or `<a>` element.
 */
/* omitModule */
/**
* Abstract base class shared by `igc-button` and `igc-icon-button`.
*
* Provides common form-association behavior, link-button rendering
* (renders as `<a>` when `href` is set), keyboard focus-ring management,
* and the Invoker Commands API (`command` / `commandfor`).
*
* Concrete subclasses must implement `_renderContent()` to supply the
* visual content projected inside the native `<button>` or `<a>` element.
*/
@blazorDeepImport
@shadowOptions({ delegatesFocus: true })
export abstract class IgcButtonBaseComponent extends EventEmitterMixin<
  IgcButtonEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly formAssociated = true;

  //#region Internal state

  private readonly _focusRingManager = addKeyboardFocusRing(this);
  private readonly _internals = addInternalsController(this);
  private readonly _resolver = addIdRefResolver(
    this,
    this._resolveCommandForElement
  );

  private _disabled = false;
  private _commandfor: string | null = null;
  private _commandForElement: Element | null = null;

  @query('[part="base"]', true)
  private readonly _nativeButton?: HTMLButtonElement | HTMLAnchorElement;

  //#endregion

  //#region Public properties

  /* alternateName: displayType */
  /**
   * The type of the button, which determines its behavior and semantics.
   * - `'button'` – no default action; useful for custom JavaScript handlers.
   * - `'submit'` – submits the associated form when clicked.
   * - `'reset'` – resets the associated form fields to their initial values.
   *
   * Ignored when the button is rendered as a link (i.e. `href` is set).
   * @attr type
   * @default 'button'
   */
  @property({ reflect: true })
  public type: 'button' | 'reset' | 'submit' = 'button';

  /**
   * The URL the button points to. When set, the component renders as an
   * `<a>` element instead of a `<button>`, enabling navigation on click.
   * Use together with `target`, `download`, and `rel` for full anchor semantics.
   * @attr href
   */
  @property()
  public href?: string;

  /**
   * Prompts the browser to download the linked resource rather than navigating
   * to it. The optional value is used as the suggested file name.
   * Only effective when `href` is set.
   * @attr download
   */
  @property()
  public download?: string;

  /**
   * Where to open the linked document. Only effective when `href` is set.
   * - `'_self'` – current browsing context (default browser behavior).
   * - `'_blank'` – new tab or window.
   * - `'_parent'` – parent browsing context; falls back to `_self` if none.
   * - `'_top'` – top-level browsing context; falls back to `_self` if none.
   * @attr target
   */
  @property()
  public target?: '_blank' | '_parent' | '_self' | '_top';

  /**
   * The relationship between the current document and the linked URL.
   * Accepts a space-separated list of link types (e.g. `'noopener noreferrer'`).
   * Only effective when `href` is set. When `target="_blank"` is used,
   * setting `rel="noopener noreferrer"` is strongly recommended for security.
   * @attr rel
   */
  @property()
  public rel?: string;

  /**
   * When set, the button will be disabled and non-interactive.
   *
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public set disabled(value: boolean) {
    this._disabled = value;
    this.toggleAttribute('disabled', Boolean(this._disabled));
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  /**
   * The command to invoke on the target element specified by `commandfor`.
   * Part of the [Invoker Commands](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) API.
   * Custom commands must start with two dashes (e.g. `'--my-command'`).
   * @attr command
   */
  @property({ reflect: true })
  public command?: string;

  /**
   * The ID of the target element for the invoker command.
   * Part of the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).
   * @attr commandfor
   */
  @property({ attribute: 'commandfor' })
  public set commandfor(value: string | null) {
    this._commandfor = value;
    if (value) {
      this._resolver.observe();
      this._commandForElement = getElementByIdFromRoot(this, value);
    } else {
      this._commandForElement = null;
      this._resolver.unobserve();
    }
  }

  public get commandfor(): string | null {
    return this._commandfor;
  }

  /* blazorSuppress */
  /* alternateType: object */
  /**
   * The target element for the invoker command. Resolved from the `commandfor` ID.
   */
  public get commandForElement(): Element | null {
    return this._commandForElement;
  }

  /* blazorSuppress */
  /* alternateType: object */
  public set commandForElement(value: Element | null) {
    this._commandForElement = value;
    this.requestUpdate();
  }

  /* blazorCSSuppress */
  /* alternateType: object */
  /**
   * The `<form>` element the button is associated with.
   * Resolved through the standard form-association mechanism — either the
   * closest ancestor `<form>` or the form referenced by the button's `form`
   * attribute. Returns `null` when no form is associated.
   * Relevant only when `type` is `'submit'` or `'reset'`.
   */
  public get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  //#endregion

  //#region Lifecycle

  protected override firstUpdated(): void {
    this.updateComplete.then(() => {
      if (this._commandfor) {
        this._commandForElement = getElementByIdFromRoot(
          this,
          this._commandfor
        );
        this.requestUpdate();
      }
    });
  }

  //#endregion

  //#region Event handlers

  protected _handleClick(): void {
    switch (this.type) {
      case 'submit':
        this.form?.requestSubmit();
        break;
      case 'reset':
        this.form?.reset();
        break;
    }
  }

  protected formDisabledCallback(state: boolean): void {
    this._disabled = state;
    this.requestUpdate();
  }

  //#endregion

  private _resolveCommandForElement(ids: Set<string>): void {
    if (this._commandfor && ids.has(this._commandfor)) {
      this._commandForElement = getElementByIdFromRoot(this, this._commandfor);
      this.requestUpdate();
    }
  }

  //#region Public API

  /** Simulates a mouse click on the button, triggering its click handler and any associated form action. */
  public override click(): void {
    this._nativeButton?.click();
  }

  //#endregion

  private _renderButton() {
    return html`
      <button
        command=${ifDefined(this.command)}
        .commandForElement=${this._commandForElement}
        part=${partMap({ base: true, focused: this._focusRingManager.focused })}
        aria-label=${bindIf(this.ariaLabel, this.ariaLabel)}
        ?disabled=${this.disabled}
        type=${ifDefined(this.type)}
        @click=${this._handleClick}
      >
        ${this._renderContent()}
      </button>
    `;
  }

  private _renderLinkButton() {
    return html`
      <a
        part=${partMap({ base: true, focused: this._focusRingManager.focused })}
        role="button"
        aria-label=${bindIf(this.ariaLabel, this.ariaLabel)}
        aria-disabled=${this.disabled}
        href=${ifDefined(this.href)}
        target=${ifDefined(this.target)}
        download=${ifDefined(this.download)}
        rel=${ifDefined(this.rel)}
      >
        ${this._renderContent()}
      </a>
    `;
  }

  protected abstract _renderContent(): TemplateResult;

  protected override render() {
    return this.href != null ? this._renderLinkButton() : this._renderButton();
  }
}

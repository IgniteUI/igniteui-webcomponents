import {
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common//mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import { bindIf, getRoot, isString } from '../common/util.js';

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
@blazorDeepImport
@shadowOptions({ delegatesFocus: true })
export abstract class IgcButtonBaseComponent extends EventEmitterMixin<
  IgcButtonEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly formAssociated = true;

  //#region Internal state

  private readonly _focusRingManager = addKeyboardFocusRing(this);
  protected readonly _internals = addInternalsController(this);

  protected _disabled = false;

  @query('[part="base"]', true)
  private readonly _nativeButton?: HTMLButtonElement;

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
   * The command to invoke on the target element specified by `commandForElement`.
   * Part of the [Invoker Commands](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API)
   * API. Built-in values include `'show-popover'`, `'hide-popover'`,
   * `'toggle-popover'`, and `'open'`. Custom commands must start with two
   * dashes (e.g. `'--my-command'`).
   * @attr command
   */
  @property({ reflect: true })
  public command?: string;

  /**
   * The element that the button's command is associated with.
   * This can be an actual Element or a string ID of an element in the same document.
   * If this property is set, the button will dispatch its command to the specified element instead of itself.
   * @attr commandfor
   */
  @property({ attribute: 'commandfor' })
  public commandForElement?: Element | string | null;

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

  //#region Lifecycle hooks

  protected override update(properties: PropertyValues<this>): void {
    if (properties.has('commandForElement')) {
      this.commandForElement = this._resolveCommandTarget();
    }

    super.update(properties);
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

  //#region Internal API

  private _resolveCommandTarget(): Element | null {
    const commandForElement = this.commandForElement;

    if (commandForElement instanceof Element) {
      return commandForElement;
    }

    return isString(commandForElement)
      ? getRoot(this).getElementById(commandForElement)
      : null;
  }

  //#endregion

  //#region Public API

  /* alternateName: focusComponent */
  /** Moves keyboard focus to the button. Accepts an optional `FocusOptions` object (e.g. `{ preventScroll: true }`). */
  public override focus(options?: FocusOptions): void {
    this._nativeButton?.focus(options);
  }

  /** Simulates a mouse click on the button, triggering its click handler and any associated form action. */
  public override click(): void {
    this._nativeButton?.click();
  }

  /* alternateName: blurComponent */
  /** Removes keyboard focus from the button. */
  public override blur(): void {
    this._nativeButton?.blur();
  }

  //#endregion

  private _renderButton() {
    const commandForElement = (this.commandForElement as Element) ?? null;

    return html`
      <button
        command=${ifDefined(this.command)}
        .commandForElement=${commandForElement}
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

import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  ariaBindings,
  hostAria,
} from '#internals/controllers/aria-projection.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { bindIf } from '#internals/utils/lit.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { all } from '#themes/tabs/themes/tab-themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { getTabHeader } from './tab-dom.js';
import { styles as shared } from './themes/shared/tab/tab.common.css.js';
import { styles } from './themes/tab.base.css.js';

const nextId = createIdGenerator('igc-tab');

export interface IgcTabComponentEventMap {
  igcNavigate: CustomEvent<void>;
}

/**
 * A tab nested in a tabs component.
 *
 * @element igc-tab
 *
 * @fires igcNavigate - Emitted when a plain click, Enter or Space activates a link tab,
 * before the browser follows the link. Cancel it to route on the client. Does not bubble.
 *
 * @slot - Renders the tab's content.
 * @slot label - Renders the tab header's label. Takes non-interactive content only.
 * @slot prefix - Renders the tab header's prefix. Takes non-interactive content only.
 * @slot suffix - Renders the tab header's suffix. Takes non-interactive content only.
 *
 * @csspart tab-header - The header of a single tab.
 * @csspart base - The wrapper of the prefix, the label and the suffix in the tab header.
 * @csspart prefix - Tab header's label prefix.
 * @csspart content - Tab header's label slot container.
 * @csspart suffix - Tab header's label suffix.
 * @csspart tab-body - Holds the body content of a single tab, only the body of the selected tab is visible.
 */
export default class IgcTabComponent extends EventEmitterMixin<IgcTabComponentEventMap>(
  HostAriaMixin(LitElement)
) {
  public static readonly tagName = 'igc-tab';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcTabComponent);
  }

  //#region Internal state & properties

  private readonly _tabId = nextId();
  private readonly _headerId = `${this._tabId}-header`;
  private readonly _contentId = `${this._tabId}-content`;

  @state()
  private _posInSet = 0;

  @state()
  private _setSize = 0;

  @state()
  private _isTabStop = false;

  //#endregion

  //#region Public properties

  /**
   * The tab item label.
   * @attr label
   */
  @property()
  public label = '';

  /**
   * Whether the tab is selected.
   *
   * @attr selected
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * Whether the tab is disabled.
   *
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * The URL of the tab. When set, the tab header renders as a link.
   *
   * A plain click selects the tab and follows the link; cancel `igcNavigate` to route
   * on the client. A click with a modifier key or the middle button opens the link
   * without selecting the tab. A disabled tab does not follow its link.
   *
   * @attr href
   */
  @property()
  public href?: string;

  /**
   * Where to open the URL when `href` is set. Without it, the target of the page's
   * `<base>` element applies. A target other than `_self` never changes the selection.
   *
   * @attr target
   */
  @property()
  public target?: '_blank' | '_parent' | '_self' | '_top';

  /**
   * Space-separated link types, used when `href` is set.
   *
   * @attr rel
   */
  @property()
  public rel?: string;

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();
    addThemingController(this, all);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.id = this.id || this._tabId;
  }

  protected override update(props: PropertyValues<this>): void {
    // A change between a link and a plain tab replaces the header element.
    const refocus = props.has('href') && getTabHeader(this)?.matches(':focus');

    super.update(props);

    if (refocus) {
      getTabHeader(this)?.focus({ preventScroll: true });
    }
  }

  //#endregion

  //#region Internal API

  /**
   * @hidden @internal
   * `isTabStop` keeps the strip reachable when no tab is selected.
   */
  public _setTabState(
    posInSet: number,
    setSize: number,
    isTabStop: boolean
  ): void {
    this._posInSet = posInSet;
    this._setSize = setSize;
    this._isTabStop = isTabStop;
  }

  //#endregion

  //#region Render

  private _renderHeader(): TemplateResult {
    const content = html`
      <div part="base">
        <slot name="prefix" part="prefix"></slot>
        <div part="content">
          <slot name="label">${this.label}</slot>
        </div>
        <slot name="suffix" part="suffix"></slot>
      </div>
    `;

    // An anchor has no disabled state, so a disabled link tab drops its URL.
    return this.href != null
      ? html`
          <a
            ${ariaBindings(hostAria(this))}
            part="tab-header"
            role="tab"
            id=${this._headerId}
            href=${bindIf(!this.disabled, this.href)}
            target=${ifDefined(this.target)}
            rel=${ifDefined(this.rel)}
            aria-disabled=${this.disabled}
            aria-selected=${this.selected}
            aria-controls=${this._contentId}
            aria-posinset=${this._posInSet || nothing}
            aria-setsize=${this._setSize || nothing}
            tabindex=${this.selected || this._isTabStop ? 0 : -1}
          >
            ${content}
          </a>
        `
      : html`
          <div
            ${ariaBindings(hostAria(this))}
            part="tab-header"
            role="tab"
            id=${this._headerId}
            aria-disabled=${this.disabled}
            aria-selected=${this.selected}
            aria-controls=${this._contentId}
            aria-posinset=${this._posInSet || nothing}
            aria-setsize=${this._setSize || nothing}
            tabindex=${this.selected || this._isTabStop ? 0 : -1}
          >
            ${content}
          </div>
        `;
  }

  protected override render(): TemplateResult {
    return html`
      ${this._renderHeader()}
      <div
        part="tab-body"
        role="tabpanel"
        id=${this._contentId}
        aria-labelledby=${this._headerId}
        tabindex=${this.selected ? 0 : -1}
        .inert=${!this.selected}
      >
        <slot></slot>
      </div>
    `;
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tab': IgcTabComponent;
  }
}

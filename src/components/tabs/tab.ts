import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles as shared } from './themes/shared/tab/tab.common.css.js';
import { styles } from './themes/tab.base.css.js';
import { all } from './themes/tab-themes.js';

let nextId = 1;

/**
 * A tab nested in a tabs component.
 *
 * @element igc-tab
 *
 * @slot - Renders the tab's content.
 * @slot label - Renders the tab header's label.
 * @slot prefix - Renders the tab header's prefix.
 * @slot suffix - Renders the tab header's suffix.
 *
 * @csspart tab-header - The header of a single tab.
 * @csspart prefix - Tab header's label prefix.
 * @csspart content - Tab header's label slot container.
 * @csspart suffix - Tab header's label suffix.
 * @csspart tab-body - Holds the body content of a single tab, only the body of the selected tab is visible.
 */
export default class IgcTabComponent extends LitElement {
  public static readonly tagName = 'igc-tab';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcTabComponent);
  }

  //#region Internal state & properties

  private readonly _instanceId = nextId++;
  private readonly _headerId = `igc-tab-header-${this._instanceId}`;
  private readonly _contentId = `igc-tab-content-${this._instanceId}`;

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
   * Determines whether the tab is selected.
   *
   * @attr selected
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * Determines whether the tab is disabled.
   *
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  //#endregion

  //#region Life-cycle hooks

  constructor() {
    super();
    addThemingController(this, all);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.id = this.id || `igc-tab-${this._instanceId}`;
  }

  //#endregion

  //#region Internal API

  /**
   * @hidden @internal
   * Applied by the parent `igc-tabs` whenever the tab set or the selection changes.
   *
   * `isTabStop` drives the roving tabindex, keeping the tab strip reachable even
   * when no tab is selected.
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

  protected override render(): TemplateResult {
    return html`
      <div
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
        <div part="base">
          <slot name="prefix" part="prefix"></slot>
          <div part="content">
            <slot name="label">${this.label}</slot>
          </div>
          <slot name="suffix" part="suffix"></slot>
        </div>
      </div>
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

import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { addAnimationController } from '../../animations/player.js';
import { growVerIn, growVerOut } from '../../animations/presets/grow/index.js';
import { addThemingController } from '../../theming/theming-controller.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
} from '../common/controllers/key-bindings.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import IgcIconComponent from '../icon/icon.js';
import type { ExpansionPanelIndicatorPosition } from '../types.js';
import { styles } from './themes/expansion-panel.base.css.js';
import { styles as shared } from './themes/shared/expansion-panel.common.css.js';
import { all } from './themes/themes.js';

export interface IgcExpansionPanelComponentEventMap {
  igcOpening: CustomEvent<IgcExpansionPanelComponent>;
  igcOpened: CustomEvent<IgcExpansionPanelComponent>;
  igcClosing: CustomEvent<IgcExpansionPanelComponent>;
  igcClosed: CustomEvent<IgcExpansionPanelComponent>;
}

let nextId = 1;

/**
 * The Expansion Panel Component provides a way to display information in a toggleable way -
 * compact summary view containing title and description and expanded detail view containing
 * additional content to the summary header.
 *
 * @element igc-expansion-panel
 *
 * @slot - renders the default content of the panel
 * @slot title - renders the title of the panel's header
 * @slot subtitle - renders the subtitle of the panel's header
 * @slot indicator - renders the expand/collapsed indicator
 * @slot indicator-expanded - renders the expanded state of the indicator
 *
 * @fires igcOpening - Emitted before opening the expansion panel.
 * @fires igcOpened - Emitted after the expansion panel is opened.
 * @fires igcClosing - Emitted before closing the expansion panel.
 * @fires igcClosed - Emitted after the expansion panel is closed.
 *
 * @csspart header - The container of the expansion indicator, title and subtitle.
 * @csspart title -  The title container.
 * @csspart subtitle - The subtitle container.
 * @csspart indicator - The indicator container.
 * @csspart content - The expansion panel's content wrapper.
 */
export default class IgcExpansionPanelComponent extends EventEmitterMixin<
  IgcExpansionPanelComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-expansion-panel';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcExpansionPanelComponent, IgcIconComponent);
  }

  private _panelId = `${IgcExpansionPanelComponent.tagName}-${nextId++}`;
  private readonly _headerRef = createRef<HTMLElement>();
  private readonly _panelRef = createRef<HTMLElement>();

  private readonly _player = addAnimationController(this, this._panelRef);
  private readonly _slots = addSlotController(this, {
    slots: setSlots('title', 'subtitle', 'indicator', 'indicator-expanded'),
  });

  /**
   * Indicates whether the contents of the control should be visible.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * The indicator position of the expansion panel.
   * @attr indicator-position
   */
  @property({ reflect: true, attribute: 'indicator-position' })
  public indicatorPosition: ExpansionPanelIndicatorPosition = 'start';

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      ref: this._headerRef,
      skip: () => this.disabled,
    })
      .setActivateHandler(this._toggle)
      .set([altKey, arrowDown], this._show)
      .set([altKey, arrowUp], this._hide);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this._panelId = this.id || this._panelId;
  }

  private _handleClick(): void {
    this._headerRef.value?.focus();
    this._toggle();
  }

  private async _setOpenState({
    state,
    withEvent,
  }: {
    state: boolean;
    withEvent?: boolean;
  }): Promise<void> {
    if (this.open === state) return;

    const args = { detail: this };
    const event = state ? 'igcOpening' : 'igcClosing';
    const eventDone = state ? 'igcOpened' : 'igcClosed';
    const animation = state ? growVerIn : growVerOut;

    if (withEvent && !this.emitEvent(event, { cancelable: true, ...args })) {
      return;
    }

    this.open = state;

    if (await this._player.playExclusive(animation())) {
      if (withEvent) {
        this.emitEvent(eventDone, args);
      }
    }
  }

  private async _toggle(): Promise<void> {
    this.open ? await this._hide() : await this._show();
  }

  private async _show(): Promise<void> {
    await this._setOpenState({ state: true, withEvent: true });
  }

  private async _hide(): Promise<void> {
    await this._setOpenState({ state: false, withEvent: true });
  }

  /** Toggles the panel open/close state. */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }

  /** Hides the panel content. */
  public async hide(): Promise<boolean> {
    if (!this.open) return false;

    await this._setOpenState({ state: false });
    return true;
  }

  /** Shows the panel content. */
  public async show(): Promise<boolean> {
    if (this.open) return false;

    await this._setOpenState({ state: true });
    return true;
  }

  private _renderIndicator() {
    const iconName = this.open ? 'collapse' : 'expand';
    const indicatorHidden =
      this.open && this._slots.hasAssignedElements('indicator-expanded');

    return html`
      <div part="indicator" aria-hidden="true">
        <slot name="indicator" ?hidden=${indicatorHidden}>
          <igc-icon name=${iconName} collection="default"></igc-icon>
        </slot>
        <slot name="indicator-expanded" ?hidden=${!indicatorHidden}></slot>
      </div>
    `;
  }

  private _renderHeader() {
    return html`
      <div
        ${ref(this._headerRef)}
        part="header"
        id="${this._panelId}-header"
        role="button"
        aria-expanded=${this.open}
        aria-disabled=${this.disabled}
        aria-controls="${this._panelId}-content"
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this.disabled ? nothing : this._handleClick}
      >
        ${this._renderIndicator()}
        <div>
          <slot name="title" part="title"></slot>
          <slot name="subtitle" part="subtitle"></slot>
        </div>
      </div>
    `;
  }

  private _renderPanel() {
    return html`
      <div
        ${ref(this._panelRef)}
        part="content"
        role="region"
        id="${this._panelId}-content"
        aria-labelledby="${this._panelId}-header"
        .inert=${!this.open}
        aria-hidden=${!this.open}
      >
        <slot></slot>
      </div>
    `;
  }

  protected override render() {
    return html`${this._renderHeader()}${this._renderPanel()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-expansion-panel': IgcExpansionPanelComponent;
  }
}

import { html, LitElement, nothing } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';

import { addAnimationController } from '../../animations/player.js';
import { growVerIn, growVerOut } from '../../animations/presets/grow/index.js';
import { addThemingController } from '../../theming/theming-controller.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
} from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { createCounter, isEmpty } from '../common/util.js';
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
  public static register() {
    registerComponent(IgcExpansionPanelComponent, IgcIconComponent);
  }

  private static readonly increment = createCounter();

  private _panelId!: string;
  private headerRef: Ref<HTMLDivElement> = createRef();
  private contentRef: Ref<HTMLDivElement> = createRef();

  private animationPlayer = addAnimationController(this, this.contentRef);

  @queryAssignedElements({ slot: 'indicator-expanded' })
  private _indicatorExpandedElements!: HTMLElement[];

  /**
   * Indicates whether the contents of the control should be visible.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public open = false;

  /**
   * Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
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
      ref: this.headerRef,
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true },
    })
      .setActivateHandler(this.toggleWithEvent)
      .set([altKey, arrowDown], this.openWithEvent)
      .set([altKey, arrowUp], this.closeWithEvent);
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  public override connectedCallback() {
    super.connectedCallback();
    this._panelId =
      this.id ||
      `igc-expansion-panel-${IgcExpansionPanelComponent.increment()}`;
  }

  private handleClick() {
    this.headerRef.value!.focus();
    this.toggleWithEvent();
  }

  private toggleWithEvent() {
    this.open ? this.closeWithEvent() : this.openWithEvent();
  }

  private async toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? growVerIn : growVerOut;

    const [_, event] = await Promise.all([
      this.animationPlayer.stopAll(),
      this.animationPlayer.play(animation()),
    ]);

    return event.type === 'finish';
  }

  private async openWithEvent() {
    if (
      this.open ||
      !this.emitEvent('igcOpening', { cancelable: true, detail: this })
    ) {
      return;
    }

    this.open = true;

    if (await this.toggleAnimation('open')) {
      this.emitEvent('igcOpened', { detail: this });
    }
  }

  private async closeWithEvent() {
    if (
      !(
        this.open &&
        this.emitEvent('igcClosing', { cancelable: true, detail: this })
      )
    ) {
      return;
    }

    this.open = false;

    if (await this.toggleAnimation('close')) {
      this.emitEvent('igcClosed', { detail: this });
    }
  }

  /** Toggles the panel open/close state. */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }

  /** Hides the panel content. */
  public async hide(): Promise<boolean> {
    if (!this.open) {
      return false;
    }

    this.open = false;
    await this.toggleAnimation('close');
    return true;
  }

  /** Shows the panel content. */
  public async show(): Promise<boolean> {
    if (this.open) {
      return false;
    }

    this.open = true;
    await this.toggleAnimation('open');
    return true;
  }

  private renderIndicatorTemplate() {
    const indicatorHidden =
      this.open && this._indicatorExpandedElements.length > 0;
    const indicatorExpandedHidden =
      isEmpty(this._indicatorExpandedElements) || !this.open;

    return html`
      <div part="indicator" aria-hidden="true">
        <slot name="indicator" ?hidden=${indicatorHidden}>
          <igc-icon
            name=${this.open ? 'collapse' : 'expand'}
            collection="default"
          >
          </igc-icon>
        </slot>
        <slot
          name="indicator-expanded"
          ?hidden=${indicatorExpandedHidden}
        ></slot>
      </div>
    `;
  }

  private renderHeaderTemplate() {
    return html`
      <div
        ${ref(this.headerRef)}
        part="header"
        id="${this._panelId}-header"
        role="button"
        aria-expanded=${this.open}
        aria-disabled=${this.disabled}
        aria-controls="${this._panelId}-content"
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this.disabled ? nothing : this.handleClick}
      >
        ${this.renderIndicatorTemplate()}
        <div>
          <slot name="title" part="title"></slot>
          <slot name="subtitle" part="subtitle"></slot>
        </div>
      </div>
    `;
  }

  private renderContentTemplate() {
    return html`
      <div
        ${ref(this.contentRef)}
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
    return html`${this.renderHeaderTemplate()}${this.renderContentTemplate()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-expansion-panel': IgcExpansionPanelComponent;
  }
}

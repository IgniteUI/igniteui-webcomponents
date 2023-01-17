import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/expansion-panel.base.css.js';
import { styles as bootstrap } from './themes/light/expansion-panel.bootstrap.css.js';
import { styles as fluent } from './themes/light/expansion-panel.fluent.css.js';
import { styles as indigo } from './themes/light/expansion-panel.indigo.css.js';
import { createCounter, registerComponent } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import {
  AnimationPlayer,
  growVerIn,
  growVerOut,
} from '../../animations/index.js';

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
 * @slot - default content of the expansion panel
 * @slot title - renders the title of the panel's header
 * @slot subtitle - renders the subtitle of the panel's header
 * @slot indicator - renders the expand/collapsed indicator
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
@themes({ bootstrap, fluent, indigo })
export default class IgcExpansionPanelComponent extends EventEmitterMixin<
  IgcExpansionPanelComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-expansion-panel';
  public static styles = styles;
  private static readonly increment = createCounter();
  private animationPlayer!: AnimationPlayer;

  public static register() {
    registerComponent(this, [IgcIconComponent]);
  }

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
  public indicatorPosition: 'start' | 'end' | 'none' = 'start';

  @query('[part~="header"]', true)
  protected panelHeader!: HTMLElement;

  @query('[part~="content"]', true)
  protected panelContent!: HTMLElement;

  private panelId!: string;

  public override connectedCallback() {
    super.connectedCallback();
    this.panelId =
      this.getAttribute('id') ||
      `igc-expansion-panel-${IgcExpansionPanelComponent.increment()}`;
  }

  public override firstUpdated() {
    this.animationPlayer = new AnimationPlayer(this.panelContent);
  }

  private handleClicked() {
    this.panelHeader!.focus();

    if (this.open) {
      this.closeWithEvent();
    } else {
      this.openWithEvent();
    }
  }

  private handleKeydown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'arrowdown':
      case 'down':
        if (event.altKey) {
          this.openWithEvent();
        }
        break;
      case 'arrowup':
      case 'up':
        if (event.altKey) {
          this.closeWithEvent();
        }
        break;
      case 'enter':
      case ' ':
        this.open ? this.closeWithEvent() : this.openWithEvent();
        break;
    }
  }

  private async toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? growVerIn : growVerOut;

    const [_, event] = await Promise.all([
      this.animationPlayer.stopAll(),
      this.animationPlayer.play(animation),
    ]);

    return event.type === 'finish';
  }

  /**
   * @private
   * Opens the panel.
   */
  private async openWithEvent() {
    if (this.open) {
      return;
    }

    const args = {
      cancelable: true,
      detail: this,
    };

    const allowed = this.emitEvent('igcOpening', args);

    if (!allowed) {
      return;
    }

    this.open = true;

    if (await this.toggleAnimation('open')) {
      this.emitEvent('igcOpened', { detail: this });
    }
  }

  /**
   * @private
   * Closes the panel.
   */
  private async closeWithEvent() {
    if (!this.open) {
      return;
    }

    const args = {
      cancelable: true,
      detail: this,
    };

    const allowed = this.emitEvent('igcClosing', args);

    if (!allowed) {
      return;
    }

    this.open = false;

    if (await this.toggleAnimation('close')) {
      this.emitEvent('igcClosed', { detail: this });
    }
  }

  /** Toggles panel open state. */
  public toggle(): void {
    this.open ? this.hide() : this.show();
  }

  /** Hides the panel content. */
  public hide(): void {
    if (this.open) {
      this.toggleAnimation('close');
    }

    this.open = false;
  }

  /** Shows the panel content. */
  public show(): void {
    if (!this.open) {
      this.toggleAnimation('open');
    }

    this.open = true;
  }

  private indicatorTemplate() {
    return html`
      <div part="indicator" aria-hidden="true">
        <slot name="indicator">
          <igc-icon
            name=${this.open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            collection="internal"
          >
          </igc-icon>
        </slot>
      </div>
    `;
  }

  private headerTemplate() {
    return html`
      <div
        part="header"
        id="${this.panelId!}-header"
        role="button"
        aria-expanded="${this.open}"
        aria-disabled="${this.disabled}"
        aria-controls="${this.panelId!}-content"
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this.handleClicked}
        @keydown=${this.handleKeydown}
      >
        ${this.indicatorTemplate()}
        <div>
          <slot name="title" part="title"></slot>
          <slot name="subtitle" part="subtitle"></slot>
        </div>
      </div>
    `;
  }

  private contentTemplate() {
    return html`
      <div
        part="content"
        role="region"
        id="${this.panelId!}-content"
        aria-labelledby="${this.panelId!}-header"
        aria-hidden=${!this.open}
      >
        <slot></slot>
      </div>
    `;
  }

  protected override render() {
    return html` ${this.headerTemplate()} ${this.contentTemplate()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-expansion-panel': IgcExpansionPanelComponent;
  }
}

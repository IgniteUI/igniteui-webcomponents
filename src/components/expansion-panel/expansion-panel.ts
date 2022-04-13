import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { expansionPanelStyles } from './expansion-panel.styles';

export interface IgcExpansionPanelComponentEventMap {
  igcContentOpening: CustomEvent<any>;
  igcContentOpened: CustomEvent<any>;
  igcContentClosing: CustomEvent<any>;
  igcContentClosed: CustomEvent<any>;
}

export default class IgcExpansionPanelComponent extends EventEmitterMixin<
  IgcExpansionPanelComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static tagName = 'igc-expansion-panel';

  public static styles = [expansionPanelStyles];

  @property({ reflect: true, type: Boolean })
  public open = false;

  @property({ reflect: true, type: Boolean })
  public disabled = false;

  constructor() {
    super();
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeydown);
  }

  private panelClicked(): void {
    if (this.disabled) {
      return;
    }

    if (this.open) {
      this.closeWithEvent();
    } else {
      this.openWithEvent();
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    console.log(event);
  }

  /**
   * @private
   * Opens the panel.
   */
  public openWithEvent() {
    if (this.open) {
      return;
    }

    const args = {
      cancelable: true,
      detail: this,
    };

    const allowed = this.emitEvent('igcContentOpening', args);

    if (!allowed) {
      return;
    }

    this.open = true;
    this.emitEvent('igcContentOpened', { detail: this });
  }

  /**
   * @private
   * Close the panel.
   */
  public closeWithEvent() {
    if (!this.open) {
      return;
    }

    const args = {
      cancelable: true,
      detail: this,
    };

    const allowed = this.emitEvent('igcContentClosing', args);

    if (!allowed) {
      return;
    }

    this.open = false;
    this.emitEvent('igcContentClosed', { detail: this });
  }

  /** Toggles panel open state. */
  public toggle(): void {
    this.open = !this.open;
  }

  /** Closes/Hides the panel. TODO: discuss naming */
  public hide(): void {
    this.open = false;
  }

  /** Opens/Shows the panel. TODO: discuss naming */
  public show(): void {
    this.open = true;
  }

  private iconTemplate() {
    return html`
      <div part="icon">
        <slot name="icon">
          <igc-icon
            name=${this.open ? 'keyboard_arrow_right' : 'keyboard_arrow_down'}
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
        role="heading"
        aria-level="3"
        @click=${this.panelClicked}
      >
        <div
          role="button"
          aria-expanded="${this.open}"
          aria-disabled="${this.disabled}"
          tabindex=${this.disabled ? '-1' : '0'}
          class="expansionPanel"
        >
          ${this.iconTemplate()}
          <div part="headerText">
            <slot name="title">ddd</slot>
            <slot name="subTitle">ddd</slot>
          </div>
        </div>
      </div>
    `;
  }

  private contentTemplate() {
    return html`
      <div part="content" role="region">
        <slot name="content" ?hidden=${!this.open}></slot>
      </div>
    `;
  }

  protected override render() {
    return html` ${this.headerTemplate()} ${this.contentTemplate()} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-expansion-panel': IgcExpansionPanelComponent;
  }
}

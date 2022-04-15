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

const TABBABLE_SELECTORS =
  'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

export default class IgcExpansionPanelComponent extends EventEmitterMixin<
  IgcExpansionPanelComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static tagName = 'igc-expansion-panel';

  public static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  public static styles = [expansionPanelStyles];

  @property({ reflect: true, type: Boolean })
  public open = false;

  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /** The indicator alignment of the expansion panel. */
  @property({ reflect: true, attribute: 'indicator-alignment' })
  public indicatorAlignment: 'start' | 'end' = 'start';

  private focusedElement!: HTMLElement;

  constructor() {
    super();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeydown);
  }

  private handleClicked(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    const el = event.target as HTMLElement;

    if (!el.matches(TABBABLE_SELECTORS)) {
      if (this.focusedElement) {
        this.focusedElement.blur();
        this.focus();
      }
    } else {
      const closestSlot = el.closest('[slot]');
      if (closestSlot) {
        const slot = closestSlot.getAttribute('slot');
        if (slot !== 'indicator') {
          return;
        }
      }
    }

    if (this.open) {
      this.closeWithEvent();
    } else {
      this.openWithEvent();
    }
  }

  public handleKeydown(event: KeyboardEvent) {
    //event.preventDefault();
    console.log(event);
    if (this.disabled) {
      event.preventDefault();
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

  /**
   * @private
   * Opens the panel.
   */
  private openWithEvent() {
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

  public focusIn(event: FocusEvent) {
    const el = event.target as HTMLElement;
    if (el.matches(TABBABLE_SELECTORS)) {
      this.focusedElement = el;
    }
  }

  /**
   * @private
   * Close the panel.
   */
  private closeWithEvent() {
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

  private indicatorTemplate() {
    return html`
      <div part="indicator">
        <slot name="indicator" @focusin=${this.focusIn}>
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
        role="heading"
        aria-level="3"
        @click=${this.handleClicked}
      >
        <div
          role="button"
          aria-expanded="${this.open}"
          aria-disabled="${this.disabled}"
          tabindex=${this.disabled ? '-1' : '0'}
          class="expansionPanel"
        >
          ${this.indicatorTemplate()}
          <div part="headerText" @focusin=${this.focusIn}>
            <slot name="title"></slot>
            <slot name="subTitle">Default subtitle</slot>
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
    return html` ${this.headerTemplate()} ${this.contentTemplate()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-expansion-panel': IgcExpansionPanelComponent;
  }
}

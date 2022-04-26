import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { expansionPanelStyles } from './expansion-panel.styles';

let NEXT_ID = 0;
export interface IgcExpansionPanelComponentEventMap {
  igcOpening: CustomEvent<any>;
  igcOpened: CustomEvent<any>;
  igcClosing: CustomEvent<any>;
  igcClosed: CustomEvent<any>;
}

const TABBABLE_SELECTORS =
  'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

/**
 * The Expansion Panel Component provides a way to display information in a toggleable way -
 * compact summary view containing title and description and expanded detail view containing
 * additional content to the summary header.
 *
 * @element igc-expansion-panel
 *
 * @slot title - renders the title of the panel's header
 * @slot subTitle - renders the subtitle of the panel's header
 * @slot indicator - renders the expand/collapsed indicator
 * @slot content - renders the content area of the panel
 *
 * @csspart header
 * @csspart headerText
 * @csspart indicator
 * @csspart content
 */
export default class IgcExpansionPanelComponent extends EventEmitterMixin<
  IgcExpansionPanelComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static tagName = 'igc-expansion-panel';

  public static styles = [expansionPanelStyles];

  /** Indicates whether the contents of the control should be visible. */
  @property({ reflect: true, type: Boolean })
  public open = false;

  /** Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions. */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /** The indicator alignment of the expansion panel. */
  @property({ reflect: true, attribute: 'indicator-alignment' })
  public indicatorAlignment: 'start' | 'end' = 'start';

  @query('[part~="header"]', true)
  protected panelHeader!: HTMLElement;

  private panelId!: string;

  constructor() {
    super();
  }

  public override connectedCallback() {
    super.connectedCallback();
    const id = this.getAttribute('id');
    this.panelId! = id ? id : 'igc-expansion-panel-' + ++NEXT_ID;
  }

  private handleClicked(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    const el = event.target as HTMLElement;

    if (!el.matches(TABBABLE_SELECTORS)) {
      this.panelHeader!.focus();
    }

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

    const allowed = this.emitEvent('igcOpening', args);

    if (!allowed) {
      return;
    }

    this.open = true;
    this.emitEvent('igcOpened', { detail: this });
  }

  /**
   * @private
   * Closes the panel.
   */
  private closeWithEvent() {
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
    this.emitEvent('igcClosed', { detail: this });
  }

  /** Toggles panel open state. */
  public toggle(): void {
    this.open = !this.open;
  }

  /** Hides the panel content. */
  public hide(): void {
    this.open = false;
  }

  /** Shows the panel content. */
  public show(): void {
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
        class="igx-expansion-panel__header-inner expansionPanel"
        role="button"
        aria-expanded="${this.open}"
        aria-disabled="${this.disabled}"
        aria-controls="${this.panelId!}-content"
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this.handleClicked}
        @keydown=${this.handleKeydown}
      >
        ${this.indicatorTemplate()}
        <div part="headerText" class="igx-expansion-panel__title-wrapper">
          <slot name="title"></slot>
          <slot name="subTitle"></slot>
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
      >
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

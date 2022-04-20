import '../button/icon-button';
import { html, LitElement } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { watch } from '../common/decorators';
import IgcTabComponent from './tab';
import IgcTabPanelComponent from './tab-panel';
import { styles } from './themes/light/tabs.base.css';

export default class IgcTabsComponent extends LitElement {
  public static readonly tagName = 'igc-tabs';

  public static override styles = styles;

  @queryAssignedElements({ selector: 'igc-tab' })
  private tabs!: Array<IgcTabComponent>;

  @queryAssignedElements({ slot: 'panel' })
  private panels!: Array<IgcTabPanelComponent>;

  @query('[part="headers-container"]')
  private headersContainer!: HTMLLIElement;

  @query('[part="selected-indicator"]', true)
  private selectedIndicator!: HTMLElement;

  @state() private hasLeftScrollButton = false;
  @state() private hasRightScrollButton = false;

  @property({ type: String })
  public selected = '';

  @property({ reflect: true })
  public alignment: 'start' | 'end' | 'center' | 'justify' = 'start';

  @property()
  public activation: 'focus' | 'select' = 'select';

  protected override firstUpdated() {
    if (!this.selected) {
      const firstTab = this.tabs.find((el) => !el.disabled);

      this.setSelectedTab(firstTab?.panel);
    } else {
      this.setSelectedTab(this.selected);
    }

    this.updateScrollButtons();
  }

  private setSelectedTab(tab?: string) {
    if (!tab) {
      this.hideSelectedIndicator();
      return;
    }

    if (tab !== this.selected) {
      this.selected = tab;
    }

    this.tabs.forEach((el) => (el.selected = el.panel === this.selected));
    this.panels.forEach((el) => (el.selected = el.name === this.selected));

    this.realignSelectedIndicator();
  }

  @watch('alignment', { waitUntilFirstUpdate: true })
  private realignSelectedIndicator() {
    const selectedHeader = this.tabs.find(
      (element) => element.panel === this.selected
    );
    this.alignSelectedIndicator(selectedHeader as HTMLElement);
  }

  private updateScrollButtons() {
    if (this.headersContainer.scrollWidth > this.headersContainer.offsetWidth) {
      this.hasLeftScrollButton = this.hasRightScrollButton = true;
    }
  }

  private alignSelectedIndicator(element: HTMLElement, duration = 0.3): void {
    if (this.selectedIndicator) {
      this.selectedIndicator.style.visibility = 'visible';
      this.selectedIndicator.style.transitionDuration =
        duration > 0 ? `${duration}s` : 'initial';
      this.selectedIndicator.style.width = `${element.offsetWidth}px`;
      this.selectedIndicator.style.transform = `translate(${element.offsetLeft}px)`;
    }
  }

  private hideSelectedIndicator(): void {
    if (this.selectedIndicator) {
      this.selectedIndicator.style.visibility = 'hidden';
    }
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tab = target.closest('igc-tab');

    if (!tab || tab.disabled) {
      return;
    }

    this.setSelectedTab(tab.panel);
  }

  protected override render() {
    return html`
      <div part="base" @click=${this.handleClick}>
        <div part="header-wrapper">
          ${this.hasLeftScrollButton
            ? html` <igc-icon-button></igc-icon-button> `
            : ''}
          <div part="headers-container" role="tablist">
            <slot></slot>
            <div part="selected-indicator"></div>
          </div>
          ${this.hasRightScrollButton
            ? html` <igc-icon-button></igc-icon-button> `
            : ''}
        </div>
        <div part="content">
          <slot name="panel"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tabs': IgcTabsComponent;
  }
}

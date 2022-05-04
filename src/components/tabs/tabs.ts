import '../button/icon-button';
import { html, LitElement } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { watch } from '../common/decorators';
import { themes } from '../../theming/theming-decorator.js';
import IgcTabComponent from './tab';
import IgcTabPanelComponent from './tab-panel';
import { styles } from './themes/light/tabs.base.css';
import { styles as bootstrap } from './themes/light/tabs.bootstrap.css.js';
import { styles as indigo } from './themes/light/tabs.indigo.css.js';

@themes({ bootstrap, indigo })
export default class IgcTabsComponent extends LitElement {
  public static readonly tagName = 'igc-tabs';

  public static override styles = styles;

  @queryAssignedElements({ selector: 'igc-tab' })
  private tabs!: Array<IgcTabComponent>;

  @queryAssignedElements({ slot: 'panel' })
  private panels!: Array<IgcTabPanelComponent>;

  @query('[part="headers-wrapper"]')
  private headersWrapper!: HTMLLIElement;

  @query('[part="headers-content"]')
  private headersContent!: HTMLLIElement; // == viewport

  @query('[part="headers-scroll"]')
  private headersScrollContainer!: HTMLLIElement; // == itemsContainer

  @query('[part="selected-indicator"]', true)
  private selectedIndicator!: HTMLElement;

  @state() private showStartScrollButton = false;
  @state() private showEndScrollButton = false;

  private offset = 0;

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

  private handleStartButtonClick() {
    this.updateScrollPosition(false);
  }

  private handleEndButtonClick() {
    this.updateScrollPosition(true);
  }

  private updateScrollPosition(scrollToEnd: boolean) {
    for (const tab of this.tabs) {
      if (scrollToEnd) {
        if (
          tab.offsetWidth + tab.offsetLeft >
          this.headersContent.offsetWidth + this.offset
        ) {
          this.scrollElement(tab, scrollToEnd);
          break;
        }
      } else {
        if (tab.offsetWidth + tab.offsetLeft >= this.offset) {
          this.scrollElement(tab, scrollToEnd);
          break;
        }
      }
    }
  }

  private scrollElement(element: any, scrollToEnd: boolean) {
    const headersContentWidth = this.headersContent.offsetWidth;

    this.offset = scrollToEnd
      ? element.offsetWidth + element.offsetLeft - headersContentWidth
      : element.offsetLeft;
    this.headersWrapper.style.transform = `translate(${-this.offset}px)`;
    this.updateScrollButtons();
  }

  private updateScrollButtons() {
    const headersScrollContainerWidth = this.headersScrollContainer.offsetWidth; //itemsContainerWidth
    const headersContentWidth = this.headersContent.offsetWidth; //viewportwidth

    if (headersScrollContainerWidth > this.offset + headersContentWidth) {
      this.showEndScrollButton = true;
    } else {
      this.showEndScrollButton = false;
    }

    if (this.offset !== 0) {
      this.showStartScrollButton = true;
    } else {
      this.showStartScrollButton = false;
    }
  }

  private alignSelectedIndicator(element: HTMLElement, duration = 0.3) {
    if (this.selectedIndicator) {
      this.selectedIndicator.style.visibility = 'visible';
      this.selectedIndicator.style.transitionDuration =
        duration > 0 ? `${duration}s` : 'initial';
      this.selectedIndicator.style.width = `${element.offsetWidth}px`;
      this.selectedIndicator.style.transform = `translate(${element.offsetLeft}px)`;
    }
  }

  private hideSelectedIndicator() {
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
        <div part="headers">
          ${this.showStartScrollButton
            ? html`
                <igc-icon-button
                  part="start-scroll-button"
                  size="medium"
                  variant="flat"
                  name="navigate_before"
                  collection="internal"
                  @click=${this.handleStartButtonClick}
                ></igc-icon-button>
              `
            : ''}
          <div part="headers-content">
            <div part="headers-wrapper">
              <div part="headers-scroll" role="tablist">
                <slot></slot>
              </div>
              <div part="selected-indicator"></div>
            </div>
          </div>
          ${this.showEndScrollButton
            ? html`
                <igc-icon-button
                  part="end-scroll-button"
                  size="medium"
                  variant="flat"
                  name="navigate_next"
                  collection="internal"
                  @click=${this.handleEndButtonClick}
                ></igc-icon-button>
              `
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

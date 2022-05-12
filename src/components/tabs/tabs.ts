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
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { Constructor } from '../common/mixins/constructor';

export interface IgcTabsEventMap {
  igcChange: CustomEvent<string>;
}

@themes({ bootstrap, indigo })
export default class IgcTabsComponent extends EventEmitterMixin<
  IgcTabsEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tabs';

  public static styles = styles;

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
  private resizeObserver: ResizeObserver | undefined;
  private _selected = '';

  @property({ type: String })
  public get selected(): string {
    return this._selected;
  }

  @property({ reflect: true })
  public alignment: 'start' | 'end' | 'center' | 'justify' = 'start';

  @property()
  public activation: 'auto' | 'manual' = 'auto';

  constructor() {
    super();

    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  public override firstUpdated() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateScrollButtons();
      this.realignSelectedIndicator();
    });

    this.resizeObserver.observe(this.headersContent);
    this.resizeObserver.observe(this.headersWrapper);

    if (!this._selected) {
      const firstTab = this.tabs.find((el) => !el.disabled);

      this.setSelectedTab(firstTab?.panel);
    } else {
      this.setSelectedTab(this._selected);
    }
  }

  public override disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  public select(selectedTab: string | HTMLElement) {
    const tab = this.tabs.find(
      (el) => el.panel === selectedTab || el === selectedTab
    );

    if (tab) {
      this.setSelectedTab(tab.panel);
      this.scrollTabIntoView(tab);
    }
  }

  private setSelectedTab(tab?: string) {
    if (!tab) {
      this.hideSelectedIndicator();
      return;
    }

    if (tab !== this._selected) {
      this._selected = tab;

      this.tabs.forEach((el) => (el.selected = el.panel === this._selected));
      this.panels.forEach((el) => (el.selected = el.name === this._selected));

      this.realignSelectedIndicator();
      this.emitEvent('igcChange', { detail: this._selected });
    }
  }

  @watch('alignment', { waitUntilFirstUpdate: true })
  private realignSelectedIndicator() {
    const selectedHeader = this.tabs.find(
      (element) => element.panel === this._selected
    );
    this.alignSelectedIndicator(selectedHeader as HTMLElement);
  }

  private scrollElement(element: any, scrollToEnd: boolean) {
    const headersContentWidth = this.headersContent.offsetWidth;

    this.offset = scrollToEnd
      ? element.offsetWidth + element.offsetLeft - headersContentWidth
      : element.offsetLeft;
    this.headersWrapper.style.transform = `translate(${-this.offset}px)`;
    this.updateScrollButtons();
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

  private handleStartButtonClick() {
    this.updateScrollPosition(false);
  }

  private handleEndButtonClick() {
    this.updateScrollPosition(true);
  }

  private updateScrollButtons() {
    const headersScrollContainerWidth = this.headersScrollContainer.offsetWidth;
    const headersContentWidth = this.headersContent.offsetWidth;

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

  private scrollTabIntoView(tab: IgcTabComponent) {
    if (this._selected) {
      // Scroll left if there is need
      if (tab.offsetLeft < this.offset) {
        this.scrollElement(tab, false);
      }

      // Scroll right if there is need
      const headersContentOffsetWidth = this.headersContent.offsetWidth;
      const delta =
        tab.offsetLeft +
        tab.offsetWidth -
        (headersContentOffsetWidth + this.offset);

      if (delta > 0) {
        this.scrollElement(tab, true);
      }

      if (tab.selected) {
        this.alignSelectedIndicator(tab);
      }
    } else {
      this.hideSelectedIndicator();
    }
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tab = target.closest('igc-tab');

    if (!tab || tab.disabled) {
      return;
    }

    tab.focus();
    this.setSelectedTab(tab.panel);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    const activeEl = document.activeElement;
    const enabledTabs = this.tabs.filter((el) => !el.disabled);

    let index = enabledTabs.indexOf(activeEl as IgcTabComponent);

    switch (key) {
      case 'ArrowLeft':
        index = (enabledTabs.length + index - 1) % enabledTabs.length;
        break;
      case 'ArrowRight':
        index = (index + 1) % enabledTabs.length;
        break;
      case 'Home':
        index = 0;
        break;
      case 'End':
        index = enabledTabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        this.setSelectedTab(enabledTabs[index].panel);
        break;
      default:
        return;
    }

    enabledTabs[index].focus({ preventScroll: true });

    if (this.activation === 'auto') {
      this.setSelectedTab(enabledTabs[index].panel);
    }

    this.scrollTabIntoView(enabledTabs[index]);

    event.preventDefault();
  };

  protected override render() {
    return html`
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tabs': IgcTabsComponent;
  }
}

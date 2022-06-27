import '../button/icon-button';
import { html, LitElement, nothing } from 'lit';
import {
  eventOptions,
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import { themes } from '../../theming/theming-decorator.js';
import type IgcTabComponent from './tab.js';
import type IgcTabPanelComponent from './tab-panel.js';
import { styles } from './themes/light/tabs.base.css.js';
import { styles as bootstrap } from './themes/light/tabs.bootstrap.css.js';
import { styles as fluent } from './themes/light/tabs.fluent.css.js';
import { styles as indigo } from './themes/light/tabs.indigo.css.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';
import { getOffset } from '../common/util.js';

export interface IgcTabsEventMap {
  igcChange: CustomEvent<string>;
}

/**
 * Represents tabs component
 *
 * @element igc-tabs
 *
 * @fires igcChange - Emitted when the selected tab changes.
 *
 * @slot - Renders the tab header.
 * @slot panel - Renders the tab content.
 *
 * @csspart headers - The wrapper of the tabs including the headers content and the scroll buttons.
 * @csspart headers-content - The container for the tab headers.
 * @csspart headers-wrapper - The wrapper for the tab headers and the selected indicator.
 * @csspart headers-scroll - The container for the headers.
 * @csspart selected-indicator - The selected indicator.
 * @csspart start-scroll-button - The start scroll button displayed when the tabs overflow.
 * @csspart end-scroll-button - The end scroll button displayed when the tabs overflow.
 * @csspart content - The container for the tabs content.
 */
@themes({ bootstrap, fluent, indigo })
export default class IgcTabsComponent extends EventEmitterMixin<
  IgcTabsEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tabs';

  public static styles = styles;

  @queryAssignedElements({ selector: 'igc-tab' })
  protected tabs!: Array<IgcTabComponent>;

  @queryAssignedElements({ slot: 'panel' })
  protected panels!: Array<IgcTabPanelComponent>;

  @query('slot', true)
  protected defaultSlot!: HTMLSlotElement;

  @query('[part="headers-wrapper"]', true)
  protected wrapper!: HTMLElement;

  @query('[part="headers-content"]', true)
  protected container!: HTMLElement;

  @query('[part="selected-indicator"]', true)
  protected selectedIndicator!: HTMLElement;

  @state()
  protected showScrollButtons = false;

  @state()
  protected disableStartScrollButton = true;

  @state()
  protected disableEndScrollButton = false;

  @state()
  protected _selected = '';

  protected resizeObserver!: ResizeObserver;

  protected get selectedTab() {
    return this.tabs.find((tab) => tab.panel === this._selected);
  }

  protected get enabledTabs() {
    return this.tabs.filter((tab) => !tab.disabled);
  }

  protected get isLTR() {
    return (
      window.getComputedStyle(this).getPropertyValue('direction') === 'ltr'
    );
  }

  /** Returns the currently selected tab. */
  public get selected(): string {
    return this._selected;
  }

  /** Sets the alignment for the tab headers */
  @property({ reflect: true })
  public alignment: 'start' | 'end' | 'center' | 'justify' = 'start';

  /**
   * Determines the tab activation. When set to auto,
   * the tab is instantly selected while navigating with the Left/Right Arrows, Home or End keys
   * and the corresponding panel is displayed.
   * When set to manual, the tab is only focused. The selection happens after pressing Space or Enter.
   */
  @property()
  public activation: 'auto' | 'manual' = 'auto';

  @watch('alignment', { waitUntilFirstUpdate: true })
  protected alignIndicator() {
    const styles: Partial<CSSStyleDeclaration> = {
      visibility: this.selected ? 'visible' : 'hidden',
      transitionDuration: '0.3s',
    };

    if (this.selected) {
      Object.assign(styles, {
        width: `${this.selectedTab!.offsetWidth}px`,
        transform: `translate(${
          this.isLTR
            ? getOffset(this.selectedTab!, this.wrapper).left
            : getOffset(this.selectedTab!, this.wrapper).right
        }px)`,
      });
    }

    Object.assign(this.selectedIndicator.style, styles);
  }

  protected override async firstUpdated() {
    this.showScrollButtons =
      this.container.scrollWidth > this.container.clientWidth;

    await this.updateComplete;

    this.setSelectedTab(
      this.tabs.filter((tab) => tab.selected).at(-1) ?? this.enabledTabs.at(0)
    );

    this.setupObserver();
    this.setAriaAttributes();
    this.defaultSlot.addEventListener('slotchange', this.handleSlotChange);
  }

  public override disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.defaultSlot.removeEventListener('slotchange', this.handleSlotChange);
    super.disconnectedCallback();
  }

  protected updateButtonsOnResize() {
    // Hide the buttons in the resize observer callback and synchronously update the DOM
    // in order to get the actual size
    this.showScrollButtons = false;
    this.performUpdate();

    this.showScrollButtons =
      this.container.scrollWidth > this.container.clientWidth;

    this.updateScrollButtons();
  }

  protected updateScrollButtons() {
    const { scrollLeft, offsetWidth } = this.container,
      { scrollWidth } = this.wrapper;

    this.disableEndScrollButton =
      scrollWidth <= Math.abs(scrollLeft) + offsetWidth;
    this.disableStartScrollButton = scrollLeft === 0;
  }

  protected setupObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateButtonsOnResize();
      this.alignIndicator();
    });

    [this.container, this.wrapper, ...this.tabs].forEach((element) =>
      this.resizeObserver.observe(element)
    );
  }

  private setSelectedTab(tab?: IgcTabComponent) {
    if (!tab) {
      return;
    }

    if (tab.panel !== this._selected) {
      this._selected = tab.panel;

      this.tabs.forEach((el) => (el.selected = el.panel === this._selected));
      this.panels.forEach(
        (el) => (el.style.display = el.id === this._selected ? 'block' : 'none')
      );
      tab.scrollIntoView();
      this.alignIndicator();
    }
  }

  protected scrollByTabOffset(direction: 'start' | 'end') {
    const { scrollLeft, offsetWidth } = this.container;
    const LTR = this.isLTR,
      next = direction === 'end';

    const pivot = Math.abs(next ? offsetWidth + scrollLeft : scrollLeft);

    let amount = this.tabs
      .map((tab) => ({
        start: LTR
          ? getOffset(tab, this.wrapper).left
          : Math.abs(getOffset(tab, this.wrapper).right),
        width: tab.offsetWidth,
      }))
      .filter((offset) =>
        next ? offset.start + offset.width > pivot : offset.start < pivot
      )
      .at(next ? 0 : -1)!.width;

    amount *= next ? 1 : -1;
    this.container.scrollBy({ left: this.isLTR ? amount : -amount });
  }

  protected handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tab = target.closest('igc-tab');

    if (!tab || tab.disabled) {
      return;
    }

    tab.focus();
    this.setSelectedTab(tab);
    this.emitEvent('igcChange', { detail: this._selected });
  }

  protected handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    const enabledTabs = this.enabledTabs;

    let index = enabledTabs.indexOf(document.activeElement as IgcTabComponent);

    switch (key) {
      case 'ArrowLeft':
        index = this.isLTR
          ? (enabledTabs.length + index - 1) % enabledTabs.length
          : (index + 1) % enabledTabs.length;
        break;
      case 'ArrowRight':
        index = this.isLTR
          ? (index + 1) % enabledTabs.length
          : (enabledTabs.length + index - 1) % enabledTabs.length;
        break;
      case 'Home':
        index = 0;
        break;
      case 'End':
        index = enabledTabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        this.setSelectedTab(enabledTabs[index]);
        break;
      default:
        return;
    }

    enabledTabs[index].focus({ preventScroll: true });

    if (this.activation === 'auto') {
      this.setSelectedTab(enabledTabs[index]);
      this.emitEvent('igcChange', { detail: this._selected });
    } else {
      enabledTabs[index].scrollIntoView();
    }

    event.preventDefault();
  };

  private setAriaAttributes() {
    this.tabs.forEach((tab) => {
      const panel = this.panels.find((el) => el.id === tab.panel);
      if (panel) {
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', tab.getAttribute('id')!);
      }
    });
  }

  @eventOptions({ passive: true })
  protected handleScroll() {
    this.updateScrollButtons();
  }

  protected handleSlotChange = () => {
    this.resizeObserver?.disconnect();

    if (!this.selectedTab) {
      this.tabs.forEach((tab) => (tab.selected = false));
      this.panels.forEach((panel) => (panel.style.display = 'none'));
      this._selected = '';
    }
    this.setAriaAttributes();
    this.setupObserver();
  };

  /** Selects the specified tab and displays the corresponding panel.  */
  public select(name: string) {
    this.setSelectedTab(this.tabs.find((el) => el.panel === name));
  }

  protected renderScrollButton(direction: 'start' | 'end') {
    const start = direction === 'start';

    return this.showScrollButtons
      ? html`<igc-icon-button
          size="large"
          variant="flat"
          collection="internal"
          part="${direction}-scroll-button"
          name="navigate_${start ? 'before' : 'next'}"
          .disabled=${start
            ? this.disableStartScrollButton
            : this.disableEndScrollButton}
          @click=${() => this.scrollByTabOffset(direction)}
        ></igc-icon-button>`
      : nothing;
  }

  protected override render() {
    return html`
      <div part="headers">
        ${this.renderScrollButton('start')}
        <div part="headers-content" @scroll=${this.handleScroll}>
          <div part="headers-wrapper">
            <div
              part="headers-scroll"
              role="tablist"
              @click=${this.handleClick}
              @keydown=${this.handleKeyDown}
            >
              <slot></slot>
            </div>
            <div part="selected-indicator"></div>
          </div>
        </div>
        ${this.renderScrollButton('end')}
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

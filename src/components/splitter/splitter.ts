import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { addSlotController } from '../common/controllers/slot.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { SplitterOrientation } from '../types.js';
import IgcSplitterBarComponent from './splitter-bar.js';
import IgcSplitterPaneComponent from './splitter-pane.js';
import { styles } from './themes/splitter.base.css.js';

export default class IgcSplitterComponent extends LitElement {
  public static readonly tagName = 'igc-splitter';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcSplitterComponent,
      IgcSplitterPaneComponent,
      IgcSplitterBarComponent
    );
  }

  private readonly _slots = addSlotController(this, {
    onChange: this._handleSlotChange,
  });

  /** Returns all of the splitter's panes. */
  @queryAssignedElements({ selector: 'igc-splitter-pane' })
  public panes!: Array<IgcSplitterPaneComponent>;

  /** Gets/Sets the orientation of the splitter.
   *
   * @remarks
   * Default value is `horizontal`.
   */
  @property({ reflect: true })
  public orientation: SplitterOrientation = 'horizontal';

  protected _handleSlotChange(): void {
    this.initPanes();
  }

  private _assignFlexOrder() {
    let k = 0;
    this.panes.forEach((pane) => {
      pane.order = k;
      k += 2;
    });
  }

  /**
   * @hidden @internal
   * This method inits panes with properties.
   */
  private initPanes() {
    this.panes.forEach((pane) => {
      pane.owner = this;
      if (this.orientation === 'horizontal') {
        pane.minWidth = pane.minSize ?? '0';
        pane.maxWidth = pane.maxSize ?? '100%';
      } else {
        pane.minHeight = pane.minSize ?? '0';
        pane.maxHeight = pane.maxSize ?? '100%';
      }
    });
    this._assignFlexOrder();
    //in igniteui-angular this is added as feature but i haven't checked why
    // if (this.panes.filter(x => x.collapsed).length > 0) {
    //   // if any panes are collapsed, reset sizes.
    //   this.resetPaneSizes();
    // }
  }

  /**
   * @hidden @internal
   * This method reset pane sizes.
   */
  private resetPaneSizes() {
    if (this.panes) {
      // if type is changed runtime, should reset sizes.
      this.panes.forEach((pane) => {
        pane.size = 'auto';
        pane.minWidth = '0';
        pane.maxWidth = '100%';
        pane.minHeight = '0';
        pane.maxHeight = '100%';
      });
    }
  }

  @watch('orientation', { waitUntilFirstUpdate: true })
  protected orientationChange(): void {
    this.setAttribute('aria-orientation', this.orientation);
    this.resetPaneSizes();
    this.initPanes();
  }

  constructor() {
    super();

    this.addEventListener('sizeChanged', (event: any) => {
      event.stopPropagation();
      this.initPanes();
    });
  }

  private _renderBar(order: number) {
    return html` <igc-splitter-bar .order=${order}></igc-splitter-bar> `;
  }

  protected override render() {
    return html`
      <slot></slot>
      ${this.panes.map((pane, i) => {
        const isLast = i === this.panes.length - 1;
        return html`${!isLast ? this._renderBar(pane.order + 1) : ''}`;
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter': IgcSplitterComponent;
  }
}

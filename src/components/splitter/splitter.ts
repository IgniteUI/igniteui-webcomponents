import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { addSlotController } from '../common/controllers/slot.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { SplitterOrientation } from '../types.js';
import IgcSplitterBarComponent from './splitter-bar.js';
import IgcSplitterPaneComponent from './splitter-pane.js';
import { styles } from './themes/splitter.base.css.js';

/**
 * The Splitter component provides a framework for a simple layout, splitting the view horizontally or vertically
 * into multiple smaller resizable and collapsible areas.
 *
 * @element igc-splitter
 * *
 * @fires igc... - Emitted when ... .
 *
 * @csspart ... - ... .
 */
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

  //#region Properties

  private readonly _slots = addSlotController(this, {
    onChange: this._handleSlotChange,
  });

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      ariaOrientation: 'horizontal',
    },
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

  /**
   * Sets the visibility of the handle and expanders in the splitter bar.
   * @remarks
   * Default value is `false`.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public nonCollapsible = false;

  //#endregion

  //#region Internal API

  @watch('orientation', { waitUntilFirstUpdate: true })
  protected _orientationChange(): void {
    this._internals.setARIA({ ariaOrientation: this.orientation });
    this._resetPaneSizes();
    this._initPanes();
  }

  constructor() {
    super();

    this.addEventListener('sizeChanged', (event: any) => {
      event.stopPropagation();
      this._initPanes();
    });
  }

  protected _handleSlotChange(): void {
    this._initPanes();
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
  private _initPanes() {
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
  private _resetPaneSizes() {
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

  private paneBefore!: IgcSplitterPaneComponent;
  private paneAfter!: IgcSplitterPaneComponent;
  private initialPaneBeforeSize!: number;
  private initialPaneAfterSize!: number;

  private _handleMovingStart(event: CustomEvent<IgcSplitterPaneComponent>) {
    // Handle the moving start event
    const panes = this.panes;
    this.paneBefore = event.detail;
    this.paneAfter = panes[panes.indexOf(this.paneBefore) + 1];

    const paneRect = this.paneBefore.getBoundingClientRect();
    this.initialPaneBeforeSize =
      this.orientation === 'horizontal' ? paneRect.width : paneRect.height;

    const siblingRect = this.paneAfter.getBoundingClientRect();
    this.initialPaneAfterSize =
      this.orientation === 'horizontal'
        ? siblingRect.width
        : siblingRect.height;
  }
  private _handleMoving(event: CustomEvent<number>) {
    const [paneSize, siblingSize] = this.calcNewSizes(event.detail);

    this.paneBefore.size = paneSize + 'px';
    this.paneAfter.size = siblingSize + 'px';
  }

  //I am not sure if this code changes anything, it looks like it works without it as well,
  // however I found a bug, which I am not sure how to reproduce it and still haven't encaountered it with this code
  private _handleMovingEnd(event: CustomEvent<number>) {
    const [paneSize, siblingSize] = this.calcNewSizes(event.detail);

    if (this.paneBefore.isPercentageSize) {
      // handle % resizes
      const totalSize = this.getTotalSize();
      const percentPaneSize = (paneSize / totalSize) * 100;
      this.paneBefore.size = percentPaneSize + '%';
    } else {
      // px resize
      this.paneBefore.size = paneSize + 'px';
    }

    if (this.paneAfter.isPercentageSize) {
      // handle % resizes
      const totalSize = this.getTotalSize();
      const percentSiblingPaneSize = (siblingSize / totalSize) * 100;
      this.paneAfter.size = percentSiblingPaneSize + '%';
    } else {
      // px resize
      this.paneAfter.size = siblingSize + 'px';
    }
  }

  /**
   * @hidden @internal
   * Calculates new sizes for the panes based on move delta and initial sizes
   */
  private calcNewSizes(delta: number): [number, number] {
    let finalDelta: number;
    const min =
      Number.parseInt(
        this.paneBefore.minSize ? this.paneBefore.minSize : '0',
        10
      ) || 0;
    const minSibling =
      Number.parseInt(
        this.paneAfter.minSize ? this.paneAfter.minSize : '0',
        10
      ) || 0;
    const max =
      Number.parseInt(
        this.paneBefore.maxSize ? this.paneBefore.maxSize : '0',
        10
      ) || this.initialPaneBeforeSize + this.initialPaneAfterSize - minSibling;
    const maxSibling =
      Number.parseInt(
        this.paneAfter.maxSize ? this.paneAfter.maxSize : '0',
        10
      ) || this.initialPaneBeforeSize + this.initialPaneAfterSize - min;

    if (delta < 0) {
      const maxPossibleDelta = Math.min(
        this.initialPaneBeforeSize - min,
        maxSibling - this.initialPaneAfterSize
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta)) * -1;
    } else {
      const maxPossibleDelta = Math.min(
        max - this.initialPaneBeforeSize,
        this.initialPaneAfterSize - minSibling
      );
      finalDelta = Math.min(maxPossibleDelta, Math.abs(delta));
    }
    return [
      this.initialPaneBeforeSize + finalDelta,
      this.initialPaneAfterSize - finalDelta,
    ];
  }

  private getTotalSize() {
    const computed = document.defaultView?.getComputedStyle(this);
    const totalSize =
      this.orientation === 'horizontal'
        ? computed?.getPropertyValue('width')
        : computed?.getPropertyValue('height');
    return Number.parseFloat(totalSize ? totalSize : '0');
  }
  //#endregion

  //#region Rendering

  private _renderBar(order: number, i: number) {
    return html`
      <igc-splitter-bar
        .order=${order}
        .orientation=${this.orientation}
        .paneBefore=${this.panes[i]}
        .paneAfter=${this.panes[i + 1]}
        @igcMovingStart=${this._handleMovingStart}
        @igcMoving=${this._handleMoving}
        @igcMovingEnd=${this._handleMovingEnd}
      ></igc-splitter-bar>
    `;
  }

  protected override render() {
    return html`
      <slot></slot>
      ${this.panes.map((pane, i) => {
        const isLast = i === this.panes.length - 1;
        return html`${!isLast ? this._renderBar(pane.order + 1, i) : ''}`;
      })}
    `;
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter': IgcSplitterComponent;
  }
}

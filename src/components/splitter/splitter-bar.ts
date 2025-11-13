import { ContextConsumer } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { splitterContext } from '../common/context.js';
import { addInternalsController } from '../common/controllers/internals.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
} from '../common/controllers/key-bindings.js';
import { createMutationController } from '../common/controllers/mutation-observer.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import { addResizeController } from '../resize-container/resize-controller.js';
import type { SplitterOrientation } from '../types.js';
import type IgcSplitterComponent from './splitter.js';
import IgcSplitterPaneComponent from './splitter-pane.js';
import { styles } from './themes/splitter-bar.base.css.js';

export interface IgcSplitterBarComponentEventMap {
  igcMovingStart: CustomEvent<IgcSplitterPaneComponent>;
  igcMoving: CustomEvent<number>;
  igcMovingEnd: CustomEvent<number>;
}
export default class IgcSplitterBarComponent extends EventEmitterMixin<
  IgcSplitterBarComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-splitter-bar';
  public static styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterBarComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      ariaOrientation: 'horizontal',
    },
  });

  protected _contextConsumer = new ContextConsumer(this, {
    context: splitterContext,
    subscribe: true,
    callback: (value) => {
      this._handleContextChange(value);
    },
  });

  protected _resolvePartNames() {
    return {
      base: true,
      [this._orientation.toString()]: true,
    };
  }

  private _internalStyles: StyleInfo = {};

  private _orientation: SplitterOrientation = 'horizontal';
  private _splitter?: IgcSplitterComponent;

  private get _siblingPanes(): Array<IgcSplitterPaneComponent | null> {
    if (!this._splitter || !this._splitter.panes) {
      return [];
    }

    const panes = this._splitter.panes;
    const ownerPaneIndex = panes.findIndex((p) => p.shadowRoot?.contains(this));

    if (ownerPaneIndex === -1) {
      return [];
    }

    const currentPane = panes[ownerPaneIndex];
    const nextPane = panes[ownerPaneIndex + 1] || null;
    return [currentPane, nextPane];
  }

  private get _resizeDisallowed() {
    return !!this._siblingPanes.find(
      (x) => x && (x.resizable === false || x.collapsed === true)
    );
  }

  /**
   * Returns the appropriate cursor style based on orientation and resize state.
   */
  private get _cursor(): string {
    if (this._resizeDisallowed) {
      return 'default';
    }
    return this._orientation === 'horizontal' ? 'col-resize' : 'row-resize';
  }

  constructor() {
    super();
    this._internalStyles = { '--cursor': this._cursor };

    addResizeController(this, {
      mode: 'immediate',
      updateTarget: false,
      resizeTarget: () => {
        // we don’t resize the bar, we just use the delta
        const pane = this._siblingPanes[0];
        return (
          (pane?.shadowRoot?.querySelector('[part="base"]') as HTMLElement) ??
          this
        );
      },
      start: () => {
        if (this._resizeDisallowed) {
          return false;
        }
        this.emitEvent('igcMovingStart', { detail: this._siblingPanes[0]! });
        return true;
      },
      resize: ({ state }) => {
        const isHorizontal = this._orientation === 'horizontal';
        const delta = isHorizontal ? state.deltaX : state.deltaY;

        if (delta !== 0) {
          this.emitEvent('igcMoving', { detail: delta });
        }
      },
      end: ({ state }) => {
        const isHorizontal = this._orientation === 'horizontal';
        const delta = isHorizontal ? state.deltaX : state.deltaY;
        if (delta !== 0) {
          this.emitEvent('igcMovingEnd', { detail: delta });
        }
      },
      cancel: () => {},
    });

    addKeybindings(this)
      .set(arrowUp, this._handleResizePanes)
      .set(arrowDown, this._handleResizePanes)
      .set(arrowLeft, this._handleResizePanes)
      .set(arrowRight, this._handleResizePanes)
      .set([ctrlKey, arrowUp], this._handleExpandPanes)
      .set([ctrlKey, arrowDown], this._handleExpandPanes)
      .set([ctrlKey, arrowLeft], this._handleExpandPanes)
      .set([ctrlKey, arrowRight], this._handleExpandPanes);
    //addThemingController(this, all);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this._siblingPanes?.forEach((pane) => {
      this._createSiblingPaneMutationController(pane!);
    });
  }

  private _handleResizePanes(event: KeyboardEvent) {
    if (this._resizeDisallowed) {
      return false;
    }
    if (
      (event.key === arrowUp || event.key === arrowDown) &&
      this._orientation === 'horizontal'
    ) {
      return false;
    }
    if (
      (event.key === arrowLeft || event.key === arrowRight) &&
      this._orientation === 'vertical'
    ) {
      return false;
    }
    let delta = 0;
    if (event.key === arrowUp || event.key === arrowLeft) {
      delta = -10;
    } else {
      delta = 10;
    }
    this.emitEvent('igcMovingStart', { detail: this._siblingPanes[0]! });
    this.emitEvent('igcMoving', { detail: delta });
    this.emitEvent('igcMovingEnd', { detail: delta });
    return true;
  }

  private _handleExpandPanes(event: KeyboardEvent) {
    if (this._splitter?.nonCollapsible) {
      return;
    }
    const { prevButtonHidden, nextButtonHidden } =
      this._getExpanderHiddenState();

    if (
      ((event.key === arrowUp && this._orientation === 'vertical') ||
        (event.key === arrowLeft && this._orientation === 'horizontal')) &&
      !prevButtonHidden
    ) {
      this._handleExpanderClick(true);
    }
    if (
      ((event.key === arrowDown && this._orientation === 'vertical') ||
        (event.key === arrowRight && this._orientation === 'horizontal')) &&
      !nextButtonHidden
    ) {
      this._handleExpanderClick(false);
    }
  }

  private _createSiblingPaneMutationController(pane: IgcSplitterPaneComponent) {
    createMutationController(pane, {
      callback: () => {
        Object.assign(this._internalStyles, { '--cursor': this._cursor });
        this.requestUpdate();
      },
      filter: [IgcSplitterPaneComponent.tagName],
      config: {
        attributeFilter: ['collapsed', 'resizable'],
        subtree: true,
      },
    });
  }

  private _handleContextChange(splitter: IgcSplitterComponent) {
    this._splitter = splitter;
    if (this._orientation !== splitter.orientation) {
      this._orientation = splitter.orientation;
      this._internals.setARIA({ ariaOrientation: this._orientation });
      Object.assign(this._internalStyles, { '--cursor': this._cursor });
    }
    this.requestUpdate();
  }

  private _handleExpanderClick(start: boolean, event?: PointerEvent) {
    // Prevent resize controller from starting
    event?.stopPropagation();

    const prevSibling = this._siblingPanes[0]!;
    const nextSibling = this._siblingPanes[1]!;

    let target: IgcSplitterPaneComponent;
    if (start) {
      // if prev is clicked when next pane is hidden, show next pane, else hide prev pane.
      target = nextSibling.collapsed ? nextSibling : prevSibling;
    } else {
      // if next is clicked when prev pane is hidden, show prev pane, else hide next pane.
      target = prevSibling.collapsed ? prevSibling : nextSibling;
    }
    target.toggle();
    target.emitEvent('igcToggle', { detail: target });
  }

  private _getExpanderHiddenState() {
    const [prev, next] = this._siblingPanes;
    return {
      prevButtonHidden: !!(prev?.collapsed && !next?.collapsed),
      nextButtonHidden: !!(next?.collapsed && !prev?.collapsed),
    };
  }

  private _renderBarControls() {
    if (this._splitter?.nonCollapsible) {
      return nothing;
    }
    const { prevButtonHidden, nextButtonHidden } =
      this._getExpanderHiddenState();
    return html`
      <div
        part="expander-start"
        ?hidden=${prevButtonHidden}
        @pointerdown=${(e: PointerEvent) => this._handleExpanderClick(true, e)}
      ></div>
      <div part="handle"></div>
      <div
        part="expander-end"
        ?hidden=${nextButtonHidden}
        @pointerdown=${(e: PointerEvent) => this._handleExpanderClick(false, e)}
      ></div>
    `;
  }

  protected override render() {
    return html`
      <div
        part=${partMap(this._resolvePartNames())}
        style=${styleMap(this._internalStyles)}
        tabindex="0"
      >
        ${this._renderBarControls()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter-bar': IgcSplitterBarComponent;
  }
}

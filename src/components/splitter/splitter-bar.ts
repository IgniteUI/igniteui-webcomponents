import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { asNumber } from '../common/util.js';
import { addResizeController } from '../resize-container/resize-controller.js';
import type { SplitterOrientation } from '../types.js';
import type IgcSplitterPaneComponent from './splitter-pane.js';

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

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterBarComponent);
  }

  private _order = -1;

  /**
   * Gets/sets the bar's visual position in the layout.
   * @hidden @internal
   */
  @property({ type: Number })
  public set order(value: number) {
    this._order = asNumber(value);
    this.style.order = this._order.toString();
  }

  public get order(): number {
    return this._order;
  }

  /** Gets/Sets the orientation of the splitter.
   *
   * @remarks
   * Default value is `horizontal`.
   */
  @property({ reflect: true })
  public orientation: SplitterOrientation = 'horizontal';

  @property({ attribute: false })
  public paneBefore?: IgcSplitterPaneComponent;

  @property({ attribute: false })
  public paneAfter?: IgcSplitterPaneComponent;

  constructor() {
    super();
    addResizeController(this, {
      mode: 'immediate',
      resizeTarget: (): HTMLElement => this.paneBefore ?? this, // we don’t resize the bar, we just use the delta
      start: () => {
        if (
          !this.paneBefore?.resizable ||
          !this.paneAfter?.resizable ||
          this.paneBefore.collapsed
        ) {
          return false;
        }
        this.emitEvent('igcMovingStart', { detail: this.paneBefore });
        return true;
      },
      resize: ({ state }) => {
        const isHorizontal = this.orientation === 'horizontal';
        const delta = isHorizontal ? state.deltaX : state.deltaY;

        if (delta !== 0) {
          this.emitEvent('igcMoving', { detail: delta });
        }
      },
      end: ({ state }) => {
        const isHorizontal = this.orientation === 'horizontal';
        const delta = isHorizontal ? state.deltaX : state.deltaY;
        if (delta !== 0) {
          this.emitEvent('igcMovingEnd', { detail: delta });
        }
      },
      cancel: () => {},
    });
    //addThemingController(this, all);
  }

  protected override render() {
    return html`
      <div part="base">
        <div part="expander--start"></div>
        <div part="handle"></div>
        <div part="expander--end"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter-bar': IgcSplitterBarComponent;
  }
}

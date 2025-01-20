import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';

import {
  addKeybindings,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partNameMap } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import { addRefactoredResizeController } from './resize-controller.js';
import { styles } from './themes/resize-container.base.css.js';
import type {
  ResizeCallbackParams,
  ResizeGhostFactory,
  ResizeMode,
  ResizeState,
} from './types.js';
// import { addScrollBehavior } from './auto-scroll.js';

export interface IgcResizeContainerComponentEventMap {
  igcResizeStart: CustomEvent<ResizeCallbackParams>;
  igcResize: CustomEvent<ResizeCallbackParams>;
  igcResizeEnd: CustomEvent<ResizeCallbackParams>;
  igcResizeCancel: CustomEvent<unknown>;
}

/* blazorSuppress */
/**
 * @element igc-resize-container
 *
 * @slot - renders the element(s) that should be resized
 */
export default class IgcResizeContainerComponent extends EventEmitterMixin<
  IgcResizeContainerComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-resize-container';
  public static styles = [styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcResizeContainerComponent, IgcIconComponent);
  }

  private _controller: ReturnType<typeof addRefactoredResizeController>;

  private _mode: ResizeMode = 'immediate';
  private _ghostFactory?: ResizeGhostFactory;

  /** The DOM container doing the actual resizing */
  private _container: Ref<HTMLElement> = createRef();

  /** Resize component adorners */
  private _adorners: Record<'side' | 'corner' | 'bottom', Ref<HTMLElement>> = {
    side: createRef(),
    corner: createRef(),
    bottom: createRef(),
  };

  // REVIEW: Scroll behavior
  // private _scroll = addScrollBehavior(this);

  @state()
  private _state!: ResizeState;

  @state()
  private _isResizing = false;

  @state()
  private _isActive = false;

  @property({ attribute: false })
  public set ghostFactory(value: ResizeGhostFactory) {
    this._ghostFactory = value;
    this._controller.setConfig({ deferredFactory: this._ghostFactory });
  }

  public get ghostFactory(): ResizeGhostFactory | undefined {
    return this._ghostFactory;
  }

  /** Get/Set the mode of the resizing operation. */
  @property()
  public set mode(value: ResizeMode) {
    this._mode = value;
    this._controller.setConfig({ mode: this._mode });
  }

  public get mode(): ResizeMode {
    return this._mode;
  }

  constructor() {
    super();

    this._controller = addRefactoredResizeController(this, {
      ref: [this._adorners.side, this._adorners.corner, this._adorners.bottom],
      mode: this._mode,
      deferredFactory: this._ghostFactory,
      start: this._handleResizeStart,
      resize: this._handleResize,
      end: this._handleResizeEnd,
      resizeTarget: () => this._container.value!,
    });

    addKeybindings(this, {
      skip: () => !this._isResizing,
      bindingDefaults: { preventDefault: true },
    }).set(escapeKey, this._handleResizeCancel);
  }

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  private _setState(params: ResizeCallbackParams): void {
    this._state = params.state;
  }

  private _updateResizingState(params: ResizeCallbackParams): void {
    const { initial, current, trigger } = params.state;
    const { side, bottom } = this._adorners;

    if (trigger === side.value) {
      current.height = initial.height;
    } else if (trigger === bottom.value) {
      current.width = initial.width;
    }

    this._setState(params);
  }

  // REVIEW: Scroll behavior
  // private _scrollIfNeeded(params: ResizeCallbackParams): void {
  //   const {
  //     state: {
  //       initial: { bottom, right },
  //       deltaX,
  //       deltaY,
  //     },
  //   } = params;
  //   const { x, y } = this._scroll.state;

  //   if (bottom + deltaX > x || right + deltaY > y) {
  //     this._scroll.scrollBy({
  //       left: deltaX * 2,
  //       top: deltaY * 2,
  //       behavior: 'smooth',
  //     });
  //   }
  // }

  private _handlePointerEnter(): void {
    this._isActive = true;
  }

  private _handlePointerLeave(): void {
    this._isActive = false;
  }

  private _handleResizeStart(params: ResizeCallbackParams): void {
    // REVIEW: Expose a property to control this behavior?
    params.event.preventDefault();

    this.emitEvent('igcResizeStart', { bubbles: false, detail: params });
    // REVIEW: Scroll behavior
    // this._scroll.saveCurrentState();

    this._isResizing = true;
    this._setState(params);
    params.state.trigger!.focus();
  }

  private _handleResize(params: ResizeCallbackParams): void {
    this._updateResizingState(params);
    this.emitEvent('igcResize', { bubbles: false, detail: params });
    // this._scrollIfNeeded(params);
  }

  private _handleResizeEnd(params: ResizeCallbackParams): void {
    this._isResizing = false;
    this._setState(params);
    this.emitEvent('igcResizeEnd', { bubbles: false, detail: params });
  }

  private _handleResizeCancel(): void {
    this._isResizing = false;
    this._controller.dispose();

    const { width, height } = this._state.initial;

    Object.assign(this._container.value!.style, {
      width: `${width}px`,
      height: `${height}px`,
    });

    this.emitEvent('igcResizeCancel', { bubbles: false, cancelable: false });
  }

  protected _renderAdorners() {
    if (!this._isActive) {
      return nothing;
    }

    return html`
      <div ${ref(this._adorners.side)} part="trigger-side" tabindex="-1">
        ➡️
      </div>
      <div ${ref(this._adorners.corner)} part="trigger" tabindex="-1">↘️</div>
      <div ${ref(this._adorners.bottom)} part="trigger-bottom" tabindex="-1">
        ⬇️
      </div>
    `;
  }

  protected override render() {
    const parts = partNameMap({
      'resize-base': true,
      active: this._isActive,
    });

    return html`
      <div
        ${ref(this._container)}
        part=${parts}
        @pointerenter=${this._handlePointerEnter}
        @pointerleave=${this._handlePointerLeave}
      >
        <slot></slot>
        ${this._renderAdorners()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-resize-container': IgcResizeContainerComponent;
  }
}

import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import IgcIconComponent from '../icon/icon.js';
import { addResizeController } from './resize-controller.js';
import { styles } from './themes/resize-container.base.css.js';
import { styles as shared } from './themes/shared/resize-container.common.css.js';
import { all } from './themes/themes.js';
import type {
  ResizeCallbackParams,
  ResizeGhostFactory,
  ResizeMode,
  ResizeState,
} from './types.js';

/** @ignore */
export interface IgcResizeContainerComponentEventMap {
  igcResizeStart: CustomEvent<ResizeCallbackParams>;
  igcResize: CustomEvent<ResizeCallbackParams>;
  igcResizeEnd: CustomEvent<ResizeCallbackParams>;
  igcResizeCancel: CustomEvent<unknown>;
}

/* blazorSuppress */
/**
 * @element igc-resize
 *
 * @slot - renders the element(s) that should be resized
 * @slot side-adorner - renders the side resize handle.
 * @slot corner-adorner - renders the corner resize handle.
 * @slot bottom-adorner - renders the bottom resize handle.
 *
 */
export default class IgcResizeContainerComponent extends EventEmitterMixin<
  IgcResizeContainerComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-resize';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcResizeContainerComponent, IgcIconComponent);
  }

  private _controller: ReturnType<typeof addResizeController>;

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

  @state()
  private _isActive = false;

  /**
   * Whether to always show the resize element adorners.
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  @property({ attribute: false })
  public set ghostFactory(value: ResizeGhostFactory) {
    this._ghostFactory = value;
    this._controller.set({ deferredFactory: this._ghostFactory });
  }

  public get ghostFactory(): ResizeGhostFactory | undefined {
    return this._ghostFactory;
  }

  /** Get/Set the mode of the resizing operation. */
  @property()
  public set mode(value: ResizeMode) {
    this._mode = value;
    this._controller.set({ mode: this._mode });
  }

  public get mode(): ResizeMode {
    return this._mode;
  }

  constructor() {
    super();

    addThemingController(this, all);

    this._controller = addResizeController(this, {
      ref: [this._adorners.side, this._adorners.corner, this._adorners.bottom],
      mode: this._mode,
      deferredFactory: this._ghostFactory,
      start: this._handleResizeStart,
      resize: this._handleResize,
      end: this._handleResizeEnd,
      cancel: this._handleResizeCancel,
      resizeTarget: () => this._container.value!,
    });
  }

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  private _updateResizingState(params: ResizeCallbackParams): void {
    const { initial, current, trigger } = params.state;
    const { side, bottom } = this._adorners;

    if (trigger === side.value) {
      current.height = initial.height;
    } else if (trigger === bottom.value) {
      current.width = initial.width;
    }
  }

  private _handlePointerEnter(): void {
    this._isActive = true;
  }

  private _handlePointerLeave(): void {
    this._isActive = false;
  }

  private _handleResizeStart(params: ResizeCallbackParams) {
    params.event.preventDefault();

    return this.emitEvent('igcResizeStart', {
      bubbles: false,
      cancelable: true,
      detail: params,
    });
  }

  private _handleResize(params: ResizeCallbackParams): void {
    this._updateResizingState(params);
    this.emitEvent('igcResize', { bubbles: false, detail: params });
  }

  private _handleResizeEnd(params: ResizeCallbackParams): void {
    this.emitEvent('igcResizeEnd', { bubbles: false, detail: params });
  }

  private _handleResizeCancel({ initial }: ResizeState): void {
    this._controller.dispose();

    if (this.mode !== 'deferred') {
      Object.assign(this._container.value!.style, {
        width: `${initial.width}px`,
        height: `${initial.height}px`,
      });
    }

    this.emitEvent('igcResizeCancel', { bubbles: false, cancelable: false });
  }

  protected _renderAdorner(name: 'side' | 'corner' | 'bottom', part: string) {
    return html`
      <slot ${ref(this._adorners[name])} part=${part} name="${name}-adorner">
      </slot>
    `;
  }

  protected _renderAdorners() {
    if (!this._isActive && !this.active) {
      return nothing;
    }

    return html`
      ${this._renderAdorner('side', 'trigger-side')}
      ${this._renderAdorner('corner', 'trigger')}
      ${this._renderAdorner('bottom', 'trigger-bottom')}
    `;
  }

  protected override render() {
    const parts = {
      'resize-base': true,
      active: this._isActive || this.active,
    };

    return html`
      <div
        ${ref(this._container)}
        part=${partMap(parts)}
        @pointerenter=${this.active ? nothing : this._handlePointerEnter}
        @pointerleave=${this.active ? nothing : this._handlePointerLeave}
      >
        <slot></slot>
        ${this._renderAdorners()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-resize': IgcResizeContainerComponent;
  }
}

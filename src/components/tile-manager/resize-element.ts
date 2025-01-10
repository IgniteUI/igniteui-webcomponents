import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';
import {
  addKeybindings,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import IgcIconComponent from '../icon/icon.js';
import {
  type ResizeCallbackParams,
  type ResizeMode,
  addResizeController,
} from './resize-controller.js';
import { styles } from './themes/resize.base.css.js';
import { styles as shared } from './themes/shared/resize.common.css.js';

export interface IgcResizeComponentEventMap {
  igcResizeStart: CustomEvent<ResizeCallbackParams>;
  igcResize: CustomEvent<ResizeCallbackParams>;
  igcResizeEnd: CustomEvent<ResizeCallbackParams>;
  igcResizeCancel: CustomEvent<unknown>;
}

/* blazorSuppress */
/**
 * @element igc-resize
 */
export default class IgcResizeComponent extends EventEmitterMixin<
  IgcResizeComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-resize';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcResizeComponent, IgcIconComponent);
  }

  private _resizeController: ReturnType<typeof addResizeController>;

  private _ghostFactory!: (element?: HTMLElement) => HTMLElement;
  private _mode: ResizeMode = 'immediate';
  private _adorner: Ref<HTMLElement> = createRef();

  @state()
  private _state!: ResizeCallbackParams['state'];

  @state()
  private _isResizing = false;

  @property()
  public set mode(value: ResizeMode) {
    this._mode = value;
    this._resizeController.setConfig({ mode: value });
  }

  public get mode(): ResizeMode {
    return this._mode;
  }

  @property({ attribute: false })
  public set ghostFactory(func: (element?: HTMLElement) => HTMLElement) {
    this._ghostFactory = func;
    this._resizeController.setConfig({ deferredFactory: func });
  }

  public get ghostFactory() {
    return this._ghostFactory;
  }

  constructor() {
    super();

    this._resizeController = addResizeController(this, {
      ref: this._adorner,
      start: this._handleResizeStart,
      resize: this._handleResize,
      end: this._handleResizeEnd,
      resizableElement: () => this.querySelector('div[part~="base"]')!,
    });

    addKeybindings(this, {
      skip: () => !this._isResizing,
      bindingDefaults: { preventDefault: true },
    }).set(escapeKey, this._handleResizeCancel);
  }

  private _setState(state: ResizeCallbackParams['state']) {
    this._state = state;
  }

  private _handleResizeStart(params: ResizeCallbackParams) {
    params.event.preventDefault();
    this.emitEvent('igcResizeStart', { bubbles: false, detail: params });

    this._isResizing = true;
    this._setState(params.state);
    this._adorner.value!.focus();
  }

  private _handleResize(params: ResizeCallbackParams) {
    this._setState(params.state);
    this.emitEvent('igcResize', { bubbles: false, detail: params });
  }

  private _handleResizeEnd(params: ResizeCallbackParams) {
    this._isResizing = false;
    this._setState(params.state);
    this.emitEvent('igcResizeEnd', { bubbles: false, detail: params });
  }

  private _handleResizeCancel() {
    this._isResizing = false;
    this._resizeController.dispose();

    const { width, height } = this._state.initial;

    Object.assign(this.style, {
      width: `${width}px`,
      height: `${height}px`,
    });

    this.emitEvent('igcResizeCancel', { bubbles: false });
  }

  protected override render() {
    return html`
      <div part="resize-base">
        <slot></slot>
        <div ${ref(this._adorner)} part="trigger" tabindex="-1">
          <igc-icon name="resize" collection="default"></igc-icon>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-resize': IgcResizeComponent;
  }
}

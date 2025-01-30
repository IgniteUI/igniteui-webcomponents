import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref.js';
import { findElementFromEventPath } from '../common/util.js';

export type ResizeMode = 'immediate' | 'deferred';

export type ResizeCallbackParams = {
  event: PointerEvent;
  state: {
    initial: DOMRect;
    current: DOMRect;
    dx: number;
    dy: number;
    ghost: HTMLElement | null;
  };
};

type ResizeControllerCallback = (params: ResizeCallbackParams) => unknown;

type ResizeControllerConfig = {
  ref?: Ref<HTMLElement>;
  mode?: ResizeMode;
  deferredFactory?: (element?: HTMLElement) => HTMLElement;
  start?: ResizeControllerCallback;
  resize?: ResizeControllerCallback;
  end?: ResizeControllerCallback;
  resizableElement?: () => Element;
};

class ResizeController implements ReactiveController {
  private static readonly auxiliaryEvents = [
    'pointermove',
    'lostpointercapture',
  ] as const;

  private static createDefaultGhost(host: HTMLElement): HTMLElement {
    const { width, height } = host.getBoundingClientRect();
    const ghostElement = document.createElement('div');

    Object.assign(ghostElement.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1000,
      background: 'pink',
      opacity: 0.85,
      width: `${width}px`,
      height: `${height}px`,
    });

    return ghostElement;
  }

  private _host: ReactiveControllerHost & HTMLElement;
  private _config: ResizeControllerConfig = {};
  private _id = -1;
  private _hasPointerCapture = false;

  private _ghost: HTMLElement | null = null;
  protected _initialState!: DOMRect;
  private _state!: DOMRect;

  protected get _element(): HTMLElement {
    return this._config?.ref ? this._config.ref.value! : this._host;
  }

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    config?: ResizeControllerConfig
  ) {
    this._host = host;
    this._host.addController(this);

    this.setConfig(config);
  }

  // Internal state helpers

  private _createGhost(): void {
    if (this._config.mode !== 'deferred') {
      return;
    }

    this._ghost = this._config.deferredFactory
      ? this._config.deferredFactory()
      : ResizeController.createDefaultGhost(this._host);
    this._host.append(this._ghost);
  }

  private _disposeGhost(): void {
    if (this._ghost) {
      this._ghost.remove();
      this._ghost = null;
    }
  }

  private _setPointerCaptureState(state: boolean): void {
    this._hasPointerCapture = state;
    state
      ? this._element.setPointerCapture(this._id)
      : this._element.releasePointerCapture(this._id);

    for (const event of ResizeController.auxiliaryEvents) {
      state
        ? this._host.addEventListener(event, this)
        : this._host.removeEventListener(event, this);
    }
  }

  private _setInitialState({ pointerId }: PointerEvent): void {
    const resizableElement = this._config.resizableElement
      ? this._config.resizableElement()
      : this._host;

    this._initialState = resizableElement.getBoundingClientRect();
    this._state = structuredClone(this._initialState);
    this._id = pointerId;
  }

  private _createCallbackParams(event: PointerEvent): ResizeCallbackParams {
    return {
      event,
      state: {
        initial: this._initialState,
        current: this._state,
        dx: this._state.width - this._initialState.width,
        dy: this._state.height - this._initialState.height,
        ghost: this._ghost,
      },
    };
  }

  private _shouldSkip(event: PointerEvent): boolean {
    return !findElementFromEventPath((e) => e === this._element, event);
  }

  // Event handlers

  private _handlePointerDown(event: PointerEvent): void {
    // Non-primary buttons are ignored
    if (event.button) {
      return;
    }

    if (this._config?.start) {
      this._setInitialState(event);
      this._createGhost();
      this._config.start.call(this._host, this._createCallbackParams(event));
      this._setPointerCaptureState(true);
    }
  }

  private _handlePointerMove(event: PointerEvent): void {
    if (!this._hasPointerCapture) {
      return;
    }

    // REVIEW: Sequencing

    if (this._config?.resize) {
      const params = this._createCallbackParams(event);
      this._config.resize.call(this._host, params);
      this._state = params.state.current;
    }

    const target = this._config.mode === 'deferred' ? this._ghost! : this._host;

    Object.assign(target.style, {
      width: `${this._state.width}px`,
      height: `${this._state.height}px`,
    });
  }

  private _handlePointerEnd(event: PointerEvent): void {
    Object.assign(this._host.style, {
      width: `${this._state.width}px`,
      height: `${this._state.height}px`,
    });

    if (this._config?.end) {
      this._config.end.call(this._host, this._createCallbackParams(event));
    }

    this.dispose();
  }

  public handleEvent(event: PointerEvent): void {
    if (this._shouldSkip(event)) {
      return;
    }

    switch (event.type) {
      case 'touchstart':
        event.preventDefault();
        break;

      case 'pointerdown':
        this._handlePointerDown(event);
        break;
      case 'pointermove':
        this._handlePointerMove(event);
        break;
      case 'lostpointercapture':
        this._handlePointerEnd(event);
        break;
    }
  }

  // Public API

  public setConfig(config?: ResizeControllerConfig): void {
    Object.assign(this._config, config);
  }

  public dispose(): void {
    this._disposeGhost();
    this._setPointerCaptureState(false);
  }

  public hostConnected(): void {
    this._host.addEventListener('pointerdown', this);
    this._host.addEventListener('touchstart', this, { passive: false });
  }

  public hostDisconnected(): void {
    this._host.removeEventListener('pointerdown', this);
    this._host.removeEventListener('touchstart', this);
  }
}

export function addResizeController(
  host: ReactiveControllerHost & HTMLElement,
  config?: ResizeControllerConfig
): ResizeController {
  return new ResizeController(host, config);
}

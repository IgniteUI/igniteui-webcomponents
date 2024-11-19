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
};

class ResizeController implements ReactiveController {
  private static auxiliaryEvents = [
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
  private _id!: number;

  private _ghost: HTMLElement | null = null;
  protected _initialState!: DOMRect;
  private _state!: DOMRect;

  protected get _element() {
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

  private _createGhost() {
    if (this._config.mode !== 'deferred') {
      return;
    }

    this._ghost = this._config.deferredFactory
      ? this._config.deferredFactory()
      : ResizeController.createDefaultGhost(this._host);
    this._host.append(this._ghost);
  }

  private _disposeGhost() {
    if (this._ghost) {
      this._ghost.remove();
      this._ghost = null;
    }
  }

  private _setInitialState(event: PointerEvent) {
    const rect = this._host.getBoundingClientRect();
    this._initialState = structuredClone(rect);
    this._state = rect;
    this._id = event.pointerId;
  }

  private _createCallbackParams(event: PointerEvent): ResizeCallbackParams {
    return {
      event,
      state: {
        initial: this._initialState,
        current: this._state,
        dx: this._state.width - this._initialState.width,
        dy: this._state.height - this._initialState.height,
      },
    };
  }

  private _toggleSubsequentEvents(set: boolean) {
    const method = set
      ? this._host.addEventListener
      : this._host.removeEventListener;
    for (const type of ResizeController.auxiliaryEvents) {
      method(type, this);
    }
  }

  private _shouldSkip(event: PointerEvent): boolean {
    return !findElementFromEventPath((e) => e === this._element, event);
  }

  // Event handlers

  private _handlePointerDown(event: PointerEvent) {
    // Non-primary buttons are ignored
    if (event.button) {
      return;
    }

    if (this._config?.start) {
      this._setInitialState(event);
      this._config.start.call(this._host, this._createCallbackParams(event));

      this._createGhost();

      this._element.setPointerCapture(this._id);
      this._toggleSubsequentEvents(true);
    }
  }

  private _handlePointerMove(event: PointerEvent) {
    if (!this._element.hasPointerCapture(this._id)) {
      return;
    }

    // REVIEW: Sequencing

    if (this._config?.resize) {
      this._state.width = event.clientX;
      this._state.height = event.clientY;

      this._config.resize.call(this._host, this._createCallbackParams(event));
    }

    const target = this._config.mode === 'deferred' ? this._ghost! : this._host;

    Object.assign(target.style, {
      width: `${this._state.width}px`,
      height: `${this._state.height}px`,
    });
  }

  private _handlePointerEnd(event: PointerEvent) {
    Object.assign(this._host.style, {
      width: `${this._state.width}px`,
      height: `${this._state.height}px`,
    });

    if (this._config?.end) {
      this._config.end.call(this._host, this._createCallbackParams(event));
    }

    this.dispose();
  }

  public handleEvent(event: PointerEvent) {
    if (this._shouldSkip(event)) {
      return;
    }

    switch (event.type) {
      case 'touchstart':
        return event.preventDefault();

      case 'pointerdown':
        return this._handlePointerDown(event);
      case 'pointermove':
        return this._handlePointerMove(event);
      case 'lostpointercapture':
        return this._handlePointerEnd(event);
    }
  }

  // Public API

  public setConfig(config?: ResizeControllerConfig) {
    Object.assign(this._config, config);
  }

  public dispose() {
    this._disposeGhost();
    this._toggleSubsequentEvents(false);
    this._element.releasePointerCapture(this._id);
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
) {
  return new ResizeController(host, config);
}

import type { ReactiveController, ReactiveControllerHost } from 'lit';

import { asArray, findElementFromEventPath } from '../common/util.js';
import { createDefaultGhostElement } from './default-ghost.js';
import type { ResizeCallbackParams, ResizeControllerConfig } from './types.js';

const additionalEvents = ['pointermove', 'lostpointercapture'] as const;

type State = {
  initial: DOMRect;
  current: DOMRect;
};

class RefactoredResizeController implements ReactiveController {
  private _host: ReactiveControllerHost & HTMLElement;
  private _config: ResizeControllerConfig = {};

  private _state!: State;
  private _id = -1;
  private _hasPointerCapture = false;

  private _activeRef: HTMLElement | null = null;
  private _ghost: HTMLElement | null = null;

  private get _element(): HTMLElement {
    return this._activeRef || this._host;
  }

  private get _isDeferred(): boolean {
    return this._config?.mode ? this._config.mode === 'deferred' : false;
  }

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    config?: ResizeControllerConfig
  ) {
    this._host = host;
    this._host.addController(this);

    this.setConfig(config);
  }

  // #region Public API

  /** Updates the configuration of the resize controller. */
  public setConfig(value?: ResizeControllerConfig): void {
    Object.assign(this._config, value);
  }

  /** Stops resizing, cleaning up any ghosts and additional event listeners. */
  public dispose(): void {
    this._setPointerCaptureState(false);
    this._removeGhostElement();
    this._activeRef = null;
  }

  public hostConnected(): void {
    this._host.addEventListener('pointerdown', this);
    this._host.addEventListener('touchstart', this, { passive: false });
  }

  public hostDisconnected(): void {
    this._host.removeEventListener('pointerdown', this);
    this._host.removeEventListener('touchstart', this);
  }

  /** @internal */
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
        this._handlePointeEnd(event);
        break;
    }
  }
  // #endregion

  // #region Event handlers

  private _handlePointerDown(event: PointerEvent): void {
    // Non-primary buttons are ignored
    if (event.button) {
      return;
    }

    this._setInitialState(event);
    this._createGhostElement();

    if (this._config.start) {
      this._config.start.call(this._host, this._createCallbackParams(event));
    }

    this._setPointerCaptureState(true);
  }

  private _handlePointerMove(event: PointerEvent): void {
    if (!this._hasPointerCapture) {
      return;
    }

    const params = this._createCallbackParams(event);
    const target = this._isDeferred ? this._ghost : this._getResizeTarget();

    if (this._config.resize) {
      this._config.resize.call(this._host, params);
      this._state.current = params.state.current;
    }

    Object.assign(target!.style, {
      width: `${this._state.current.width}px`,
      height: `${this._state.current.height}px`,
    });
  }

  private _handlePointeEnd(event: PointerEvent): void {
    const params = this._createCallbackParams(event);

    if (this._config.end) {
      this._config.end.call(this._host, params);
      this._state.current = params.state.current;
    }

    Object.assign(this._getResizeTarget().style, {
      width: `${this._state.current.width}px`,
      height: `${this._state.current.height}px`,
    });

    this.dispose();
  }

  // #endregion

  // #region Internal API

  private _shouldSkip(event: PointerEvent): boolean {
    // REVIEW: Look at GC load and optimize if required
    const refValues = new Set(
      asArray(this._config.ref).map((ref) => ref.value)
    );

    this._activeRef =
      findElementFromEventPath<HTMLElement>(
        (e) => refValues.has(e as HTMLElement),
        event
      ) ?? null;

    return !this._activeRef;
  }

  private _setPointerCaptureState(state: boolean): void {
    this._hasPointerCapture = state;

    state
      ? this._element.setPointerCapture(this._id)
      : this._element.releasePointerCapture(this._id);

    // Toggle additional event listeners
    for (const type of additionalEvents) {
      state
        ? this._host.addEventListener(type, this)
        : this._host.removeEventListener(type, this);
    }
  }

  private _createCallbackParams(event: PointerEvent): ResizeCallbackParams {
    const { initial, current } = this._state;

    // REVIEW
    if (event.type === 'pointermove') {
      current.width = event.clientX - initial.x;
      current.height = event.clientY - initial.y;
    }

    return {
      event,
      state: {
        initial,
        current,
        deltaX: current.width - initial.width,
        deltaY: current.height - initial.height,
        ghost: this._ghost,
        trigger: this._activeRef,
      },
    };
  }

  private _setInitialState({ pointerId }: PointerEvent): void {
    const dimensions = this._getResizeTarget().getBoundingClientRect();

    this._id = pointerId;
    this._state = {
      initial: dimensions,
      current: structuredClone(dimensions),
    };
  }

  private _createGhostElement(): void {
    if (!this._isDeferred) {
      return;
    }

    this._ghost = this._config.deferredFactory
      ? this._config.deferredFactory.call(this._host)
      : createDefaultGhostElement(
          this._state.initial.width,
          this._state.initial.height
        );

    this._ghost.setAttribute('data-resize-ghost', '');
    this._host.append(this._ghost);
  }

  private _removeGhostElement(): void {
    if (this._ghost) {
      this._ghost.remove();
      this._ghost = null;
    }
  }

  private _getResizeTarget(): HTMLElement {
    return this._config.resizeTarget
      ? this._config.resizeTarget.call(this._host)
      : this._host;
  }

  // #endregion
}

export function addRefactoredResizeController(
  host: ReactiveControllerHost & HTMLElement,
  config?: ResizeControllerConfig
): RefactoredResizeController {
  return new RefactoredResizeController(host, config);
}

import type { ReactiveController, ReactiveControllerHost } from 'lit';

import { findElementFromEventPath } from '../common/util.js';
import { createDefaultGhostElement, getDefaultLayer } from './default-ghost.js';
import type { ResizeControllerConfiguration, ResizeState } from './types.js';

const additionalEvents = ['pointermove', 'lostpointercapture'] as const;

type State = {
  initial: DOMRect;
  current: DOMRect;
};

class ResizeController implements ReactiveController {
  private _host: ReactiveControllerHost & HTMLElement;
  private _options: ResizeControllerConfiguration = {
    enabled: true,
    layer: getDefaultLayer,
  };

  private _id = -1;
  private _hasPointerCapture = false;
  private _state!: State;

  private _activeRef: HTMLElement | null = null;
  private _ghost: HTMLElement | null = null;

  private get _element(): HTMLElement {
    return this._activeRef ?? this._host;
  }

  private get _resizeTarget(): HTMLElement {
    return this._options.resizeTarget?.call(this._host) ?? this._host;
  }

  private get _layer(): HTMLElement {
    if (!this._isDeferred) {
      return this._host;
    }

    return this._options.layer?.() ?? this._host;
  }

  /** Whether the controller is in deferred mode. */
  private get _isDeferred(): boolean {
    return this._options.mode === 'deferred';
  }

  private get _stateParameters(): ResizeState {
    const { initial, current } = this._state;

    return {
      initial,
      current,
      deltaX: current.width - initial.width,
      deltaY: current.height - initial.height,
      ghost: this._ghost,
      trigger: this._activeRef,
    };
  }

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    options?: ResizeControllerConfiguration
  ) {
    this._host = host;
    this._host.addController(this);

    this.set(options);
  }

  // #region Public API

  /** Whether the controller is enabled and will listen for events. */
  public get enabled(): boolean {
    return Boolean(this._options.enabled);
  }

  /** Updates the configuration of the resize controller. */
  public set(options?: ResizeControllerConfiguration): void {
    Object.assign(this._options, options);
  }

  /** Stops any resizing operation, cleaning up any additional elements and event listeners. */
  public dispose(): void {
    this._setResizeState(false);
    this._removeGhostElement();
    this._activeRef = null;
  }

  /** Assign the given width and height in pixels to the resize target of the controller. */
  public setSize(width: number | null, height: number | null): void {
    if (this._resizeTarget) {
      Object.assign(this._resizeTarget.style, {
        width: width ? `${width}px` : '',
        height: height ? `${height}px` : '',
      });
    }
  }

  /** @internal */
  public hostConnected(): void {
    this._host.addEventListener('pointerdown', this);
    this._host.addEventListener('touchstart', this, { passive: false });
  }

  /** @internal */
  public hostDisconnected(): void {
    this._host.removeEventListener('pointerdown', this);
    this._host.removeEventListener('touchstart', this);
    this._setResizeCancelListener(false);
    this._removeGhostElement();
  }

  /** @internal */
  public handleEvent(event: PointerEvent & KeyboardEvent): void {
    if (!this.enabled) {
      return;
    }

    switch (event.type) {
      case 'touchstart':
        event.preventDefault();
        break;
      case 'keydown':
        this._handleCancel(event);
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
  // #endregion

  // #region Event handlers

  private _handlePointerDown(event: PointerEvent): void {
    // Non-primary buttons are ignored
    if (event.button || this._shouldSkip(event)) {
      return;
    }

    this._setInitialState(event);
    this._createGhostElement();

    this._options.start?.call(this._host, {
      event,
      state: this._stateParameters,
    });
    this._setResizeState();
  }

  private _handlePointerMove(event: PointerEvent): void {
    if (!this._hasPointerCapture) {
      return;
    }

    this._updateState(event);

    const parameters = { event, state: this._stateParameters };
    this._options.resize?.call(this._host, parameters);
    this._state.current = parameters.state.current;
    this._updatePosition(this._isDeferred ? this._ghost : this._resizeTarget);
  }

  private _handlePointerEnd(event: PointerEvent): void {
    const parameters = { event, state: this._stateParameters };

    this._options.end?.call(this._host, parameters);
    this._state.current = parameters.state.current;

    this._updatePosition(this._resizeTarget);
    this.dispose();
  }

  private _handleCancel(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    if (this._hasPointerCapture && key === 'escape') {
      this._options.cancel?.call(this._host, this._stateParameters);
    }
  }

  // #endregion

  // #region Internal API

  private _shouldSkip(event: PointerEvent): boolean {
    this._setActiveRef(event);
    return !this._activeRef;
  }

  private _setActiveRef(event: Event): void {
    const refs = this._options.ref?.map(({ value }) => value) ?? [this._host];

    this._activeRef =
      findElementFromEventPath<HTMLElement>(
        (e) => refs.includes(e as HTMLElement),
        event
      ) ?? null;
  }

  private _setResizeState(enabled = true): void {
    this._hasPointerCapture = enabled;

    enabled
      ? this._element.setPointerCapture(this._id)
      : this._element.releasePointerCapture(this._id);

    this._setResizeCancelListener(enabled);

    // Toggle additional event listeners
    for (const type of additionalEvents) {
      enabled
        ? this._host.addEventListener(type, this)
        : this._host.removeEventListener(type, this);
    }
  }

  private _setResizeCancelListener(enabled = true): void {
    enabled
      ? globalThis.addEventListener('keydown', this)
      : globalThis.removeEventListener('keydown', this);
  }

  private _setInitialState({ pointerId }: PointerEvent): void {
    const dimensions = this._resizeTarget.getBoundingClientRect();

    this._id = pointerId;
    this._state = {
      initial: dimensions,
      current: structuredClone(dimensions),
    };
  }

  private _updateState({ clientX, clientY }: PointerEvent): void {
    this._state.current.width = clientX - this._state.initial.x;
    this._state.current.height = clientY - this._state.initial.y;
  }

  private _updatePosition(element: HTMLElement | null): void {
    if (element) {
      Object.assign(element.style, {
        width: `${this._state.current.width}px`,
        height: `${this._state.current.height}px`,
      });
    }
  }

  private _createGhostElement(): void {
    if (!this._isDeferred) {
      return;
    }

    this._ghost =
      this._options.deferredFactory?.call(this._host) ??
      createDefaultGhostElement(this._resizeTarget.getBoundingClientRect());

    this._ghost.setAttribute('data-resize-ghost', '');
    this._layer.append(this._ghost);
  }

  private _removeGhostElement(): void {
    this._ghost?.remove();
    this._ghost = null;
  }

  // #endregion
}

export function addResizeController(
  host: ReactiveControllerHost & HTMLElement,
  options?: ResizeControllerConfiguration
): ResizeController {
  return new ResizeController(host, options);
}

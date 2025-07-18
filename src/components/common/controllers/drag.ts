import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';
import type { Ref } from 'lit/directives/ref.js';

import { getDefaultLayer } from '../../resize-container/default-ghost.js';
import { createAbortHandle } from '../abort-handler.js';
import {
  findElementFromEventPath,
  getRoot,
  isLTR,
  roundByDPR,
} from '../util.js';

type DragCallback = (parameters: DragCallbackParameters) => unknown;
type DragCancelCallback = (state: DragState) => unknown;

export type DragCallbackParameters = {
  event: PointerEvent;
  state: DragState;
};

type State = {
  initial: DOMRect;
  current: DOMRect;
  position: { x: number; y: number };
  offset: { x: number; y: number };
  pointerState: {
    previous: { x: number; y: number };
    current: { x: number; y: number };
    direction: Direction;
  };
};

type DragState = State & {
  ghost: HTMLElement | null;
  element: Element | null;
};

type Direction = 'start' | 'end' | 'bottom' | 'top';

type DragControllerConfiguration = {
  /** Whether the drag feature is enabled for the current host. */
  enabled?: boolean;
  /**
   * The mode of the drag operation.
   *
   * Deferred will create a ghost element and keep the original element
   * at its place until the operation completes successfully.
   */
  mode?: 'immediate' | 'deferred';
  /**
   * Whether starting a drag operation should snap the dragged item's top left corner
   * to the cursor position.
   */
  snapToCursor?: boolean;
  /**
   * Guard function invoked during the `start` callback.
   * Returning a truthy value will stop the current drag operation.
   */
  skip?: (event: PointerEvent) => boolean;

  matchTarget?: (target: Element) => boolean;
  /**
   *
   */
  trigger?: () => HTMLElement;
  /**
   * Contain drag operations to the scope of the passed DOM element.
   */
  container?: Ref<HTMLElement>;
  /**
   * The DOM element that will "host" the ghost drag element when the controller
   * is set to **deferred**.
   *
   * @remarks
   * In **immediate** mode, this property is ignored.
   */
  layer?: () => HTMLElement;

  ghost?: () => HTMLElement;

  /** Callback invoked at the beginning of a drag operation. */
  start?: DragCallback;
  /** Callback invoked while dragging the target element.  */
  move?: DragCallback;

  enter?: DragCallback;

  leave?: DragCallback;

  over?: DragCallback;

  /** Callback invoked during a drop operation. */
  end?: DragCallback;
  /** Callback invoked when a drag is cancelled */
  cancel?: DragCancelCallback;
};

const additionalEvents = [
  'pointermove',
  'lostpointercapture',
  'contextmenu',
] as const;

class DragController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & LitElement;
  private readonly _options: DragControllerConfiguration = {
    enabled: true,
    mode: 'deferred',
    snapToCursor: false,
    layer: getDefaultLayer,
  };

  private readonly _abortHandle = createAbortHandle();

  private _state!: State;

  private _matchedElement!: Element | null;

  private _id = -1;
  private _hasPointerCapture = false;

  private _ghost: HTMLElement | null = null;

  /** Whether `snapToCursor` is enabled for the controller. */
  private get _hasSnapping(): boolean {
    return Boolean(this._options.snapToCursor);
  }

  /** Whether the current drag mode is deferred. */
  private get _isDeferred(): boolean {
    return this._options.mode === 'deferred';
  }

  /**
   * The source element which will capture pointer events and initiate drag mode.
   *
   * @remarks
   * By default that will be the host element itself, unless `trigger` is passed in.
   */
  private get _element(): HTMLElement {
    return this._options.trigger?.() ?? this._host;
  }

  /**
   * The element being dragged.
   *
   * @remarks
   * When in **deferred** mode this returns a reference to the drag ghost element,
   * otherwise it is the host element.
   */
  private get _dragItem(): HTMLElement {
    return this._isDeferred ? this._ghost! : this._host;
  }

  /**
   * The DOM element that will "host" the ghost drag element when the controller
   * is set to **deferred**.
   *
   * @remarks
   * In **immediate** mode, this property is ignored.
   */
  private get _layer(): HTMLElement {
    if (!this._isDeferred) {
      return this._host;
    }

    return this._options.layer?.() ?? this._host;
  }

  private get _stateParameters(): DragState {
    return {
      ...this._state,
      ghost: this._ghost,
      element: this._matchedElement,
    };
  }

  constructor(
    host: ReactiveControllerHost & LitElement,
    options?: DragControllerConfiguration
  ) {
    this._host = host;
    this._host.addController(this);
    this.set(options);
  }

  // #region Public API

  /** Whether the drag controller is enabled. */
  public get enabled(): boolean {
    return Boolean(this._options.enabled);
  }

  /** Updates the drag controller configuration. */
  public set(options?: DragControllerConfiguration): void {
    Object.assign(this._options, options);
  }

  /** Stops any drag operation and cleans up state, additional event listeners and elements. */
  public dispose(): void {
    this._matchedElement = null;
    this._removeGhost();
    this._setDragState(false);
  }

  /** @internal */
  public hostConnected(): void {
    const { signal } = this._abortHandle;

    this._host.addEventListener('dragstart', this, { signal });
    this._host.addEventListener('touchstart', this, { passive: false, signal });
    this._host.addEventListener('pointerdown', this, { signal });
  }

  /** @internal */
  public hostDisconnected(): void {
    this._abortHandle.abort();
    this._setDragCancelListener(false);
    this._removeGhost();
  }

  /** @internal */
  public handleEvent(event: PointerEvent & KeyboardEvent): void {
    if (!this.enabled) {
      return;
    }

    switch (event.type) {
      case 'touchstart':
      case 'dragstart':
      // Prevent contextmenu default behavior during drag
      case 'contextmenu':
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
    if (this._shouldSkip(event)) {
      return;
    }

    this._setInitialState(event);
    this._createDragGhost();
    this._updatePosition(event);

    const parameters = {
      event,
      state: this._stateParameters,
    };

    if (this._options.start?.call(this._host, parameters) === false) {
      this.dispose();
      return;
    }

    this._assignPosition(this._dragItem);
    this._setDragState();
  }

  private _handlePointerMove(event: PointerEvent): void {
    if (!this._hasPointerCapture) {
      return;
    }

    this._updatePosition(event);
    this._updatePointerState(event);
    this._updateMatcher(event);

    const parameters = {
      event,
      state: this._stateParameters,
    };

    this._options.move?.call(this._host, parameters);

    this._assignPosition(this._dragItem);
  }

  private _handlePointerEnd(event: PointerEvent): void {
    this._options.end?.call(this._host, {
      event,
      state: this._stateParameters,
    });
    this.dispose();
  }

  private _handleCancel(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    if (this._hasPointerCapture && key === 'escape') {
      // Reset state
      this._options.cancel?.call(this._host, this._stateParameters);
    }
  }

  // #endregion

  private _setDragCancelListener(enabled = true): void {
    enabled
      ? globalThis.addEventListener('keydown', this)
      : globalThis.removeEventListener('keydown', this);
  }

  private _setInitialState({
    pointerId,
    clientX,
    clientY,
  }: PointerEvent): void {
    const rect = this._host.getBoundingClientRect();
    const position = { x: rect.x, y: rect.y };
    const offset = { x: rect.x - clientX, y: rect.y - clientY };

    this._id = pointerId;
    this._state = {
      initial: rect,
      current: structuredClone(rect),
      position,
      offset,
      pointerState: {
        previous: { x: clientX, y: clientY },
        current: { x: clientX, y: clientY },
        direction: 'end',
      },
    };
  }

  private _setDragState(enabled = true): void {
    this._hasPointerCapture = enabled;
    const cssValue = enabled ? 'none' : '';

    Object.assign(this._element.style, {
      touchAction: cssValue,
      userSelect: cssValue,
    });

    enabled
      ? this._element.setPointerCapture(this._id)
      : this._element.releasePointerCapture(this._id);

    this._setDragCancelListener(enabled);

    // Toggle additional events
    for (const type of additionalEvents) {
      enabled
        ? this._host.addEventListener(type, this)
        : this._host.removeEventListener(type, this);
    }
  }

  private _updateMatcher(event: PointerEvent) {
    if (!this._options.matchTarget) {
      return;
    }

    const match = getRoot(this._host)
      .elementsFromPoint(event.clientX, event.clientY)
      .find((element) => this._options.matchTarget!.call(this._host, element));

    if (match && !this._matchedElement) {
      this._matchedElement = match;
      this._options.enter?.call(this._host, {
        event,
        state: this._stateParameters,
      });
      return;
    }

    if (!match && this._matchedElement) {
      this._options.leave?.call(this._host, {
        event,
        state: this._stateParameters,
      });
      this._matchedElement = null;
      return;
    }

    if (match && match === this._matchedElement) {
      this._options.over?.call(this._host, {
        event,
        state: this._stateParameters,
      });
    }
  }

  private _updatePosition({ clientX, clientY }: PointerEvent): void {
    const { x, y } = this._state.offset;
    const { x: layerX, y: layerY } = this._isDeferred
      ? this._layer.getBoundingClientRect()
      : this._state.initial;

    const posX = this._hasSnapping ? clientX - layerX : clientX - layerX + x;
    const posY = this._hasSnapping ? clientY - layerY : clientY - layerY + y;

    this._state.position = { x: posX, y: posY };
  }

  private _updatePointerState({ clientX, clientY }: PointerEvent): void {
    const state = this._state.pointerState;

    state.previous = { ...state.current };
    state.current = { x: clientX, y: clientY };

    const dx = state.current.x - state.previous.x;
    const dy = state.current.y - state.previous.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
      const swapHorizontal = isLTR(this._host) ? dx >= 0 : dx <= 0;
      state.direction = swapHorizontal ? 'end' : 'start';
    } else {
      state.direction = dy >= 0 ? 'bottom' : 'top';
    }
  }

  private _assignPosition(element: HTMLElement): void {
    element.style.transform = `translate3d(${roundByDPR(this._state.position.x)}px,${roundByDPR(this._state.position.y)}px,0)`;
  }

  private _createDragGhost(): void {
    if (!this._isDeferred) {
      return;
    }

    this._ghost =
      this._options.ghost?.call(this._host) ??
      createDefaultDragGhost(this._host.getBoundingClientRect());

    this._layer.append(this._ghost);
  }

  private _removeGhost(): void {
    this._ghost?.remove();
    this._ghost = null;
  }

  private _shouldSkip(event: PointerEvent): boolean {
    return (
      Boolean(event.button) ||
      this._options.skip?.call(this._host, event) ||
      !findElementFromEventPath((e) => e === this._element, event)
    );
  }
}

function createDefaultDragGhost({ x, y, width, height }: DOMRect): HTMLElement {
  const element = document.createElement('div');

  Object.assign(element.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: 1000,
    background: 'gold',
  });

  return element;
}

/**
 * Adds a drag and drop controller to the given host
 */
export function addDragController(
  host: ReactiveControllerHost & LitElement,
  options?: DragControllerConfiguration
): DragController {
  return new DragController(host, options);
}

import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';
import type { Ref } from 'lit/directives/ref.js';
import { findElementFromEventPath } from '../util.js';

type DragDropCallback = () => unknown;

type DragDropConfig = {
  /** Whether the drag and drop feature is enabled for the current host. */
  enabled?: boolean;
  /**
   * The mode of the drag and drop operation.
   *
   * Deferred will create a ghost element and keep the original element
   * at its place until the operation completes successfully.
   */
  mode?: 'immediate' | 'deferred';
  /**
   * Whether drag operation should snap the dragged item top left corner
   * to the cursor position.
   */
  snapToCursor?: boolean;
  /**
   * Guard function invoked during the `dragStart` callback.
   * Returning a truthy value will stop the current drag and drop operation.
   */
  skip?: (event: PointerEvent) => boolean;
  // REVIEW: API signature
  matchTarget?: (target: Element) => boolean;
  /**
   *
   */
  trigger?: () => HTMLElement;
  /**
   * Contain drag and drop operations to the scope of the passed DOM element.
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
  dragStart?: DragDropCallback;
  /** Callback invoked while dragging the target element.  */
  dragMove?: DragDropCallback;
  /** Callback invoked during a drop operation. */
  dragEnd?: DragDropCallback;
  /** Callback invoked when a drag and drop is cancelled */
  dragCancel?: unknown;
};

const additionalEvents = ['pointermove', 'lostpointercapture'] as const;

class DragDropController implements ReactiveController {
  private _host: ReactiveControllerHost & LitElement;
  private _config: DragDropConfig = {
    enabled: true,
    mode: 'deferred',
  };

  private _dragOffset = { dx: 0, dy: 0 };

  private _id = -1;
  private _hasPointerCapture = false;

  private _ghost: HTMLElement | null = null;

  /** Whether `snapToCursor` is enabled for the controller. */
  private get _hasSnapping(): boolean {
    return Boolean(this._config.snapToCursor);
  }

  /** Whether the current drag mode is deferred. */
  private get _isDeferred(): boolean {
    return this._config.mode === 'deferred';
  }

  /**
   * The source element which will capture pointer events and initiate drag mode.
   *
   * @remarks
   * By default that will be the host element itself, unless `trigger` is passed in.
   */
  private get _element(): HTMLElement {
    return this._config.trigger?.() ?? this._host;
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

    return this._config.layer?.() ?? this._host;
  }

  /** Whether the drag controller is enabled. */
  public get enabled(): boolean {
    return Boolean(this._config.enabled);
  }

  constructor(
    host: ReactiveControllerHost & LitElement,
    config?: DragDropConfig
  ) {
    this._host = host;
    this._host.addController(this);
    this.setConfig(config);
  }

  private _setInitialState({
    pointerId,
    clientX,
    clientY,
  }: PointerEvent): void {
    const rect = this._host.getBoundingClientRect();

    this._id = pointerId;

    this._dragOffset = {
      dx: rect.x - clientX,
      dy: rect.y - clientY,
    };
  }

  private _setPointerCaptureState(state: boolean): void {
    this._hasPointerCapture = state;
    const cssValue = state ? 'none' : '';

    Object.assign(this._element.style, {
      touchAction: cssValue,
      userSelect: cssValue,
    });

    state
      ? this._element.setPointerCapture(this._id)
      : this._element.releasePointerCapture(this._id);

    // Toggle additional events
    for (const type of additionalEvents) {
      state
        ? this._host.addEventListener(type, this)
        : this._host.removeEventListener(type, this);
    }
  }

  private _updateCoordinates(x: number, y: number) {
    const { top, left } = this._layer.getBoundingClientRect();
    const posX = this._hasSnapping ? x - left : x - left + this._dragOffset.dx;
    const posY = this._hasSnapping ? y - top : y - top + this._dragOffset.dy;

    this._dragItem.style.transform = `translate(${posX}px,${posY}px)`;
  }

  private _createDragGhost(x: number, y: number): void {
    this._ghost = this._config.ghost
      ? this._config.ghost.call(this._host)
      : createDefaultDragGhost(this._host.getBoundingClientRect());

    this._updateCoordinates(x, y);
    this._layer.append(this._ghost);
  }

  private _removeGhost(): void {
    if (this._ghost) {
      this._ghost.remove();
      this._ghost = null;
    }
  }

  private _shouldSkip(event: PointerEvent): boolean {
    return (
      this._config.skip?.call(this._host, event) ||
      !findElementFromEventPath((e) => e === this._element, event)
    );
  }

  private _handlePointerDown(event: PointerEvent): void {
    if (this._shouldSkip(event)) {
      return;
    }

    // REVIEW
    event.preventDefault();

    this._setInitialState(event);
    this._createDragGhost(event.clientX, event.clientY);

    if (this._config.dragStart) {
      this._config.dragStart.call(this._host);
    }

    this._setPointerCaptureState(true);
  }

  private _handlePointerMove(event: PointerEvent): void {
    if (!this._hasPointerCapture) {
      return;
    }

    if (this._config.dragMove) {
      this._config.dragMove.call(this._host);
    }

    // REVIEW: additional event implementation here
    // if (this._config.matchTarget) {
    //   const dropTarget = document
    //     .elementsFromPoint(event.clientX, event.clientY)
    //     .find((e) =>
    //       this._config.matchTarget!.call(this._host, e)
    //     ) as HTMLElement;

    //   if (this._dropTarget !== dropTarget) {
    //     this._dropTarget = dropTarget;
    //     this._config.dragOver?.call(this._host, this._dropTarget);
    //   }
    // }

    this._updateCoordinates(event.clientX, event.clientY);
  }

  private _handlePointerEnd(_: PointerEvent): void {
    if (this._config.dragEnd) {
      this._config.dragEnd.call(this._host);
    }

    this.dispose();
  }

  /** Updates the drag and drop controller configuration. */
  public setConfig(value?: DragDropConfig): void {
    Object.assign(this._config, value);
  }

  /** @internal */
  public handleEvent(event: PointerEvent): void {
    if (!this.enabled) {
      return;
    }

    switch (event.type) {
      case 'touchstart':
      case 'dragstart':
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

  /** Stops any drag operation and cleans up state and additional elements. */
  public dispose(): void {
    this._removeGhost();
    this._setPointerCaptureState(false);
  }

  public hostConnected(): void {
    this._host.addEventListener('dragstart', this);
    this._host.addEventListener('touchstart', this, { passive: false });
    this._host.addEventListener('pointerdown', this);
  }

  public hostDisconnected(): void {
    this._host.removeEventListener('dragstart', this);
    this._host.removeEventListener('touchstart', this);
    this._host.removeEventListener('pointerdown', this);
  }
}

function createDefaultDragGhost(rect: DOMRect): HTMLElement {
  const element = document.createElement('div');
  Object.assign(element.style, {
    position: 'absolute',
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
    zIndex: 1e3,
    background: 'gold',
  });

  return element;
}

/**
 * Adds a drag and drop controller to the given host
 */
export function addDragDropController(
  host: ReactiveControllerHost & LitElement,
  config?: DragDropConfig
): DragDropController {
  return new DragDropController(host, config);
}

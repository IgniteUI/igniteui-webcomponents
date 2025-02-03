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
   * Guard function invoked during the `dragStart` callback.
   * Returning a truthy value will stop the current drag and drop operation.
   */
  skip?: (event: PointerEvent) => boolean;
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

  private _id = -1;
  private _hasPointerCapture = false;

  private _ghost: HTMLElement | null = null;

  private get _element(): HTMLElement {
    return this._config.trigger?.() ?? this._host;
  }

  // REVIEW
  /**
   * The DOM element that will "host" the ghost drag element when the controller
   * is set to **deferred**.
   *
   * @remarks
   * In **immediate** mode, this property is ignored.
   */
  private get _layer(): HTMLElement {
    if (this._config.mode === 'immediate') {
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

  private _setInitialState({ pointerId }: PointerEvent): void {
    this._id = pointerId;
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

  private _createDragGhost(x: number, y: number): void {
    this._ghost = this._config.ghost
      ? this._config.ghost.call(this._host)
      : createDefaultDragGhost(this._host.getBoundingClientRect());

    // REVIEW
    const rect = this._layer.getBoundingClientRect();
    this._ghost.style.transform = `translate(${x - rect.left}px, ${y - rect.top}px)`;
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

  private _handlePointerDown(event: PointerEvent) {
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

  private _handlePointerMove(event: PointerEvent) {
    if (!this._hasPointerCapture) {
      return;
    }

    if (this._config.dragMove) {
      this._config.dragMove.call(this._host);
    }

    const rect = this._layer.getBoundingClientRect();

    // REVIEW: Simulate dragEnter, dragOver? and dragLeave based on that
    // const elements = document.elementsFromPoint(event.clientX, event.clientY);

    // HACK
    this._ghost!.style.transform = `translate(${event.clientX - rect.left}px, ${event.clientY - rect.top}px)`;
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

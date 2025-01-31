import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';
import type { Ref } from 'lit/directives/ref.js';

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
  private _dragElement?: Ref<HTMLElement>;

  private get _element(): HTMLElement {
    return this._config.trigger?.() ?? this._host;
  }

  public get enabled(): boolean {
    return Boolean(this._config.enabled);
  }

  public get dragElement(): HTMLElement {
    return this._dragElement ? this._dragElement.value! : this._host;
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

    Object.assign(this._host.style, {
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
    const rect = this._host.getBoundingClientRect();
    this._ghost.style.transform = `translate(${x - rect.left}px, ${y - rect.top}px)`;

    this._host.append(this._ghost);
  }

  private _removeGhost(): void {
    if (this._ghost) {
      this._ghost.remove();
      this._ghost = null;
    }
  }

  private _handlePointerDown(event: PointerEvent) {
    if (this._config.skip?.call(this._host, event)) {
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

    const rect = this._host.getBoundingClientRect();

    // const elements = document.elementsFromPoint(event.clientX, event.clientY);

    // HACK
    this._ghost!.style.transform = `translate(${event.clientX - rect.left}px, ${event.clientY - rect.top}px)`;
  }

  private _handlePointerEnd(_: PointerEvent): void {
    this._removeGhost();
    this._setPointerCaptureState(false);
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

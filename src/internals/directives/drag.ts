import { directive, type PartInfo } from 'lit/async-directive.js';
import { getRoot, isLTR, roundByDPR, setStyles } from '../utils/dom.js';
import { getElementFromPath } from '../utils/events.js';
import {
  PointerOperationDirective,
  type PointerOperationOptions,
  type PointerOperationState,
} from './pointer-operation.js';

export type DragPointerDirection = 'start' | 'end' | 'top' | 'bottom';
export type DragCallback = (params: DragCallbackParams) => unknown;
export type DragCancelCallback = (state: DragState) => unknown;

type Point = { x: number; y: number };

export type DragState = {
  /** The bounding rectangle of the target at the start of the operation. */
  initial: DOMRect;
  current: DOMRect;
  /**
   * The position of the moved element: relative to the layer in deferred
   * mode, and to the initial rectangle of the target in immediate mode.
   */
  position: Point;
  /** The distance from the target origin to the pointer at the start. */
  offset: Point;
  pointerState: {
    previous: Point;
    current: Point;
    direction: DragPointerDirection;
  };
  /** The ghost element when in deferred mode. */
  ghost: HTMLElement | null;
  /** The element that the `matchTarget` callback matches, or `null`. */
  element: Element | null;
};

export type DragCallbackParams = {
  event: PointerEvent;
  state: DragState;
};

/**
 * Options for the draggable directive. See {@link PointerOperationOptions}
 * for the shared ones. The mode defaults to `deferred`, which moves a ghost
 * element and leaves the target in place.
 */
export interface DraggableOptions extends PointerOperationOptions {
  /** Whether the dragged element snaps its top left corner to the pointer. */
  snapToCursor?: boolean;
  /** Returns the element whose presence in the event path starts a drag. */
  trigger?: () => HTMLElement | null | undefined;
  /** Runs with the initiating pointer event. A `true` return skips the drag. */
  skip?: (event: PointerEvent) => boolean;
  /**
   * A predicate for the elements under the pointer. The first match becomes
   * `state.element`, and drives `enter`, `leave` and `over`.
   */
  matchTarget?: (element: Element) => boolean;
  /** Runs when a drag starts. A `false` return aborts the operation. */
  start?: DragCallback;
  /** Runs on each pointer move of a drag operation. */
  move?: DragCallback;
  /** Runs when the pointer enters a matched element. */
  enter?: DragCallback;
  /** Runs when the pointer leaves the matched element. */
  leave?: DragCallback;
  /** Runs while the pointer moves over the matched element. */
  over?: DragCallback;
  /** Runs when a drag operation completes. */
  end?: DragCallback;
  /** Runs when the Escape key cancels a drag operation. */
  cancel?: DragCancelCallback;
}

type DragOperation = PointerOperationState & {
  target: HTMLElement;
  initial: DOMRect;
  current: DOMRect;
  position: Point;
  offset: Point;
  pointerState: DragState['pointerState'];
  matchedElement: Element | null;
  /** The inline transform of the target, restored on an immediate cancel. */
  targetTransform: string;
};

function createDefaultGhost({ width, height }: DOMRect): HTMLElement {
  const element = document.createElement('div');

  // The element sits at the layer origin and moves with `translate3d`.
  setStyles(element, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: `${width}px`,
    height: `${height}px`,
    zIndex: '1000',
    background: 'gold',
  });

  return element;
}

class DraggableDirective extends PointerOperationDirective<
  DraggableOptions,
  DragOperation
> {
  private _target: HTMLElement | null = null;

  constructor(partInfo: PartInfo) {
    super(partInfo, {
      name: 'draggable',
      ghostAttribute: 'data-drag-ghost',
      defaultMode: 'deferred',
      defaultGhost: createDefaultGhost,
    });
  }

  protected override _cancelOperation(): void {
    this._options.cancel?.(this._createState());

    if (!this._isDeferred) {
      this._operation!.target.style.transform =
        this._operation!.targetTransform;
    }
  }

  /** Restores the styles that the operation changed, then disposes. */
  protected override _dispose(): void {
    if (this._operation) {
      this._setDragStyles(false);
    }

    super._dispose();
  }

  protected override disconnected(): void {
    super.disconnected();
    this._target = null;
  }

  /** The ghost element in deferred mode, the drag target in immediate mode. */
  private get _dragItem(): HTMLElement {
    return this._isDeferred ? this._operation!.ghost! : this._operation!.target;
  }

  // #region Event handlers

  private readonly _handlePointerDown = (event: PointerEvent): void => {
    if (
      !this._enabled ||
      event.button !== 0 ||
      this._operation ||
      this._shouldSkip(event)
    ) {
      return;
    }

    const target = this._target!;
    const initial = target.getBoundingClientRect();
    const { pointerId, clientX, clientY } = event;

    this._operation = {
      pointerId,
      target,
      initial,
      current: DOMRect.fromRect(initial),
      position: { x: initial.x, y: initial.y },
      offset: { x: initial.x - clientX, y: initial.y - clientY },
      pointerState: {
        previous: { x: clientX, y: clientY },
        current: { x: clientX, y: clientY },
        direction: 'end',
      },
      ghost: this._isDeferred ? this._createGhost(initial) : null,
      matchedElement: null,
      targetTransform: target.style.transform,
    };

    this._updatePosition(event);

    if (this._options.start?.(this._createParams(event)) === false) {
      this._dispose();
      return;
    }

    this._assignPosition(this._dragItem);
    this._startOperation(event);
  };

  private readonly _handlePointerMove = (event: PointerEvent): void => {
    if (!this._operation) {
      return;
    }

    this._updatePosition(event);
    this._updatePointerState(event);
    this._updateMatcher(event);

    this._options.move?.(this._createParams(event));

    this._assignPosition(this._dragItem);
  };

  private readonly _handlePointerEnd = (event: PointerEvent): void => {
    if (!this._operation) {
      return;
    }

    this._options.end?.(this._createParams(event));
    this._dispose();
  };

  // #endregion

  // #region Internal API

  protected override _attachTriggerListeners(): void {
    const target = this._resolveTarget();
    if (!target) {
      return;
    }

    if (target !== this._target) {
      this._triggerAbort.abort();
      this._target = target;
    }

    const { signal } = this._triggerAbort;

    target.addEventListener('pointerdown', this._handlePointerDown, {
      signal,
    });
    target.addEventListener('dragstart', this._preventNativeBehavior, {
      signal,
    });
    target.addEventListener('touchstart', this._preventNativeBehavior, {
      passive: false,
      signal,
    });
  }

  private _startOperation({ pointerId }: PointerEvent): void {
    this._setDragStyles(true);

    this._startOperationListeners(
      this._operation!.target,
      pointerId,
      this._handlePointerMove,
      this._handlePointerEnd
    );
  }

  private _shouldSkip(event: PointerEvent): boolean {
    if (this._options.skip?.(event)) {
      return true;
    }

    const trigger = this._options.trigger?.();
    return trigger ? !getElementFromPath((e) => e === trigger, event) : false;
  }

  private _createState(): DragState {
    const {
      initial,
      current,
      position,
      offset,
      pointerState,
      ghost,
      matchedElement,
    } = this._operation!;

    return {
      initial,
      current,
      position,
      offset,
      pointerState,
      ghost,
      element: matchedElement,
    };
  }

  private _createParams(event: PointerEvent): DragCallbackParams {
    return { event, state: this._createState() };
  }

  private _updatePosition({ clientX, clientY }: PointerEvent): void {
    const operation = this._operation!;
    const { x: layerX, y: layerY } = this._isDeferred
      ? this._resolveLayer().getBoundingClientRect()
      : operation.initial;
    const { x, y } = this._options.snapToCursor
      ? { x: 0, y: 0 }
      : operation.offset;

    operation.position = {
      x: clientX - layerX + x,
      y: clientY - layerY + y,
    };
  }

  private _updatePointerState({ clientX, clientY }: PointerEvent): void {
    const state = this._operation!.pointerState;

    state.previous = { ...state.current };
    state.current = { x: clientX, y: clientY };

    const dx = state.current.x - state.previous.x;
    const dy = state.current.y - state.previous.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
      const swapHorizontal = isLTR(this._operation!.target) ? dx >= 0 : dx <= 0;
      state.direction = swapHorizontal ? 'end' : 'start';
    } else {
      state.direction = dy >= 0 ? 'bottom' : 'top';
    }
  }

  private _updateMatcher(event: PointerEvent): void {
    const { matchTarget } = this._options;
    if (!matchTarget) {
      return;
    }

    const operation = this._operation!;
    const match = getRoot(operation.target)
      .elementsFromPoint(event.clientX, event.clientY)
      .find((element) => matchTarget(element));

    if (match && !operation.matchedElement) {
      operation.matchedElement = match;
      this._options.enter?.(this._createParams(event));
      return;
    }

    if (!match && operation.matchedElement) {
      this._options.leave?.(this._createParams(event));
      operation.matchedElement = null;
      return;
    }

    if (match && match === operation.matchedElement) {
      this._options.over?.(this._createParams(event));
    }
  }

  private _assignPosition(element: HTMLElement): void {
    const { x, y } = this._operation!.position;
    element.style.transform = `translate3d(${roundByDPR(x)}px,${roundByDPR(y)}px,0)`;
  }

  /**
   * Toggles the touch action and the text selection for a drag operation.
   *
   * @remarks
   * The `user-select` style on the dragged element is not enough. Browsers,
   * Safari in particular, still select text in the elements under the
   * pointer, so the style also goes on the body of the owner document.
   */
  private _setDragStyles(active: boolean): void {
    const value = active ? 'none' : '';
    const { target } = this._operation!;
    const doc = target.ownerDocument;

    setStyles(target, {
      touchAction: value,
      userSelect: value,
      webkitUserSelect: value,
    });
    setStyles(doc.body, { userSelect: value, webkitUserSelect: value });

    if (active) {
      doc.getSelection()?.removeAllRanges();
    }
  }

  // #endregion
}

/**
 * A directive that makes an element draggable, in place or through a
 * deferred ghost element, with an optional hit test of other elements.
 */
export const draggable = directive(DraggableDirective);

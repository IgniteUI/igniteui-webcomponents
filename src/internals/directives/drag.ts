import { noChange } from 'lit';
import {
  AsyncDirective,
  directive,
  type DirectiveParameters,
  type ElementPart,
  type PartInfo,
  PartType,
} from 'lit/async-directive.js';
import { createAbortHandle } from '../abort-handler.js';
import { escapeKey, isKey } from '../controllers/key-bindings.js';
import {
  getDefaultLayer,
  getRoot,
  isLTR,
  roundByDPR,
  setStyles,
} from '../utils/dom.js';
import { getElementFromPath, preventDefault } from '../utils/events.js';

export type DragMode = 'immediate' | 'deferred';
export type DragPointerDirection = 'start' | 'end' | 'top' | 'bottom';
export type DragGhostFactory = (initial: DOMRect) => HTMLElement;
export type DragCallback = (params: DragCallbackParams) => unknown;
export type DragCancelCallback = (state: DragState) => unknown;

type Point = { x: number; y: number };

export type DragState = {
  /** The bounding rectangle of the drag target at the start of the operation. */
  initial: DOMRect;
  /** The current bounding rectangle of the drag target. */
  current: DOMRect;
  /** The current position of the dragged element relative to its containing layer. */
  position: Point;
  /** Offset between the drag target origin and the pointer position at the start of the operation. */
  offset: Point;
  /** Pointer positions and movement direction for the current operation. */
  pointerState: {
    previous: Point;
    current: Point;
    direction: DragPointerDirection;
  };
  /** The ghost element when in deferred mode. */
  ghost: HTMLElement | null;
  /** The current element matched through the `matchTarget` callback, if any. */
  element: Element | null;
};

export type DragCallbackParams = {
  event: PointerEvent;
  state: DragState;
};

/** Options for the draggable directive. */
export interface DraggableOptions {
  /** Whether the directive will listen for and initiate drag operations. Defaults to `true`. */
  enabled?: boolean;
  /**
   * The mode of the drag operation.
   *
   * In `immediate` mode the target element is moved in place as the pointer moves.
   * In `deferred` mode a ghost element is created and moved instead, keeping the
   * target element at its place until the operation completes.
   *
   * Defaults to `deferred`.
   */
  mode?: DragMode;
  /** Whether the dragged element's top left corner snaps to the cursor position at the start of the operation. */
  snapToCursor?: boolean;
  /**
   * The element being dragged. It captures the pointer events for the operation.
   * Defaults to the element the directive is applied to.
   *
   * Accepts either an element or a function returning one, resolved when
   * the directive options are applied.
   */
  target?: HTMLElement | (() => HTMLElement | null | undefined);
  /**
   * When provided, a drag operation only starts if the returned element is in the
   * composed path of the initiating pointer event.
   */
  trigger?: () => HTMLElement | null | undefined;
  /** Guard invoked on the initiating pointer event. Returning `true` skips the drag operation. */
  skip?: (event: PointerEvent) => boolean;
  /**
   * Predicate invoked with the elements under the pointer while dragging.
   * The first matching element is exposed as `state.element` and drives the
   * `enter`, `leave` and `over` callbacks.
   */
  matchTarget?: (element: Element) => boolean;
  /** Factory function for the ghost element in deferred mode. */
  ghostFactory?: DragGhostFactory;
  /** The container in which the deferred ghost element is rendered. Defaults to the document body. */
  layer?: () => HTMLElement;
  /** Called when a drag operation starts. Return `false` to abort the operation. */
  start?: DragCallback;
  /** Called on each pointer move during a drag operation. */
  move?: DragCallback;
  /** Called when the pointer enters an element matched through `matchTarget`. */
  enter?: DragCallback;
  /** Called when the pointer leaves the currently matched element. */
  leave?: DragCallback;
  /** Called while the pointer moves over the currently matched element. */
  over?: DragCallback;
  /** Called when a drag operation completes. */
  end?: DragCallback;
  /** Called when a drag operation is cancelled with the Escape key. */
  cancel?: DragCancelCallback;
}

type DragOperation = {
  pointerId: number;
  target: HTMLElement;
  initial: DOMRect;
  current: DOMRect;
  position: Point;
  offset: Point;
  pointerState: DragState['pointerState'];
  ghost: HTMLElement | null;
  matchedElement: Element | null;
  /** Inline transform of the target before the operation, restored on cancel. */
  targetTransform: string;
};

function createDefaultGhost({ width, height }: DOMRect): HTMLElement {
  const element = document.createElement('div');

  // Anchored at the layer origin; the directive positions it via `translate3d`.
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

class DraggableDirective extends AsyncDirective {
  private readonly _triggerAbort = createAbortHandle();
  private readonly _dragAbort = createAbortHandle();

  private _options: DraggableOptions = {};
  private _host?: HTMLElement;
  private _target: HTMLElement | null = null;
  private _operation: DragOperation | null = null;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'The `draggable` directive can only be used on elements.'
      );
    }
  }

  private get _enabled(): boolean {
    return this._options.enabled ?? true;
  }

  private get _isDeferred(): boolean {
    return (this._options.mode ?? 'deferred') === 'deferred';
  }

  /** The element being moved around - the ghost in deferred mode, otherwise the drag target. */
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
      current: structuredClone(initial),
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

  private readonly _handleKeydown = (event: KeyboardEvent): void => {
    if (!this._operation || !isKey(event, escapeKey)) {
      return;
    }

    this._options.cancel?.(this._createState());

    if (!this._isDeferred) {
      this._operation.target.style.transform = this._operation.targetTransform;
    }

    this._dispose();
  };

  /** Prevents native drag and touch interactions from interfering with an enabled directive. */
  private readonly _preventNativeBehavior = (event: Event): void => {
    if (this._enabled) {
      event.preventDefault();
    }
  };

  // #endregion

  // #region Internal API

  private _attachTriggerListeners(): void {
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
    const { target } = this._operation!;
    const { signal } = this._dragAbort;

    this._setDragStyles(true);

    target.setPointerCapture(pointerId);
    target.addEventListener('pointermove', this._handlePointerMove, {
      signal,
    });
    target.addEventListener('lostpointercapture', this._handlePointerEnd, {
      signal,
    });
    target.addEventListener('contextmenu', preventDefault, { signal });
    globalThis.addEventListener('keydown', this._handleKeydown, { signal });
  }

  private _resolveTarget(): HTMLElement | null {
    const { target } = this._options;
    return (
      (typeof target === 'function' ? target() : target) ?? this._host ?? null
    );
  }

  private _resolveLayer(): HTMLElement {
    return this._options.layer?.() ?? getDefaultLayer();
  }

  private _shouldSkip(event: PointerEvent): boolean {
    if (this._options.skip?.(event)) {
      return true;
    }

    const trigger = this._options.trigger?.();
    return trigger ? !getElementFromPath((e) => e === trigger, event) : false;
  }

  private _createGhost(initial: DOMRect): HTMLElement {
    const ghost =
      this._options.ghostFactory?.(initial) ?? createDefaultGhost(initial);

    ghost.setAttribute('data-drag-ghost', '');
    this._resolveLayer().append(ghost);
    return ghost;
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
   * Toggles touch action, user and text selection for the duration of a drag operation.
   *
   * @remarks
   * Disabling `user-select` only on the dragged element is not enough, since browsers
   * (notably Safari) will still create a text selection in whatever elements sit under
   * the pointer while dragging. Applying it to the owner document's body prevents that
   * across the page for the active drag and is reverted once the operation completes.
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

  /** Stops the current drag operation, cleaning up the ghost element and event listeners. */
  private _dispose(): void {
    this._dragAbort.abort();

    if (this._operation) {
      const { pointerId, target, ghost } = this._operation;

      this._setDragStyles(false);

      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }

      ghost?.remove();
      this._operation = null;
    }
  }

  // #endregion

  protected override reconnected(): void {
    this._attachTriggerListeners();
  }

  protected override disconnected(): void {
    this._dispose();
    this._triggerAbort.abort();
    this._target = null;
  }

  public override update(
    part: ElementPart,
    [options]: DirectiveParameters<this>
  ) {
    if (this.isConnected) {
      this._host = part.element as HTMLElement;
      this._options = options ?? {};
      this._attachTriggerListeners();
    }
    return noChange;
  }

  public render(_options?: DraggableOptions) {
    return noChange;
  }
}

/**
 * A directive that makes an element draggable, either in place or through
 * a deferred ghost element, with optional hit-testing against other elements
 * while dragging.
 */
export const draggable = directive(DraggableDirective);

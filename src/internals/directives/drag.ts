import { directive, type PartInfo } from 'lit/async-directive.js';
import { getActiveViewTransition } from '#animations/view-transition.js';
import { getRoot, isPointInsideElement } from '../utils/dom.js';
import {
  type Point,
  PointerOperationDirective,
  type PointerOperationOptions,
  type PointerOperationState,
} from './pointer-operation.js';

export type DragPointerDirection = 'start' | 'end' | 'top' | 'bottom';
type DragCallback = (params: DragCallbackParams) => unknown;

export type DragState = {
  /** The bounding rectangle of the target at the start of the operation. */
  initial: DOMRect;
  /** The translation of the ghost from its origin, the ghost at left 0 and top 0. */
  position: Point;
  /** The direction of the last pointer move. */
  direction: DragPointerDirection;
  /** Whether the target lays out left to right. Not `:dir()`, which misses a CSS `direction`. */
  ltr: boolean;
  /** The element that the `matchTarget` callback matches, or `null`. */
  element: Element | null;
  /** Aborts when the operation ends, also when it ends inside `start`. */
  signal: AbortSignal;
};

export type DragCallbackParams = {
  event: PointerEvent;
  state: DragState;
};

/**
 * Options for the draggable directive. See {@link PointerOperationOptions}
 * for the shared ones. A drag moves a ghost element and leaves the target in
 * place.
 */
export interface DraggableOptions extends PointerOperationOptions<DragState> {
  /** Returns the element whose presence in the event path starts a drag. */
  trigger?: () => HTMLElement | null | undefined;
  /**
   * Runs with the `pointerdown`, `touchstart` or `dragstart` event that would
   * start a drag. A `true` return skips the drag and the native action stays.
   */
  skip?(event: Event): boolean;
  /**
   * A predicate for the elements under the pointer. The first match becomes
   * `state.element`, and stays while the pointer is in its box, also where an
   * ancestor clips it.
   */
  matchTarget?: (element: Element) => boolean;
  /** Runs on a pointer move that stays over the same matched element. */
  over?: DragCallback;
  /** Runs when a drag operation completes. */
  end?: DragCallback;
}

type DragOperation = PointerOperationState &
  Omit<DragState, 'signal'> & {
    /** The offset of the target origin from the pointer at the start. */
    offset: Point;
    /** The pointer position of the last move. */
    pointer: Point;
  };

class DraggableDirective extends PointerOperationDirective<
  DraggableOptions,
  DragOperation,
  DragState
> {
  constructor(partInfo: PartInfo) {
    super(partInfo, 'draggable', 'data-drag-ghost');
  }

  // #region Event handlers

  protected override _start(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement;
    const initial = target.getBoundingClientRect();
    const { pointerId, clientX, clientY } = event;

    this._operation = {
      pointerId,
      target,
      ltr: getComputedStyle(target).direction !== 'rtl',
      initial,
      position: { x: 0, y: 0 },
      offset: { x: initial.x - clientX, y: initial.y - clientY },
      pointer: { x: clientX, y: clientY },
      direction: 'end',
      ghost: this._createGhost(target, initial),
      element: null,
    };

    this._updatePosition(event);

    if (!this._runStart(event)) {
      return;
    }

    this._assignPosition();
    this._startOperationListeners(
      target,
      this._handlePointerMove,
      this._handlePointerEnd
    );
  }

  private readonly _handlePointerMove = (event: PointerEvent): void => {
    this._updatePosition(event);
    this._updateDirection(event);
    this._updateMatcher(event);
    this._assignPosition();
  };

  private readonly _handlePointerEnd = (event: PointerEvent): void => {
    this._options.end?.(this._createParams(event));
  };

  // #endregion

  // #region Internal API

  protected override _getTriggerElement(): HTMLElement | null {
    return this._resolveTarget();
  }

  protected override _getTouchElement(): HTMLElement | null {
    return this._options.trigger?.() ?? this._resolveTarget();
  }

  protected override _skips(event: Event): boolean {
    if (this._options.skip?.(event)) {
      return true;
    }

    const trigger = this._options.trigger?.();
    return trigger ? !event.composedPath().includes(trigger) : false;
  }

  protected override _createState(): DragState {
    const { initial, position, direction, ltr, element } = this._operation!;

    return {
      initial,
      position,
      direction,
      ltr,
      element,
      signal: this._operationAbort.signal,
    };
  }

  private _updatePosition({ clientX, clientY }: PointerEvent): void {
    const operation = this._operation!;
    const origin = this._getGhostOrigin(operation.ghost);

    operation.position = {
      x: clientX - origin.x + operation.offset.x,
      y: clientY - origin.y + operation.offset.y,
    };
  }

  private _updateDirection({ clientX, clientY }: PointerEvent): void {
    const operation = this._operation!;
    const dx = clientX - operation.pointer.x;
    const dy = clientY - operation.pointer.y;

    operation.pointer = { x: clientX, y: clientY };

    if (Math.abs(dx) >= Math.abs(dy)) {
      operation.direction = (operation.ltr ? dx >= 0 : dx <= 0)
        ? 'end'
        : 'start';
    } else {
      operation.direction = dy >= 0 ? 'bottom' : 'top';
    }
  }

  private _updateMatcher(event: PointerEvent): void {
    const { matchTarget } = this._options;
    if (!matchTarget) {
      return;
    }

    const operation = this._operation!;
    const previous = operation.element;
    const { clientX, clientY } = event;

    // The box check spares a hit test of the whole stack. During a view
    // transition, the transition layer can take the hit test, so it decides.
    const stays =
      previous !== null &&
      !getActiveViewTransition() &&
      matchTarget(previous) &&
      isPointInsideElement(previous, clientX, clientY);

    operation.element = stays
      ? previous
      : (getRoot(operation.target)
          ?.elementsFromPoint(clientX, clientY)
          .find(matchTarget) ?? null);

    // The first move over a match, also straight from another match, only records it.
    if (operation.element && operation.element === previous) {
      this._options.over?.(this._createParams(event));
    }
  }

  private _assignPosition(): void {
    const { ghost, position } = this._operation!;
    this._translate(ghost, position);
  }

  // #endregion
}

/**
 * A directive that drags a ghost of an element, with an optional hit test of
 * other elements.
 */
export const draggable = directive(DraggableDirective);

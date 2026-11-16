import { directive, type PartInfo } from 'lit/async-directive.js';
import { setStyles } from '../utils/dom.js';
import {
  type PointerOperationOptions,
  PointerOperationDirective,
  type PointerOperationState,
} from './pointer-operation.js';

export type ResizeDirection = 'horizontal' | 'vertical' | 'both';
type ResizeCallback = (params: ResizeCallbackParams) => unknown;

export type ResizeState = {
  /** The dimensions of the resize target at the start of the operation. */
  initial: DOMRect;
  /** The current dimensions. The callbacks can change this rectangle. */
  current: DOMRect;
  /** The difference between the current and the initial width. */
  deltaX: number;
  /** The difference between the current and the initial height. */
  deltaY: number;
  /** Aborts when the operation ends, also when it ends inside `start`. */
  signal: AbortSignal;
  /**
   * An optional commit function that the `end` callback sets. It runs in
   * place of the default, which applies the final dimensions to the target.
   */
  commit?: () => unknown;
};

export type ResizeCallbackParams = {
  event: PointerEvent;
  state: ResizeState;
};

/**
 * Options for the resizable directive. See {@link PointerOperationOptions}
 * for the shared ones. A resize sizes a ghost element, and the target takes
 * the final size when the operation ends.
 */
export interface ResizableOptions extends PointerOperationOptions<ResizeState> {
  /** The direction in which the element can be resized. Defaults to `both`. */
  direction?: ResizeDirection;
  /** Runs on each pointer move. The callback can change `state.current`. */
  resize?: ResizeCallback;
  /** Runs when a resize completes. The callback can set `state.commit`. */
  end?: ResizeCallback;
}

type ResizeOperation = PointerOperationState & {
  initial: DOMRect;
  current: DOMRect;
  /** Whether the target is right-to-left. Its width then grows to the left. */
  rtl: boolean;
};

class ResizableDirective extends PointerOperationDirective<
  ResizableOptions,
  ResizeOperation,
  ResizeState
> {
  constructor(partInfo: PartInfo) {
    super(partInfo, 'resizable', 'data-resize-ghost');
  }

  // #region Event handlers

  protected override _start(event: PointerEvent): void {
    const target = this._resolveTarget();
    if (!target) {
      return;
    }

    const initial = target.getBoundingClientRect();
    // Not `isLTR`: `:dir()` misses a CSS `direction`.
    const rtl = getComputedStyle(target).direction === 'rtl';

    this._operation = {
      pointerId: event.pointerId,
      target,
      initial,
      current: DOMRect.fromRect(initial),
      rtl,
      ghost: this._createGhost(target, initial),
    };

    this._placeGhost(initial);

    if (!this._runStart(event)) {
      return;
    }

    this._startOperationListeners(
      this._host!,
      this._handlePointerMove,
      this._handlePointerEnd
    );
  }

  private readonly _handlePointerMove = (event: PointerEvent): void => {
    const operation = this._operation!;
    const { ghost, target } = operation;
    // The page can scroll during the operation, so measure the target again.
    // The reads come before the writes below, which would force a layout.
    const edges = target.getBoundingClientRect();
    const origin = this._getGhostOrigin(ghost);

    this._updateDimensions(event, edges);

    const params = this._createParams(event);
    this._options.resize?.(params);
    operation.current = params.state.current;

    this._applyDimensions(ghost);
    this._placeGhost(edges, origin);
  };

  private readonly _handlePointerEnd = (event: PointerEvent): void => {
    const operation = this._operation!;
    const params = this._createParams(event);

    this._options.end?.(params);
    operation.current = params.state.current;

    if (params.state.commit) {
      params.state.commit();
    } else {
      this._applyDimensions(operation.target);
    }
  };

  // #endregion

  // #region Internal API

  protected override _createState(): ResizeState {
    const { initial, current } = this._operation!;

    return {
      initial,
      current,
      deltaX: current.width - initial.width,
      deltaY: current.height - initial.height,
      signal: this._operationAbort.signal,
    };
  }

  /** Puts the ghost at the start edge of the target, which is the right edge in RTL. */
  private _placeGhost(
    edges: DOMRect,
    origin = this._getGhostOrigin(this._operation!.ghost)
  ): void {
    const { ghost, current, rtl } = this._operation!;

    this._translate(ghost, {
      x: (rtl ? edges.right - current.width : edges.x) - origin.x,
      y: edges.y - origin.y,
    });
  }

  /** Sizes `current` from the pointer and the current `edges` of the target. */
  private _updateDimensions(
    { clientX, clientY }: PointerEvent,
    edges: DOMRect
  ): void {
    const { initial, current, rtl } = this._operation!;
    const direction = this._options.direction ?? 'both';

    const inlineSize = rtl ? edges.right - clientX : clientX - edges.x;

    current.width = direction === 'vertical' ? initial.width : inlineSize;
    current.height =
      direction === 'horizontal' ? initial.height : clientY - edges.y;
  }

  private _applyDimensions(element: HTMLElement): void {
    const { current } = this._operation!;
    setStyles(element, {
      width: `${current.width}px`,
      height: `${current.height}px`,
    });
  }

  // #endregion
}

/**
 * A directive that makes an element a resize trigger. It sizes a ghost of the
 * target, and the target takes the final size.
 */
export const resizable = directive(ResizableDirective);

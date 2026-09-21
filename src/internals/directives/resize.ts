import { directive, type PartInfo } from 'lit/async-directive.js';
import { setStyles } from '../utils/dom.js';
import {
  type PointerOperationOptions,
  PointerOperationDirective,
  type PointerOperationState,
} from './pointer-operation.js';

export type ResizeDirection = 'horizontal' | 'vertical' | 'both';
export type ResizeCallback = (params: ResizeCallbackParams) => unknown;
export type ResizeCancelCallback = (state: ResizeState) => unknown;

export type ResizeState = {
  /** The dimensions of the resize target at the start of the operation. */
  initial: DOMRect;
  /** The current dimensions. The callbacks can change this rectangle. */
  current: DOMRect;
  /** The difference between the current and the initial width. */
  deltaX: number;
  /** The difference between the current and the initial height. */
  deltaY: number;
  /** The ghost element when in deferred mode. */
  ghost: HTMLElement | null;
  /** The element that carries the directive. */
  trigger: HTMLElement | null;
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
 * for the shared ones. The mode defaults to `immediate`, which resizes the
 * target while the pointer moves.
 */
export interface ResizableOptions extends PointerOperationOptions {
  /** The direction in which the element can be resized. Defaults to `both`. */
  direction?: ResizeDirection;
  /** The size bounds of the resizable element, in pixels. */
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  /** Whether the element keeps its initial aspect ratio during a resize. */
  maintainAspectRatio?: boolean;
  /** Runs when a resize starts. A `false` return aborts the operation. */
  start?: ResizeCallback;
  /** Runs on each pointer move. The callback can change `state.current`. */
  resize?: ResizeCallback;
  /** Runs when a resize completes. The callback can set `state.commit`. */
  end?: ResizeCallback;
  /** Runs when the Escape key cancels a resize operation. */
  cancel?: ResizeCancelCallback;
}

type ResizeOperation = PointerOperationState & {
  target: HTMLElement;
  initial: DOMRect;
  current: DOMRect;
  /** The inline size styles of the target, restored on an immediate cancel. */
  targetStyles: { width: string; height: string };
};

function createDefaultGhost({ x, y, width, height }: DOMRect): HTMLElement {
  const element = document.createElement('div');
  const { scrollX, scrollY } = window;

  setStyles(element, {
    position: 'absolute',
    top: `${y + scrollY}px`,
    left: `${x + scrollX}px`,
    zIndex: '1000',
    background: 'pink',
    opacity: '0.85',
    width: `${width}px`,
    height: `${height}px`,
  });

  return element;
}

class ResizableDirective extends PointerOperationDirective<
  ResizableOptions,
  ResizeOperation
> {
  constructor(partInfo: PartInfo) {
    super(partInfo, {
      name: 'resizable',
      ghostAttribute: 'data-resize-ghost',
      defaultMode: 'immediate',
      defaultGhost: createDefaultGhost,
    });
  }

  protected override _cancelOperation(): void {
    this._options.cancel?.(this._createState());

    if (!this._isDeferred) {
      setStyles(this._operation!.target, this._operation!.targetStyles);
    }
  }

  // #region Event handlers

  private readonly _handlePointerDown = (event: PointerEvent): void => {
    if (!this._enabled || event.button !== 0 || this._operation) {
      return;
    }

    const target = this._resolveTarget();
    if (!target) {
      return;
    }

    const initial = target.getBoundingClientRect();

    this._operation = {
      pointerId: event.pointerId,
      target,
      initial,
      current: DOMRect.fromRect(initial),
      ghost: this._isDeferred ? this._createGhost(initial) : null,
      targetStyles: { width: target.style.width, height: target.style.height },
    };

    if (this._options.start?.(this._createParams(event)) === false) {
      this._dispose();
      return;
    }

    this._startOperationListeners(
      this._host!,
      event.pointerId,
      this._handlePointerMove,
      this._handlePointerEnd
    );
  };

  private readonly _handlePointerMove = (event: PointerEvent): void => {
    if (!this._operation) {
      return;
    }

    this._updateDimensions(event);

    const params = this._createParams(event);
    this._options.resize?.(params);
    this._operation.current = params.state.current;

    this._applyDimensions(
      this._isDeferred ? this._operation.ghost : this._operation.target
    );
  };

  private readonly _handlePointerEnd = (event: PointerEvent): void => {
    if (!this._operation) {
      return;
    }

    const params = this._createParams(event);
    this._options.end?.(params);
    this._operation.current = params.state.current;

    if (params.state.commit) {
      params.state.commit();
    } else {
      this._applyDimensions(this._operation.target);
    }

    this._dispose();
  };

  // #endregion

  // #region Internal API

  protected override _attachTriggerListeners(): void {
    if (!this._host) {
      return;
    }

    const { signal } = this._triggerAbort;

    this._host.addEventListener('pointerdown', this._handlePointerDown, {
      signal,
    });
    this._host.addEventListener('touchstart', this._preventNativeBehavior, {
      passive: false,
      signal,
    });
  }

  private _createState(): ResizeState {
    const { initial, current, ghost } = this._operation!;

    return {
      initial,
      current,
      deltaX: current.width - initial.width,
      deltaY: current.height - initial.height,
      ghost,
      trigger: this._host ?? null,
    };
  }

  private _createParams(event: PointerEvent): ResizeCallbackParams {
    return { event, state: this._createState() };
  }

  private _updateDimensions({ clientX, clientY }: PointerEvent): void {
    const { initial, current } = this._operation!;
    const {
      direction = 'both',
      maintainAspectRatio,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
    } = this._options;

    const horizontal = direction !== 'vertical';
    const vertical = direction !== 'horizontal';

    let width = horizontal ? clientX - initial.x : initial.width;
    let height = vertical ? clientY - initial.y : initial.height;

    if (maintainAspectRatio) {
      const ratio = initial.width / initial.height;

      if (horizontal) {
        height = width / ratio;
      } else {
        width = height * ratio;
      }
    }

    if (minWidth != null) width = Math.max(width, minWidth);
    if (maxWidth != null) width = Math.min(width, maxWidth);
    if (minHeight != null) height = Math.max(height, minHeight);
    if (maxHeight != null) height = Math.min(height, maxHeight);

    current.width = width;
    current.height = height;
  }

  /** Applies the current dimensions to `element` as inline styles. */
  private _applyDimensions(element: HTMLElement | null): void {
    if (element) {
      const { current } = this._operation!;
      setStyles(element, {
        width: `${current.width}px`,
        height: `${current.height}px`,
      });
    }
  }

  // #endregion
}

/**
 * A directive that makes an element a resize trigger. It resizes the target
 * in place, or through a deferred ghost element.
 */
export const resizable = directive(ResizableDirective);

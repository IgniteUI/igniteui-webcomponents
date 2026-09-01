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
import { getDefaultLayer, setStyles } from '../utils/dom.js';
import { preventDefault } from '../utils/events.js';

export type ResizeMode = 'immediate' | 'deferred';
export type ResizeDirection = 'horizontal' | 'vertical' | 'both';
export type ResizeGhostFactory = (initial: DOMRect) => HTMLElement;
export type ResizeCallback = (params: ResizeCallbackParams) => unknown;
export type ResizeCancelCallback = (state: ResizeState) => unknown;

export type ResizeState = {
  /** The dimensions of the resize target at the start of the operation. */
  initial: DOMRect;
  /** The current dimensions of the resize target. Mutable from within the callbacks. */
  current: DOMRect;
  /** Difference between the current and initial width. */
  deltaX: number;
  /** Difference between the current and initial height. */
  deltaY: number;
  /** The ghost element when in deferred mode. */
  ghost: HTMLElement | null;
  /** The element the directive is attached to. */
  trigger: HTMLElement | null;
  /**
   * When assigned from within the `end` callback, it is invoked instead of the default
   * behavior of applying the final dimensions to the resize target.
   */
  commit?: () => unknown;
};

export type ResizeCallbackParams = {
  event: PointerEvent;
  state: ResizeState;
};

/** Options for the resizable directive. */
export interface ResizableOptions {
  /** Whether the directive will listen for and initiate resize operations. Defaults to `true`. */
  enabled?: boolean;
  /**
   * The mode of the resize operation.
   *
   * In `immediate` mode the target element is resized in place as the pointer moves.
   * In `deferred` mode a ghost element is created and resized instead, with the final
   * dimensions applied to the target when the operation completes.
   */
  mode?: ResizeMode;
  /** The direction in which the element can be resized. Defaults to `both`. */
  direction?: ResizeDirection;
  /**
   * The element being resized. Defaults to the element the directive is applied to.
   *
   * Accepts either an element or a function returning one, resolved at the start
   * of each resize operation.
   */
  target?: HTMLElement | (() => HTMLElement | null | undefined);
  /** Factory function for the ghost element in deferred mode. */
  ghostFactory?: ResizeGhostFactory;
  /** The container in which the deferred ghost element is rendered. Defaults to the document body. */
  layer?: () => HTMLElement;
  /** The minimum width of the resizable element in pixels. */
  minWidth?: number;
  /** The maximum width of the resizable element in pixels. */
  maxWidth?: number;
  /** The minimum height of the resizable element in pixels. */
  minHeight?: number;
  /** The maximum height of the resizable element in pixels. */
  maxHeight?: number;
  /** Whether to maintain the initial aspect ratio of the resizable element. */
  maintainAspectRatio?: boolean;
  /** Called when a resize operation starts. Return `false` to abort the operation. */
  start?: ResizeCallback;
  /** Called on each pointer move during a resize operation. May mutate `state.current`. */
  resize?: ResizeCallback;
  /** Called when a resize operation completes. May assign `state.commit`. */
  end?: ResizeCallback;
  /** Called when a resize operation is cancelled with the Escape key. */
  cancel?: ResizeCancelCallback;
}

type ResizeOperation = {
  pointerId: number;
  target: HTMLElement;
  initial: DOMRect;
  current: DOMRect;
  ghost: HTMLElement | null;
  /** Inline size styles of the target before the operation, restored on cancel. */
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

class ResizableDirective extends AsyncDirective {
  private readonly _triggerAbort = createAbortHandle();
  private readonly _resizeAbort = createAbortHandle();

  private _options: ResizableOptions = {};
  private _host?: HTMLElement;
  private _operation: ResizeOperation | null = null;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'The `resizable` directive can only be used on elements.'
      );
    }
  }

  private get _enabled(): boolean {
    return this._options.enabled ?? true;
  }

  private get _isDeferred(): boolean {
    return this._options.mode === 'deferred';
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
      current: structuredClone(initial),
      ghost: this._isDeferred ? this._createGhost(initial) : null,
      targetStyles: { width: target.style.width, height: target.style.height },
    };

    if (this._options.start?.(this._createParams(event)) === false) {
      this._dispose();
      return;
    }

    const host = this._host!;
    const { signal } = this._resizeAbort;

    host.setPointerCapture(event.pointerId);
    host.addEventListener('pointermove', this._handlePointerMove, { signal });
    host.addEventListener('lostpointercapture', this._handlePointerEnd, {
      signal,
    });
    host.addEventListener('contextmenu', preventDefault, { signal });
    globalThis.addEventListener('keydown', this._handleKeydown, { signal });
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

  private readonly _handleKeydown = (event: KeyboardEvent): void => {
    if (!this._operation || !isKey(event, escapeKey)) {
      return;
    }

    this._options.cancel?.(this._createState());

    if (!this._isDeferred) {
      setStyles(this._operation.target, this._operation.targetStyles);
    }

    this._dispose();
  };

  // #endregion

  // #region Internal API

  /** Prevents native touch interactions from interfering with an enabled directive. */
  private readonly _preventNativeBehavior = (event: Event): void => {
    if (this._enabled) {
      event.preventDefault();
    }
  };

  private _addTriggerListeners(): void {
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

  private _resolveTarget(): HTMLElement | null {
    const { target } = this._options;
    return (
      (typeof target === 'function' ? target() : target) ?? this._host ?? null
    );
  }

  private _createGhost(initial: DOMRect): HTMLElement {
    const ghost =
      this._options.ghostFactory?.(initial) ?? createDefaultGhost(initial);

    ghost.setAttribute('data-resize-ghost', '');
    (this._options.layer?.() ?? getDefaultLayer()).append(ghost);
    return ghost;
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

  /** Applies the current dimensions of the operation as inline styles to the given element. */
  private _applyDimensions(element: HTMLElement | null): void {
    if (element) {
      const { current } = this._operation!;
      setStyles(element, {
        width: `${current.width}px`,
        height: `${current.height}px`,
      });
    }
  }

  /** Stops the current resize operation, cleaning up the ghost element and event listeners. */
  private _dispose(): void {
    this._resizeAbort.abort();

    if (this._operation) {
      const { pointerId, ghost } = this._operation;

      if (this._host?.hasPointerCapture(pointerId)) {
        this._host.releasePointerCapture(pointerId);
      }

      ghost?.remove();
      this._operation = null;
    }
  }

  // #endregion

  protected override reconnected(): void {
    this._addTriggerListeners();
  }

  protected override disconnected(): void {
    this._dispose();
    this._triggerAbort.abort();
  }

  public override update(
    part: ElementPart,
    [options]: DirectiveParameters<this>
  ) {
    if (this.isConnected) {
      this._host = part.element as HTMLElement;
      this._options = options ?? {};
      this._addTriggerListeners();
    }
    return noChange;
  }

  public render(_options?: ResizableOptions) {
    return noChange;
  }
}

/**
 * A directive that makes an element a trigger for resizing a target element,
 * either in place or through a deferred ghost element.
 */
export const resizable = directive(ResizableDirective);

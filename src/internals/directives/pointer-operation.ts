import { noChange } from 'lit';
import {
  AsyncDirective,
  type DirectiveParameters,
  type ElementPart,
  type PartInfo,
  PartType,
} from 'lit/async-directive.js';
import { createAbortHandle } from '../abort-handler.js';
import { escapeKey, isKey } from '../controllers/keys.js';
import {
  getTopLayerAncestor,
  replaceStyles,
  roundByDPR,
  setStyles,
} from '../utils/dom.js';
import { preventDefault } from '../utils/events.js';
import { getOrInsertComputed } from '../utils/objects.js';
import { resolveValue } from '../utils/types.js';

/**
 * Builds the look of the ghost element from the initial rectangle. The
 * directive sizes, positions and stacks it, and owns its `transform`.
 */
type GhostFactory = (initial: DOMRect) => HTMLElement;

export type Point = { x: number; y: number };

type CallbackParams<TState> = { event: PointerEvent; state: TState };

/**
 * The scale that the transforms of its ancestors give to `ghost`, from the
 * ghost moved by 100 pixels. A rotation or a skew is not supported.
 */
function measureScale(ghost: HTMLElement): Point {
  ghost.style.transform = 'none';
  const start = ghost.getBoundingClientRect();

  ghost.style.transform = 'translate(100px,100px)';
  const moved = ghost.getBoundingClientRect();

  return {
    x: (moved.left - start.left) / 100 || 1,
    y: (moved.top - start.top) / 100 || 1,
  };
}

const NO_SELECTION = { 'user-select': 'none', '-webkit-user-select': 'none' };

/** The running operations that guard each element, and the restore of its styles. */
const styleGuards = new WeakMap<
  HTMLElement,
  { count: number; restore: () => void }
>();

/**
 * Sets `styles` on `element` until the last of the overlapping operations
 * ends, so the first one saves the values of the page.
 */
function guardStyles(
  element: HTMLElement,
  styles: Record<string, string>
): () => void {
  const guard = getOrInsertComputed(styleGuards, element, () => ({
    count: 0,
    restore: replaceStyles(element, styles),
  }));

  guard.count++;

  return () => {
    if (--guard.count === 0) {
      styleGuards.delete(element);
      guard.restore();
    }
  };
}

/** The options that the pointer directives have in common. */
export interface PointerOperationOptions<TCallbackState> {
  /** Whether the directive starts operations. Defaults to `true`. */
  enabled?: boolean;
  /** The operation target. Defaults to the element with the directive. */
  target?: HTMLElement | (() => HTMLElement | null | undefined);
  /** Builds the look of the ghost, which shows the operation. Defaults to a plain box. */
  ghostFactory?: GhostFactory;
  /** Runs when an operation starts. A `false` return aborts it. */
  start?: (params: CallbackParams<TCallbackState>) => unknown;
  /** Runs when Escape, `pointercancel` or a disconnect cancels the operation. */
  cancel?: (state: TCallbackState) => unknown;
}

/** The state that each operation keeps, whatever the directive. */
export type PointerOperationState = {
  pointerId: number;
  target: HTMLElement;
  ghost: HTMLElement;
};

/**
 * The base of the drag and resize directives. It owns the trigger listeners,
 * the abort handles, the ghost, the pointer capture, the native input guard
 * and the life-cycle. A subclass adds its geometry and its callbacks.
 */
export abstract class PointerOperationDirective<
  TOptions extends PointerOperationOptions<TCallbackState>,
  TState extends PointerOperationState,
  TCallbackState,
> extends AsyncDirective {
  /** Aborts the listeners that wait for an operation to start. */
  private readonly _triggerAbort = createAbortHandle();
  /** Aborts the listeners that run for the duration of an operation. */
  protected readonly _operationAbort = createAbortHandle();

  private readonly _ghostAttribute: string;

  protected _options = {} as TOptions;
  protected _host?: HTMLElement;
  protected _operation: TState | null = null;

  /** The element with the trigger listeners. */
  private _triggerElement: HTMLElement | null = null;
  /** The element with the non-passive `touchstart` listener, while enabled. */
  private _touchElement: HTMLElement | null = null;
  /** The element that holds the pointer capture of the running operation. */
  private _captureElement?: HTMLElement;
  /** Whether the operation runs `onEnd`, so a disconnect then does not cancel it. */
  private _ending = false;
  /** Restores the inline styles that the operation set on the target and the body. */
  private _restoreStyles?: () => void;
  /** The last offset of `_translate`. */
  private _translation: Point = { x: 0, y: 0 };
  /** The scale of the ghost layer, which `_translate` undoes on the ghost. */
  private _layerScale: Point = { x: 1, y: 1 };

  constructor(partInfo: PartInfo, name: string, ghostAttribute: string) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        `The \`${name}\` directive can only be used on elements.`
      );
    }

    this._ghostAttribute = ghostAttribute;
  }

  protected get _enabled(): boolean {
    return this._options.enabled ?? true;
  }

  //#region Subclass contract

  /** Starts an operation from a primary `pointerdown` that passed the shared checks. */
  protected abstract _start(event: PointerEvent): void;

  /** The operation state that the callbacks receive. */
  protected abstract _createState(): TCallbackState;

  /** The element whose `pointerdown` starts an operation. */
  protected _getTriggerElement(): HTMLElement | null {
    return this._host ?? null;
  }

  /** The element where a touch can start an operation. */
  protected _getTouchElement(): HTMLElement | null {
    return this._getTriggerElement();
  }

  /** Whether `event` cannot start an operation, so its native action stays. */
  protected _skips(_event: Event): boolean {
    return false;
  }

  //#endregion

  /** The parameters of a callback for `event`. */
  protected _createParams(event: PointerEvent): CallbackParams<TCallbackState> {
    return { event, state: this._createState() };
  }

  //#region Shared internals

  private readonly _handlePointerDown = (event: PointerEvent): void => {
    if (
      this._enabled &&
      event.button === 0 &&
      !this._operation &&
      !this._skips(event)
    ) {
      this._start(event);
    }
  };

  /** Cancels a touch scroll or a native drag where an operation can start. */
  private readonly _preventNativeInput = (event: Event): void => {
    if (this._enabled && !this._skips(event)) {
      event.preventDefault();
    }
  };

  private readonly _handleKeydown = (event: KeyboardEvent): void => {
    if (isKey(event, escapeKey)) {
      this._cancel();
    }
  };

  /** Cancels the running operation: on Escape, `pointercancel` or a disconnect. */
  private readonly _cancel = (): void => {
    if (this._operation && !this._ending) {
      this._options.cancel?.(this._createState());
      this._dispose();
    }
  };

  private _attachTriggerListeners(): void {
    const element = this._getTriggerElement();
    const touchElement = this._enabled ? this._getTouchElement() : null;

    if (
      !element ||
      (element === this._triggerElement && touchElement === this._touchElement)
    ) {
      return;
    }

    this._triggerAbort.abort();
    this._triggerElement = element;
    this._touchElement = touchElement;

    const { signal } = this._triggerAbort;

    element.addEventListener('pointerdown', this._handlePointerDown, {
      signal,
    });
    element.addEventListener('dragstart', this._preventNativeInput, {
      signal,
    });

    // A non-passive touch listener makes touch scrolling wait for the main
    // thread, so it covers only where an operation can start.
    touchElement?.addEventListener('touchstart', this._preventNativeInput, {
      passive: false,
      signal,
    });
  }

  /**
   * Runs the `start` callback. A `false` return, an error, or a cancel in it,
   * such as a listener that removes the target, disposes the operation. An
   * error propagates.
   */
  protected _runStart(event: PointerEvent): boolean {
    let started = false;

    try {
      started =
        this._options.start?.(this._createParams(event)) !== false &&
        this._operation !== null;
    } finally {
      if (!started) {
        this._dispose();
      }
    }

    return started;
  }

  protected _resolveTarget(): HTMLElement | null {
    return resolveValue(this._options.target) ?? this._host ?? null;
  }

  /**
   * Appends a fixed ghost of the initial size to the closest top-layer
   * ancestor of the target, or to the document body. There it renders above
   * the target, and the scroll, border and overflow of the layer do not move
   * or clip it. A shadow host renders only its slotted children, so the ghost
   * goes into its shadow root.
   */
  protected _createGhost(target: HTMLElement, initial: DOMRect): HTMLElement {
    const layer = getTopLayerAncestor(target) ?? document.body;
    const ghost =
      this._options.ghostFactory?.(initial) ?? document.createElement('div');

    setStyles(ghost, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: `${initial.width}px`,
      height: `${initial.height}px`,
      zIndex: '1000',
      transformOrigin: '0 0',
    });
    ghost.setAttribute(this._ghostAttribute, '');
    (layer.shadowRoot ?? layer).append(ghost);
    this._layerScale = measureScale(ghost);
    this._translate(ghost, { x: 0, y: 0 });
    return ghost;
  }

  /**
   * The viewport position of the ghost without its translate. A transform or a
   * filter on an ancestor moves it from the viewport corner, also on scroll, so
   * it is measured.
   */
  protected _getGhostOrigin(ghost: HTMLElement): Point {
    const { left, top } = ghost.getBoundingClientRect();
    return { x: left - this._translation.x, y: top - this._translation.y };
  }

  /**
   * Moves `element` with a `translate3d`, rounded to device pixels. A scale of
   * the ghost layer is undone, so the ghost moves and sizes in viewport pixels.
   */
  protected _translate(element: HTMLElement, { x, y }: Point): void {
    const { x: scaleX, y: scaleY } = this._layerScale;
    const scale =
      scaleX === 1 && scaleY === 1 ? '' : ` scale(${1 / scaleX},${1 / scaleY})`;

    this._translation = { x: roundByDPR(x), y: roundByDPR(y) };
    element.style.transform = `translate3d(${this._translation.x / scaleX}px,${this._translation.y / scaleY}px,0)${scale}`;
  }

  /**
   * Captures the pointer on `element`, adds the operation listeners, and stops
   * touch scrolling and text selection until the operation ends. Browsers,
   * Safari in particular, still select text under the pointer, so
   * `user-select` also goes on the document body. The pointer listeners ignore
   * the events of other pointers, and the operation ends after `onEnd`.
   */
  protected _startOperationListeners(
    element: HTMLElement,
    onMove: (event: PointerEvent) => void,
    onEnd: (event: PointerEvent) => void
  ): void {
    const { pointerId, target } = this._operation!;
    const { signal } = this._operationAbort;
    const own =
      (handler: (event: PointerEvent) => void) => (event: PointerEvent) => {
        if (event.pointerId === pointerId) {
          handler(event);
        }
      };

    this._captureElement = element;

    try {
      element.setPointerCapture(pointerId);
    } catch (error) {
      // For example a synthetic event with a pointer that is not active.
      this._cancel();
      throw error;
    }

    element.addEventListener('pointermove', own(onMove), { signal });
    element.addEventListener(
      'lostpointercapture',
      own((event) => {
        this._ending = true;

        try {
          onEnd(event);
        } finally {
          this._ending = false;
          this._dispose();
        }
      }),
      { signal }
    );
    element.addEventListener('pointercancel', own(this._cancel), { signal });
    element.addEventListener('contextmenu', preventDefault, { signal });
    globalThis.addEventListener('keydown', this._handleKeydown, { signal });

    const doc = target.ownerDocument;
    const restoreTarget = guardStyles(target, {
      ...NO_SELECTION,
      'touch-action': 'none',
    });
    const restoreBody = guardStyles(doc.body, NO_SELECTION);

    this._restoreStyles = () => {
      restoreTarget();
      restoreBody();
    };
    doc.getSelection()?.removeAllRanges();
  }

  /** Stops the operation, and removes the ghost, the listeners and the styles. */
  protected _dispose(): void {
    this._operationAbort.abort();

    if (!this._operation) {
      return;
    }

    const { pointerId, ghost } = this._operation;
    const element = this._captureElement;

    if (element?.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }

    this._restoreStyles?.();
    ghost.remove();
    this._restoreStyles = undefined;
    this._captureElement = undefined;
    this._operation = null;
  }

  //#endregion

  //#region Directive life-cycle

  protected override reconnected(): void {
    this._attachTriggerListeners();
  }

  protected override disconnected(): void {
    this._cancel();
    this._triggerAbort.abort();
    this._triggerElement = null;
    this._touchElement = null;
  }

  public override update(
    part: ElementPart,
    [options]: DirectiveParameters<this>
  ) {
    // Store the host and options also while disconnected, so `reconnected()`
    // can attach the listeners.
    this._host = part.element as HTMLElement;
    this._options = (options ?? {}) as TOptions;

    if (this.isConnected) {
      this._attachTriggerListeners();
    }
    return noChange;
  }

  public render(_options?: TOptions) {
    return noChange;
  }

  //#endregion
}

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
import { getTopLayerAncestor, roundByDPR, setStyles } from '../utils/dom.js';
import { preventDefault } from '../utils/events.js';
import { resolveValue } from '../utils/types.js';

/**
 * How an operation applies its result. `immediate` changes the target while
 * the pointer moves. `deferred` changes a ghost, and the target keeps its
 * state until the operation ends.
 */
export type PointerOperationMode = 'immediate' | 'deferred';

/**
 * Builds the look and the size of the ghost element from the initial
 * rectangle. The directive positions it and owns its `transform`.
 */
export type GhostFactory = (initial: DOMRect) => HTMLElement;

export type Point = { x: number; y: number };

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

/** The options that the pointer directives have in common. */
export interface PointerOperationOptions {
  /** Whether the directive starts operations. Defaults to `true`. */
  enabled?: boolean;
  /** The mode of the operation. Each directive has its own default. */
  mode?: PointerOperationMode;
  /** The operation target. Defaults to the element with the directive. */
  target?: HTMLElement | (() => HTMLElement | null | undefined);
  ghostFactory?: GhostFactory;
  /**
   * The ghost container. Defaults to the closest top-layer element of the
   * target, so that the ghost renders above it, else to the document body.
   */
  layer?: () => HTMLElement;
}

/** The traits that a directive fixes, and that its options cannot change. */
export type PointerOperationConfig = {
  /** The name of the directive, used in the wrong-part-type error. */
  name: string;
  ghostAttribute: string;
  defaultMode: PointerOperationMode;
  /** The ghost that the directive builds without a factory. */
  defaultGhost: GhostFactory;
};

/** The state that each operation keeps, whatever the directive. */
export type PointerOperationState = {
  pointerId: number;
  /** The ghost element in deferred mode. */
  ghost: HTMLElement | null;
};

/**
 * The base of the drag and resize directives. It owns the abort handles, the
 * ghost, the pointer capture and the life-cycle. A subclass adds its geometry
 * and its callbacks.
 */
export abstract class PointerOperationDirective<
  TOptions extends PointerOperationOptions,
  TState extends PointerOperationState,
> extends AsyncDirective {
  /** Aborts the listeners that wait for an operation to start. */
  protected readonly _triggerAbort = createAbortHandle();
  /** Aborts the listeners that run for the duration of an operation. */
  protected readonly _operationAbort = createAbortHandle();

  protected readonly _config: PointerOperationConfig;

  protected _options = {} as TOptions;
  protected _host?: HTMLElement;
  protected _operation: TState | null = null;

  /** The element that holds the pointer capture of the running operation. */
  private _captureElement?: HTMLElement;
  /** The last offset of `_translate`: the ghost's, or the target's in immediate mode. */
  private _translation: Point = { x: 0, y: 0 };
  /** The scale of the ghost layer, which `_translate` undoes on the ghost. */
  private _layerScale: Point = { x: 1, y: 1 };

  constructor(partInfo: PartInfo, config: PointerOperationConfig) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        `The \`${config.name}\` directive can only be used on elements.`
      );
    }

    this._config = config;
  }

  protected get _enabled(): boolean {
    return this._options.enabled ?? true;
  }

  protected get _isDeferred(): boolean {
    return (this._options.mode ?? this._config.defaultMode) === 'deferred';
  }

  //#region Subclass contract

  protected abstract _attachTriggerListeners(): void;

  /** Reports the cancellation and restores the target element. */
  protected abstract _cancelOperation(): void;

  //#endregion

  //#region Shared internals

  /** Prevents the native interactions that would compete with the directive. */
  protected readonly _preventNativeBehavior = (event: Event): void => {
    if (this._enabled) {
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
    if (this._operation) {
      this._cancelOperation();
      this._dispose();
    }
  };

  /**
   * Runs `start`. A `false` return, an error, or a cancel in `start`, such as
   * a listener that removes the target, disposes the operation. An error
   * propagates.
   */
  protected _runStart(start: () => unknown): boolean {
    let started = false;

    try {
      started = start() !== false && this._operation !== null;
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

  /** A shadow host renders only its slotted children, so its ghost goes to the shadow root. */
  private _resolveLayer(target: HTMLElement): HTMLElement | ShadowRoot {
    const layer =
      this._options.layer?.() ?? getTopLayerAncestor(target) ?? document.body;

    return layer.shadowRoot ?? layer;
  }

  /**
   * Appends a fixed ghost to its layer, at the ghost origin. The scroll, the
   * border and the overflow of the layer then do not move or clip it.
   */
  protected _createGhost(target: HTMLElement, initial: DOMRect): HTMLElement {
    const layer = this._resolveLayer(target);
    const ghost = (this._options.ghostFactory ?? this._config.defaultGhost)(
      initial
    );

    setStyles(ghost, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      transformOrigin: '0 0',
    });
    ghost.setAttribute(this._config.ghostAttribute, '');
    layer.append(ghost);
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
   * Captures the pointer on `element` and adds the operation listeners. The
   * pointer listeners ignore the events of other pointers.
   */
  protected _startOperationListeners(
    element: HTMLElement,
    pointerId: number,
    onMove: (event: PointerEvent) => void,
    onEnd: (event: PointerEvent) => void
  ): void {
    const { signal } = this._operationAbort;
    const own = (handler: (event: PointerEvent) => void) => {
      return (event: PointerEvent) => {
        if (event.pointerId === pointerId) {
          handler(event);
        }
      };
    };

    this._captureElement = element;
    element.setPointerCapture(pointerId);
    element.addEventListener('pointermove', own(onMove), { signal });
    element.addEventListener('lostpointercapture', own(onEnd), { signal });
    element.addEventListener('pointercancel', own(this._cancel), { signal });
    element.addEventListener('contextmenu', preventDefault, { signal });
    globalThis.addEventListener('keydown', this._handleKeydown, { signal });
  }

  /** Stops the operation and removes the ghost and the listeners. */
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

    ghost?.remove();
    this._captureElement = undefined;
    this._layerScale = { x: 1, y: 1 };
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

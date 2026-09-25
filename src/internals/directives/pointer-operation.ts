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
import { getDefaultLayer } from '../utils/dom.js';
import { preventDefault } from '../utils/events.js';
import { resolveValue } from '../utils/types.js';

/**
 * How an operation applies its result. `immediate` changes the target while
 * the pointer moves. `deferred` changes a ghost, and the target keeps its
 * state until the operation ends.
 */
export type PointerOperationMode = 'immediate' | 'deferred';

/** Builds the ghost element from the initial rectangle. */
export type GhostFactory = (initial: DOMRect) => HTMLElement;

/** The options that the pointer directives have in common. */
export interface PointerOperationOptions {
  /** Whether the directive starts operations. Defaults to `true`. */
  enabled?: boolean;
  /** The mode of the operation. Each directive has its own default. */
  mode?: PointerOperationMode;
  /** The operation target. Defaults to the element with the directive. */
  target?: HTMLElement | (() => HTMLElement | null | undefined);
  ghostFactory?: GhostFactory;
  /** The ghost container. Defaults to the document body. */
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
 * The parts that the drag and the resize directives share.
 *
 * @remarks
 * The base class keeps the abort handles, the ghost, the pointer capture and
 * the life-cycle. A subclass adds its own geometry and start events.
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

  protected readonly _handleKeydown = (event: KeyboardEvent): void => {
    if (!this._operation || !isKey(event, escapeKey)) {
      return;
    }

    this._cancelOperation();
    this._dispose();
  };

  protected _resolveTarget(): HTMLElement | null {
    return resolveValue(this._options.target) ?? this._host ?? null;
  }

  protected _resolveLayer(): HTMLElement {
    return this._options.layer?.() ?? getDefaultLayer();
  }

  protected _createGhost(initial: DOMRect): HTMLElement {
    const ghost = (this._options.ghostFactory ?? this._config.defaultGhost)(
      initial
    );

    ghost.setAttribute(this._config.ghostAttribute, '');
    this._resolveLayer().append(ghost);
    return ghost;
  }

  /** Captures the pointer on `element` and adds the operation listeners. */
  protected _startOperationListeners(
    element: HTMLElement,
    pointerId: number,
    onMove: (event: PointerEvent) => void,
    onEnd: (event: PointerEvent) => void
  ): void {
    const { signal } = this._operationAbort;

    this._captureElement = element;
    element.setPointerCapture(pointerId);
    element.addEventListener('pointermove', onMove, { signal });
    element.addEventListener('lostpointercapture', onEnd, { signal });
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
    this._operation = null;
  }

  //#endregion

  //#region Directive life-cycle

  protected override reconnected(): void {
    this._attachTriggerListeners();
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
      this._options = (options ?? {}) as TOptions;
      this._attachTriggerListeners();
    }
    return noChange;
  }

  public render(_options?: TOptions) {
    return noChange;
  }

  //#endregion
}

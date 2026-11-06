import {
  isServer,
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';
import { isEmpty } from '../utils/arrays.js';
import { normalizedTextContent } from '../utils/dom.js';

type InferSlotNames<T> = T extends readonly (infer U)[] ? U : never;

type SlotQueryOptions = {
  /**
   * Whether the query also returns the content of the descendant slots.
   * Defaults to `false`.
   *
   * @remarks
   * A flattened query also returns fallback content: a slot rendered as
   * `<slot>${this.label}</slot>` reports `label` as assigned content,
   * although the consumer projected nothing.
   */
  flatten?: boolean;
  /** The CSS selector that filters the returned elements. */
  selector?: string;
};

type SlotChangeCallback<T> = (
  parameters: SlotChangeCallbackParameters<T>
) => void;

type SlotChangeCallbackParameters<T> = {
  /** The name of the slot with the changed assigned nodes. */
  slot: T;
  isDefault: boolean;
  /** Whether the callback runs for the first host update. */
  isInitial: boolean;
};

type SlotControllerOptions<T> = {
  /** The slot names to observe. */
  slots?: Iterable<T>;
  /** Callback that runs when the assigned nodes of a slot change. */
  onChange?: SlotChangeCallback<T>;
  /** Whether `onChange` also runs once, after the first host update. */
  initial?: boolean;
};

const DefaultSlot = '[default]';

class SlotController<T> implements ReactiveController {
  private readonly _host: ReactiveControllerHost & LitElement;
  private readonly _options: SlotControllerOptions<T>;
  private readonly _slots?: Set<T>;
  private readonly _slotCache = new Map<T | undefined, HTMLSlotElement>();
  private _initialized = false;

  /**
   * Set during the first update of a server-rendered host. The server render
   * has no slotted content, so until the update ends the queries report none
   * and `slotchange` waits; otherwise both renders differ.
   */
  private _hydrating = false;

  /** Whether the hydration made a query report no slot. */
  private _queryWithheld = false;

  /** The `slotchange` callbacks that wait for the end of the hydration. */
  private readonly _pendingChanges: SlotChangeCallbackParameters<T>[] = [];

  constructor(
    host: ReactiveControllerHost & LitElement,
    options?: SlotControllerOptions<T>
  ) {
    this._host = host;
    this._host.addController(this);

    // Lit creates the shadow root on connect, so a root in the constructor is a
    // declarative shadow root from the server. Create the controller there.
    this._hydrating = !isServer && host.shadowRoot !== null;

    this._options = { ...options };
    this._slots = options?.slots ? new Set(options.slots) : undefined;
  }

  /**
   * Finds the slot element with the given name.
   *
   * @remarks
   * The result is cached, because the accessors below run from `render`. The
   * cache serves only a connected slot. A query before the host creates its
   * render root, or during the hydration, reports no slot and raises no error.
   */
  private _getSlot(slotName?: T): HTMLSlotElement | null {
    if (isServer) return null;

    if (this._hydrating) {
      this._queryWithheld = true;
      return null;
    }

    const cached = this._slotCache.get(slotName);

    if (cached?.isConnected) {
      return cached;
    }

    const selector =
      slotName === DefaultSlot
        ? 'slot:not([name])'
        : `slot[name="${slotName}"]`;
    const slot =
      this._host.renderRoot?.querySelector<HTMLSlotElement>(selector) ?? null;

    if (slot) {
      this._slotCache.set(slotName, slot);
    } else {
      this._slotCache.delete(slotName);
    }

    return slot;
  }

  /**
   * Returns the nodes assigned to `slot`. See
   * {@link SlotQueryOptions.flatten}.
   */
  public getAssignedNodes(slot: T, flatten = false): Node[] {
    return this._getSlot(slot)?.assignedNodes({ flatten }) ?? [];
  }

  /** Returns the elements assigned to `slot`, as `options` selects them. */
  public getAssignedElements<U extends Element>(
    slot: T,
    options?: SlotQueryOptions
  ): U[] {
    const elements =
      (this._getSlot(slot)?.assignedElements({
        flatten: options?.flatten,
      }) as U[]) ?? [];

    return options?.selector
      ? elements.filter((e) => e.matches(options.selector!))
      : elements;
  }

  /**
   * Returns the text content assigned to `slot`, trimmed and with collapsed
   * whitespace.
   */
  public getAssignedText(slot: T, flatten = false): string {
    return normalizedTextContent(this.getAssignedNodes(slot, flatten));
  }

  /**
   * Whether `slot` has assigned nodes. A flattened query counts fallback
   * content, so a slot with fallback always reports nodes.
   */
  public hasAssignedNodes(slot: T, flatten = false): boolean {
    return !isEmpty(this.getAssignedNodes(slot, flatten));
  }

  /** Whether `slot` has assigned elements, as `options` selects them. */
  public hasAssignedElements(slot: T, options?: SlotQueryOptions): boolean {
    return !isEmpty(this.getAssignedElements(slot, options));
  }

  /** @internal */
  public hostConnected(): void {
    this._host.renderRoot.addEventListener('slotchange', this);
  }

  /** @internal */
  public hostDisconnected(): void {
    this._host.renderRoot.removeEventListener('slotchange', this);
  }

  public handleEvent(event: Event): void {
    const name = (event.target as HTMLSlotElement).name as T;
    const isDefault = name === '';
    const observed = isDefault ? (DefaultSlot as T) : name;

    if (this._slots && !this._slots.has(observed)) return;

    const change = { slot: name, isDefault, isInitial: false };

    if (this._hydrating) {
      this._pendingChanges.push(change);
    } else {
      this._notifyChange(change);
    }
  }

  private _notifyChange(change: SlotChangeCallbackParameters<T>): void {
    this._options.onChange?.call(this._host, change);
    this._host.requestUpdate();
  }

  /** Runs the waiting `slotchange` callbacks, and renders the slots a query missed. */
  private _endHydration(): void {
    for (const change of this._pendingChanges.splice(0)) {
      this._notifyChange(change);
    }

    if (this._queryWithheld) {
      this._host.requestUpdate();
    }
  }

  /** @internal */
  public hostUpdated(): void {
    if (this._hydrating) {
      this._hydrating = false;
      // Off the update cycle - avoids Lit's change-in-update warning.
      queueMicrotask(() => this._endHydration());
    }

    if (!this._initialized && this._options.initial) {
      this._initialized = true;
      this._options.onChange?.call(this._host, {
        slot: '<initial>' as T,
        isDefault: false,
        isInitial: true,
      });
    }
  }
}

function addSlotController<K extends readonly string[]>(
  host: ReactiveControllerHost,
  options?: SlotControllerOptions<InferSlotNames<K>> & {
    slots?: K;
  }
): SlotController<InferSlotNames<K>> {
  return new SlotController(host as ReactiveControllerHost & LitElement, {
    ...options,
    slots: options?.slots as Iterable<InferSlotNames<K>>,
  });
}

function setSlots<const T extends readonly string[]>(...slots: T) {
  return [DefaultSlot, ...slots] as const;
}

export type {
  InferSlotNames,
  SlotChangeCallback,
  SlotChangeCallbackParameters,
  SlotController,
  SlotControllerOptions,
  SlotQueryOptions,
};
export { addSlotController, DefaultSlot, setSlots };

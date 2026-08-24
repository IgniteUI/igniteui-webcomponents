import {
  isServer,
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';
import { isEmpty } from '../utils/arrays.js';
import { normalizedTextContent } from '../utils/dom.js';

type InferSlotNames<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Additional query options for the slot controller methods.
 */
type SlotQueryOptions = {
  /**
   * If set to `true`, it returns a sequence of both the elements assigned to the queried slot,
   * as well as elements assigned to any other slots that are descendants of this slot. If no
   * assigned elements are found, it returns the slot's fallback content.
   *
   * @remarks
   * Mind that fallback content when checking whether a consumer projected anything:
   * for a slot rendered as `<slot>${this.label}</slot>`, a flattened query reports
   * the rendered `label` as assigned content even though nothing was projected.
   *
   * Defaults to `false`.
   */
  flatten?: boolean;
  /**
   * CSS selector used to filter the elements returned.
   */
  selector?: string;
};

type SlotChangeCallback<T> = (
  parameters: SlotChangeCallbackParameters<T>
) => void;

type SlotChangeCallbackParameters<T> = {
  /** The slot name that has its assigned nodes changed. */
  slot: T;
  /** `true` if the slot is the default slot. */
  isDefault: boolean;
  /** `true` if the callback handler is called for the initial host update. */
  isInitial: boolean;
};

type SlotControllerOptions<T> = {
  /** An iterable collection of slot names to observe. */
  slots?: Iterable<T>;
  /** Callback function which is invoked a slot's assigned nodes change. */
  onChange?: SlotChangeCallback<T>;
  /** If set to `true`, the `onChange` callback is invoked once after the host is updated for the first time. */
  initial?: boolean;
};

const DefaultSlot = '[default]';

class SlotController<T> implements ReactiveController {
  private readonly _host: ReactiveControllerHost & LitElement;
  private readonly _options: SlotControllerOptions<T>;
  private readonly _slots?: Set<T>;
  private readonly _slotCache = new Map<T | undefined, HTMLSlotElement>();
  private _initialized = false;

  constructor(
    host: ReactiveControllerHost & LitElement,
    options?: SlotControllerOptions<T>
  ) {
    this._host = host;
    this._host.addController(this);

    this._options = { ...options };
    this._slots = options?.slots ? new Set(options.slots) : undefined;
  }

  /**
   * The query results are cached, since the accessors below are routinely called
   * from a host's `render`. Only a still connected slot is served from the cache -
   * one removed by a conditional template falls back to a fresh query.
   *
   * There is no slot to find before the host creates its render root, which happens
   * when it connects. A query that comes earlier, such as one from an attribute that
   * the parser applies on upgrade, reports no slot instead of an error.
   */
  private _getSlot(slotName?: T): HTMLSlotElement | null {
    if (isServer) return null;

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
   * Returns an array of the assigned nodes for `slot`.
   *
   * If `flatten` is set to `true`, it returns a sequence of both the nodes assigned to the queried slot,
   * as well as nodes assigned to any other slots that are descendants of this slot. If no
   * assigned nodes are found, it returns the slot's fallback content.
   */
  public getAssignedNodes(slot: T, flatten = false): Node[] {
    return this._getSlot(slot)?.assignedNodes({ flatten }) ?? [];
  }

  /**
   * Returns an array of the assigned elements for `slot` with additional `options`.
   *
   * See {@link SlotQueryOptions.flatten} and {@link SlotQueryOptions.selector} for more information.
   */
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
   * Returns the combined text content of the nodes assigned to `slot`,
   * trimmed and with consecutive whitespace collapsed.
   *
   * Useful for deriving an accessible label from projected content.
   * See {@link SlotQueryOptions.flatten} for the `flatten` semantics.
   */
  public getAssignedText(slot: T, flatten = false): string {
    return normalizedTextContent(this.getAssignedNodes(slot, flatten));
  }

  /**
   * Return whether `slot` has assigned nodes.
   *
   * If `flatten` is set to `true`, it returns a sequence of both the nodes assigned to the queried slot,
   * as well as nodes assigned to any other slots that are descendants of this slot. If no
   * assigned nodes are found, it returns the slot's fallback content - so a slot with
   * fallback content always reports as having nodes. See {@link SlotQueryOptions.flatten}.
   */
  public hasAssignedNodes(slot: T, flatten = false): boolean {
    return !isEmpty(this.getAssignedNodes(slot, flatten));
  }

  /**
   * Return whether `slot` has assigned elements accepting additional `options`.
   *
   * See {@link SlotQueryOptions.flatten} and {@link SlotQueryOptions.selector} for more information.
   */
  public hasAssignedElements(slot: T, options?: SlotQueryOptions): boolean {
    return !isEmpty(this.getAssignedElements(slot, options));
  }

  /** @internal */
  public handleEvent(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const name = slot.name as T;
    const isDefault = name === '';
    const observed = isDefault ? (DefaultSlot as T) : name;

    if (!this._slots || this._slots.has(observed)) {
      this._options.onChange?.call(this._host, {
        slot: name,
        isDefault,
        isInitial: false,
      });
      this._host.requestUpdate();
    }
  }

  /** @internal */
  public hostConnected(): void {
    this._host.renderRoot.addEventListener('slotchange', this);
  }

  /** @internal */
  public hostDisconnected(): void {
    this._host.renderRoot.removeEventListener('slotchange', this);
  }

  /** @internal */
  public hostUpdated(): void {
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

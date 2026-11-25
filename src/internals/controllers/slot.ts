import {
  isServer,
  type LitElement,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';
import { isEmpty } from '../utils/arrays.js';
import { isAssignedTo, normalizedTextContent } from '../utils/dom.js';

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
  slots?: readonly T[];
  /** Callback that runs when the assigned nodes of a slot change. */
  onChange?: SlotChangeCallback<T>;
  /** Whether `onChange` also runs once, after the first host update. */
  initial?: boolean;
};

const DefaultSlot = '[default]';

/** Returns the `name` of the slot element for a controller slot key. */
function slotNameOf(slot: unknown): string {
  return slot === DefaultSlot ? '' : String(slot);
}

/**
 * Whether `node` is a slot in a shadow tree. The checks do not use
 * `instanceof`, so they also accept a slot adopted from an iframe.
 */
function isShadowSlot(node: Node): node is HTMLSlotElement {
  // Only the root of a shadow tree is different from the composed root.
  return (
    node.nodeType === Node.ELEMENT_NODE &&
    (node as Element).localName === 'slot' &&
    node.getRootNode() !== node.getRootNode({ composed: true })
  );
}

class SlotController<T> implements ReactiveController {
  private readonly _host: ReactiveControllerHost & LitElement;
  private readonly _options: SlotControllerOptions<T>;
  private readonly _slotCache = new Map<T | undefined, HTMLSlotElement>();
  private _initialized = false;

  /**
   * Set from `hostUpdate` of the first update. Until the template commits, a
   * query reads the host children.
   */
  private _inFirstUpdate = false;

  /**
   * The child count of the render root before the first render. The root can
   * have other nodes, such as a style from `createRenderRoot`.
   */
  private _rootChildCount = 0;

  /**
   * Set during the first update of a server-rendered host. The server render
   * has no slotted content, so until the update ends the queries report none
   * and `slotchange` waits; otherwise both renders differ.
   */
  private _hydrating = false;

  /** Whether the hydration made a query report no slot. */
  private _queryWithheld = false;

  /** The `slotchange` callbacks that wait for the end of the hydration. */
  private _pendingChanges?: SlotChangeCallbackParameters<T>[];

  constructor(
    host: ReactiveControllerHost & LitElement,
    options: SlotControllerOptions<T>
  ) {
    this._host = host;
    this._host.addController(this);

    // Lit creates the shadow root on connect, so a root in the constructor is a
    // declarative shadow root from the server. Create the controller there.
    this._hydrating = !isServer && host.shadowRoot !== null;

    this._options = options;
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

    const name = slotNameOf(slotName);
    const selector = name ? `slot[name="${name}"]` : 'slot:not([name])';
    const slot =
      this._host.renderRoot?.querySelector<HTMLSlotElement>(selector) ?? null;

    if (slot) {
      this._slotCache.set(slotName, slot);
    } else {
      this._slotCache.delete(slotName);
    }

    return slot;
  }

  /** Returns the host children that `slot` gets once it renders. */
  private _lightDomNodes(slot: T, flatten: boolean): Node[] {
    const name = slotNameOf(slot);
    const nodes: Node[] = [];

    for (const node of this._host.childNodes) {
      if (!isAssignedTo(node, name)) continue;

      if (flatten && isShadowSlot(node)) {
        nodes.push(...node.assignedNodes({ flatten: true }));
      } else {
        nodes.push(node);
      }
    }

    return nodes;
  }

  /**
   * Returns the nodes assigned to `slot`. See
   * {@link SlotQueryOptions.flatten}.
   *
   * @remarks
   * The slots do not exist before the first template commits, so a query from
   * the first render reads the host children. It also reports content for a
   * slot that the template does not render, and a flattened query returns no
   * fallback content. An earlier query, such as from a setter, reports none.
   */
  public getAssignedNodes(slot: T, flatten = false): Node[] {
    const slotElement = this._getSlot(slot);

    if (slotElement) {
      return slotElement.assignedNodes({ flatten });
    }

    // Lit adds a marker node to the render root when it commits the first
    // template. After that, a missing slot is one that the template leaves out.
    return this._inFirstUpdate &&
      this._host.renderRoot.childNodes.length === this._rootChildCount
      ? this._lightDomNodes(slot, flatten)
      : [];
  }

  /** Returns the elements assigned to `slot`, as `options` selects them. */
  public getAssignedElements<U extends Element>(
    slot: T,
    options?: SlotQueryOptions
  ): U[] {
    // An element adopted from an iframe fails `isElement`, as `instanceof Node`.
    const elements = this.getAssignedNodes(slot, options?.flatten).filter(
      (node) => node.nodeType === Node.ELEMENT_NODE
    ) as U[];

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
   * Whether `slot` has assigned nodes. See {@link SlotQueryOptions.flatten}.
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

    if (this._options.slots && !this._options.slots.includes(observed)) return;

    const change = { slot: name, isDefault, isInitial: false };

    if (this._hydrating) {
      (this._pendingChanges ??= []).push(change);
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
    const pending = this._pendingChanges ?? [];
    this._pendingChanges = undefined;

    for (const change of pending) {
      this._notifyChange(change);
    }

    if (this._queryWithheld) {
      this._host.requestUpdate();
    }
  }

  /** @internal */
  public hostUpdate(): void {
    // The server and the hydrating render have no slotted content. A manual
    // slot assignment does not follow the `slot` attributes.
    if (
      isServer ||
      this._hydrating ||
      this._host.hasUpdated ||
      this._host.shadowRoot?.slotAssignment === 'manual'
    ) {
      return;
    }

    this._inFirstUpdate = true;
    this._rootChildCount = this._host.renderRoot.childNodes.length;
    // A render that throws commits nothing, so the flag must end too.
    queueMicrotask(() => {
      this._inFirstUpdate = false;
    });
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
  options: SlotControllerOptions<InferSlotNames<K>> & {
    slots?: K;
  }
): SlotController<InferSlotNames<K>> {
  return new SlotController(
    host as ReactiveControllerHost & LitElement,
    options
  );
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

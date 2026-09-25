import type { ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref.js';
import { createAbortHandle } from '../abort-handler.js';
import { asArray, partition } from '../utils/arrays.js';
import { isElement } from '../utils/dom.js';
import { isFunction } from '../utils/types.js';
import { addHostListeners } from './host-listeners.js';
import { enterKey, spaceBar } from './keys.js';

// Re-exported from `./keys.js`, so a consumer keeps a single import.
export * from './keys.js';

//#region Modifiers and combination keys

/**
 * Each modifier and the `KeyboardEvent` property it reads; `control` maps to
 * `ctrlKey`. The alphabetical order is what a combination key inherits.
 */
const MODIFIER_ENTRIES = [
  ['alt', 'altKey'],
  ['control', 'ctrlKey'],
  ['meta', 'metaKey'],
  ['shift', 'shiftKey'],
] as const satisfies ReadonlyArray<readonly [string, keyof KeyboardEvent]>;

const ALL_MODIFIER_VALUES = MODIFIER_ENTRIES.map(([name]) => name);
const MODIFIERS = new Set<string>(ALL_MODIFIER_VALUES);

/**
 * {@link MODIFIER_ENTRIES} as a name to event property lookup.
 * @internal Used by the keyboard simulation helper of the test suite.
 */
export const MODIFIER_EVENT_KEYS: Record<string, string> =
  Object.fromEntries(MODIFIER_ENTRIES);

/**
 * Splits the keys into modifiers (Alt, Control, Meta, Shift) and normal keys,
 * in lower case.
 *
 * @internal
 */
export function parseKeys(inputKeys: string | string[]): {
  keys: string[];
  modifiers: string[];
} {
  const [modifiers, keys] = partition(
    asArray(inputKeys).map((key) => key.toLowerCase()),
    (key) => MODIFIERS.has(key)
  );
  return { keys, modifiers };
}

/** Sorts `modifiers` alphabetically. */
function sortModifiers(modifiers: string[]): string[] {
  return ALL_MODIFIER_VALUES.filter((mod) => modifiers.includes(mod));
}

/** Returns the modifiers active for `event`, already sorted. */
function getActiveModifiers(event: KeyboardEvent): string[] {
  const active: string[] = [];

  for (const [name, property] of MODIFIER_ENTRIES) {
    if (event[property]) {
      active.push(name);
    }
  }

  return active;
}

/** Whether `event` carries at least one active modifier. */
function hasModifiers(event: KeyboardEvent): boolean {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

/**
 * Joins keys and modifiers into a `+` separated combination key, sorted
 * alphabetically. `modifiers` must already be sorted; see
 * {@link sortModifiers} and {@link getActiveModifiers}.
 */
function createCombinationKey(keys: string[], modifiers: string[]): string {
  return modifiers.concat(keys.length > 1 ? keys.toSorted() : keys).join('+');
}

//#endregion

//#region Types

type KeyBindingHandler = (event: KeyboardEvent) => void;
type KeyBindingObserverCleanup = { unsubscribe: () => void };

/**
 * Whether the controller must ignore the current event.
 *
 * @param node - The target of the event.
 * @param event - The event.
 */
type KeyBindingSkipCallback = (node: Element, event: KeyboardEvent) => boolean;

/** The event type that starts the bound handler. */
type KeyBindingTrigger = 'keydown' | 'keyup';

/** @hidden */
interface KeyBindingControllerOptions {
  /** The element to observe. Defaults to the host element. */
  ref?: Ref;
  /**
   * The key presses that the controller ignores. CSS selectors match against
   * the composed path of the event; a {@link KeyBindingSkipCallback} decides
   * per event instead. Defaults to `['input', 'textarea', 'select']`.
   *
   * @example
   * ```ts
   * {
   *  // Skip events originating from elements with `readonly` attribute
   *  skip: ['[readonly]']
   * }
   * ...
   * {
   * // Same as above but with a callback
   *  skip: (node: Element) => node.hasAttribute('readonly')
   * }
   * ```
   */
  skip?: string[] | KeyBindingSkipCallback;
  /** Default options for every binding. A `set` call merges over them. */
  bindingDefaults?: KeyBindingOptions;
}

interface KeyBindingOptions {
  /** The event types that start the handler. Defaults to `keydown`. */
  triggers?: KeyBindingTrigger[];
  /** Whether the handler runs for a repeated keydown. Defaults to `false`. */
  repeat?: boolean;
  /** Whether to call `preventDefault` before the handler runs. */
  preventDefault?: boolean;
  /** Whether to call `stopPropagation` before the handler runs. */
  stopPropagation?: boolean;
}

/** A registered binding. The key of the binding map holds the combination. */
interface KeyBinding {
  handler: KeyBindingHandler;
  options?: KeyBindingOptions;
}

//#endregion

//#region Internal functions and constants

function isKeydown(event: Event): boolean {
  return event.type === 'keydown';
}

function isKeyup(event: Event): boolean {
  return event.type === 'keyup';
}

//#endregion

/**
 * Manages the key bindings of a host element.
 * @hidden
 */
class KeyBindingController {
  //#region Private properties and state

  /** Base configuration, shared between instances. Never written to. */
  private static readonly _defaultOptions = {
    skip: ['input', 'textarea', 'select'],
    bindingDefaults: { preventDefault: true },
  } satisfies KeyBindingControllerOptions;

  private readonly _host: ReactiveControllerHost & Element;
  private readonly _ref?: Ref;

  private readonly _bindings = new Map<string, KeyBinding>();
  private readonly _allowedKeys = new Set<string>();
  private readonly _pressedKeys = new Set<string>();

  private readonly _bindingDefaults: KeyBindingOptions;
  private readonly _skipSelector?: string;
  private readonly _skipCallback?: KeyBindingSkipCallback;

  private _observedElement?: Element;

  private get _element(): Element {
    if (this._observedElement) {
      return this._observedElement;
    }
    return this._ref?.value || this._host;
  }

  //#endregion

  constructor(
    host: ReactiveControllerHost & Element,
    options?: KeyBindingControllerOptions
  ) {
    const defaults = KeyBindingController._defaultOptions;
    const skip = options?.skip ?? defaults.skip;

    this._host = host;
    this._ref = options?.ref;

    // Host options merge over the defaults instead of replacing them.
    this._bindingDefaults = {
      ...defaults.bindingDefaults,
      ...options?.bindingDefaults,
    };

    if (isFunction(skip)) {
      this._skipCallback = skip;
    } else {
      this._skipSelector = skip.join(',');
    }

    addHostListeners(host, { events: ['keyup', 'keydown'], listener: this });
    addHostListeners(host, {
      target: globalThis,
      events: ['blur'],
      listener: this,
    });
  }

  //#region Private API

  /** Applies the event options of the binding to the keyboard event. */
  private _applyEventModifiers(
    binding: KeyBinding,
    event: KeyboardEvent
  ): void {
    if (binding.options?.preventDefault) {
      event.preventDefault();
    }

    if (binding.options?.stopPropagation) {
      event.stopPropagation();
    }
  }

  /** Whether the event type matches the triggers of the binding. */
  private _bindingMatches(binding: KeyBinding, event: KeyboardEvent): boolean {
    const triggers = binding.options?.triggers ?? ['keydown'];

    if (isKeydown(event) && triggers.includes('keydown')) {
      return !event.repeat || Boolean(binding.options?.repeat);
    }

    if (isKeyup(event) && triggers.includes('keyup')) {
      return true;
    }

    return false;
  }

  /**
   * Whether to ignore the event. The key has no binding, the event missed the
   * observed element, or the skip configuration agrees.
   */
  private _shouldSkip(event: KeyboardEvent, key: string): boolean {
    if (!this._allowedKeys.has(key)) {
      return true;
    }

    const element = this._element;
    const selector = this._skipSelector;

    // The host carries the listeners. Only a `ref` puts the observed element
    // deeper in the tree, where the path must confirm containment.
    const needsContainmentCheck = element !== this._host;

    if (needsContainmentCheck || selector) {
      // The path runs target first, so the scan stops at the observed element.
      let reachedElement = false;

      for (const node of event.composedPath()) {
        if (node === element) {
          reachedElement = true;
          break;
        }

        if (selector && isElement(node) && node.matches(selector)) {
          return true;
        }
      }

      if (needsContainmentCheck && !reachedElement) {
        return true;
      }
    }

    return this._skipCallback
      ? this._skipCallback.call(this._host, event.target as Element, event)
      : false;
  }

  //#endregion

  //#region Event handling

  /**
   * Clears the pressed keys on a global blur. No keyup arrives if the user
   * moves to a different application or tab with a key down.
   */
  private _handleGlobalBlur(): void {
    this._pressedKeys.clear();
  }

  /** Handles a keyboard event on the observed element. */
  private _handleKeyEvent(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const isModifier = MODIFIERS.has(key);

    if (this._shouldSkip(event, key)) {
      // A keyup always cleans up the key, also for an event that it skips.
      if (!isModifier && isKeyup(event)) {
        this._pressedKeys.delete(key);
      }
      return;
    }

    if (!isModifier) {
      this._pressedKeys.add(key);
    }

    let binding: KeyBinding | undefined;

    if (!isModifier && !hasModifiers(event) && this._pressedKeys.size === 1) {
      // Fast path: one key, no modifier. The combination is the key itself,
      // so the lookup builds no arrays or strings.
      binding = this._bindings.get(key);
    } else {
      const activeModifiers = getActiveModifiers(event);

      const combination = createCombinationKey(
        Array.from(this._pressedKeys),
        activeModifiers
      );
      binding = this._bindings.get(combination);

      // Overlapping presses leave several regular keys down, so the full
      // combination matches no single-key binding. Fall back to the current
      // key, so its binding still runs while another key stays down.
      if (!binding && this._pressedKeys.size > 1) {
        binding = this._bindings.get(
          createCombinationKey([key], activeModifiers)
        );
      }
    }

    if (binding && this._bindingMatches(binding, event)) {
      this._applyEventModifiers(binding, event);
      binding.handler.call(this._host, event);
    }

    if (!isModifier && isKeyup(event)) {
      this._pressedKeys.delete(key);
    }
  }

  /** @internal */
  public handleEvent(event: KeyboardEvent | FocusEvent): void {
    switch (event.type) {
      case 'keydown':
      case 'keyup':
        this._handleKeyEvent(event as KeyboardEvent);
        break;
      case 'blur':
        this._handleGlobalBlur();
        break;
    }
  }

  //#endregion

  //#region Public API

  /**
   * Registers a binding for a key or a combination, such as `['shift', 'a']`.
   * Returns the controller, for chaining.
   */
  public set(
    key: string | string[],
    handler: KeyBindingHandler,
    bindingOptions?: KeyBindingOptions
  ): this {
    const { keys, modifiers } = parseKeys(key);
    const combination = createCombinationKey(keys, sortModifiers(modifiers));
    const options = { ...this._bindingDefaults, ...bindingOptions };

    for (const each of [...keys, ...modifiers]) {
      this._allowedKeys.add(each);
    }

    this._bindings.set(combination, { handler, options });

    return this;
  }

  /**
   * Registers `handler` for both the Enter key and the Space bar. Returns the
   * controller, for chaining.
   */
  public setActivateHandler(
    handler: KeyBindingHandler,
    options?: KeyBindingOptions
  ): this {
    this.set(enterKey, handler, options);
    this.set(spaceBar, handler, options);

    return this;
  }

  /**
   * Listens for keyboard events on any page element, with the configuration
   * and the handlers of this controller. Call `unsubscribe` to stop.
   */
  public observeElement(element: Element): KeyBindingObserverCleanup {
    const handle = createAbortHandle();
    const { signal } = handle;

    element.addEventListener('keydown', this, { signal });
    element.addEventListener('keyup', this, { signal });
    this._observedElement = element;

    return {
      unsubscribe: () => {
        handle.abort();

        if (this._observedElement === element) {
          this._observedElement = undefined;
        }
      },
    };
  }

  //#endregion
}

/**
 * Creates a {@link KeyBindingController}, and adds it to the given host.
 *
 * @param element - The host element of the controller.
 * @param options - The configuration of the controller.
 * @returns The new controller.
 *
 * @example
 * ```ts
 * class MyComponent extends LitElement {
 *   // `skip` ignores the key presses that come from these elements.
 *   // `bindingDefaults` applies to each binding of the controller.
 *   private _keyBindings = addKeybindings(this, {
 *     skip: ['input', 'textarea'],
 *     bindingDefaults: { preventDefault: true },
 *   });
 *
 *   constructor() {
 *     super();
 *     // A combination is an array of key names, not one joined string.
 *     this._keyBindings.set([ctrlKey, 's'], this._handleSave);
 *   }
 * }
 * ```
 */
export function addKeybindings(
  element: ReactiveControllerHost & Element,
  options?: KeyBindingControllerOptions
): KeyBindingController {
  return new KeyBindingController(element, options);
}

export type {
  KeyBindingController,
  KeyBindingControllerOptions,
  KeyBindingHandler,
  KeyBindingObserverCleanup,
  KeyBindingOptions,
  KeyBindingSkipCallback,
  KeyBindingTrigger,
};

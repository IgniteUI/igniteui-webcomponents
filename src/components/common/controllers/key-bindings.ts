import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref.js';
import { createAbortHandle } from '../abort-handler.js';
import {
  asArray,
  findElementFromEventPath,
  isFunction,
  partition,
  toMerged,
} from '../util.js';

//#region Keys and modifiers

/* Common keys */
export const arrowLeft = 'ArrowLeft' as const;
export const arrowRight = 'ArrowRight' as const;
export const arrowUp = 'ArrowUp' as const;
export const arrowDown = 'ArrowDown' as const;
export const enterKey = 'Enter' as const;
export const spaceBar = ' ' as const;
export const escapeKey = 'Escape' as const;
export const homeKey = 'Home' as const;
export const endKey = 'End' as const;
export const pageUpKey = 'PageUp' as const;
export const pageDownKey = 'PageDown' as const;
export const tabKey = 'Tab' as const;

/* Modifiers */
export const altKey = 'Alt' as const;
export const ctrlKey = 'Ctrl' as const;
export const metaKey = 'Meta' as const;
export const shiftKey = 'Shift' as const;

//#endregion

//#region Types

/* Types */
type KeyBindingHandler = (event: KeyboardEvent) => void;
type KeyBindingObserverCleanup = { unsubscribe: () => void };

/**
 * Whether the current event should be ignored by the controller.
 *
 * @param node - The event target
 * @param event - The event object
 *
 * When `true` is returned, the current event is ignored.
 */
type KeyBindingSkipCallback = (node: Element, event: KeyboardEvent) => boolean;

/**
 * The event type which will trigger the bound handler.
 */
type KeyBindingTrigger = 'keydown' | 'keyup';

/**
 * Configuration object for the controller.
 * @ignore
 */
interface KeyBindingControllerOptions {
  /**
   * By default, the controller listens for keypress events in the context of the host element.
   * If you pass a `ref`, you can limit the observation to a certain DOM part of the host scope.
   */
  ref?: Ref;
  /**
   * Option to ignore key press events.
   *
   * If passed an array of CSS selectors, it will ignore key presses originating from elements in the event composed path
   * that match one of the selectors.
   * Otherwise you can pass a {@link KeyBindingSkipCallback} function.
   *
   * Defaults to `['input', 'textarea', 'select']`.
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
  /**
   * A set of KeyBindingOptions configuration which is applied to every handler
   * that is added to the controller.
   *
   * Any additional KeyBindingOptions values passed when `set` is called
   * will be merged with `bindingDefaults`.
   */
  bindingDefaults?: KeyBindingOptions;
}

/**
 * Configuration object for customizing the behavior of
 * the registered handler.
 */
interface KeyBindingOptions {
  /**
   * The event type(s) on which the handler will be invoked.
   *
   * Defaults to `keydown` if not set.
   */
  triggers?: KeyBindingTrigger[];
  /**
   * Whether the handler should fire on auto-repeated keydown events (i.e. when a key is held down).
   *
   * Defaults to `false`.
   */
  repeat?: boolean;
  /**
   * Whether to call `preventDefault` on the target event before the handler is invoked.
   */
  preventDefault?: boolean;
  /**
   * Whether to call `stopPropagation` on the target event before the handler is invoked.
   */
  stopPropagation?: boolean;
}

interface KeyBinding {
  keys: string[];
  handler: KeyBindingHandler;
  options?: KeyBindingOptions;
  modifiers: string[];
}

//#endregion

//#region Internal functions and constants

const MODIFIERS = new Set(['alt', 'ctrl', 'meta', 'shift']);
const ALL_MODIFIER_VALUES = Array.from(MODIFIERS).sort();

function normalizeKeys(keys: string | string[]): string[] {
  return asArray(keys).map((key) => key.toLowerCase());
}

function isKeydown(event: Event): boolean {
  return event.type === 'keydown';
}

function isKeyup(event: Event): boolean {
  return event.type === 'keyup';
}

/**
 * Creates a normalized combination key string from the provided keys and modifiers.
 *
 * The combination key is a string that uniquely identifies a specific combination of keys and modifiers.
 * It is created by sorting the keys and modifiers alphabetically and joining them with a '+' separator.
 */
function createCombinationKey(keys: string[], modifiers: string[]): string {
  const sortedKeys = keys.toSorted();
  const sortedModifiers = ALL_MODIFIER_VALUES.filter((mod) =>
    modifiers.includes(mod)
  ).sort();

  return sortedModifiers.concat(sortedKeys).join('+');
}

//#endregion

/**
 * A controller for managing key bindings on a host element. It allows you to register handlers for specific key combinations,
 * with support for modifier keys and event options such as `preventDefault` and `stopPropagation`.
 *
 * The controller listens for keyboard events on the host element (or an optionally specified element) and invokes the appropriate handlers
 * when the registered key combinations are detected.
 *
 */
class KeyBindingController implements ReactiveController {
  //#region Private properties and state

  private static readonly _defaultOptions: KeyBindingControllerOptions = {
    skip: ['input', 'textarea', 'select'],
    bindingDefaults: { preventDefault: true },
  };

  private readonly _host: ReactiveControllerHost & Element;
  private readonly _ref?: Ref;
  private readonly _abortHandle = createAbortHandle();

  private readonly _bindings = new Map<string, KeyBinding>();
  private readonly _allowedKeys = new Set<string>();
  private readonly _pressedKeys = new Set<string>();

  private readonly _options: KeyBindingControllerOptions;
  private readonly _skipSelector: string | undefined;

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
    this._host = host;
    this._ref = options?.ref;
    this._options = toMerged(
      KeyBindingController._defaultOptions,
      options ?? {}
    );

    if (Array.isArray(this._options.skip)) {
      this._skipSelector = this._options.skip.join(',');
    }

    host.addController(this);
  }

  //#region Private API

  /**
   * Applies the event modifiers specified in the binding options to the provided keyboard event.
   * If `preventDefault` is set, it calls `event.preventDefault()`.
   * If `stopPropagation` is set, it calls `event.stopPropagation()`.
   */
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

  /**
   * Determines whether the provided keyboard event matches the specified key binding,
   * taking into account the event type and the binding's trigger options.
   */
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
   * Determines whether the provided event should be ignored based on the controller's configuration and the event's context.
   * The method checks if the event's key is among the allowed keys, if the event originated from within the controller's scope,
   * and if it matches any of the skip conditions defined in the controller's options.
   */
  private _shouldSkip(event: KeyboardEvent): boolean {
    const skip = this._options.skip;

    if (!this._allowedKeys.has(event.key.toLowerCase())) {
      return true;
    }

    if (!findElementFromEventPath((e) => e === this._element, event)) {
      return true;
    }

    if (Array.isArray(skip)) {
      if (!this._skipSelector) {
        return false;
      }

      return Boolean(findElementFromEventPath(this._skipSelector, event));
    }

    if (isFunction(skip)) {
      return skip.call(this._host, event.target as Element, event);
    }

    return false;
  }

  //#endregion

  //#region Controller lifecycle

  /** @internal */
  public hostConnected(): void {
    const { signal } = this._abortHandle;
    this._host.addEventListener('keyup', this, { signal });
    this._host.addEventListener('keydown', this, { signal });
    globalThis.addEventListener('blur', this, { signal });
  }

  /** @internal */
  public hostDisconnected(): void {
    this._abortHandle.abort();
  }

  //#endregion

  //#region Event handling

  /**
   * Handles the global blur event to clear the internal state of pressed keys.
   *
   * This is necessary to prevent "stuck" keys when the user switches to another application
   * or tab while holding down a key.
   */
  private _handleGlobalBlur(): void {
    this._pressedKeys.clear();
  }

  /**
   * Handles keyboard events on the observed element.
   *
   * It checks if the event should be skipped based on the controller's configuration,
   * and if not, it determines if there is a registered handler for the combination of pressed keys and active modifiers.
   *
   * If a matching handler is found, it applies the specified event modifiers and invokes the handler.
   * It also manages the internal state of currently pressed keys to accurately detect key combinations.
   *
   */
  private _handleKeyEvent(event: KeyboardEvent): void {
    if (this._shouldSkip(event)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (!MODIFIERS.has(key)) {
      this._pressedKeys.add(key);
    }

    const activeModifiers = ALL_MODIFIER_VALUES.filter(
      (mod) => event[`${mod}Key` as keyof KeyboardEvent]
    );

    const combination = createCombinationKey(
      Array.from(this._pressedKeys),
      activeModifiers
    );
    const binding = this._bindings.get(combination);

    if (binding && this._bindingMatches(binding, event)) {
      this._applyEventModifiers(binding, event);
      binding.handler.call(this._host, event);
    }

    if (!MODIFIERS.has(key) && isKeyup(event)) {
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
   * Registers a key binding with the specified key(s), handler function, and optional configuration.
   *
   * The `key` parameter can be a single key or an array of keys, and can include modifier keys (e.g., 'ctrl+s', ['shift', 'a']).
   * The `handler` is a function that will be called when the specified key combination is detected.
   * The `bindingOptions` allow you to customize the behavior of the binding, such as which event types trigger the handler,
   * whether it should fire on auto-repeated keydown events, and whether to call `preventDefault` or `stopPropagation`.
   *
   * The method returns the controller instance to allow for method chaining.
   */
  public set(
    key: string | string[],
    handler: KeyBindingHandler,
    bindingOptions?: KeyBindingOptions
  ): this {
    const { keys, modifiers } = parseKeys(key);
    const combination = createCombinationKey(keys, modifiers);
    const options = toMerged(
      this._options.bindingDefaults!,
      bindingOptions ?? {}
    );

    for (const each of [...keys, ...modifiers]) {
      this._allowedKeys.add(each);
    }

    this._bindings.set(combination, { keys, handler, options, modifiers });

    return this;
  }

  /**
   * Registers the provided handler function to be called when either the Enter key or Space bar is pressed.
   *
   * This is a common pattern for activating buttons or interactive elements, and this method provides a convenient way to set up such bindings.
   *
   * The method accepts optional `KeyBindingOptions` which are applied to both the Enter key and Space bar bindings.
   * It returns the controller instance to allow for method chaining.
   *
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
   * Sets the controller to listen for keyboard events on an arbitrary `element` in the page context.
   * All the configuration and event handlers are applied as well.
   *
   * Returns an object with an `unsubscribe` function which should be called when the observing of keyboard
   * events on the `element` should cease.
   */
  public observeElement(element: Element): KeyBindingObserverCleanup {
    element.addEventListener('keydown', this);
    element.addEventListener('keyup', this);
    this._observedElement = element;

    return {
      unsubscribe: () => {
        this._observedElement?.removeEventListener('keydown', this);
        this._observedElement?.removeEventListener('keyup', this);
        this._observedElement = undefined;
      },
    };
  }

  //#endregion
}

/**
 * Parses the provided key(s) and separates them into modifiers and regular keys.
 *
 * Modifiers are keys like Alt, Ctrl, Meta and Shift which modify the behavior of other keys when pressed in combination.
 * Regular keys are all other keys which trigger the bound handler when pressed.
 *
 * The returned `keys` and `modifiers` are normalized to lowercase for consistency.
 *
 * @internal
 *
 * @param inputKeys - The key or keys to parse, provided as a string or an array of strings.
 * @returns An object containing the separated `keys` and `modifiers`.
 */
export function parseKeys(inputKeys: string | string[]): {
  keys: string[];
  modifiers: string[];
} {
  const [modifiers, keys] = partition(normalizeKeys(inputKeys), (key) =>
    MODIFIERS.has(key)
  );
  return { keys, modifiers };
}

/**
 * Controller factory function which creates a {@link KeyBindingController} instance and attaches it to the provided host.
 *
 * @param element - The host element to which the controller will be attached.
 * @param options - Optional configuration for the controller.
 * @returns The created {@link KeyBindingController} instance.
 *
 * @example
 * ```ts
 * class MyComponent extends LitElement {
 *   private _keyBindings = addKeybindings(this, {
 *     skip: ['input', 'textarea'], // Optional: Skip key events originating from these elements
 *     bindingDefaults: { preventDefault: true }, // Optional: Default options for all bindings
 *   });
 *
 *   constructor() {
 *     super();
 *     this._keyBindings.set('ctrl+s', this._handleSave); // Register a key binding
 *   }
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

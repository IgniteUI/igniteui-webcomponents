import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref.js';
import { asArray, findElementFromEventPath, isFunction } from '../util.js';

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
 *
 * @remarks
 * `keydownRepeat` is similar to `keydown` with the exception
 * that after the handler is invoked the pressed state of the key is reset
 * in the controller.
 */
type KeyBindingTrigger = 'keydown' | 'keyup' | 'keydownRepeat';

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

const Modifiers: Map<string, string> = new Map([
  [altKey.toLowerCase(), altKey.toLowerCase()],
  [ctrlKey.toLowerCase(), ctrlKey.toLowerCase()],
  [metaKey.toLowerCase(), metaKey.toLowerCase()],
  [shiftKey.toLowerCase(), shiftKey.toLowerCase()],
]);

const ALL_MODIFIER_VALUES = Array.from(Modifiers.values()).sort();

function normalizeKeys(keys: string | string[]): string[] {
  return asArray(keys).map((key) => key.toLowerCase());
}

function isKeydown(event: Event): boolean {
  return event.type === 'keydown';
}

function isKeyup(event: Event): boolean {
  return event.type === 'keyup';
}

function isKeydownTrigger(triggers?: KeyBindingTrigger[]): boolean {
  return triggers
    ? triggers.includes('keydown') || isKeydownRepeatTrigger(triggers)
    : false;
}

function isKeyupTrigger(triggers?: KeyBindingTrigger[]): boolean {
  return triggers ? triggers.includes('keyup') : false;
}

function isKeydownRepeatTrigger(triggers?: KeyBindingTrigger[]): boolean {
  return triggers ? triggers.includes('keydownRepeat') : false;
}

function createCombinationKey(keys: string[], modifiers: string[]): string {
  const sortedKeys = keys.toSorted();
  const sortedModifiers = ALL_MODIFIER_VALUES.filter((mod) =>
    modifiers.includes(mod)
  ).sort();

  return sortedModifiers.concat(sortedKeys).join('+');
}

//#endregion

class KeyBindingController implements ReactiveController {
  //#region Private properties and state

  private static readonly _defaultOptions: KeyBindingControllerOptions = {
    skip: ['input', 'textarea', 'select'],
  };

  private readonly _host: ReactiveControllerHost & Element;
  private readonly _ref?: Ref;

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
    this._options = { ...KeyBindingController._defaultOptions, ...options };

    if (Array.isArray(this._options.skip)) {
      this._skipSelector = this._options.skip.join(',');
    }

    host.addController(this);
  }

  //#region Private API

  /**
   * Checks and executes any event modifiers that are present in the matched binding.
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

  private _bindingMatches(binding: KeyBinding, event: KeyboardEvent): boolean {
    const triggers = binding.options?.triggers ?? ['keydown'];

    if (isKeydown(event) && isKeydownTrigger(triggers)) {
      return true;
    }

    if (isKeyup(event) && isKeyupTrigger(triggers)) {
      return true;
    }

    return false;
  }

  private _shouldSkip(event: KeyboardEvent): boolean {
    const skip = this._options?.skip;

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

  //#region Controller specific handlers

  /** @internal */
  public hostConnected(): void {
    this._host.addEventListener('keyup', this);
    this._host.addEventListener('keydown', this);
  }

  /** @internal */
  public hostDisconnected(): void {
    this._host.removeEventListener('keyup', this);
    this._host.removeEventListener('keydown', this);
  }

  /** @internal */
  public handleEvent(event: KeyboardEvent): void {
    if (this._shouldSkip(event)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (!Modifiers.has(key)) {
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

      if (isKeydownRepeatTrigger(binding.options?.triggers)) {
        this._pressedKeys.delete(key);
      }
    }

    if (isKeyup(event) && !Modifiers.has(key)) {
      this._pressedKeys.delete(key);
    }
  }

  //#endregion

  //#region Public API

  /**
   * Registers a keybinding handler.
   */
  public set(
    key: string | string[],
    handler: KeyBindingHandler,
    bindingOptions?: KeyBindingOptions
  ) {
    const { keys, modifiers } = parseKeys(key);
    const combination = createCombinationKey(keys, modifiers);
    const options = { ...this._options?.bindingDefaults, ...bindingOptions };

    for (const each of [...keys, ...modifiers]) {
      this._allowedKeys.add(each);
    }

    this._bindings.set(combination, { keys, handler, options, modifiers });

    return this;
  }

  /**
   * Register a handler function which is called when the target receives a key
   * which "activates" it.
   *
   * In the browser context this is usually either an Enter and Space bar keypress.
   */
  public setActivateHandler(
    handler: KeyBindingHandler,
    options?: KeyBindingOptions
  ) {
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

/** @internal */
export function parseKeys(keys: string | string[]) {
  const normalizedKeys = normalizeKeys(keys);
  return {
    keys: normalizedKeys.filter((key) => !Modifiers.has(key)),
    modifiers: normalizedKeys.filter((key) => Modifiers.has(key)),
  };
}

/**
 * Creates a keybinding controller and adds to it to the passed `element`
 * with the provided `options`.
 */
export function addKeybindings(
  element: ReactiveControllerHost & Element,
  options?: KeyBindingControllerOptions
): KeyBindingController {
  return new KeyBindingController(element, options);
}

export type {
  KeyBindingHandler,
  KeyBindingObserverCleanup,
  KeyBindingSkipCallback,
  KeyBindingTrigger,
  KeyBindingControllerOptions,
  KeyBindingOptions,
  KeyBindingController,
};

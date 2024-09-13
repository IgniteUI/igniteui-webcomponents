import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref.js';

import { findElementFromEventPath } from '../util.js';

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

/* Types */
export type KeyBindingHandler = (event: KeyboardEvent) => void;
export type KeyBindingObserverCleanup = { unsubscribe: () => void };

/**
 * Whether the current event should be ignored by the controller.
 *
 * @param node - The event target
 * @param event - The event object
 *
 * When `true` is returned, the current event is ignored.
 */
export type KeyBindingSkipCallback = (
  node: Element,
  event: KeyboardEvent
) => boolean;

/**
 * The event type which will trigger the bound handler.
 *
 * @remarks
 * `keydownRepeat` is similar to `keydown` with the exception
 * that after the handler is invoked the pressed state of the key is reset
 * in the controller.
 */
export type KeyBindingTrigger = 'keydown' | 'keyup' | 'keydownRepeat';

/**
 * Configuration object for the controller.
 * @ignore
 */
export interface KeyBindingControllerOptions {
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
export interface KeyBindingOptions {
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
  modifiers?: string[];
}

const Modifiers: Map<string, string> = new Map(
  [altKey, ctrlKey, metaKey, shiftKey].map((key) => {
    const mod = key.toLowerCase();
    return key === ctrlKey ? ['control', mod] : [mod, mod];
  })
);

const defaultOptions: KeyBindingControllerOptions = {
  skip: ['input', 'textarea', 'select'],
};

function normalizeKeys(keys: string | string[]) {
  return (Array.isArray(keys) ? keys : [keys]).map((key) => key.toLowerCase());
}

function isKeydown(event: Event) {
  return event.type === 'keydown';
}

function isKeyup(event: Event) {
  return event.type === 'keyup';
}

function isKeydownTrigger(triggers?: KeyBindingTrigger[]) {
  return triggers
    ? triggers.includes('keydown') || isKeydownRepeatTrigger(triggers)
    : false;
}

function isKeyupTrigger(triggers?: KeyBindingTrigger[]) {
  return triggers ? triggers.includes('keyup') : false;
}

function isKeydownRepeatTrigger(triggers?: KeyBindingTrigger[]) {
  return triggers ? triggers.includes('keydownRepeat') : false;
}

export function parseKeys(keys: string | string[]) {
  const parsed = normalizeKeys(keys);
  return {
    keys: parsed.filter((key) => !Modifiers.has(key)),
    modifiers: parsed.filter((key) => Modifiers.has(key)),
  };
}

function createCombinationKey(keys: string[], modifiers: string[]) {
  return Array.from(Modifiers.values())
    .filter((mod) => modifiers.includes(mod))
    .concat(keys)
    .join('+');
}

class KeyBindingController implements ReactiveController {
  protected _host: ReactiveControllerHost & Element;
  protected _ref?: Ref;
  protected _observedElement?: Element;
  protected _options?: KeyBindingControllerOptions;
  private bindings = new Map<string, KeyBinding>();
  private pressedKeys = new Set<string>();

  protected get _element() {
    if (this._observedElement) {
      return this._observedElement;
    }
    return this._ref ? this._ref.value : this._host;
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

  constructor(
    host: ReactiveControllerHost & Element,
    options?: KeyBindingControllerOptions
  ) {
    this._host = host;
    this._ref = options?.ref;
    this._options = { ...defaultOptions, ...options };
    host.addController(this);
  }

  /**
   * Checks and executes any event modifiers that are present in the matched binding.
   */
  private eventModifiersMatch(binding: KeyBinding, event: KeyboardEvent) {
    if (binding.options?.preventDefault) {
      event.preventDefault();
    }

    if (binding.options?.stopPropagation) {
      event.stopPropagation();
    }
  }

  private bindingMatches(binding: KeyBinding, event: KeyboardEvent) {
    const triggers = binding.options?.triggers ?? ['keydown'];

    if (isKeydown(event) && isKeydownTrigger(triggers)) {
      return true;
    }

    if (isKeyup(event) && isKeyupTrigger(triggers)) {
      return true;
    }

    return false;
  }

  private shouldSkip(event: KeyboardEvent) {
    const skip = this._options?.skip;

    if (!findElementFromEventPath((e) => e === this._element, event)) {
      return true;
    }

    if (!skip) {
      return false;
    }

    return Array.isArray(skip)
      ? findElementFromEventPath(skip.join(), event)
      : skip.call(this._host, event.target as Element, event);
  }

  public handleEvent(event: KeyboardEvent) {
    if (this.shouldSkip(event)) {
      return;
    }

    const key = event.key.toLowerCase();
    Modifiers.has(key) ? this.pressedKeys.clear() : this.pressedKeys.add(key);

    const pendingKeys = Array.from(this.pressedKeys);
    const modifiers = Array.from(Modifiers.values()).filter(
      (mod) => event[`${mod}Key` as keyof KeyboardEvent]
    );

    const binding = this.bindings.get(
      createCombinationKey(pendingKeys, modifiers)
    );

    if (binding && this.bindingMatches(binding, event)) {
      this.eventModifiersMatch(binding, event);
      binding.handler.call(this._host, event);

      if (isKeydownRepeatTrigger(binding.options?.triggers)) {
        this.pressedKeys.delete(key);
      }
    }

    if (isKeyup(event) && !Modifiers.has(key)) {
      this.pressedKeys.delete(key);
    }
  }

  /**
   * Registers a keybinding handler.
   */
  public set(
    key: string | string[],
    handler: KeyBindingHandler,
    options?: KeyBindingOptions
  ) {
    const { keys, modifiers } = parseKeys(key);
    const combination = createCombinationKey(keys, modifiers);
    const _options = { ...this._options?.bindingDefaults, ...options };

    this.bindings.set(combination, {
      keys,
      handler,
      options: _options,
      modifiers,
    });

    return this;
  }

  /**
   * Register a handler function which is called when the target receives a key
   * which "activates" it.
   *
   * In the browser context this is usually either an Enter and/or Space keypress.
   */
  public setActivateHandler(
    handler: KeyBindingHandler,
    options?: KeyBindingOptions
  ) {
    for (const key of [enterKey, spaceBar]) {
      this.set(key, handler, options);
    }

    return this;
  }

  public hostConnected(): void {
    this._host.addEventListener('keyup', this);
    this._host.addEventListener('keydown', this);
  }

  public hostDisconnected(): void {
    this._host.removeEventListener('keyup', this);
    this._host.removeEventListener('keydown', this);
  }
}

/**
 * Creates a keybinding controller and adds to it to the passed `element`
 * with the provided `options`.
 */
export function addKeybindings(
  element: ReactiveControllerHost & Element,
  options?: KeyBindingControllerOptions
) {
  return new KeyBindingController(element, options);
}

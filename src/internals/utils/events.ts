import { isServer } from 'lit';
import { isElement } from './dom.js';
import { isEventListenerObject, isString } from './types.js';

/**
 * Finds the first element in the composed path of the event that matches the
 * predicate.
 *
 * @param predicate - A CSS selector, or a function that returns whether an
 * element matches.
 * @param event - The event that holds the composed path.
 * @returns The first element that matches, or `undefined`.
 *
 * @example
 * ```typescript
 * // Using a string selector
 * const button = getElementFromPath('button', event);
 * ```
 * ```typescript
 * // Using a predicate function
 * const customElement = getElementFromPath(
 *   (el) => el.tagName === 'MY-ELEMENT',
 *   event
 * );
 * ```
 */
export function getElementFromPath<K extends keyof HTMLElementTagNameMap>(
  predicate: K,
  event: Event
): HTMLElementTagNameMap[K] | undefined;
export function getElementFromPath<T extends Element>(
  predicate: string | ((element: Element) => boolean),
  event: Event
): T | undefined;
export function getElementFromPath(
  predicate: string | ((element: Element) => boolean),
  event: Event
) {
  const func = isString(predicate)
    ? (e: Element) => e.matches(predicate)
    : (e: Element) => predicate(e);

  const match = event
    .composedPath()
    .find((item) => isElement(item) && func(item));

  return match as Element | undefined;
}

/** Reusable event listener that stops the propagation of the event. */
export function stopPropagation(event: Event): void {
  event.stopPropagation();
}

/** Reusable event listener that prevents the default action of the event. */
export function preventDefault(event: Event): void {
  event.preventDefault();
}

/**
 * Returns whether the focus moved out of the given host element, for use
 * with a `focusout` or `blur` event.
 */
export function focusLeftHost(host: Element, event: FocusEvent): boolean {
  return !host.contains(event.relatedTarget as Node | null);
}

/**
 * Adds an event listener that holds only a weak reference to `listener`, so
 * the garbage collector can collect it.
 */
export function addWeakEventListener(
  element: Element,
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean
): void {
  const weakRef = new WeakRef(listener);
  const wrapped = (evt: Event) => {
    const handler = weakRef.deref();

    if (!handler) {
      // The listener was collected, so drop the wrapper too.
      element.removeEventListener(event, wrapped, options);
      return;
    }

    return isEventListenerObject(handler)
      ? handler.handleEvent(evt)
      : handler(evt);
  };

  element.addEventListener(event, wrapped, options);
}

type EventTypeOf<T extends keyof HTMLElementEventMap | keyof WindowEventMap> =
  (HTMLElementEventMap & WindowEventMap)[T];

/**
 * Adds the `listener` to the `target` if `active` is true. Removes it if
 * `active` is false.
 *
 * The caller must pass a stable listener reference. `addEventListener` and
 * `removeEventListener` are then idempotent, and the caller needs no state.
 */
export function toggleEventListener<
  E extends keyof HTMLElementEventMap | keyof WindowEventMap,
>(
  target: EventTarget,
  active: boolean,
  event: E,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions
): void {
  active
    ? target.addEventListener(event, listener, options)
    : target.removeEventListener(event, listener, options);
}

/**
 * Adds an event listener to an element, and does nothing during server-side
 * rendering.
 *
 * @remarks
 * The `this` context of `handler` is the target element.
 */
export function toggleEventListener<
  E extends keyof HTMLElementEventMap | keyof WindowEventMap,
>(
  target: EventTarget,
  active: boolean,
  event: E,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions
): void {
  active
    ? target.addEventListener(event, listener, options)
    : target.removeEventListener(event, listener, options);
}

/**
 * Adds an event listener to an element, and does nothing during server-side
 * rendering.
 *
 * @remarks
 * The `this` context of `handler` is the target element.
 */
export function addSafeEventListener<
  E extends keyof HTMLElementEventMap | keyof WindowEventMap,
>(
  target: HTMLElement,
  eventName: E,
  handler: (event: EventTypeOf<E>) => unknown,
  options?: boolean | AddEventListenerOptions
): void {
  if (isServer) {
    return;
  }

  const boundHandler = (event: Event) =>
    handler.call(target, event as EventTypeOf<E>);

  target.addEventListener(eventName, boundHandler, options);
}

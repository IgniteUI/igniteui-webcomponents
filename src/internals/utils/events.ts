import { isServer } from 'lit';
import { isElement } from './dom.js';
import { isEventListenerObject, isString } from './types.js';

/**
 * Finds the first element in the event's composed path that matches the provided predicate, which can be either a string selector or a function.
 *
 * @param predicate - A string representing a CSS selector or a function that takes an Element and returns a boolean indicating a match.
 * @param event - The event whose composed path will be searched for the matching element.
 * @returns The first Element that matches the predicate, or undefined if no match is found.
 *
 * @example
 * ```typescript
 * // Using a string selector
 * const button = getElementFromPath('button', event);
 * ```
 * ```typescript
 * // Using a predicate function
 * const customElement = getElementFromPath((el) => el.tagName === 'MY-ELEMENT', event);
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

  return Iterator.from(event.composedPath()).find(
    (item) => isElement(item) && func(item)
  ) as Element | undefined;
}

export function stopPropagation(event: Event): void {
  event.stopPropagation();
}

/**
 * Returns whether focus has moved outside of the given host element for
 * a `focusout`/`blur` event, that is the element gaining focus is not
 * a descendant of the host.
 */
export function focusLeftHost(host: Element, event: FocusEvent): boolean {
  return !host.contains(event.relatedTarget as Node | null);
}

export function addWeakEventListener(
  element: Element,
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean
): void {
  const weakRef = new WeakRef(listener);
  const wrapped = (evt: Event) => {
    const handler = weakRef.deref();

    return isEventListenerObject(handler)
      ? handler.handleEvent(evt)
      : handler?.(evt);
  };

  element.addEventListener(event, wrapped, options);
}

type EventTypeOf<T extends keyof HTMLElementEventMap | keyof WindowEventMap> =
  (HTMLElementEventMap & WindowEventMap)[T];

/**
 * Safely adds an event listener to an HTMLElement, automatically handling
 * server-side rendering environments by doing nothing if `isServer` is true.
 * This function also correctly binds the `handler`'s `this` context to the `target` element
 * and ensures proper event type inference.
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

import { isServer } from 'lit';
import { firstOf } from './arrays.js';
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

/**
 * Returns the element that started the event if it matches the selector.
 * Unlike `getElementFromPath`, a match deeper in the composed path does not count.
 */
export function getEventOrigin<T extends Element = Element>(
  selector: string,
  event: Event
): T | undefined {
  const origin = firstOf(event.composedPath());
  return isElement(origin) && origin.matches(selector)
    ? (origin as T)
    : undefined;
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
 * Whether the browser opens a link in another browsing context: by its `target`
 * (or the target of the page's `<base>` element), or for a click with another
 * button or a modifier key. In a page that is not in a frame, `_parent` and
 * `_top` open the link in the same browsing context.
 */
export function linkOpensElsewhere(
  target: string | null | undefined,
  document: Document,
  event?: MouseEvent
): boolean {
  if (
    event &&
    (event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey)
  ) {
    return true;
  }

  const resolved = (target ?? getBaseTarget(document))?.toLowerCase();

  // `top`, because a page script can replace `parent`.
  if (resolved === '_parent' || resolved === '_top') {
    const view = document.defaultView;
    return view?.top !== view;
  }

  return Boolean(resolved) && resolved !== '_self';
}

/** The target of the first `<base>` element that has one, as the browser uses it. */
function getBaseTarget(document: Document): string | null {
  for (const base of document.getElementsByTagName('base')) {
    if (base.hasAttribute('target')) {
      return base.getAttribute('target');
    }
  }

  return null;
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

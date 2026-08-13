import { expect, nextFrame } from '@open-wc/testing';
import { type CalendarDay, toCalendarDay } from '../date/model.js';
import { toKebabCase } from '../utils/strings.js';

/**
 * Returns an array of all Animation objects affecting this element or which are scheduled to do so in the future.
 * It can optionally return Animation objects for descendant elements too.
 */
export function getAnimationsFor(
  element: ShadowRoot | Element,
  options?: GetAnimationsOptions
): Animation[] {
  return element.getAnimations(options);
}

/**
 * Runs all animations for the given element and/or descendant elements to completion.
 */
export function finishAnimationsFor(
  element: ShadowRoot | Element,
  options?: GetAnimationsOptions
): void {
  const animations = getAnimationsFor(element, options);
  for (const animation of animations) {
    animation.finish();
  }
}

/**
 * Waits for a started view transition (or any frame-scheduled DOM work)
 * to fully settle by yielding two consecutive animation frames.
 */
export async function viewTransitionComplete(): Promise<void> {
  await nextFrame();
  await nextFrame();
}

/**
 * Checks if a given element is within the view of another element.
 */
export function scrolledIntoView(el: HTMLElement, view: HTMLElement): boolean {
  const { top, bottom, height } = el.getBoundingClientRect();
  const { top: viewTop, bottom: viewBottom } = view.getBoundingClientRect();

  return top <= viewTop
    ? viewTop - top <= height
    : bottom - viewBottom <= height;
}

export function isFocused(element?: Element): boolean {
  return element ? element.matches(':focus') : false;
}

/**
 * Compares and returns whether the passed in CSS `{ prop: value }` entries match against
 * the resolved `(getComputedStyle)` styles of the element.
 */
export function compareStyles(
  element: Element,
  values: Partial<CSSStyleDeclaration>
): boolean {
  const computed = getComputedStyle(element);
  return Object.entries(values).every(
    ([key, value]) => computed.getPropertyValue(toKebabCase(key)) === value
  );
}

/**
 * Compares two date values
 */
export function checkDatesEqual(a: CalendarDay | Date, b: CalendarDay | Date) {
  expect(toCalendarDay(a).equalTo(toCalendarDay(b))).to.be.true;
}

export function suppressResizeObserverLoopError(): void {
  const flag = '__igcSuppressResizeObserverLoopError__';
  if (flag in window) {
    return;
  }

  (window as unknown as Window & Record<string, boolean>)[flag] = true;
  // Suppress ResizeObserver loop errors that can occur during tests.
  // These are benign and do not affect test correctness.
  const errorHandler = window.onerror;
  window.onerror = (message, ...args) => {
    if (typeof message === 'string' && /ResizeObserver loop/.test(message)) {
      return true;
    }
    return errorHandler ? errorHandler(message, ...args) : false;
  };
}

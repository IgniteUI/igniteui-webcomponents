import { expect, nextFrame } from '@open-wc/testing';
import { type CalendarDay, toCalendarDay } from '../date/model.js';
import { toKebabCase } from '../utils/strings.js';

/** Returns the animations of the element and, optionally, its descendants. */
export function getAnimationsFor(
  element: ShadowRoot | Element,
  options?: GetAnimationsOptions
): Animation[] {
  return element.getAnimations(options);
}

/** Finishes the animations of the element and, optionally, its descendants. */
export function finishAnimationsFor(
  element: ShadowRoot | Element,
  options?: GetAnimationsOptions
): void {
  const animations = getAnimationsFor(element, options);
  for (const animation of animations) {
    animation.finish();
  }
}

/** Waits two animation frames, so a started view transition settles. */
export async function viewTransitionComplete(): Promise<void> {
  await nextFrame();
  await nextFrame();
}

/** Returns whether `el` is in the visible area of `view`. */
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

/** Returns whether the computed styles of the element match `values`. */
export function compareStyles(
  element: Element,
  values: Partial<CSSStyleDeclaration>
): boolean {
  const computed = getComputedStyle(element);
  return Object.entries(values).every(
    ([key, value]) => computed.getPropertyValue(toKebabCase(key)) === value
  );
}

/** Asserts that each number of `actual` is within `delta` of the same number of `expected`. */
export function expectCloseTo(
  actual: ArrayLike<number>,
  expected: ArrayLike<number>,
  delta: number
): void {
  for (let i = 0; i < expected.length; i++) {
    expect(actual[i], `index ${i}`).to.be.closeTo(expected[i], delta);
  }
}

export function checkDatesEqual(a: CalendarDay | Date, b: CalendarDay | Date) {
  expect(toCalendarDay(a).equalTo(toCalendarDay(b))).to.be.true;
}

export function suppressResizeObserverLoopError(): void {
  const flag = '__igcSuppressResizeObserverLoopError__';
  if (flag in window) {
    return;
  }

  (window as unknown as Window & Record<string, boolean>)[flag] = true;
  // ResizeObserver loop errors are benign in tests.
  const errorHandler = window.onerror;
  window.onerror = (message, ...args) => {
    if (typeof message === 'string' && /ResizeObserver loop/.test(message)) {
      return true;
    }
    return errorHandler ? errorHandler(message, ...args) : false;
  };
}

/**
 * Axe options for components that publish required ARIA relations through
 * ARIA element reflection. Reflection blanks the content attribute that axe
 * reads, so axe trips `aria-required-attr`. Assert such a relation by element
 * identity instead.
 */
export const axeReflectedRelationsOptions = {
  ignoredRules: ['aria-required-attr'],
};

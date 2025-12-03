import { type RenderOptions, render, type TemplateResult } from 'lit';
import { html, unsafeStatic } from 'lit/static-html.js';
import { beforeEach } from 'vitest';
import { page } from 'vitest/browser';
import type { Constructor } from './mixins/constructor.js';

interface LitTemplateResult {
  processor: any;
  strings: TemplateStringsArray;
  type: string;
  values: readonly unknown[];
}

type RenderResult =
  | LitTemplateResult
  | TemplateResult
  | TemplateResult[]
  | Node
  | Node[]
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | null
  | undefined;

type FixtureOptions = {
  container?: HTMLElement;
  options?: RenderOptions;
};

let defineCECounter = 0;
const containers = new Set<HTMLElement>();

export async function fixture<T extends HTMLElement>(
  template: RenderResult,
  options: FixtureOptions = {}
) {
  const container =
    options?.container ??
    document.body.appendChild(document.createElement('div'));

  containers.add(container);
  render(template, container, options.options);

  const element = container.firstElementChild as T;
  await elementUpdated(element);

  return element;
}

/** Clean up all rendered fixtures */
export function cleanup(): void {
  for (const container of containers) {
    container.remove();
  }
  containers.clear();
}

/** Define a custom element with a unique tag name for testing */
export function defineCE<T extends HTMLElement>(
  _class: Constructor<T>
): string {
  const uniqueTagName = `test-${defineCECounter}`;
  customElements.define(uniqueTagName, _class);
  defineCECounter += 1;
  return uniqueTagName;
}

/** Wait for the next animation frame */
export async function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** Wait for a specific amount of time */
export function aTimeout(timeout: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), timeout));
}

/** Wait for an element to finish updating */
export async function elementUpdated<T extends Element>(
  element: T
): Promise<T> {
  let hasSpecificUpdate = false;

  if (element && 'updateComplete' in element) {
    await element.updateComplete;
    hasSpecificUpdate = true;
  }

  if (!hasSpecificUpdate) {
    await nextFrame();
  }

  return element;
}

/** Wait until a predicate is true or a timeout occurs */
export function waitUntil(
  predicate: () => unknown | Promise<unknown>,
  message?: string,
  options: { interval?: number; timeout?: number } = {}
): Promise<void> {
  const { interval = 50, timeout = 1000 } = options;
  const { stack } = new Error();

  return new Promise<void>((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    setTimeout(() => {
      clearTimeout(timeoutId);

      const error = new Error(
        message
          ? `Timeout: ${message}`
          : `waitUntil timed out after ${timeout}ms`
      );
      error.stack = stack ?? '';
      reject(error);
    }, timeout);

    async function nextInterval() {
      try {
        if (await predicate()) {
          resolve();
        } else {
          timeoutId = setTimeout(() => {
            nextInterval();
          }, interval);
        }
      } catch (error) {
        reject(error);
      }
    }

    nextInterval();
  });
}

page.extend({ fixture, [Symbol.for('vitest:component-cleanup')]: cleanup });
beforeEach(() => cleanup());

export { html, unsafeStatic };

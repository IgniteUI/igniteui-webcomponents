/// <reference types="chai-a11y-axe/chai-a11y-axe-plugin" />

import type { RenderOptions, TemplateResult } from 'lit';
import type { DiffOptions } from '@open-wc/semantic-dom-diff/get-diffable-html';
import type { Assertion } from 'vitest';

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

interface DomAssertion<T> extends Omit<Assertion<T>, 'equal' | 'to' | 'be'> {
  to: DomAssertion<T>;
  be: DomAssertion<T>;
  equal(value: unknown, options?: DiffOptions): void;
  equal(value: unknown, message?: string, options?: DiffOptions): void;
}

declare module 'vitest' {
  interface Assertion<T = any> {
    accessible(options?: object): Promise<Assertion<T>>;
    dom: DomAssertion<T>;
    lightDom: DomAssertion<T>;
    shadowDom: DomAssertion<T>;
  }
}

declare module '@vitest/browser/context' {
  interface BrowserPage {
    fixture<T extends HTMLElement>(
      template: RenderResult,
      options?: FixtureOptions
    ): Promise<T>;
  }
}

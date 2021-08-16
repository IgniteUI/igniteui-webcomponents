import { TemplateResult } from 'lit-html';

export type Direction = 'ltr' | 'rtl' | 'auto';

export interface Context {
  globals: { theme: string; direction: Direction };
}

export interface Story<T, K> {
  (args: T, context: K): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
  context?: Partial<K>;
}

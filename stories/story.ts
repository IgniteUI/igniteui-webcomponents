import { TemplateResult } from 'lit-html';

type Direction = 'ltr' | 'rtl' | 'auto';

export interface Story<T, K> {
  (args: T, context: K): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
  context?: Partial<K>;
}

export interface Context {
  globals: { theme: string; direction: Direction };
}

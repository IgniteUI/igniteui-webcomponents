import { TemplateResult } from 'lit';

export type Direction = 'ltr' | 'rtl' | 'auto';
export type Variant = 'light' | 'dark';

export interface Story<T, K> {
  (args: T, context: K): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
  context?: Partial<K>;
}

export interface Context {
  globals: { theme: string; direction: Direction; variant: Variant };
}

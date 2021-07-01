import { TemplateResult } from 'lit-html';

export interface Story<T, K> {
  (args: T, context: K): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
  context?: Partial<K>;
}

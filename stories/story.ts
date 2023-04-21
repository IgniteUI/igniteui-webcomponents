import type { ArgTypes, Meta } from '@storybook/web-components';

export type Direction = 'ltr' | 'rtl' | 'auto';
export type Variant = 'light' | 'dark';
export type Size = 'attribute' | 'small' | 'medium' | 'large';

export interface Context {
  globals: {
    theme: string;
    direction: Direction;
    variant: Variant;
    size: Size;
  };
}

export function disableStoryControls<T>(meta: Meta<T>): Partial<ArgTypes<T>> {
  return Object.fromEntries(
    Object.entries(structuredClone(meta.argTypes!)).map(([key, args]) => [
      key,
      Object.assign(args as {}, { table: { disable: true } }),
    ])
  ) as unknown as Partial<ArgTypes<T>>;
}

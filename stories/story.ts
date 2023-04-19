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

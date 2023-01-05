export type Direction = 'ltr' | 'rtl' | 'auto';

export type IgniteComponent = CustomElementConstructor & {
  tagName: string;
  register: () => void;
};

export type IgcTheme = 'material' | 'bootstrap' | 'indigo' | 'fluent';

export type ThemeOptions = {
  [K in IgcTheme]?: string;
};

export interface DynamicTheme {
  styles: string;
  variant: IgcTheme;
}

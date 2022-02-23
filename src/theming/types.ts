export type IgcTheme = 'material' | 'bootstrap' | 'indigo' | 'fluent';

export type ThemeOptions = {
  [K in IgcTheme]?: string;
};

export interface ReactiveThemeController {
  theme: IgcTheme;
}

export interface ReactiveTheme {
  onControllerAttached(controller: ReactiveThemeController): void;
}

import { createContext } from '@lit/context';
import type { Theme, ThemeVariant } from './types.js';

/**
 * The theme context value.
 */
export interface ThemeContext {
  theme: Theme;
  variant: ThemeVariant;
}

/**
 * Theme context provided by the theme provider component and consumed by the theming controller.
 */
export const themeContext = createContext<ThemeContext>('ig-theme-context');

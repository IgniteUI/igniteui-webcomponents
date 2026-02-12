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
 * Context for providing theme information to descendant components.
 *
 * Components can consume this context to receive theme information from a theme provider
 * instead of relying on global theming events.
 *
 * @example
 * ```ts
 * // In a component
 * import { ContextConsumer } from '@lit/context';
 * import { themeContext } from './context.js';
 *
 * class MyComponent extends LitElement {
 *   private _themeConsumer = new ContextConsumer(this, {
 *     context: themeContext,
 *     subscribe: true
 *   });
 *
 *   render() {
 *     const theme = this._themeConsumer.value;
 *     // ...
 *   }
 * }
 * ```
 */
export const themeContext = createContext<ThemeContext>('ig-theme-context');

import type { LitElement } from 'lit';

import { createThemeController } from './theming-controller.js';
import type { ThemeController, Themes } from './types.js';

/**
 * Class decorator to enable multiple theme support for a component.
 * The component will re-render on theme changes.
 *
 * Passing `{ exposeController: true }` in the decorator options will create an internal symbol
 * which can be used by {@link getThemeController} to additionally query and modify the component
 * based on the themes.
 *
 * Usage:
 *  ```ts
 *  import { LitElement, html } from 'lit';
 *  import { themes } from 'igniteui-webcomponents/themes';
 *  import { styles } from './themes/my-element.base.css.js';
 *  import { styles as shared } from './themes/shared/my-picker.common.css.js';
 *  import { all } from './themes/themes.js';
 *
 *  @themes(all)
 *  class MyElement extends LitElement {
 *    public static styles = [styles, shared];
 *  }
 *
 *  @themes(all, { exposeController: true })
 *  class MyElementWithExposedTheming extends LitElement {
 *    ...
 *
 *    render() {
 *      const theme = getThemeController(this)?.theme;
 *      ...
 *    }
 *  }
 *  ```
 */
export function themes(themes: Themes, options?: ThemeOptions) {
  return (proto: unknown) => {
    (proto as typeof LitElement).addInitializer((instance) => {
      const controller = createThemeController(instance, themes);

      if (options?.exposeController) {
        Object.defineProperty(instance, themeSymbol, {
          get() {
            return controller;
          },
          configurable: true,
          enumerable: false,
        });
      }
    });
  };
}

/**
 * Returns the theming controller for the given element if exposed.
 */
export function getThemeController(host: LitElement) {
  return isControllerExposed(host) ? host[themeSymbol] : undefined;
}

function isControllerExposed(
  host: LitElement
): host is LitElement & { [themeSymbol]: ThemeController } {
  return Object.getOwnPropertySymbols(host).includes(themeSymbol);
}

const themeSymbol = Symbol('Theming Controller');
type ThemeOptions = { exposeController?: boolean };

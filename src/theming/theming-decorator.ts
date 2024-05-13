import type { ReactiveElement } from 'lit';

import { updateWhenThemeChanges } from './theming-controller.js';
import type { Themes } from './types.js';

/**
 * Class decorator to enable multiple theme support for a component.
 * The component will re-render on theme changes.
 *
 * See also {@link updateWhenThemeChanges} for the same functionality
 * without the use of this decorator.
 *
 * Usage:
 *  ```ts
 *  import { LitElement, html } from 'lit';
 *  import { themes } from 'igniteui-webcomponents/themes';
 *  import { styles } from './themes/my-element.base.css';
 *  import { styles as material } from './themes/my-element.material.css';
 *  import { styles as bootstrap } from './themes/my-element.bootstrap.css';
 *  import { styles as indigo } from './themes/my-element.indigo.css';
 *
 *  @themes({ material, bootstrap, indigo })
 *  class MyElement extends LitElement {
 *    public static styles = styles;
 *  }
 *  ```
 */
export function themes(themes: Themes, exposeTheme = false) {
  return (clazz: any) => {
    clazz.addInitializer((instance: ReactiveElement) => {
      updateWhenThemeChanges(instance, themes, exposeTheme);
    });

    return clazz;
  };
}

export { themeSymbol } from './theming-controller.js';

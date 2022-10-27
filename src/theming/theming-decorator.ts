import { ReactiveElement } from 'lit';
import { updateWhenThemeChanges } from './theming-controller.js';
import { ReactiveTheme, Themes } from './types.js';

/**
 * Class decorator to enable multiple theme support for a component.
 * The component will re-render on theme changes.
 *
 * See also {@link updateWhenThemeChanges} for the same functionallity
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
export function themes(themes: Themes) {
  return (clazz: any) => {
    clazz.addInitializer((instance: ReactiveElement & ReactiveTheme) => {
      const controller = updateWhenThemeChanges(instance, themes);

      if ('themeAdopted' in instance) {
        instance.themeAdopted(controller);
      }
    });
    return clazz;
  };
}

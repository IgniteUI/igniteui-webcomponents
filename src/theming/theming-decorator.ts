import { ReactiveElement } from 'lit';
import { updateWhenThemeChanges } from './theming-controlller';
import { ReactiveTheme, Themes } from './types';

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
 *
 *  @themes({
 *    material: './my-element/material.css',
 *    bootstrap: './my-element/bootstrap.css',
 *    fluent: './my-element/fluent.css',
 *    indigo: './my-element/indigo.css',
 *  })
 *  class MyElement extends LitElement { }
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

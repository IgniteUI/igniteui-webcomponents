import callsites from 'callsites';
import { ReactiveElement } from 'lit';
import { updateWhenThemeChanges } from './theming-controlller';
import { ThemeOptions } from './types';

/**
 * Property decorator that provides a DynamicTheme instance to
 * allow theme switching during component execution.
 *
 * Usage:
 *
 *   import { LitElement, html } from 'lit';
 *   import { themed, ThemingController } from 'igniteui-webcomponents/themed';
 *
 *   class MyElement extends LitElement {
 *      @themed({
 *        material: './material.css',
 *        bootstrap: './bootstrap.css'
 *      })
 *      private theme!: ThemingController;
 *
 *      render() {
 *        <style>
 *          ${this.theme.styles}
 *        </style>
 *        <slot></slot>
 *      }
 *   }
 */
export function theme(options: ThemeOptions) {
  return (proto: ReactiveElement, name: string): any => {
    const ctor = proto.constructor as typeof ReactiveElement;

    ctor.addInitializer((instance: ReactiveElement) => {
      (instance as any)[name] = updateWhenThemeChanges(
        instance,
        transformOptionPaths(options)
      );
    });
  };
}

function transformOptionPaths(options: ThemeOptions): ThemeOptions {
  const path = callsites()
    .find((f) => f.getFileName()?.includes('components'))
    ?.getFileName();
  const startIndex = path?.indexOf('components');
  const endIndex = path?.lastIndexOf('/');
  const modulePath = path?.slice(startIndex, endIndex);
  const result = {};

  Object.entries(options).forEach(([key, value]) => {
    const themePath = `../${modulePath}/${value
      .replace('./', '')
      .replace('scss', 'css.js')}`;
    (result as any)[key] = themePath;
  });

  return result;
}

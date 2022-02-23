import {
  adoptStyles,
  css,
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
  ReactiveElement,
} from 'lit';
import { ReactiveThemeController } from '.';
import { getTheme } from './config';
import { CHANGE_THEME_EVENT } from './theming-event';
import { IgcTheme, ThemeOptions } from './types';

export class ThemingController
  implements ReactiveController, ReactiveThemeController
{
  private options: ThemeOptions;
  private host: ReactiveControllerHost & ReactiveElement;
  public theme!: IgcTheme;

  constructor(
    host: ReactiveControllerHost & ReactiveElement,
    options: ThemeOptions
  ) {
    this.host = host;
    this.options = options;
  }

  private readonly __themingEventHandler = async () => {
    await this.adoptStyles();
    this.host.requestUpdate();
  };

  public hostConnected() {
    window.addEventListener(CHANGE_THEME_EVENT, this.__themingEventHandler);
    this.adoptStyles();
  }

  public hostDisconnected() {
    window.removeEventListener(CHANGE_THEME_EVENT, this.__themingEventHandler);
  }

  protected async adoptStyles() {
    let result = css``;
    this.theme = getTheme() as IgcTheme;

    const styles = Object.entries(this.options).filter(
      (o) => o[0] === this.theme
    );

    if (styles[0]) {
      const module = await import(styles[0][1]);
      result = module.styles;
    }

    const ctor = this.host.constructor as typeof LitElement;
    adoptStyles(this.host.shadowRoot as ShadowRoot, [
      ...ctor.elementStyles,
      result,
    ]);
  }
}

const _updateWhenThemeChanges = (
  host: ReactiveControllerHost & ReactiveElement,
  options: ThemeOptions
) => {
  const controller = new ThemingController(host, options);
  host.addController(controller);
  return controller;
};

export const updateWhenThemeChanges: typeof _updateWhenThemeChanges & {
  _THEMING_CONTROLLER_FN_?: never;
} = _updateWhenThemeChanges;

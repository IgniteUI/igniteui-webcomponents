import {
  adoptStyles,
  css,
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
  ReactiveElement,
} from 'lit';
import { getTheme } from './config';
import { CHANGE_THEME_EVENT } from './theming-event';
import { IgcTheme, ThemeOptions } from './types';

export class ThemingController implements ReactiveController {
  private options: ThemeOptions;
  private host: ReactiveControllerHost & ReactiveElement;
  public variant: IgcTheme = 'bootstrap';

  constructor(
    host: ReactiveControllerHost & ReactiveElement,
    options: ThemeOptions
  ) {
    this.host = host;
    this.options = options;
  }

  private readonly __themingEventHandler = async (
    event: WindowEventMap[typeof CHANGE_THEME_EVENT]
  ) => {
    this.variant = event.detail.theme as IgcTheme;
    await this.adoptStyles();
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

    const styles = Object.entries(this.options).filter(
      (o) => o[0] === getTheme()
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

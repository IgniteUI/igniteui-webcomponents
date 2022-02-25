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
import { Theme, ThemeController, Themes } from './types';

class ThemingController implements ReactiveController, ThemeController {
  private themes: Themes;
  private host: ReactiveControllerHost & ReactiveElement;
  public theme!: Theme;

  constructor(host: ReactiveControllerHost & ReactiveElement, themes: Themes) {
    this.host = host;
    this.themes = themes;
  }

  private readonly __themingEventHandler = () => {
    this.adoptStyles();
    this.host.requestUpdate();
  };

  public hostConnected() {
    this.adoptStyles();
    window.addEventListener(CHANGE_THEME_EVENT, this.__themingEventHandler);
  }

  public hostDisconnected() {
    window.removeEventListener(CHANGE_THEME_EVENT, this.__themingEventHandler);
  }

  protected adoptStyles() {
    this.theme = getTheme();
    const ctor = this.host.constructor as typeof LitElement;
    let styleSheet = css``;

    const [theme] = Object.entries(this.themes).filter(
      ([name]) => name === this.theme
    );

    if (theme) {
      const [_, cssResult] = theme;
      styleSheet = cssResult;
    }

    adoptStyles(this.host.shadowRoot as ShadowRoot, [
      ...ctor.elementStyles,
      styleSheet,
    ]);
  }
}

const _updateWhenThemeChanges = (
  host: ReactiveControllerHost & ReactiveElement,
  themes: Themes
) => {
  const controller = new ThemingController(host, themes);
  host.addController(controller);
  return controller;
};

export const updateWhenThemeChanges: typeof _updateWhenThemeChanges & {
  _THEMING_CONTROLLER_FN_?: never;
} = _updateWhenThemeChanges;

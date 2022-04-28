import {
  adoptStyles,
  css,
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
  ReactiveElement,
} from 'lit';
import { getTheme } from './config.js';
import { CHANGE_THEME_EVENT } from './theming-event.js';
import type { Theme, ThemeController, Themes } from './types';

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
    const supportsAdoptingStyleSheets =
      window.ShadowRoot &&
      'adoptedStyleSheets' in Document.prototype &&
      'replace' in CSSStyleSheet.prototype;

    let styleSheet = css``;

    const [theme] = Object.entries(this.themes).filter(
      ([name]) => name === this.theme
    );

    if (theme) {
      const [_, cssResult] = theme;
      styleSheet = cssResult;
    }

    // Firefox and Safari don't support the adoptedStyleSheets API yet,
    // and the lit framework appends the resolved stylesheets indiscriminately
    // when using the adoptStyles API below. Hence, we need to remove all previously
    // defined style tags in the shadow root as changing the themes at runtime just
    // keeps stacking the resolved styles one over the other, resulting in broken themes.
    if (!supportsAdoptingStyleSheets) {
      [...this.host!.renderRoot.querySelectorAll('style')]
        .slice(1)
        .forEach((tag) => tag.remove());
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

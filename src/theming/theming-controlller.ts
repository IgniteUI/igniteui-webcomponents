import { ReactiveController, ReactiveControllerHost } from 'lit';
import { DynamicTheme } from '.';
import { CHANGE_THEME_EVENT } from './theming-event';
import { IgcTheme, ThemeOptions } from './types';

export class ThemingController implements DynamicTheme, ReactiveController {
  private options: ThemeOptions;
  private host: ReactiveControllerHost;
  public variant: IgcTheme = 'bootstrap';
  public styles!: string;

  constructor(host: ReactiveControllerHost, options: ThemeOptions) {
    this.host = host;
    this.options = options;
  }

  private readonly __themingEventHandler = async (
    event: WindowEventMap[typeof CHANGE_THEME_EVENT]
  ) => {
    this.variant = event.detail.theme as IgcTheme;
    await this.applyStyles(this.options);
    this.host.requestUpdate();
  };

  public hostConnected() {
    window.addEventListener(CHANGE_THEME_EVENT, this.__themingEventHandler);
    window.dispatchEvent(
      new CustomEvent(CHANGE_THEME_EVENT, {
        detail: { theme: this.variant },
      })
    );
  }

  public hostDisconnected() {
    window.removeEventListener(CHANGE_THEME_EVENT, this.__themingEventHandler);
  }

  private async applyStyles(options: ThemeOptions) {
    const styles = Object.entries(options).filter((o) => o[0] === this.variant);
    const result = await import(styles[0][1]);
    this.styles = result.styles.cssText;
  }
}

const _updateWhenThemeChanges = (
  host: ReactiveControllerHost,
  options: ThemeOptions
) => {
  const controller = new ThemingController(host, options);
  host.addController(controller);
  return controller;
};

export const updateWhenThemeChanges: typeof _updateWhenThemeChanges & {
  _THEMING_CONTROLLER_FN_?: never;
} = _updateWhenThemeChanges;

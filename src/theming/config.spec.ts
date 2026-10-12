import { expect, oneEvent } from '@open-wc/testing';

import { configureTheme, getTheme } from './config.js';
import { CHANGE_THEME_EVENT } from './theming-event.js';

describe('Theming Config', () => {
  // `getTheme` caches its first read, so take it before any test sets a theme.
  let initialTheme: ReturnType<typeof getTheme>;

  before(() => {
    const sheet = document.createElement('style');
    sheet.textContent =
      ':root { --ig-theme: indigo; --ig-theme-variant: dark; }';
    document.head.append(sheet);

    initialTheme = getTheme();
    sheet.remove();
  });

  it('should read the initial theme from the root CSS variables', () => {
    expect(initialTheme).to.deep.equal({
      theme: 'indigo',
      themeVariant: 'dark',
    });
  });

  it('should set the theme and raise event with the new theme', async () => {
    const theme = 'material';
    const themeVariant = 'light';

    setTimeout(() => {
      configureTheme(theme, themeVariant);
      expect(getTheme()).to.deep.equal({ theme, themeVariant });
    });

    const { detail } = await oneEvent(window, CHANGE_THEME_EVENT);
    expect(detail.theme).to.equal(theme);
    expect(detail.themeVariant).to.equal(themeVariant);
  });

  it('should sync the theme from an event dispatched outside configureTheme', () => {
    const detail = { theme: 'fluent', themeVariant: 'dark' } as const;

    window.dispatchEvent(new CustomEvent(CHANGE_THEME_EVENT, { detail }));
    expect(getTheme()).to.deep.equal(detail);

    window.dispatchEvent(
      new CustomEvent(CHANGE_THEME_EVENT, {
        detail: { theme: 'invalid', themeVariant: 'light' },
      })
    );
    expect(getTheme()).to.deep.equal(detail);
  });
});

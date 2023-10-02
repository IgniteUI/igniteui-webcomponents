import { expect, oneEvent } from '@open-wc/testing';
import { configureTheme, getTheme } from './config.js';
import { CHANGE_THEME_EVENT } from './theming-event.js';

describe('Theming Config', () => {
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
});

import { expect, oneEvent } from '@open-wc/testing';
import { configureTheme, getTheme } from './config';
import { CHANGE_THEME_EVENT } from './theming-event';

describe('Theming Config', () => {
  it('should set the theme and raise event with the new theme', async () => {
    const theme = 'material';

    setTimeout(() => {
      configureTheme(theme);
      expect(getTheme()).to.equal(theme);
    });

    const { detail } = await oneEvent(window, CHANGE_THEME_EVENT);
    expect(detail.theme).to.equal(theme);
  });
});

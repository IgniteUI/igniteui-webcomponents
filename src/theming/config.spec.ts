import { expect, oneEvent } from '@open-wc/testing';

import { configureTheme, getTheme } from './config.js';
import { CHANGE_THEME_EVENT } from './theming-event.js';
import { getAllCssVariables } from './utils.js';

describe('Theming Config', () => {
  it('parses CSS variables from the document style sheets', async () => {
    const sheet = document.createElement('style');
    sheet.textContent = ':root { --igc-size: 1; --my-custom-size: 2rem }';
    document.head.append(sheet);

    expect(getAllCssVariables()).to.eql({
      igcSize: '1',
      myCustomSize: '2rem',
    });

    sheet.remove();
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
});

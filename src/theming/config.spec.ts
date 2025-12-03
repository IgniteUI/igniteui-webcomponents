import { describe, expect, it } from 'vitest';
import { aTimeout } from '../components/common/helpers.spec.js';
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

  it('does not throw for CORS', async () => {
    const link = document.createElement('link');
    Object.assign(link, {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    });

    document.head.append(link);
    await aTimeout(1000);

    expect(() => getAllCssVariables()).not.to.throw();

    link.remove();
  });

  it('should set the theme and raise event with the new theme', async () => {
    const theme = 'material';
    const themeVariant = 'light';

    const eventPromise = new Promise<CustomEvent>((resolve) => {
      window.addEventListener(
        CHANGE_THEME_EVENT,
        (e) => resolve(e as CustomEvent),
        { once: true }
      );
    });

    setTimeout(() => {
      configureTheme(theme, themeVariant);
      expect(getTheme()).to.deep.equal({ theme, themeVariant });
    });

    const { detail } = await eventPromise;
    expect(detail.theme).to.equal(theme);
    expect(detail.themeVariant).to.equal(themeVariant);
  });
});

import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  oneEvent,
  unsafeStatic,
} from '@open-wc/testing';
import { css, LitElement, html as litHtml } from 'lit';
import { defineComponents } from '../components/common/definitions/defineComponents.js';
import IgcThemeProviderComponent from '../components/theme-provider/theme-provider.js';
import { configureTheme } from './config.js';
import {
  addThemingController,
  type ThemingController,
} from './theming-controller.js';
import { CHANGE_THEME_EVENT } from './theming-event.js';
import type { Theme, Themes } from './types.js';

// Mock themes for testing
const mockThemes: Themes = {
  light: {
    shared: css`
      :host {
        --test-shared-light: 1;
      }
    `,
    bootstrap: css`
      :host {
        --test-bootstrap-light: 1;
      }
    `,
    material: css`
      :host {
        --test-material-light: 1;
      }
    `,
    fluent: css`
      :host {
        --test-fluent-light: 1;
      }
    `,
    indigo: css`
      :host {
        --test-indigo-light: 1;
      }
    `,
  },
  dark: {
    shared: css`
      :host {
        --test-shared-dark: 1;
      }
    `,
    bootstrap: css`
      :host {
        --test-bootstrap-dark: 1;
      }
    `,
    material: css`
      :host {
        --test-material-dark: 1;
      }
    `,
    fluent: css`
      :host {
        --test-fluent-dark: 1;
      }
    `,
    indigo: css`
      :host {
        --test-indigo-dark: 1;
      }
    `,
  },
};

type ThemedTestComponentElement = LitElement & {
  themingController: ThemingController;
  themeChangeCallCount: number;
  lastTheme: Theme | null;
};

type ThemedTestComponentNoCallbackElement = LitElement & {
  themingController: ThemingController;
};

describe('Theming Controller', () => {
  let themedTag: string;
  let themedNoCallbackTag: string;

  before(() => {
    defineComponents(IgcThemeProviderComponent);

    themedTag = defineCE(
      class extends LitElement {
        public static override styles = css`
          :host {
            display: block;
          }
        `;

        public themingController: ThemingController;
        public themeChangeCallCount = 0;
        public lastTheme: Theme | null = null;

        constructor() {
          super();
          this.themingController = addThemingController(this, mockThemes, {
            themeChange: (theme) => {
              this.themeChangeCallCount++;
              this.lastTheme = theme;
            },
          });
        }

        protected override render() {
          return litHtml`<div>Themed Component</div>`;
        }
      }
    );

    themedNoCallbackTag = defineCE(
      class extends LitElement {
        public static override styles = css`
          :host {
            display: block;
          }
        `;

        public themingController: ThemingController;

        constructor() {
          super();
          this.themingController = addThemingController(this, mockThemes);
        }

        protected override render() {
          return litHtml`<div>Themed Component No Callback</div>`;
        }
      }
    );

    // Set up default global theme for tests
    configureTheme('bootstrap', 'light');
  });

  describe('Global Theme', () => {
    beforeEach(() => {
      // Reset to default theme before each test
      configureTheme('bootstrap', 'light');
    });

    it('should initialize with the global theme', async () => {
      const tag = unsafeStatic(themedTag);
      const el = await fixture<ThemedTestComponentElement>(
        html`<${tag}></${tag}>`
      );

      expect(el.themingController.theme).to.equal('bootstrap');
      expect(el.themingController.variant).to.equal('light');
    });

    it('should respond to global theme changes', async () => {
      const tag = unsafeStatic(themedTag);
      const el = await fixture<ThemedTestComponentElement>(
        html`<${tag}></${tag}>`
      );

      expect(el.themingController.theme).to.equal('bootstrap');
      expect(el.themingController.variant).to.equal('light');

      // Change global theme
      setTimeout(() => configureTheme('material', 'light'));
      await oneEvent(window, CHANGE_THEME_EVENT);
      await elementUpdated(el);

      expect(el.themingController.theme).to.equal('material');
      expect(el.themingController.variant).to.equal('light');
    });

    it('should call themeChange callback when global theme changes', async () => {
      const tag = unsafeStatic(themedTag);
      const el = await fixture<ThemedTestComponentElement>(
        html`<${tag}></${tag}>`
      );

      const initialCallCount = el.themeChangeCallCount;

      // Change global theme
      setTimeout(() => configureTheme('fluent', 'dark'));
      await oneEvent(window, CHANGE_THEME_EVENT);
      await elementUpdated(el);

      expect(el.themeChangeCallCount).to.be.greaterThan(initialCallCount);
      expect(el.lastTheme).to.equal('fluent');
      expect(el.themingController.variant).to.equal('dark');
    });

    it('should work without themeChange callback', async () => {
      const tag = unsafeStatic(themedNoCallbackTag);
      const el = await fixture<ThemedTestComponentNoCallbackElement>(
        html`<${tag}></${tag}>`
      );

      expect(el.themingController.theme).to.equal('bootstrap');
      expect(el.themingController.variant).to.equal('light');

      // Should not throw when changing theme
      setTimeout(() => configureTheme('indigo', 'light'));
      await oneEvent(window, CHANGE_THEME_EVENT);
      await elementUpdated(el);

      expect(el.themingController.theme).to.equal('indigo');
      expect(el.themingController.variant).to.equal('light');
    });

    it('should stop listening to global events when disconnected', async () => {
      const tag = unsafeStatic(themedTag);
      const el = await fixture<ThemedTestComponentElement>(
        html`<${tag}></${tag}>`
      );

      const initialCallCount = el.themeChangeCallCount;

      // Disconnect the element
      el.remove();

      // Change global theme
      setTimeout(() => configureTheme('material', 'dark'));
      await oneEvent(window, CHANGE_THEME_EVENT);

      // The callback should not have been called again
      expect(el.themeChangeCallCount).to.equal(initialCallCount);
    });
  });

  describe('Context Theme', () => {
    it('should use context theme when inside a theme provider', async () => {
      const tag = unsafeStatic(themedTag);
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="material" variant="dark">
            <${tag}></${tag}>
          </igc-theme-provider>
        </div>
      `);

      const el = container.querySelector(
        themedTag
      ) as ThemedTestComponentElement;
      await elementUpdated(el);

      expect(el.themingController.theme).to.equal('material');
      expect(el.themingController.variant).to.equal('dark');
    });

    it('should update when theme provider theme changes', async () => {
      const tag = unsafeStatic(themedTag);
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="bootstrap" variant="light">
            <${tag}></${tag}>
          </igc-theme-provider>
        </div>
      `);

      const provider = container.querySelector(
        'igc-theme-provider'
      ) as IgcThemeProviderComponent;
      const el = container.querySelector(
        themedTag
      ) as ThemedTestComponentElement;

      await elementUpdated(el);
      expect(el.themingController.theme).to.equal('bootstrap');
      expect(el.themingController.variant).to.equal('light');

      provider.theme = 'fluent';
      await elementUpdated(provider);
      await elementUpdated(el);

      expect(el.themingController.theme).to.equal('fluent');
      expect(el.themingController.variant).to.equal('light');
    });

    it('should update when theme provider variant changes', async () => {
      const tag = unsafeStatic(themedTag);
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="material" variant="light">
            <${tag}></${tag}>
          </igc-theme-provider>
        </div>
      `);

      const provider = container.querySelector(
        'igc-theme-provider'
      ) as IgcThemeProviderComponent;
      const el = container.querySelector(
        themedTag
      ) as ThemedTestComponentElement;

      await elementUpdated(el);

      const initialCallCount = el.themeChangeCallCount;

      provider.variant = 'dark';
      await elementUpdated(provider);
      await elementUpdated(el);

      // Theme change callback should be called even when only variant changes
      expect(el.themeChangeCallCount).to.be.greaterThan(initialCallCount);
    });

    it('should not respond to global theme changes when inside a theme provider', async () => {
      const tag = unsafeStatic(themedTag);
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="material" variant="dark">
            <${tag}></${tag}>
          </igc-theme-provider>
        </div>
      `);

      const el = container.querySelector(
        themedTag
      ) as ThemedTestComponentElement;
      await elementUpdated(el);

      expect(el.themingController.theme).to.equal('material');
      expect(el.themingController.variant).to.equal('dark');

      // Change global theme - should not affect component inside provider
      setTimeout(() => configureTheme('bootstrap', 'light'));
      await oneEvent(window, CHANGE_THEME_EVENT);
      await elementUpdated(el);

      // Should still be material, not bootstrap
      expect(el.themingController.theme).to.equal('material');
      expect(el.themingController.variant).to.equal('dark');
    });

    it('should call themeChange callback when context theme changes', async () => {
      const tag = unsafeStatic(themedTag);
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="bootstrap" variant="light">
            <${tag}></${tag}>
          </igc-theme-provider>
        </div>
      `);

      const provider = container.querySelector(
        'igc-theme-provider'
      ) as IgcThemeProviderComponent;
      const el = container.querySelector(
        themedTag
      ) as ThemedTestComponentElement;

      await elementUpdated(el);
      const initialCallCount = el.themeChangeCallCount;

      provider.theme = 'indigo';
      await elementUpdated(provider);
      await elementUpdated(el);

      expect(el.themeChangeCallCount).to.be.greaterThan(initialCallCount);
      expect(el.lastTheme).to.equal('indigo');
      expect(el.themingController.variant).to.equal('light');
    });

    it('should use nearest theme provider when nested', async () => {
      const tag = unsafeStatic(themedTag);
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="material" variant="light">
            <${tag} id="outer"></${tag}>
            <igc-theme-provider theme="fluent" variant="dark">
              <${tag} id="inner"></${tag}>
            </igc-theme-provider>
          </igc-theme-provider>
        </div>
      `);

      const outerEl = container.querySelector(
        '#outer'
      ) as ThemedTestComponentElement;
      const innerEl = container.querySelector(
        '#inner'
      ) as ThemedTestComponentElement;

      await elementUpdated(outerEl);
      await elementUpdated(innerEl);

      expect(outerEl.themingController.theme).to.equal('material');
      expect(outerEl.themingController.variant).to.equal('light');
      expect(innerEl.themingController.theme).to.equal('fluent');
      expect(innerEl.themingController.variant).to.equal('dark');
    });
  });

  describe('Dynamic Component Creation', () => {
    it('should pick up context theme when added to DOM inside provider', async () => {
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="indigo" variant="dark">
          </igc-theme-provider>
        </div>
      `);

      const provider = container.querySelector(
        'igc-theme-provider'
      ) as IgcThemeProviderComponent;

      // Dynamically create and add component
      const el = document.createElement(
        themedTag
      ) as ThemedTestComponentElement;
      provider.appendChild(el);

      await elementUpdated(el);

      expect(el.themingController.theme).to.equal('indigo');
      expect(el.themingController.variant).to.equal('dark');
    });

    it('should fall back to global theme when moved outside provider', async () => {
      // Set a known global theme
      configureTheme('bootstrap', 'light');

      const tag = unsafeStatic(themedTag);
      const container = await fixture<HTMLDivElement>(html`
        <div id="outer">
          <igc-theme-provider theme="material" variant="dark">
            <${tag}></${tag}>
          </igc-theme-provider>
        </div>
      `);

      const el = container.querySelector(
        themedTag
      ) as ThemedTestComponentElement;
      const provider = container.querySelector(
        IgcThemeProviderComponent.tagName
      )!;
      await elementUpdated(el);

      // After initial render, should have provider theme
      expect(el.themingController.theme).to.equal('material');
      expect(el.themingController.variant).to.equal('dark');

      // Move outside the provider
      container.appendChild(el);
      await elementUpdated(el);

      expect(el.themingController.theme).to.equal('bootstrap');
      expect(el.themingController.variant).to.equal('light');

      // Move back inside provider scope
      provider.appendChild(el);
      await elementUpdated(el);

      expect(el.themingController.theme).to.equal('material');
      expect(el.themingController.variant).to.equal('dark');
    });
  });

  describe('Style Adoption', () => {
    it('should have adopted styles based on the current theme', async () => {
      configureTheme('bootstrap', 'light');

      const tag = unsafeStatic(themedTag);
      const el = await fixture<ThemedTestComponentElement>(
        html`<${tag}></${tag}>`
      );

      await elementUpdated(el);

      // Check that styles are adopted (we can't easily inspect adoptedStyleSheets,
      // but we can verify the component renders without errors)
      expect(el.shadowRoot).to.not.be.null;
      expect(el.shadowRoot?.adoptedStyleSheets.length).to.be.greaterThan(0);
    });

    it('should update adopted styles when theme changes', async () => {
      configureTheme('bootstrap', 'light');

      const tag = unsafeStatic(themedTag);
      const el = await fixture<ThemedTestComponentElement>(
        html`<${tag}></${tag}>`
      );

      const initialStylesCount = el.shadowRoot?.adoptedStyleSheets.length ?? 0;

      // Change theme
      setTimeout(() => configureTheme('material', 'dark'));
      await oneEvent(window, CHANGE_THEME_EVENT);
      await elementUpdated(el);

      // Styles should still be adopted
      expect(el.shadowRoot?.adoptedStyleSheets.length).to.be.greaterThan(0);
      expect(el.shadowRoot?.adoptedStyleSheets.length).to.equal(
        initialStylesCount
      );
    });
  });

  describe('All Theme Combinations', () => {
    const themes = ['material', 'bootstrap', 'indigo', 'fluent'] as const;
    const variants = ['light', 'dark'] as const;

    for (const theme of themes) {
      for (const variant of variants) {
        it(`should correctly apply theme="${theme}" variant="${variant}" from context`, async () => {
          const tag = unsafeStatic(themedTag);
          const container = await fixture<HTMLDivElement>(html`
            <div>
              <igc-theme-provider theme="${theme}" variant="${variant}">
                <${tag}></${tag}>
              </igc-theme-provider>
            </div>
          `);

          const el = container.querySelector(
            themedTag
          ) as ThemedTestComponentElement;
          await elementUpdated(el);

          expect(el.themingController.theme).to.equal(theme);
          expect(el.themingController.variant).to.equal(variant);
        });
      }
    }
  });
});

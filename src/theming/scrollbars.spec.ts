import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement, html as litHtml } from 'lit';

import { defineComponents } from '#internals/definitions/defineComponents.js';
import IgcNavDrawerComponent from '../components/nav-drawer/nav-drawer.js';
import IgcThemeProviderComponent from '../components/theme-provider/theme-provider.js';
import { styles as fluentLight } from '../styles/themes/light/fluent.css.js';
import { configureTheme } from './config.js';
import { scrollbars } from './scrollbars.js';
import { addThemingController } from './theming-controller.js';
import type { Theme, ThemeVariant } from './types.js';

/** A distinct color for each gray shade, so each scrollbar color names its shade. */
const GRAYS = `
  --ig-gray-50: rgb(5, 5, 5);
  --ig-gray-100: rgb(10, 10, 10);
  --ig-gray-200: rgb(20, 20, 20);
  --ig-gray-300: rgb(30, 30, 30);
  --ig-gray-400: rgb(40, 40, 40);
`;

const half = (shade: number) => `hsl(from var(--ig-gray-${shade}) h s l / 0.5)`;

/** The thumb and track colors of the scrollbar schema of each theme. */
const SCHEMA_COLORS: Record<ThemeVariant, Record<Theme, [string, string]>> = {
  light: {
    material: ['var(--ig-gray-400)', 'var(--ig-gray-100)'],
    bootstrap: ['var(--ig-gray-400)', 'var(--ig-gray-100)'],
    fluent: ['var(--ig-gray-300)', 'var(--ig-gray-100)'],
    indigo: ['var(--ig-gray-400)', 'var(--ig-gray-200)'],
  },
  dark: {
    material: ['var(--ig-gray-400)', 'var(--ig-gray-100)'],
    bootstrap: [half(200), half(100)],
    fluent: ['var(--ig-gray-300)', 'var(--ig-gray-100)'],
    indigo: ['var(--ig-gray-100)', 'var(--ig-gray-50)'],
  },
};

describe('Scrollbars', () => {
  let tag: ReturnType<typeof unsafeStatic>;

  before(() => {
    defineComponents(IgcThemeProviderComponent, IgcNavDrawerComponent);

    tag = unsafeStatic(
      defineCE(
        class extends LitElement {
          constructor() {
            super();
            addThemingController(this, { light: {}, dark: {} });
          }

          protected override render() {
            return litHtml`<div part="scroller"></div>`;
          }
        }
      )
    );
  });

  afterEach(() => {
    configureTheme('bootstrap', 'light');
  });

  /** The computed `scrollbar-color` of `colors`, resolved in `scope`. */
  function resolve(scope: Element, [thumb, track]: [string, string]) {
    const probe = document.createElement('div');
    probe.style.scrollbarColor = `${thumb} ${track}`;
    scope.append(probe);
    const value = getComputedStyle(probe).scrollbarColor;
    probe.remove();
    return value;
  }

  /** Whether the browser applies `scrollbar-width`. Playwright's Firefox forces `none` on every element. */
  function appliesScrollbarWidth(): boolean {
    const probe = document.createElement('div');
    probe.style.scrollbarWidth = 'thin';
    document.body.append(probe);
    const applies = getComputedStyle(probe).scrollbarWidth === 'thin';
    probe.remove();
    return applies;
  }

  async function render(styles = '') {
    const container = await fixture<HTMLElement>(
      html`<div style=${GRAYS + styles}><${tag}></${tag}></div>`
    );
    return { container, host: container.firstElementChild as LitElement };
  }

  for (const variant of ['light', 'dark'] as const) {
    for (const theme of [
      'material',
      'bootstrap',
      'fluent',
      'indigo',
    ] as const) {
      it(`colors the scrollbar of a host with the ${variant} ${theme} schema`, async () => {
        configureTheme(theme, variant);
        const { container, host } = await render();

        expect(getComputedStyle(host).scrollbarColor).to.equal(
          resolve(container, SCHEMA_COLORS[variant][theme])
        );
      });
    }
  }

  it('adopts the scrollbar sheet of the theme', async () => {
    configureTheme('fluent', 'dark');
    const { host } = await render();

    expect(host.shadowRoot!.adoptedStyleSheets).to.include(
      scrollbars.dark.fluent.styleSheet
    );
  });

  it('swaps the scrollbar colors on a theme change', async () => {
    configureTheme('fluent', 'light');
    const { container, host } = await render();

    configureTheme('indigo', 'dark');
    await host.updateComplete;

    expect(getComputedStyle(host).scrollbarColor).to.equal(
      resolve(container, SCHEMA_COLORS.dark.indigo)
    );
  });

  it('takes the schema and the palette of a theme provider', async () => {
    configureTheme('material', 'light');
    const providerGrays = `
      --ig-gray-50: rgb(105, 105, 105);
      --ig-gray-100: rgb(110, 110, 110);
      --ig-gray-300: rgb(130, 130, 130);
    `;
    const container = await fixture<HTMLElement>(html`
      <div style=${GRAYS}>
        <igc-theme-provider
          theme="indigo"
          variant="dark"
          style=${providerGrays}
        >
          <${tag}></${tag}>
        </igc-theme-provider>
      </div>
    `);
    const provider = container.querySelector('igc-theme-provider')!;
    const host = provider.firstElementChild!;

    expect(getComputedStyle(host).scrollbarColor).to.equal(
      resolve(provider, SCHEMA_COLORS.dark.indigo)
    );
    expect(getComputedStyle(host).scrollbarColor).to.equal(
      'rgb(110, 110, 110) rgb(105, 105, 105)'
    );
  });

  it('passes its colors to the elements in its shadow root', async () => {
    const { host } = await render();
    const scroller = host.shadowRoot!.querySelector('[part="scroller"]')!;

    expect(getComputedStyle(scroller).scrollbarColor).to.equal(
      getComputedStyle(host).scrollbarColor
    );
  });

  it('takes the global --ig-scrollbar-sb-* tokens of an ancestor', async () => {
    const { host } = await render(`
      --ig-scrollbar-sb-thumb-bg-color: rgb(255, 0, 0);
      --ig-scrollbar-sb-track-bg-color: rgb(0, 0, 255);
    `);

    expect(getComputedStyle(host).scrollbarColor).to.equal(
      'rgb(255, 0, 0) rgb(0, 0, 255)'
    );
  });

  it('keeps its own colors inside an element with other --sb-* tokens', async () => {
    configureTheme('fluent', 'light');
    // The `.ig-scrollbar` tokens of another library, such as Ignite UI for Angular.
    const { container, host } = await render(`
      --sb-thumb-bg-color: rgb(255, 0, 0);
      --sb-track-bg-color: rgb(0, 0, 255);
    `);

    expect(getComputedStyle(host).scrollbarColor).to.equal(
      resolve(container, SCHEMA_COLORS.light.fluent)
    );
  });

  it('takes the --sb-* tokens set on the host', async () => {
    const { host } = await render();
    host.style.setProperty('--sb-thumb-bg-color', 'rgb(255, 0, 0)');

    expect(getComputedStyle(host).scrollbarColor).to.match(
      /^rgb\(255, 0, 0\) /
    );
  });

  it('is auto wide, and takes --sb-width', async function () {
    if (!appliesScrollbarWidth()) {
      this.skip();
    }

    const { host } = await render();

    expect(getComputedStyle(host).scrollbarWidth).to.equal('auto');

    host.style.setProperty('--sb-width', 'thin');

    expect(getComputedStyle(host).scrollbarWidth).to.equal('thin');
  });

  it('gives the navigation drawer a thin scrollbar that --sb-width overrides', async function () {
    if (!appliesScrollbarWidth()) {
      this.skip();
    }

    const drawer = await fixture<IgcNavDrawerComponent>(
      html`<igc-nav-drawer open></igc-nav-drawer>`
    );
    const base = drawer.shadowRoot!.querySelector('[part="base"]')!;

    expect(getComputedStyle(base).scrollbarWidth).to.equal('thin');

    drawer.style.setProperty('--sb-width', 'auto');

    expect(getComputedStyle(base).scrollbarWidth).to.equal('auto');
  });

  describe('Global theme', () => {
    before(() => {
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        fluentLight.styleSheet!,
      ];
    });

    after(() => {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (sheet) => sheet !== fluentLight.styleSheet
      );
    });

    it('colors an .ig-scrollbar element with the schema of its theme', async () => {
      const element = await fixture<HTMLElement>(
        html`<div class="ig-scrollbar"></div>`
      );

      expect(getComputedStyle(element).scrollbarColor).to.equal(
        resolve(document.body, SCHEMA_COLORS.light.fluent)
      );
    });

    it('sets no theme markers on .ig-scrollbar, which can sit on <html>', () => {
      const rules = Array.from(fluentLight.styleSheet!.cssRules).filter(
        (rule): rule is CSSStyleRule =>
          rule instanceof CSSStyleRule && rule.selectorText === '.ig-scrollbar'
      );

      expect(rules).to.have.length(1);
      expect(rules[0].style.getPropertyValue('--ig-theme')).to.equal('');
      expect(rules[0].style.getPropertyValue('--ig-theme-variant')).to.equal(
        ''
      );
    });
  });
});

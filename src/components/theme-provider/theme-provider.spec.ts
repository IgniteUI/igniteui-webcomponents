import { ContextConsumer } from '@lit/context';
import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';

import { type ThemeContext, themeContext } from '../../theming/context.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcThemeProviderComponent from './theme-provider.js';

type ThemeContextConsumerElement = LitElement & {
  themeValue: ThemeContext | undefined;
};

describe('Theme Provider', () => {
  let consumerTag: string;

  before(() => {
    defineComponents(IgcThemeProviderComponent);

    consumerTag = defineCE(
      class extends LitElement {
        private readonly _consumer = new ContextConsumer(this, {
          context: themeContext,
          subscribe: true,
        });

        public get themeValue(): ThemeContext | undefined {
          return this._consumer.value;
        }
      }
    );
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<IgcThemeProviderComponent>(
      html`<igc-theme-provider></igc-theme-provider>`
    );

    await expect(el).shadowDom.to.be.accessible();
    await expect(el).to.be.accessible();
  });

  it('should initialize with default values', async () => {
    const el = await fixture<IgcThemeProviderComponent>(
      html`<igc-theme-provider></igc-theme-provider>`
    );

    expect(el.theme).to.equal('bootstrap');
    expect(el.variant).to.equal('light');
  });

  it('should reflect theme attribute', async () => {
    const el = await fixture<IgcThemeProviderComponent>(
      html`<igc-theme-provider></igc-theme-provider>`
    );

    expect(el).dom.to.equal(
      `<igc-theme-provider theme="bootstrap" variant="light"></igc-theme-provider>`
    );
  });

  it('should accept theme property via attribute', async () => {
    const el = await fixture<IgcThemeProviderComponent>(
      html`<igc-theme-provider theme="material"></igc-theme-provider>`
    );

    expect(el.theme).to.equal('material');
    expect(el).attribute('theme').to.equal('material');
  });

  it('should accept variant property via attribute', async () => {
    const el = await fixture<IgcThemeProviderComponent>(
      html`<igc-theme-provider variant="dark"></igc-theme-provider>`
    );

    expect(el.variant).to.equal('dark');
    expect(el).attribute('variant').to.equal('dark');
  });

  it('should update theme property and reflect to attribute', async () => {
    const el = await fixture<IgcThemeProviderComponent>(
      html`<igc-theme-provider></igc-theme-provider>`
    );

    el.theme = 'fluent';
    await elementUpdated(el);

    expect(el.theme).to.equal('fluent');
    expect(el).attribute('theme').to.equal('fluent');
  });

  it('should update variant property and reflect to attribute', async () => {
    const el = await fixture<IgcThemeProviderComponent>(
      html`<igc-theme-provider></igc-theme-provider>`
    );

    el.variant = 'dark';
    await elementUpdated(el);

    expect(el.variant).to.equal('dark');
    expect(el).attribute('variant').to.equal('dark');
  });

  it('should render slotted content', async () => {
    const el = await fixture<IgcThemeProviderComponent>(
      html`<igc-theme-provider
        ><div id="content">Test Content</div></igc-theme-provider
      >`
    );

    const slottedContent = el.querySelector('#content');
    expect(slottedContent).to.not.be.null;
    expect(slottedContent?.textContent).to.equal('Test Content');
  });

  it('should have display: contents style', async () => {
    const el = await fixture<IgcThemeProviderComponent>(
      html`<igc-theme-provider></igc-theme-provider>`
    );

    const computedStyle = getComputedStyle(el);
    expect(computedStyle.display).to.equal('contents');
  });

  describe('Context Provider', () => {
    it('should provide theme context to descendant components', async () => {
      const tag = unsafeStatic(consumerTag);
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="material" variant="dark">
            <${tag}></${tag}>
          </igc-theme-provider>
        </div>
      `);

      const consumer = container.querySelector(
        consumerTag
      ) as ThemeContextConsumerElement;

      // Wait for context to be provided
      await elementUpdated(consumer);

      expect(consumer.themeValue).to.deep.equal({
        theme: 'material',
        variant: 'dark',
      });
    });

    it('should update context when theme property changes', async () => {
      const tag = unsafeStatic(consumerTag);
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
      const consumer = container.querySelector(
        consumerTag
      ) as ThemeContextConsumerElement;

      await elementUpdated(consumer);
      expect(consumer.themeValue?.theme).to.equal('bootstrap');

      provider.theme = 'indigo';
      await elementUpdated(provider);
      await elementUpdated(consumer);

      expect(consumer.themeValue?.theme).to.equal('indigo');
    });

    it('should update context when variant property changes', async () => {
      const tag = unsafeStatic(consumerTag);
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
      const consumer = container.querySelector(
        consumerTag
      ) as ThemeContextConsumerElement;

      await elementUpdated(consumer);
      expect(consumer.themeValue?.variant).to.equal('light');

      provider.variant = 'dark';
      await elementUpdated(provider);
      await elementUpdated(consumer);

      expect(consumer.themeValue?.variant).to.equal('dark');
    });

    it('should support nested theme providers with different themes', async () => {
      const tag = unsafeStatic(consumerTag);
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="material" variant="light">
            <${tag} id="outer-consumer"></${tag}>
            <igc-theme-provider theme="fluent" variant="dark">
              <${tag} id="inner-consumer"></${tag}>
            </igc-theme-provider>
          </igc-theme-provider>
        </div>
      `);

      const outerConsumer = container.querySelector(
        '#outer-consumer'
      ) as ThemeContextConsumerElement;
      const innerConsumer = container.querySelector(
        '#inner-consumer'
      ) as ThemeContextConsumerElement;

      await elementUpdated(outerConsumer);
      await elementUpdated(innerConsumer);

      expect(outerConsumer.themeValue).to.deep.equal({
        theme: 'material',
        variant: 'light',
      });
      expect(innerConsumer.themeValue).to.deep.equal({
        theme: 'fluent',
        variant: 'dark',
      });
    });

    it('should provide context to dynamically added descendants', async () => {
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="indigo" variant="dark">
          </igc-theme-provider>
        </div>
      `);

      const provider = container.querySelector(
        'igc-theme-provider'
      ) as IgcThemeProviderComponent;

      // Dynamically add a consumer
      const consumer = document.createElement(
        consumerTag
      ) as ThemeContextConsumerElement;
      provider.appendChild(consumer);

      await elementUpdated(consumer);

      expect(consumer.themeValue).to.deep.equal({
        theme: 'indigo',
        variant: 'dark',
      });
    });
  });

  describe('All theme and variant combinations', () => {
    const themes = ['material', 'bootstrap', 'indigo', 'fluent'] as const;
    const variants = ['light', 'dark'] as const;

    for (const theme of themes) {
      for (const variant of variants) {
        it(`should support theme="${theme}" variant="${variant}"`, async () => {
          const el = await fixture<IgcThemeProviderComponent>(
            html`<igc-theme-provider
              theme="${theme}"
              variant="${variant}"
            ></igc-theme-provider>`
          );

          expect(el.theme).to.equal(theme);
          expect(el.variant).to.equal(variant);
          expect(el).attribute('theme').to.equal(theme);
          expect(el).attribute('variant').to.equal(variant);
        });
      }
    }
  });
});

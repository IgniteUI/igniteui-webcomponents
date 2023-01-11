import {
  csrFixture,
  ssrNonHydratedFixture,
  ssrHydratedFixture,
  cleanupFixtures,
} from '@lit-labs/testing/fixtures.js';
import { html } from 'lit';
import { expect } from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcAvatarComponent from './avatar.js';

defineComponents(IgcAvatarComponent);

after(() => cleanupFixtures());

for (const fixture of [csrFixture, ssrNonHydratedFixture, ssrHydratedFixture]) {
  describe(`Avatar rendered with ${fixture.name}`, () => {
    it('is defined', () => {
      const el = document.createElement(IgcAvatarComponent.tagName);
      expect(el).instanceOf(IgcAvatarComponent);
    });

    it('renders with default values', async () => {
      const el = await fixture(html`<igc-avatar></igc-avatar>`, {
        modules: ['./avatar.js'],
      });

      expect(el).shadowDom.to.equal(`
        <div
          part="base"
          role="img"
          aria-label="avatar"
          aria-roledescription="small square"
          class="small square">
          <slot></slot>
        </div>
      `);
      expect(el).dom.to.equal(
        '<igc-avatar shape="square" size="small"></igc-avatar>'
      );
    });
  });
}

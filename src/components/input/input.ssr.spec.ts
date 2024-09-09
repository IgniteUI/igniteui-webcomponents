import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { expect } from '@open-wc/testing';
import { html } from 'lit';
import type IgcInputComponent from './input.js';

afterEach(() => cleanupFixtures());

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-input`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcInputComponent>(
        html`<igc-input value="Hello world"></igc-input>`,
        {
          modules: ['./input.js'],
        }
      );

      expect(element).not.to.be.undefined;
      expect(element.shadowRoot).not.to.be.null;
    });
  });
}

import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcSwitchComponent from './switch.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-switch checked>Label</igc-switch>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-switch`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcSwitchComponent>(template, {
        modules: ['./switch-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}

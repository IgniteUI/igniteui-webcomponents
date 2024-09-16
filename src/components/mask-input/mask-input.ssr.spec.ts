import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcMaskInputComponent from './mask-input.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-mask-input value="123"></igc-mask-input>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-mask-input`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcMaskInputComponent>(template, {
        modules: ['./mask-input-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}

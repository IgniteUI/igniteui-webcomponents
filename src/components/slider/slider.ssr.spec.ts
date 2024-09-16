import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcSliderComponent from './slider.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-slider value="50"></igc-slider>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-slider`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcSliderComponent>(template, {
        modules: ['./slider-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}

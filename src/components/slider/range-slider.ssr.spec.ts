import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcRangeSliderComponent from './range-slider.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-range-slider></igc-range-slider>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-range-slider`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcRangeSliderComponent>(template, {
        modules: ['./range-slider-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}

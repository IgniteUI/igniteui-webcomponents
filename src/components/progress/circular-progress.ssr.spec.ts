import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcCircularProgressComponent from './circular-progress.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-circular-progress value="50">
    <igc-circular-gradient
      slot="gradient"
      opacity="0.5"
      color="#d2f704"
    ></igc-circular-gradient>
    <igc-circular-gradient
      slot="gradient"
      offset="50%"
      color="#ff0079"
      opacity="0.8"
    ></igc-circular-gradient>
    <igc-circular-gradient
      slot="gradient"
      offset="100%"
      color="#1eccd4"
    ></igc-circular-gradient>
  </igc-circular-progress>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-circular-gradient`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcCircularProgressComponent>(template, {
        modules: ['./circular-progress-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}

import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcLinearProgressComponent from './linear-progress.js';

afterEach(() => cleanupFixtures());

const template = html`<igc-linear-progress value="50"></igc-linear-progress>`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-linear-progress`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcLinearProgressComponent>(template, {
        modules: ['./linear-progress-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}

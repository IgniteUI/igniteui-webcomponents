import {
  cleanupFixtures,
  csrFixture,
  ssrHydratedFixture,
  ssrNonHydratedFixture,
} from '@lit-labs/testing/fixtures.js';

import { html } from 'lit';
import { isSsrRendered, isSsrStyled } from '../common/utils.spec.js';
import type IgcStepperComponent from './stepper.js';

afterEach(() => cleanupFixtures());

const template = html`
  <igc-stepper>
    <igc-step>
      <span slot="title">Step 1</span>
      <span>Step 1 content</span>
    </igc-step>
    <igc-step>
      <span slot="title">Step 2</span>
      <span>Step 2 content</span>
    </igc-step>
  </igc-stepper>
`;

for (const fixture of [csrFixture, ssrHydratedFixture, ssrNonHydratedFixture]) {
  describe(`[${fixture.name}] - igc-stepper`, () => {
    it('renders as expected', async () => {
      const element = await fixture<IgcStepperComponent>(template, {
        modules: ['./stepper-auto-register.js'],
      });

      isSsrRendered(element);
      isSsrStyled(element);
    });
  });
}

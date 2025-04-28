import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcRippleComponent,
  defineComponents,
} from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent, IgcRippleComponent);

// region default
const metadata: Meta<IgcRippleComponent> = {
  title: 'Ripple',
  component: 'igc-ripple',
  parameters: {
    docs: {
      description: {
        component:
          'A ripple can be applied to an element to represent\ninteractive surface.',
      },
    },
  },
};

export default metadata;

type Story = StoryObj;

// endregion

const Template = () => html`
  <igc-button>
    <igc-ripple></igc-ripple>
    Button with ripple
  </igc-button>

  <h1 style="position: relative">
    Some default browser element
    <igc-ripple></igc-ripple>
  </h1>
`;

export const Basic: Story = Template.bind({});

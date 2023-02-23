import { html } from 'lit';
import { Context, Story } from './story.js';
import {
  defineComponents,
  IgcButtonComponent,
  IgcRippleComponent,
} from '../src/index.js';

defineComponents(IgcButtonComponent, IgcRippleComponent);

// region default
const metadata: Meta<IgcRippleComponent> = {
  title: 'Ripple',
  component: 'igc-ripple',
  argTypes: {},
  args: {},
};
export default metadata;
type Story = StoryObj & typeof metadata;

// endregion

const Template: Story<null, Context> = () => html`
  <igc-button>
    <igc-ripple></igc-ripple>
    Button with ripple
  </igc-button>

  <h1 style="position: relative">
    Some default browser element
    <igc-ripple></igc-ripple>
  </h1>
`;

export const Basic = Template.bind({});

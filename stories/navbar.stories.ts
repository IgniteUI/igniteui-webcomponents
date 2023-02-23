import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerIcon } from '../src/components/icon/icon.registry.js';
import { Context, Story } from './story.js';
import {
  defineComponents,
  IgcAvatarComponent,
  IgcNavbarComponent,
  IgcInputComponent,
  IgcIconComponent,
  IgcButtonComponent,
} from '../src/index.js';

defineComponents(
  IgcNavbarComponent,
  IgcAvatarComponent,
  IgcInputComponent,
  IgcIconComponent,
  IgcButtonComponent
);

// region default
const metadata: Meta<IgcNavbarComponent> = {
  title: 'Navbar',
  component: 'igc-navbar',
  argTypes: {},
  args: {},
};
export default metadata;
type Story = StoryObj & typeof metadata;

// endregion

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

registerIcon(
  'favorite',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_favorite_24px.svg'
);

const Template: Story<any, Context> = (
  { content = 'Title' }: any,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-navbar dir=${ifDefined(direction)} style="height:30px">
      <igc-icon slot="start" name="home"></igc-icon>
      <h2>${content}</h2>
      <igc-input
        slot="end"
        style="align-self: center"
        type="search"
        placeholder="search"
        size="small"
        outlined
      >
        <igc-icon name="search" slot="suffix"></igc-icon>
      </igc-input>
      <igc-icon slot="end" name="favorite"></igc-icon>
      <igc-avatar
        slot="end"
        size="small"
        shape="circle"
        src="https://i.pravatar.cc/200"
        >MP</igc-avatar
      >
      <igc-button slot="end" name="search">Login</igc-button>
    </igc-navbar>
  `;
};

export const Basic = Template.bind({});

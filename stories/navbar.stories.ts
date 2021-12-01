import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { registerIcon } from '../src/components/icon/icon.registry.js';
import { Context, Story } from './story';

// region default
const metadata = {
  title: 'Navbar',
  component: 'igc-navbar',
  argTypes: {},
};
export default metadata;

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

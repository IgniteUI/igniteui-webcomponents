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
  'search',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg'
);

const Template: Story<any, Context> = (
  { content = 'Title' }: any,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-navbar dir=${ifDefined(direction)} style="height:30px">
      <h2>${content}</h2>
      <igc-icon-button
        slot="end"
        name="search"
        variant="outlined"
      ></igc-icon-button>
    </igc-navbar>
  `;
};

export const Basic = Template.bind({});

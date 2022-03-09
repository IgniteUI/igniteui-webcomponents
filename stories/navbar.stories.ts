import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  registerIcon,
  registerIconFromText,
} from '../src/components/icon/icon.registry.js';
import { Context, Story } from './story.js';

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

registerIconFromText(
  'biking',
  '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="biking" class="svg-inline--fa fa-biking fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M400 96a48 48 0 1 0-48-48 48 48 0 0 0 48 48zm-4 121a31.9 31.9 0 0 0 20 7h64a32 32 0 0 0 0-64h-52.78L356 103a31.94 31.94 0 0 0-40.81.68l-112 96a32 32 0 0 0 3.08 50.92L288 305.12V416a32 32 0 0 0 64 0V288a32 32 0 0 0-14.25-26.62l-41.36-27.57 58.25-49.92zm116 39a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64zM128 256a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64z"/></svg>'
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
      <igc-icon-button slot="end" name="biking"></igc-icon-button>
    </igc-navbar>
  `;
};

export const Basic = Template.bind({});

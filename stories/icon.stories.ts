import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { Context, Story } from './story';
import '../igniteui-webcomponents.js';
import {
  registerIcon,
  registerIconFromText,
} from '../src/components/icon/icon.registry';
import { all } from '@igniteui/material-icons-extended';

const icons = all.map((icon) => icon.name);

// region default
const metadata = {
  title: 'Icon',
  component: 'igc-icon',
  argTypes: {
    name: {
      description: 'The name of the icon glyph to draw.',
      defaultValue: '',
      control: 'text',
    },
    collection: {
      description:
        'The name of the registered collection for look up of icons.\nDefaults to `default`.',
      defaultValue: 'default',
      control: 'text',
    },
    mirrored: {
      description: 'Whether to flip the icon. Useful for RTL layouts.',
      defaultValue: false,
      control: 'boolean',
    },
    size: {
      description: 'Determines the size of the component.',
      defaultValue: 'medium',
      control: {
        type: 'inline-radio',
        options: ['small', 'medium', 'large'],
      },
    },
  },
};
export default metadata;
interface ArgTypes {
  name: string;
  collection: string;
  mirrored: boolean;
  size: 'small' | 'medium' | 'large';
}
// endregion

(metadata.argTypes.name as any).control = {
  type: 'select',
  options: icons,
};

all.forEach((icon) => {
  registerIconFromText(icon.name, icon.value);
});

registerIconFromText(
  'biking',
  '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="biking" class="svg-inline--fa fa-biking fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M400 96a48 48 0 1 0-48-48 48 48 0 0 0 48 48zm-4 121a31.9 31.9 0 0 0 20 7h64a32 32 0 0 0 0-64h-52.78L356 103a31.94 31.94 0 0 0-40.81.68l-112 96a32 32 0 0 0 3.08 50.92L288 305.12V416a32 32 0 0 0 64 0V288a32 32 0 0 0-14.25-26.62l-41.36-27.57 58.25-49.92zm116 39a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64zM128 256a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64z"/></svg>'
);
icons.push('biking');
icons.push('search');
icons.sort();

const registerIconClick = () => {
  registerIcon(
    'search',
    'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg',
    'material'
  );
};

const Template: Story<ArgTypes, Context> = (
  { name = 'biking', collection = 'default', size, mirrored = false }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div style="display: flex;">
      <igc-icon
        .name=${name}
        .collection=${collection}
        .size=${size}
        .mirrored=${mirrored}
        dir=${ifDefined(direction)}
      >
      </igc-icon>

      <button @click=${registerIconClick}>Register Icon</button>
    </div>
  `;
};

export const Basic = Template.bind({});

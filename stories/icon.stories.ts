import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { Story } from './story';
import '../igniteui-webcomponents.js';
import {
  registerIcon,
  registerIconFromText,
} from '../src/components/icon/icon.registry';

export default {
  title: 'Icon',
  component: 'igc-icon',
  argTypes: {
    name: {
      control: {
        type: 'text',
      },
      defaultValue: '',
      description: 'Name of the icon',
    },
    collection: {
      control: {
        type: 'text',
      },
      defaultValue: 'default',
      description: 'Collection of icons',
    },
    size: {
      control: {
        type: 'inline-radio',
        options: ['small', 'medium', 'large'],
      },
      defaultValue: 'medium',
    },
    mirrored: {
      control: 'boolean',
      defaultValue: false,
    },
  },
};

interface ArgTypes {
  name: string;
  set: string;
  size: 'small' | 'medium' | 'large';
  mirrored: boolean;
}

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

registerIcon(
  'search',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg',
  'material'
);

registerIconFromText(
  'bug',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512" aria-labelledby="brbug-desc brbug-title"><title id="brbug-title">Bug Icon</title><desc id="brbug-desc">A picture showing an insect.</desc><path d="M21 9h-3.54a7.251 7.251 0 00-2.56-2.271 2.833 2.833 0 00-.2-2.015l1.007-1.007-1.414-1.414L13.286 3.3a2.906 2.906 0 00-2.572 0L9.707 2.293 8.293 3.707 9.3 4.714a2.833 2.833 0 00-.2 2.015A7.251 7.251 0 006.54 9H3v2h2.514a8.879 8.879 0 00-.454 2H3v2h2.06a8.879 8.879 0 00.454 2H3v2h3.54A6.7 6.7 0 0012 22a6.7 6.7 0 005.46-3H21v-2h-2.514a8.879 8.879 0 00.454-2H21v-2h-2.06a8.879 8.879 0 00-.454-2H21zm-10 7H9v-2h2zm0-4v-2h2v2zm4 4h-2v-2h2z"/></svg>'
);

const registerIconClick = () => {
  registerIcon(
    'virus',
    'https://cdn.jsdelivr.net/npm/@igniteui/material-icons-extended@2.8.0/src/svgs/coronavirus.svg'
  );
};

const Template: Story<ArgTypes, Context> = (
  { name = 'bug', set = 'default', size, mirrored = false }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div style="display: flex;">
      <igc-icon
        .name=${name}
        .collection=${set}
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

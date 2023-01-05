import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcBadgeComponent } from '../src/index.js';

IgcBadgeComponent.register();

// region default
const metadata = {
  title: 'Badge',
  component: 'igc-badge',
  argTypes: {
    variant: {
      type: '"primary" | "info" | "success" | "warning" | "danger"',
      description: 'The type of badge.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: {
        type: 'select',
      },
      defaultValue: 'primary',
    },
    outlined: {
      type: 'boolean',
      description: 'Sets whether to draw an outlined version of the badge.',
      control: 'boolean',
      defaultValue: false,
    },
    shape: {
      type: '"rounded" | "square"',
      description: 'The shape of the badge.',
      options: ['rounded', 'square'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'rounded',
    },
  },
};
export default metadata;
interface ArgTypes {
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  outlined: boolean;
  shape: 'rounded' | 'square';
}
// endregion

const Template: Story<ArgTypes, Context> = (
  { outlined = false, shape, variant }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const content = '';
  return html`
    <igc-badge
      ?outlined=${outlined}
      shape=${ifDefined(shape)}
      variant=${ifDefined(variant)}
      dir=${ifDefined(direction)}
      >${content}</igc-badge
    >
  `;
};

export const Basic = Template.bind({});

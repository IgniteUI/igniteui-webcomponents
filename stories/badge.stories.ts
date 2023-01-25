import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';

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
  return html`
    <igc-badge
      ?outlined=${outlined}
      shape=${ifDefined(shape)}
      variant=${ifDefined(variant)}
      dir=${ifDefined(direction)}
    >
    </igc-badge>
    <igc-badge
      ?outlined=${outlined}
      shape=${ifDefined(shape)}
      variant=${ifDefined(variant)}
      dir=${ifDefined(direction)}
    >
      <span>1</span>
    </igc-badge>
    <igc-badge
      ?outlined=${outlined}
      shape=${ifDefined(shape)}
      variant=${ifDefined(variant)}
      dir=${ifDefined(direction)}
    >
      <span>99</span>
    </igc-badge>
    <igc-badge
      ?outlined=${outlined}
      shape=${ifDefined(shape)}
      variant="success"
      dir=${ifDefined(direction)}
    >
      <span>online</span>
    </igc-badge>
    <igc-badge
      ?outlined=${outlined}
      shape=${ifDefined(shape)}
      variant=${ifDefined(variant)}
      dir=${ifDefined(direction)}
    >
      <igc-icon name="star" collection="internal"></igc-icon>
    </igc-badge>
  `;
};

export const Basic = Template.bind({});

import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineComponents, IgcBadgeComponent } from '../src/index.js';

defineComponents(IgcBadgeComponent);

// region default
const metadata: Meta = {
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
  args: {
    variant: 'primary',
    outlined: false,
    shape: 'rounded',
  },
};
export default metadata;

// endregion

const Template: Story<ArgTypes, Context> = (
  { outlined = false, shape, variant }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <link
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet"
    />
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
    <igc-badge
      ?outlined=${outlined}
      shape=${ifDefined(shape)}
      variant="warning"
      dir=${ifDefined(direction)}
    >
      <span class="material-icons">wifi</span>
    </igc-badge>
  `;
};

export const Basic = Template.bind({});

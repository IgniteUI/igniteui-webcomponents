import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineComponents, IgcBadgeComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';
import { Context } from './story.js';

defineComponents(IgcBadgeComponent);

// region default
const metadata: Meta<IgcBadgeComponent> = {
  title: 'Badge',
  component: 'igc-badge',
  parameters: {
    docs: {
      description: {
        component:
          'The badge is a component indicating a status on a related item or an area\nwhere some active indication is required.',
      },
    },
  },
  argTypes: {
    variant: {
      type: '"primary" | "info" | "success" | "warning" | "danger"',
      description: 'The type of badge.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
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
      control: { type: 'inline-radio' },
      defaultValue: 'rounded',
    },
  },
  args: { variant: 'primary', outlined: false, shape: 'rounded' },
};

export default metadata;

interface IgcBadgeArgs {
  /** The type of badge. */
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  /** Sets whether to draw an outlined version of the badge. */
  outlined: boolean;
  /** The shape of the badge. */
  shape: 'rounded' | 'square';
}
type Story = StoryObj<IgcBadgeArgs>;

// endregion

const Template = (
  { outlined = false, shape, variant }: IgcBadgeArgs,
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

export const Basic: Story = Template.bind({});

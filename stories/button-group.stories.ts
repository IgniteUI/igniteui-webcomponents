import { html } from 'lit';
import { Context } from './story.js';
import { defineComponents, IgcButtonGroupComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcButtonGroupComponent);

// region default
const metadata: Meta<IgcButtonGroupComponent> = {
  title: 'ButtonGroup',
  component: 'igc-button-group',
  parameters: {
    docs: {
      description: {
        component:
          'The `igc-button-group` groups a series of buttons together, exposing features such as layout and selection.\nThe component makes use of `igc-toggle-button`.',
      },
    },
  },
  argTypes: {
    multiple: {
      type: 'boolean',
      description: 'Enables selection of multiple buttons.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'Disables all buttons inside the group.',
      control: 'boolean',
      defaultValue: false,
    },
    alignment: {
      type: '"horizontal" | "vertical"',
      description: 'Sets the orientation of the buttons in the group.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      defaultValue: 'horizontal',
    },
  },
  args: { multiple: false, disabled: false, alignment: 'horizontal' },
};

export default metadata;

interface IgcButtonGroupArgs {
  /** Enables selection of multiple buttons. */
  multiple: boolean;
  /** Disables all buttons inside the group. */
  disabled: boolean;
  /** Sets the orientation of the buttons in the group. */
  alignment: 'horizontal' | 'vertical';
}
type Story = StoryObj<IgcButtonGroupArgs>;

// endregion

Object.assign(metadata.parameters!, {
  actions: {
    handles: ['igcSelect'],
  },
});

const Template = (
  {
    multiple = false,
    disabled = false,
    alignment = 'horizontal',
  }: IgcButtonGroupArgs,
  { globals: { direction } }: Context
) => {
  let buttonGroup: IgcButtonGroupComponent;

  const getSelection = () => {
    buttonGroup = document.getElementById(
      'igc-button-group-1'
    ) as IgcButtonGroupComponent;

    console.log(buttonGroup.selection);
  };

  const setSelection = () => {
    buttonGroup = document.getElementById(
      'igc-button-group-1'
    ) as IgcButtonGroupComponent;

    buttonGroup.selection = ['top', 'bottom'];
  };

  const igcSelect = (e) => {
    console.log('igcSelect');
    console.log(e.detail);
  };

  return html`
    <igc-button-group
      .multiple=${multiple}
      .disabled=${disabled}
      .alignment=${alignment}
      .dir=${direction}
      @igcSelect=${igcSelect}
    >
      <igc-toggle-button value="left">Left</igc-toggle-button>
      <igc-toggle-button value="center">Center</igc-toggle-button>
      <igc-toggle-button value="right">Right</igc-toggle-button>
      <igc-toggle-button value="top">Top</igc-toggle-button>
      <igc-toggle-button value="bottom">Bottom</igc-toggle-button>
    </igc-button-group>

    <hr />
    <button @click=${getSelection}>Get selection</button>
    <button @click=${setSelection}>Set selection</button>
  `;
};

export const Basic: Story = Template.bind({});

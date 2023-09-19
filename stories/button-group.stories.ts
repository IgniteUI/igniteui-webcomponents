import { html } from 'lit';
import { Context } from './story.js';
import {
  defineComponents,
  IgcButtonGroupComponent,
  registerIconFromText,
} from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';
import { github, amazon, google } from '@igniteui/material-icons-extended';

defineComponents(IgcButtonGroupComponent);
registerIconFromText(github.name, github.value);
registerIconFromText(amazon.name, github.value);
registerIconFromText(google.name, github.value);

// region default
const metadata: Meta<IgcButtonGroupComponent> = {
  title: 'ButtonGroup',
  component: 'igc-button-group',
  parameters: { docs: { description: {} } },
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
    <div style="display: flex; flex-direction: column; gap: 24px">
      <igc-button-group
        .multiple=${multiple}
        .disabled=${disabled}
        .alignment=${alignment}
        .dir=${direction}
        @igcSelect=${igcSelect}
      >
        <igc-toggle-button value="left"> Left </igc-toggle-button>
        <igc-toggle-button value="center">Center</igc-toggle-button>
        <igc-toggle-button value="right">
          <span
            >Right (Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Praesentium, reiciendis.)</span
          >
        </igc-toggle-button>
        <igc-toggle-button value="top">Top</igc-toggle-button>
        <igc-toggle-button value="bottom">Bottom</igc-toggle-button>
      </igc-button-group>

      <div style="display: flex;">
        <igc-button-group
          .multiple=${multiple}
          .disabled=${disabled}
          .alignment=${alignment}
          .dir=${direction}
          @igcSelect=${igcSelect}
        >
          <igc-toggle-button value="left">
            <igc-icon name="github"></igc-icon>
            <span>left icon</span>
          </igc-toggle-button>
          <igc-toggle-button value="center">
            <span>right icon</span>
            <igc-icon name="github"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="right">
            <igc-icon name="github"></igc-icon>
            <span>both sides</span>
            <igc-icon name="github"></igc-icon>
          </igc-toggle-button>
        </igc-button-group>
      </div>

      <div style="display: flex;">
        <igc-button-group
          .multiple=${multiple}
          .disabled=${disabled}
          .alignment=${alignment}
          .dir=${direction}
          @igcSelect=${igcSelect}
        >
          <igc-toggle-button value="left">
            <igc-icon name="github"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="center">
            <igc-icon name="github"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="right">
            <igc-icon name="github"></igc-icon>
          </igc-toggle-button>
        </igc-button-group>
      </div>

      <div>
        <button @click=${getSelection}>Get selection</button>
        <button @click=${setSelection}>Set selection</button>
      </div>
    </div>
  `;
};

export const Basic: Story = Template.bind({});

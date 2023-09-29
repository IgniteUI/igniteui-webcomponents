import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import {
  defineComponents,
  IgcButtonGroupComponent,
  IgcIconComponent,
  registerIcon,
} from '../src/index.js';

defineComponents(IgcButtonGroupComponent, IgcIconComponent);

// region default
const metadata: Meta<IgcButtonGroupComponent> = {
  title: 'ButtonGroup',
  component: 'igc-button-group',
  parameters: {
    docs: {
      description: {
        component:
          'The `igc-button-group` groups a series of `igc-toggle-button`s together, exposing features such as layout and selection.',
      },
    },
  },
  argTypes: {
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
    selection: {
      type: '"single" | "single-required" | "multiple"',
      description: 'Controls the mode of selection for the button group.',
      options: ['single', 'single-required', 'multiple'],
      control: { type: 'inline-radio' },
      defaultValue: 'single',
    },
  },
  args: { disabled: false, alignment: 'horizontal', selection: 'single' },
};

export default metadata;

interface IgcButtonGroupArgs {
  /** Disables all buttons inside the group. */
  disabled: boolean;
  /** Sets the orientation of the buttons in the group. */
  alignment: 'horizontal' | 'vertical';
  /** Controls the mode of selection for the button group. */
  selection: 'single' | 'single-required' | 'multiple';
}
type Story = StoryObj<IgcButtonGroupArgs>;

// endregion

Object.assign(metadata.parameters!, {
  actions: {
    handles: ['igcSelect', 'igcDeselect'],
  },
});

const icons = [
  {
    name: 'bold',
    url: 'https://unpkg.com/material-design-icons@3.0.1/editor/svg/production/ic_format_bold_24px.svg',
  },
  {
    name: 'italic',
    url: 'https://unpkg.com/material-design-icons@3.0.1/editor/svg/production/ic_format_italic_24px.svg',
  },
  {
    name: 'underline',
    url: 'https://unpkg.com/material-design-icons@3.0.1/editor/svg/production/ic_format_underlined_24px.svg',
  },
];

icons.forEach((icon) => {
  registerIcon(icon.name, icon.url, 'material');
});

const BasicTemplate = ({
  selection,
  disabled,
  alignment,
}: IgcButtonGroupArgs) => {
  const igcSelect = (e) => {
    console.log('igcSelect');
    console.log(e.detail);
  };

  const igcDeselect = (e) => {
    console.log('igcDeselect');
    console.log(e.detail);
  };

  return html`
    <igc-button-group
      .selection=${selection}
      .disabled=${disabled}
      .alignment=${alignment}
      @igcSelect=${igcSelect}
      @igcDeselect=${igcDeselect}
    >
      <igc-toggle-button value="left">Left</igc-toggle-button>
      <igc-toggle-button value="center">Center</igc-toggle-button>
      <igc-toggle-button value="right">Right</igc-toggle-button>
      <igc-toggle-button value="top">Top</igc-toggle-button>
      <igc-toggle-button value="bottom">Bottom</igc-toggle-button>
    </igc-button-group>
  `;
};

const SlottedContentTemplate = () => {
  return html`
    <igc-button-group selection="multiple">
      <igc-toggle-button aria-label="Bold" value="bold">
        <igc-icon name="bold" collection="material"></igc-icon>
      </igc-toggle-button>

      <igc-toggle-button aria-label="Italic" value="italic">
        <igc-icon name="italic" collection="material"></igc-icon>
      </igc-toggle-button>

      <igc-toggle-button aria-label="Underline" value="underline">
        <igc-icon name="underline" collection="material"></igc-icon>
      </igc-toggle-button>
    </igc-button-group>
  `;
};

export const Basic: Story = BasicTemplate.bind({});
export const SlottedContent: Story = SlottedContentTemplate.bind({});

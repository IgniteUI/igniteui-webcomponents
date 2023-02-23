import { html } from 'lit';
import { github } from '@igniteui/material-icons-extended';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerIconFromText } from '../src/components/icon/icon.registry';
import {
  defineComponents,
  IgcMaskInputComponent,
  IgcIconComponent,
} from '../src/index.js';

defineComponents(IgcMaskInputComponent, IgcIconComponent);
registerIconFromText(github.name, github.value);

// region default
const metadata: Meta<IgcMaskInputComponent> = {
  title: 'Mask Input',
  component: 'igc-mask-input',
  argTypes: {
    valueMode: {
      type: '"raw" | "withFormatting"',
      description:
        'Dictates the behavior when retrieving the value of the control:\n\n- `raw` will return the clean user input.\n- `withFormatting` will return the value with all literals and prompts.',
      options: ['raw', 'withFormatting'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'raw',
    },
    mask: {
      type: 'string',
      description: 'The mask pattern to apply on the input.',
      control: 'text',
    },
    prompt: {
      type: 'string',
      description: 'The prompt symbol to use for unfilled parts of the mask.',
      control: 'text',
    },
    invalid: {
      type: 'boolean',
      description: 'Controls the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    value: {
      type: 'string',
      description:
        'The value of the input.\n\nRegardless of the currently set `value-mode`, an empty value will return an empty string.',
      control: 'text',
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      defaultValue: false,
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'Makes the control a disabled field.',
      control: 'boolean',
      defaultValue: false,
    },
    readonly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      defaultValue: false,
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control.',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'medium',
    },
  },
  args: {
    valueMode: 'raw',
    invalid: false,
    outlined: false,
    required: false,
    disabled: false,
    readonly: false,
    size: 'medium',
  },
};
export default metadata;
type Story = StoryObj & typeof metadata;

// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange', 'igcInput'],
  },
};

const Template: Story<ArgTypes, Context> = (
  {
    name,
    readonly,
    disabled,
    required,
    outlined,
    valueMode,
    label,
    value,
    placeholder,
    mask,
    prompt,
    size,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`<igc-mask-input
    dir=${direction}
    name=${ifDefined(name)}
    placeholder=${ifDefined(placeholder)}
    value=${ifDefined(value)}
    mask=${ifDefined(mask)}
    prompt=${ifDefined(prompt)}
    label=${ifDefined(label)}
    size=${ifDefined(size)}
    value-mode=${ifDefined(valueMode)}
    ?readonly=${ifDefined(readonly)}
    ?outlined=${ifDefined(outlined)}
    ?required=${ifDefined(required)}
    ?disabled=${ifDefined(disabled)}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-mask-input>`;
};

export const Basic = Template.bind({});

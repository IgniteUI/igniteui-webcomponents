import { html } from 'lit';
import { github } from '@igniteui/material-icons-extended';
import { Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerIconFromText } from '../src/components/icon/icon.registry';
import {
  defineComponents,
  IgcMaskInputComponent,
  IgcIconComponent,
} from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcMaskInputComponent, IgcIconComponent);
registerIconFromText(github.name, github.value);

// region default
const metadata: Meta<IgcMaskInputComponent> = {
  title: 'MaskInput',
  component: 'igc-mask-input',
  parameters: {
    docs: {
      description: {
        component:
          'A masked input is an input field where a developer can control user input and format the visible value,\nbased on configurable rules',
      },
    },
  },
  argTypes: {
    valueMode: {
      type: '"raw" | "withFormatting"',
      description:
        'Dictates the behavior when retrieving the value of the control:\n\n- `raw` will return the clean user input.\n- `withFormatting` will return the value with all literals and prompts.',
      options: ['raw', 'withFormatting'],
      control: { type: 'inline-radio' },
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
    value: {
      type: 'string',
      description:
        'The value of the input.\n\nRegardless of the currently set `value-mode`, an empty value will return an empty string.',
      control: 'text',
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
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
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field in form context.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component',
      control: 'boolean',
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'Control the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: { type: 'inline-radio' },
      defaultValue: 'medium',
    },
  },
  args: {
    valueMode: 'raw',
    outlined: false,
    readonly: false,
    required: false,
    disabled: false,
    invalid: false,
    size: 'medium',
  },
};

export default metadata;

interface IgcMaskInputArgs {
  /**
   * Dictates the behavior when retrieving the value of the control:
   *
   * - `raw` will return the clean user input.
   * - `withFormatting` will return the value with all literals and prompts.
   */
  valueMode: 'raw' | 'withFormatting';
  /** The mask pattern to apply on the input. */
  mask: string;
  /** The prompt symbol to use for unfilled parts of the mask. */
  prompt: string;
  /**
   * The value of the input.
   *
   * Regardless of the currently set `value-mode`, an empty value will return an empty string.
   */
  value: string;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** Makes the control a readonly field. */
  readonly: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
  /** The name attribute of the control. */
  name: string;
  /** Makes the control a required field in form context. */
  required: boolean;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
  /** Determines the size of the component. */
  size: 'small' | 'medium' | 'large';
}
type Story = StoryObj<IgcMaskInputArgs>;

// endregion

Object.assign(metadata.parameters!, {
  actions: {
    handles: ['igcChange', 'igcInput'],
  },
});

const Template = (
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
  }: IgcMaskInputArgs,
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

export const Basic: Story = Template.bind({});

export const Form: Story = {
  render: () => {
    const onSubmit = (e: SubmitEvent) => {
      e.preventDefault();
      console.log(
        JSON.stringify(
          Object.fromEntries(new FormData(e.target as HTMLFormElement))
        )
      );
    };
    return html`<form action="" @submit=${onSubmit}>
      <fieldset>
        <legend>Default masked input</legend>
        <igc-mask-input
          name="mask-default"
          value="XYZ"
          label="Default"
        ></igc-mask-input>
      </fieldset>
      <fieldset>
        <legend>Formatted value mode</legend>
        <igc-mask-input
          required
          label="Formatted value mode"
          name="mask-formatted-value"
          mask="(CCC) (CCC)"
          value-mode="withFormatting"
          value="123456"
        ></igc-mask-input>
      </fieldset>
      <fieldset disabled>
        <legend>Disabled masked input</legend>
        <igc-mask-input
          name="mask-disabled"
          label="Disabled mask"
        ></igc-mask-input>
      </fieldset>
      <fieldset>
        <legend>Masked constraints</legend>
        <igc-mask-input
          name="mask-required"
          label="Required"
          required
        ></igc-mask-input>
        <igc-mask-input
          name="required-mask-pattern"
          label="Mask pattern validation"
          mask="(+35\\9) 000-000-000"
        ></igc-mask-input>
      </fieldset>
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </form>`;
  },
};

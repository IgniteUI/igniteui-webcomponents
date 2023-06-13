import type { Meta, StoryObj } from '@storybook/web-components';
import { defineComponents, IgcTextareaComponent } from '../src/index.js';
import { html } from 'lit';

defineComponents(IgcTextareaComponent);

// region default
const metadata: Meta<IgcTextareaComponent> = {
  title: 'Textarea',
  component: 'igc-textarea',
  parameters: {
    docs: {
      description: {
        component:
          'This element represents a multi-line plain-text editing control,\nuseful when you want to allow users to enter a sizeable amount of free-form text,\nfor example a comment on a review or feedback form.',
      },
    },
  },
  argTypes: {
    cols: {
      type: 'number',
      description:
        'The visible width of the text control, in average character widths. If it is specified, it must be a positive integer.\nIf it is not specified, the default value is 20.',
      control: 'number',
      defaultValue: '20',
    },
    rows: {
      type: 'number',
      description:
        'The number of visible text lines for the control. If it is specified, it must be a positive integer.\nIf it is not specified, the default value is 2.',
      control: 'number',
      defaultValue: '2',
    },
    value: {
      type: 'string',
      description: 'The value of the component',
      control: 'text',
      defaultValue: '',
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control.',
      control: 'text',
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      defaultValue: false,
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
    resize: {
      type: '"vertical" | "horizontal" | "auto" | "none" | "both"',
      options: ['vertical', 'horizontal', 'auto', 'none', 'both'],
      control: { type: 'select' },
      defaultValue: 'both',
    },
    minLength: {
      type: 'number',
      description:
        'The minimum number of characters (UTF-16 code units) required that the user should enter.',
      control: 'number',
    },
    maxLength: {
      type: 'number',
      description:
        "The maximum number of characters (UTF-16 code units) that the user can enter.\nIf this value isn't specified, the user can enter an unlimited number of characters.",
      control: 'number',
    },
  },
  args: { cols: '20', rows: '2', value: '', outlined: false, resize: 'both' },
};

export default metadata;

interface IgcTextareaArgs {
  /**
   * The visible width of the text control, in average character widths. If it is specified, it must be a positive integer.
   * If it is not specified, the default value is 20.
   */
  cols: number;
  /**
   * The number of visible text lines for the control. If it is specified, it must be a positive integer.
   * If it is not specified, the default value is 2.
   */
  rows: number;
  /** The value of the component */
  value: string;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The label for the control. */
  label: string;
  resize: 'vertical' | 'horizontal' | 'auto' | 'none' | 'both';
  /** The minimum number of characters (UTF-16 code units) required that the user should enter. */
  minLength: number;
  /**
   * The maximum number of characters (UTF-16 code units) that the user can enter.
   * If this value isn't specified, the user can enter an unlimited number of characters.
   */
  maxLength: number;
}
type Story = StoryObj<IgcTextareaArgs>;

// endregion

export const Default: Story = {
  args: {
    placeholder: 'Please type in...',
    cols: 25,
    rows: 5,
    label: 'Feedback',
  },
};

export const Projected: Story = {
  args: { cols: 50, rows: 10 },
  parameters: {
    actions: {
      handles: ['igcInput', 'igcChange'],
    },
  },
  render: ({ cols, rows, resize }) => {
    return html`
      <igc-textarea autofocus .cols=${cols} .rows=${rows} .resize=${resize}>
        <span>Hello world</span>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sed quisquam
          pariatur quaerat, quas fugiat nam doloremque doloribus ut qui? Libero
          architecto necessitatibus sequi vitae obcaecati similique? Temporibus
          quibusdam id suscipit?
        </p>
      </igc-textarea>
    `;
  },
};

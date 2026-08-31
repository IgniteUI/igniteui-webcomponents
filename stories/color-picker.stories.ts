import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { range } from 'lit/directives/range.js';

import {
  IgcColorPickerComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcColorPickerComponent);

// region default
const metadata: Meta<IgcColorPickerComponent> = {
  title: 'ColorPicker',
  component: 'igc-color-picker',
  parameters: {
    docs: {
      description: {
        component:
          'Color input component.\n\nThe user picks a color with the HSV saturation/value canvas, the hue slider\nand the optional alpha slider. The user can also type a color string: hex,\nrgb(a), hsl(a) or a named CSS color.\n\nThe component supports pre-defined swatches and the native EyeDropper API,\nwhere the browser provides one. The anchor is a trigger button\n(`mode="default"`) or an editable text field (`mode="input"`).',
      },
    },
    actions: {
      handles: [
        'igcOpening',
        'igcOpened',
        'igcClosing',
        'igcClosed',
        'igcInput',
        'igcChange',
      ],
    },
  },
  argTypes: {
    label: {
      type: 'string',
      description:
        'The label of the component.\n\nIn `mode="input"` the component forwards the label to the anchor input.\nIn `mode="default"` it renders the label as a separate element.',
      control: 'text',
    },
    value: {
      type: 'string',
      description:
        'The value of the component as a CSS color string. Accepts hex, rgb(a),\nhsl(a) and named colors.\n\nAn empty, whitespace-only or invalid string clears the value.',
      control: 'text',
    },
    format: {
      type: { name: 'enum', value: ['hex', 'rgb', 'hsl'] },
      description:
        'Sets the color format of the string value.\n\nA format change renders `value` in the new notation. The color does not\nchange, so the component emits no `igcInput` or `igcChange`.',
      options: ['hex', 'rgb', 'hsl'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'hex' } },
    },
    hideFormats: {
      type: 'boolean',
      description: 'Whether to hide the format picker buttons.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    showAlpha: {
      type: 'boolean',
      description: 'Whether to show the alpha slider and input.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    mode: {
      type: { name: 'enum', value: ['default', 'input'] },
      description:
        'The mode of the color picker.\n\nIn `"default"` mode the anchor is a trigger button. In `"input"` mode the\nanchor is an editable text field with a color swatch prefix. The prefix\nalso opens the picker.',
      options: ['default', 'input'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'default' } },
    },
    scrollStrategy: {
      type: { name: 'enum', value: ['scroll', 'hide', 'close'] },
      description:
        'Sets the behavior of the component when the parent container scrolls.\n\nIf the value is `hide`, the component hides while the anchor is fully out\nof view. `hide` is the default value.\n\nIf the value is `scroll`, the component stays visible and anchored.\n\nIf the value is `close`, the component closes on each scroll.',
      options: ['scroll', 'hide', 'close'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'hide' } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      type: 'string',
      description: 'The name of the control, submitted with the form data.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    format: 'hex',
    hideFormats: false,
    showAlpha: false,
    mode: 'default',
    scrollStrategy: 'hide',
    required: false,
    disabled: false,
    invalid: false,
    open: false,
  },
};

export default metadata;

interface IgcColorPickerArgs {
  /**
   * The label of the component.
   *
   * In `mode="input"` the component forwards the label to the anchor input.
   * In `mode="default"` it renders the label as a separate element.
   */
  label: string;
  /**
   * The value of the component as a CSS color string. Accepts hex, rgb(a),
   * hsl(a) and named colors.
   *
   * An empty, whitespace-only or invalid string clears the value.
   */
  value: string;
  /**
   * Sets the color format of the string value.
   *
   * A format change renders `value` in the new notation. The color does not
   * change, so the component emits no `igcInput` or `igcChange`.
   */
  format: 'hex' | 'rgb' | 'hsl';
  /** Whether to hide the format picker buttons. */
  hideFormats: boolean;
  /** Whether to show the alpha slider and input. */
  showAlpha: boolean;
  /**
   * The mode of the color picker.
   *
   * In `"default"` mode the anchor is a trigger button. In `"input"` mode the
   * anchor is an editable text field with a color swatch prefix. The prefix
   * also opens the picker.
   */
  mode: 'default' | 'input';
  /**
   * Sets the behavior of the component when the parent container scrolls.
   *
   * If the value is `hide`, the component hides while the anchor is fully out
   * of view. `hide` is the default value.
   *
   * If the value is `scroll`, the component stays visible and anchored.
   *
   * If the value is `close`, the component closes on each scroll.
   */
  scrollStrategy: 'scroll' | 'hide' | 'close';
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Sets the open state of the component. */
  open: boolean;
}
type Story = StoryObj<IgcColorPickerArgs>;

// endregion

/**
 * Layout shared by the multi-sample stories.
 *
 * `align-items: start` keeps every anchor on the same baseline no matter how
 * tall its label wraps, and the block padding leaves the popover somewhere to
 * open into instead of pushing the canvas around.
 */
const samples = html`
  <style>
    .samples {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      gap: 2rem 3rem;
      padding-block-end: 22rem;
    }

    .samples output {
      display: block;
      margin-block-start: 1rem;
      font-family: var(--ig-font-family, monospace);
      color: var(--ig-gray-700);
    }

    fieldset {
      min-width: 0;
    }
  </style>
`;

const palette = [
  '#f94144',
  '#f3722c',
  '#f8961e',
  '#f9c74f',
  '#90be6d',
  '#43aa8b',
  '#4d908e',
  '#577590',
];

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A fully interactive color picker. Use the controls panel to explore `mode`, `format`, `showAlpha`, `hideFormats` and the validation properties.',
      },
    },
    actions: { handles: [] },
  },
  args: {
    label: 'Pick a color',
    value: 'rebeccapurple',
  },
  render: (args) => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        .label=${args.label}
        .value=${args.value ?? ''}
        .format=${args.format}
        .mode=${args.mode}
        ?hide-formats=${args.hideFormats}
        ?show-alpha=${args.showAlpha}
        ?required=${args.required}
        ?disabled=${args.disabled}
        ?invalid=${args.invalid}
        ?open=${args.open}
      >
        <p slot="helper-text">Opens on click or with Alt + Arrow Down.</p>
      </igc-color-picker>
    </div>
  `,
};

export const Formats: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`format` decides the notation `value` is written in. Switching it re-renders the same color rather than changing it, so neither `igcInput` nor `igcChange` is emitted. Clear the field inside the picker to see each format hint its own notation as a placeholder.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        label="Hex"
        format="hex"
        value="#3f51b5"
      ></igc-color-picker>
      <igc-color-picker
        label="RGB"
        format="rgb"
        value="#3f51b5"
      ></igc-color-picker>
      <igc-color-picker
        label="HSL"
        format="hsl"
        value="#3f51b5"
      ></igc-color-picker>
    </div>
  `,
};

export const AlphaChannel: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`show-alpha` reveals the alpha slider and its input, both expressed in whole percent. The anchor swatch splits in two - the picked color over the left half and the same color at its real opacity across the whole surface - so a translucent color is always shown next to what it actually is.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        label="Opaque"
        show-alpha
        format="rgb"
        value="rgb(63 81 181)"
      ></igc-color-picker>
      <igc-color-picker
        label="60% opacity"
        show-alpha
        format="rgb"
        value="rgb(63 81 181 / 0.6)"
      ></igc-color-picker>
      <igc-color-picker
        label="15% opacity"
        show-alpha
        format="rgb"
        value="rgb(63 81 181 / 0.15)"
      ></igc-color-picker>
    </div>
  `,
};

export const InputMode: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`mode="input"` swaps the trigger button for an editable text field with the swatch as its prefix. The field accepts any CSS color - hex, `rgb()`, `hsl()` or a named color - and reverts to the current value if what was typed cannot be parsed. Clearing it clears the picker.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        label="Trigger button"
        mode="default"
        value="#e91e63"
      ></igc-color-picker>
      <igc-color-picker
        label="Editable field"
        mode="input"
        value="#e91e63"
      ></igc-color-picker>
      <igc-color-picker
        label="Editable field, empty"
        mode="input"
      ></igc-color-picker>
    </div>
  `,
};

export const CustomSwatches: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Assigning `swatches` renders a row of preset colors under the picker controls. Clicking one commits it as the value. Any CSS color string is accepted.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        label="Brand palette"
        value="#43aa8b"
        .swatches=${palette}
      ></igc-color-picker>
      <igc-color-picker
        label="Named colors"
        .swatches=${[
          'tomato',
          'orange',
          'gold',
          'yellowgreen',
          'seagreen',
          'teal',
          'steelblue',
          'rebeccapurple',
        ]}
      ></igc-color-picker>
    </div>
  `,
};

export const Sizes: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The anchor, the popover and the controls inside it all follow `--ig-size`.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div class="samples">
      <igc-color-picker
        style="--ig-size: 1"
        label="Small"
        show-alpha
        value="#009688"
        .swatches=${palette}
      ></igc-color-picker>
      <igc-color-picker
        style="--ig-size: 2"
        label="Medium"
        show-alpha
        value="#009688"
        .swatches=${palette}
      ></igc-color-picker>
      <igc-color-picker
        style="--ig-size: 3"
        label="Large"
        show-alpha
        value="#009688"
        .swatches=${palette}
      ></igc-color-picker>
    </div>
  `,
};

export const States: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'With no value the anchor carries a diagonal "no color" mark and the picker opens at the white corner of the saturation plane, with the hue slider at red.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <div style="display: flex; gap: 32px;">
      <div style="display: grid; gap: 16px;">
        <igc-color-picker label="No color selected" mode="input">
        </igc-color-picker>
        <igc-color-picker label="invalid" mode="input" value="#009688" invalid>
          <p slot="helper-text">Pick a color to continue</p>
        </igc-color-picker>
        <igc-color-picker
          label="Disabled"
          mode="input"
          value="#009688"
          disabled
        >
        </igc-color-picker>
      </div>
      <div style="display: grid; gap: 16px; align-items: center">
        <igc-color-picker label="No color selected"></igc-color-picker>
        <igc-color-picker label="Invalid" invalid>
          <p slot="helper-text">Pick a color to continue</p>
        </igc-color-picker>
        <igc-color-picker label="Disabled" value="#009688" disabled>
        </igc-color-picker>
      </div>
    </div>
  `,
};

export const Events: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`igcInput` fires on every interaction with the picker area - dragging the canvas or a slider, typing, picking a swatch. `igcChange` fires once the committed value has actually moved and focus has left the component.',
      },
    },
  },
  render: () => {
    const report = (event: CustomEvent<string>) => {
      const output = (event.currentTarget as HTMLElement)
        .closest('.samples')
        ?.querySelector('output');

      if (output) {
        output.textContent = `${event.type} - ${event.detail || '(cleared)'}`;
      }
    };

    return html`
      ${samples}
      <div class="samples">
        <div>
          <igc-color-picker
            label="Pick a color"
            .swatches=${palette}
            @igcInput=${report}
            @igcChange=${report}
          ></igc-color-picker>
          <output>No events yet</output>
        </div>
      </div>
    `;
  },
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The picker submits its `value` in the active `format` under `name`. Reset restores the value the control was rendered with.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${samples}
    <form action="" @submit=${formSubmitHandler}>
      <fieldset style="display: grid; gap: 16px;">
        <igc-color-picker
          name="color-default"
          label="Default"
        ></igc-color-picker>

        <igc-color-picker
          name="color-initial-value"
          label="Initial value"
          value="firebrick"
        ></igc-color-picker>

        <igc-color-picker
          name="color-required"
          label="Required"
          mode="input"
          required
        >
          <p slot="value-missing">Pick a color to continue</p>
        </igc-color-picker>
      </fieldset>

      <fieldset disabled>
        <igc-color-picker
          name="color-disabled"
          label="Disabled"
          value="#009688"
        ></igc-color-picker>
      </fieldset>

      ${formControls()}
    </form>
  `,
};

export const InScrollingPanel: Story = {
  args: {
    label: 'Accent color',
    value: '#3f51b5',
    scrollStrategy: 'close',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A color picker opens inside a scrolling panel. A panel can be a settings pane, a dialog body or a side drawer. The `scroll-strategy` property sets what happens to the picker when the panel scrolls. If the value is `hide`, the picker hides while the anchor is out of view. `hide` is the default value. If the value is `scroll`, the picker follows the anchor. If the value is `close`, the picker closes.',
      },
    },
    actions: { handles: [] },
  },
  render: ({ label, value, mode, scrollStrategy }) => html`
    <style>
      .panel {
        max-width: 46rem;
        height: 16rem;
        overflow: auto;
        padding: 1rem;
        border: 1px solid var(--ig-gray-200, #e0e0e0);
        border-radius: 4px;
      }
    </style>

    <div class="panel">
      <h4>Appearance</h4>
      <p>
        Open the picker and scroll this panel to compare the scroll strategies.
      </p>

      <igc-color-picker
        .label=${label}
        .value=${value ?? ''}
        .mode=${mode}
        .scrollStrategy=${scrollStrategy}
      ></igc-color-picker>

      <p>
        ${Array.from(range(1, 24)).map(
          () => html`The accent color applies to buttons, links and charts. `
        )}
      </p>
    </div>
  `,
};

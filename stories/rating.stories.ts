import { html, svg } from 'lit';
import { bacteria, bandage } from '@igniteui/material-icons-extended';
import { range } from 'lit-html/directives/range.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerIconFromText } from '../src/components/icon/icon.registry';
import {
  Context,
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';
import {
  defineComponents,
  IgcRatingComponent,
  IgcIconComponent,
} from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcRatingComponent, IgcIconComponent);
const icons = [bacteria, bandage];
icons.forEach((icon) => {
  registerIconFromText(icon.name, icon.value);
});

// region default
const metadata: Meta<IgcRatingComponent> = {
  title: 'Rating',
  component: 'igc-rating',
  parameters: {
    docs: {
      description: {
        component:
          "Rating provides insight regarding others' opinions and experiences,\nand can allow the user to submit a rating of their own",
      },
    },
  },
  argTypes: {
    max: {
      type: 'number',
      description:
        'The maximum value for the rating.\n\nIf there are projected symbols, the maximum value will be resolved\nbased on the number of symbols.',
      control: 'number',
      defaultValue: 5,
    },
    step: {
      type: 'number',
      description:
        'The minimum value change allowed.\n\nValid values are in the interval between 0 and 1 inclusive.',
      control: 'number',
      defaultValue: 1,
    },
    label: {
      type: 'string',
      description: 'The label of the control.',
      control: 'text',
    },
    valueFormat: {
      type: 'string',
      description:
        "A format string which sets aria-valuetext. Instances of '{0}' will be replaced\nwith the current value of the control and instances of '{1}' with the maximum value for the control.\n\nImportant for screen-readers and useful for localization.",
      control: 'text',
    },
    value: {
      type: 'number',
      description: 'The current value of the component',
      control: 'number',
      defaultValue: 0,
    },
    hoverPreview: {
      type: 'boolean',
      description: 'Sets hover preview behavior for the component',
      control: 'boolean',
      defaultValue: false,
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      defaultValue: false,
    },
    readonly: {
      type: 'boolean',
      description: 'Sets the readonly state of the component',
      control: 'boolean',
    },
    single: {
      type: 'boolean',
      description: 'Toggles single selection visual mode.',
      control: 'boolean',
      defaultValue: false,
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
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
      defaultValue: 'large',
    },
  },
  args: {
    max: 5,
    step: 1,
    value: 0,
    hoverPreview: false,
    readOnly: false,
    single: false,
    disabled: false,
    invalid: false,
    size: 'large',
  },
};

export default metadata;

interface IgcRatingArgs {
  /**
   * The maximum value for the rating.
   *
   * If there are projected symbols, the maximum value will be resolved
   * based on the number of symbols.
   */
  max: number;
  /**
   * The minimum value change allowed.
   *
   * Valid values are in the interval between 0 and 1 inclusive.
   */
  step: number;
  /** The label of the control. */
  label: string;
  /**
   * A format string which sets aria-valuetext. Instances of '{0}' will be replaced
   * with the current value of the control and instances of '{1}' with the maximum value for the control.
   *
   * Important for screen-readers and useful for localization.
   */
  valueFormat: string;
  /** The current value of the component */
  value: number;
  /** Sets hover preview behavior for the component */
  hoverPreview: boolean;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** Sets the readonly state of the component */
  readonly: boolean;
  /** Toggles single selection visual mode. */
  single: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
  /** Determines the size of the component. */
  size: 'small' | 'medium' | 'large';
}
type Story = StoryObj<IgcRatingArgs>;

// endregion

Object.assign(metadata.parameters!, {
  actions: {
    handles: ['igcChange', 'igcHover'],
  },
});

const heartSVG = svg`<?xml version="1.0" ?><svg
viewBox="0 0 24 24"
xmlns="http://www.w3.org/2000/svg"
width="100%"
height="100%"
>
<defs>
  <style>
    .cls-1 {
      fill: #da3380;
    }
    .cls-2 {
      fill: #f55fa6;
    }
    .cls-3 {
      fill: #6c2e7c;
    }
  </style>
</defs>
<g id="Icons">
  <path
    class="cls-1"
    d="M23,8c0,5-3,10-11,14C4,18,1,13,1,8a5.823,5.823,0,0,1,.37-2.05A5.989,5.989,0,0,1,12,4.69,5.989,5.989,0,0,1,22.63,5.95,5.823,5.823,0,0,1,23,8Z"
  />
  <path
    class="cls-2"
    d="M22.63,5.95c-.96,3.782-3.9,7.457-9.7,10.567a1.984,1.984,0,0,1-1.864,0c-5.8-3.11-8.738-6.785-9.7-10.567A5.989,5.989,0,0,1,12,4.69,5.989,5.989,0,0,1,22.63,5.95Z"
  />
</g>
<g data-name="Layer 4" id="Layer_4">
  <path
    class="cls-3"
    d="M17,1a6.98,6.98,0,0,0-5,2.1A7,7,0,0,0,0,8c0,4.16,2,10.12,11.553,14.9a1,1,0,0,0,.894,0C22,18.12,24,12.16,24,8A7.008,7.008,0,0,0,17,1ZM12,20.878C5.363,17.447,2,13.116,2,8a5,5,0,0,1,9.167-2.761,1.038,1.038,0,0,0,1.666,0A5,5,0,0,1,22,8C22,13.116,18.637,17.447,12,20.878Z"
  />
</g>
</svg>`;

const Template = (
  {
    size,
    hoverPreview,
    step,
    max,
    disabled,
    readonly,
    label = 'Default',
    value,
    valueFormat,
    single,
  }: IgcRatingArgs,
  { globals: { direction } }: Context
) => {
  const emoji = ['😣', '😔', '😐', '🙂', '😆'];

  const hoverHandler = (e: CustomEvent) => {
    const labels = [
      'Select a value',
      'Terrible',
      'Bad',
      'Meh',
      'Great',
      'Superb',
    ];
    document.getElementById('selection')!.textContent = `${
      labels[Math.ceil(e.detail)] ?? 'Unknown'
    }`;
  };

  return html`
    <div>
      <igc-rating
        label=${ifDefined(label)}
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover-preview=${hoverPreview}
        ?readonly=${readonly}
        ?single=${single}
        .step=${Number(step)}
        .value=${value}
        .max=${max}
        .valueFormat=${valueFormat}
      ></igc-rating>
    </div>
    <div
      style="display: inline-flex; align-items: flex-end; gap: 8px; margin: 24px 0;"
    >
      <igc-rating
        label="Custom symbols with single selection enabled"
        @igcChange=${hoverHandler}
        @igcHover=${hoverHandler}
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover-preview=${hoverPreview}
        ?readonly=${readonly}
        .step=${Number(step)}
        .valueFormat=${valueFormat}
        max="5"
        single
      >
        ${emoji.map(
          (each) =>
            html`<igc-rating-symbol>
              <div>${each}</div>
              <div slot="empty">${each}</div>
            </igc-rating-symbol>`
        )}
        <span slot="value-label" id="selection">Select a value</span>
      </igc-rating>
    </div>
    <div>
      <igc-rating
        label="With custom igc-icon(s)"
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover-preview=${hoverPreview}
        ?readonly=${readonly}
        ?single=${single}
        .step=${Number(step)}
        .value=${value}
        .max=${max}
        .valueFormat=${valueFormat}
      >
        ${Array.from(range(5)).map(
          () =>
            html`<igc-rating-symbol>
              <igc-icon collection="default" name="bandage"></igc-icon>
              <igc-icon
                collection="default"
                name="bacteria"
                slot="empty"
              ></igc-icon>
            </igc-rating-symbol>`
        )}
      </igc-rating>
    </div>
    <div>
      <igc-rating
        label="With custom SVG"
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover-preview=${hoverPreview}
        ?readonly=${readonly}
        ?single=${single}
        .step=${Number(step)}
        .value=${value}
        .max=${max}
        .valueFormat=${valueFormat}
      >
        ${Array.from(range(5)).map(
          () =>
            html`<igc-rating-symbol>
              <div>${heartSVG}</div>
              <div slot="empty">${heartSVG}</div>
            </igc-rating-symbol>`
        )}
      </igc-rating>
    </div>
  `;
};

export const Basic: Story = Template.bind({});

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <div>
            <igc-rating name="default-rating" label="Default"></igc-rating>
          </div>
          <div>
            <igc-rating
              name="single-select-rating"
              label="Single select"
              single
              value="1"
            >
              ${Array.from(range(5)).map(
                () =>
                  html`<igc-rating-symbol>
                    <div>${heartSVG}</div>
                    <div slot="empty">${heartSVG}</div>
                  </igc-rating-symbol>`
              )}
            </igc-rating>
          </div>
          <div>
            <igc-rating
              name="default-value"
              label="With default value"
              max="7"
              step="0.25"
              value="3.5"
            ></igc-rating>
          </div>
        </fieldset>
        <fieldset>
          <igc-rating
            name="readonly-rating"
            label="Readonly"
            value="4"
            readonly
          ></igc-rating>
        </fieldset>
        <fieldset disabled>
          <igc-rating
            name="disabled-rating"
            value="2"
            label="Disabled"
          ></igc-rating>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};

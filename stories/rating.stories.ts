import { html, svg } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { range } from 'lit-html/directives/range.js';

// region default
const metadata = {
  title: 'Rating',
  component: 'igc-rating',
  argTypes: {
    max: {
      type: 'number',
      description: 'The maximum value for the rating',
      control: 'number',
      defaultValue: '5',
    },
    step: {
      type: 'number',
      description: 'The minimum value change allowed.',
      control: 'number',
      defaultValue: '1',
    },
    symbol: {
      type: 'string',
      description: 'The symbol which the rating will display.',
      control: 'text',
      defaultValue: '⭐',
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label of the control.',
      control: 'text',
    },
    valueFormat: {
      type: 'string',
      description:
        "A format string which sets aria-valuetext. All instances of '{0}' will be replaced\nwith the current value of the control.\nImportant for screen-readers and useful for localization.",
      control: 'text',
    },
    value: {
      type: 'number',
      description: 'The current value of the component',
      control: 'number',
      defaultValue: '0',
    },
    disabled: {
      type: 'boolean',
      description: 'Sets the disabled state of the component',
      control: 'boolean',
      defaultValue: false,
    },
    hoverPreview: {
      type: 'boolean',
      description: 'Sets hover preview behavior for the component',
      control: 'boolean',
      defaultValue: false,
    },
    readonly: {
      type: 'boolean',
      description: 'Sets the readonly state of the component',
      control: 'boolean',
      defaultValue: false,
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'large',
    },
  },
};
export default metadata;
interface ArgTypes {
  max: number;
  step: number;
  symbol: string;
  name: string;
  label: string;
  valueFormat: string;
  value: number;
  disabled: boolean;
  hoverPreview: boolean;
  readonly: boolean;
  size: 'small' | 'medium' | 'large';
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange', 'igcHover'],
  },
};

const Template: Story<ArgTypes, Context> = (
  {
    size,
    hoverPreview,
    symbol,
    step,
    max,
    disabled,
    readonly,
    label = 'Default',
    value,
    valueFormat,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const heartSVG = svg`<?xml version="1.0" ?><svg
  width="24px"
  height="24px"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
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
        .step=${Number(step)}
        .symbol=${symbol}
        .value=${value}
        .max=${max}
        .valueFormat=${valueFormat}
      >
      </igc-rating>
    </div>
    <div
      style="display: inline-flex; align-items: flex-end; gap: 8px; margin: 24px 0;"
    >
      <igc-rating
        label="Custom symbols with a really really long label"
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
      >
        ${emoji.map(
          (each) => html`<igc-rating-symbol>${each}</igc-rating-symbol>`
        )}
      </igc-rating>
      <span style="min-height: 24px" id="selection">Select a value</span>
    </div>
    <div>
      <igc-rating
        label="With igc-icon"
        dir=${ifDefined(direction)}
        size=${ifDefined(size)}
        ?disabled=${disabled}
        ?hover-preview=${hoverPreview}
        ?readonly=${readonly}
        .step=${Number(step)}
        .value=${value}
        .max=${max}
        .valueFormat=${valueFormat}
      >
        ${Array.from(range(5)).map(
          () => html`<igc-rating-symbol>
            <igc-icon name="diamond-circled"></igc-icon>
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
        .step=${Number(step)}
        .value=${value}
        .max=${max}
        .valueFormat=${valueFormat}
      >
        ${Array.from(range(5)).map(
          () => html`<igc-rating-symbol>${heartSVG}</igc-rating-symbol>`
        )}
      </igc-rating>
    </div>
  `;
};

export const Basic = Template.bind({});

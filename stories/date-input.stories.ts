import { html } from 'lit';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
//import IgcDateInputComponent from './../src/components/date-input/date-input';
//import { DateParts } from '../src/components/date-input/date-util.js';

// region default
const metadata = {
  title: 'Date Input',
  component: 'igc-date-input',
  argTypes: {},
};
export default metadata;

// endregion

// const handleIncrement = () => {
//   const input = document.querySelector(
//     'igc-date-input'
//   ) as IgcDateInputComponent;
//   // input?.stepUp(DateParts.Date);
// };

// const handleDecrement = () => {
//   const input = document.querySelector(
//     'igc-date-input'
//   ) as IgcDateInputComponent;
//   // input?.clear();
// };

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange', 'igcInput'],
  },
};

const Template: Story<ArgTypes, Context> = (
  { inputFormat, prompt, placeholder, displayFormat, locale, spinLoop, value }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`<igc-date-input
    dir=${direction}
    .value=${value ? new Date(value as Date) : undefined}
    inputFormat=${ifDefined(inputFormat)}
    prompt=${ifDefined(prompt)}
    placeholder=${ifDefined(placeholder)}
    displayFormat=${ifDefined(displayFormat)}
    locale=${ifDefined(locale)}
    ?spin-loop=${ifDefined(spinLoop)}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>

    <span slot="helper-text">This is some helper text</span>
  </igc-date-input> `;
};

export const Basic = Template.bind({});

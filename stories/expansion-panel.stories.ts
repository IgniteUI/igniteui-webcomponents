import { html } from 'lit';
import { Story } from './story';

// region default
const metadata = {
  title: 'Expansion Panel',
  component: 'igc-expansion-panel',
  argTypes: {
    tagName: {
      type: 'string',
      control: 'text',
      defaultValue: 'igc-expansion-panel',
    },
    open: {
      type: 'boolean',
      description:
        'Indicates whether the contents of the control should be visible.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description:
        'Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions.',
      control: 'boolean',
      defaultValue: false,
    },
    indicatorAlignment: {
      type: '"start" | "end"',
      description: 'The indicator alignment of the expansion panel.',
      options: ['start', 'end'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'start',
    },
  },
};
export default metadata;
interface ArgTypes {
  tagName: string;
  open: boolean;
  disabled: boolean;
  indicatorAlignment: 'start' | 'end';
}
// endregion
interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const handleOpening = (ev: any) => {
  console.log(ev);
};

const handleOpened = (ev: any) => {
  console.log(ev);
};

const handleClosing = (ev: any) => {
  console.log(ev);
};
const handleClosed = (ev: any) => {
  console.log(ev);
};

const Template: Story<ArgTypes, Context> = (
  { open = false, disabled = false, indicatorAlignment = 'start' }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-expansion-panel
      indicator-alignment="${indicatorAlignment}"
      .open="${open}"
      .disabled="${disabled}"
      @igcOpening=${handleOpening}
      @igcOpened=${handleOpened}
      @igcClosing=${handleClosing}
      @igcClosed=${handleClosed}
    >
      <span slot="title">
        <span style="margin: 0; padding: 0;"
          >Sample header text</span
        > <input></input>
      </span>
      <div slot="subTitle">Sample subtitle <input></input> <a href="https://google.com" target="_blank">Link</a></div>

      <!--
      <igc-icon
          slot="indicator"
          name='select'>
      </igc-icon> 
      -->
    
      <p slot="content">content <input/></p>
      <p slot="content">content 2 <button>Button in content</button></p>
    </igc-expansion-panel>

    <igc-expansion-panel indicator-alignment="${indicatorAlignment}"
    .open="${open}"
    .disabled="${disabled}">
    <div slot="title">Title</div>
    <div slot="subTitle">SubTitle</div>
    <div slot="content"><p>Content Text</p></div>
    </igc-expansion-panel>
    <p style="visibility: collapse">"${direction}"</p>
  `;
};

export const Basic = Template.bind({});

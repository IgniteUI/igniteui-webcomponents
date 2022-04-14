import { html } from 'lit';
import { Story } from './story';

// region default
const metadata = {
  title: 'Expansion Panel',
  component: 'igc-expansion-panel',
  argTypes: {
    open: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
  },
};
export default metadata;
interface ArgTypes {
  open: boolean;
  disabled: boolean;
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
  { open = false, disabled = false }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-expansion-panel
      .open="${open}"
      .disabled="${disabled}"
      @igcContentOpening=${handleOpening}
      @igcContentOpened=${handleOpened}
      @igcContentClosing=${handleClosing}
      @igcContentClosed=${handleClosed}
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
      <div slot="indicator">
        <button
        >Button
        </button> 
      </div> 

      <p slot="content">content <input/></p>
      <p slot="content">content 2 <button>Button in content</button></p>
    </igc-expansion-panel>
    <p style="visibility: collapse">"${direction}"</p>
  `;
};

export const Basic = Template.bind({});

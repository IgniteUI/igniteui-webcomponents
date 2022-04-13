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
  //console.log(ev);
};

const handleOpened = (ev: any) => {
  //console.log(ev);
};

const handleClosing = (ev: any) => {
  //console.log(ev);
};
const handleClosed = (ev: any) => {
  //console.log(ev);
};

const clickHandle = (ev: any) => {
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
      <div slot="title">
        <span onkeydown=${clickHandle} style="margin: 0; padding: 0;"
          >Sample header text</span
        >
      </div>
      <div slot="subTitle">Sample subtitle</div>

      <!--
      <igc-icon
          slot="icon"
          name='select'>
      </igc-icon> 
      -->

      <p slot="content">content</p>
      <p slot="content">content 2</p>
    </igc-expansion-panel>
    <p style="visibility: collapse">"${direction}"</p>
  `;
};

export const Basic = Template.bind({});

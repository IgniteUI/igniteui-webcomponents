import { html } from 'lit';
import { Story } from './story';

// region default
const metadata = {
  title: 'Accordion',
  component: 'igc-accordion',
  argTypes: {
    singleExpand: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
  },
};
export default metadata;
interface ArgTypes {
  singleExpand: boolean;
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
  { singleExpand = false }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-accordion
      .singleExpand="${singleExpand}"
      .dir="${direction}"
      @igcOpening=${handleOpening}
      @igcOpened=${handleOpened}
      @igcClosing=${handleClosing}
      @igcClosed=${handleClosed}
    >
      <igc-expansion-panel>
        <div slot="title">Expansion panel 1 title</div>
        <div slot="subtitle">Expansion panel 1 subtitle</div>
        <p>Sample content 1</p>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <div slot="title">Expansion panel 2 title</div>
        <div slot="subtitle">Expansion panel 2 subtitle</div>
        <p>Sample content 2</p>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <div slot="title">Expansion panel 3 title</div>
        <div slot="subtitle">Expansion panel 3 subtitle</div>
        <p>Sample content 3</p>
        <input />
      </igc-expansion-panel>
      <igc-expansion-panel>
        <div slot="title">Expansion panel 4 title (nested accordion)</div>
        <div slot="subtitle">Expansion panel 4 subtitle</div>
        <igc-accordion .dir="${direction}">
          <igc-expansion-panel>
            <h1 slot="title">Expansion panel 4.1 title</h1>
            <h2 slot="subtitle">Expansion panel 4.1 subtitle</h2>
            <p>Sample content 4.1</p>
          </igc-expansion-panel>
          <igc-expansion-panel>
            <h1 slot="title">Expansion panel 4.2 title</h1>
            <h2 slot="subtitle">Expansion panel 4.2 subtitle</h2>
            <p>Sample content 4.2</p>
            <input />
          </igc-expansion-panel>
        </igc-accordion>
      </igc-expansion-panel>
    </igc-accordion>
  `;
};

export const Basic = Template.bind({});

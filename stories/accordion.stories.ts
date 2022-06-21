import { html } from 'lit';
import { Story } from './story';

// region default
const metadata = {
  title: 'Accordion',
  component: 'igc-accordion',
  argTypes: {
    singleBranchExpand: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
  },
};
export default metadata;
interface ArgTypes {
  singleBranchExpand: boolean;
}
// endregion
interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<ArgTypes, Context> = (
  { singleBranchExpand = false }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-accordion
      .singleBranchExpand="${singleBranchExpand}"
      .dir="${direction}"
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
      </igc-expansion-panel>
    </igc-accordion>
  `;
};

export const Basic = Template.bind({});

import { html } from 'lit';
import type { Story } from './story';
import { defineComponents, IgcAccordionComponent } from '../src/index.js';

defineComponents(IgcAccordionComponent);

// region default
const metadata = {
  title: 'Accordion',
  component: 'igc-accordion',
  argTypes: {
    singleExpand: {
      type: 'boolean',
      description: 'Allows only one panel to be expanded at a time.',
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

(metadata as any).parameters = {
  actions: {
    handles: ['igcOpening', 'igcOpened', 'igcClosing', 'igcClosed'],
  },
};

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<ArgTypes, Context> = (
  { singleExpand = false }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-accordion .singleExpand="${singleExpand}" .dir="${direction}">
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

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { range } from 'lit/directives/range.js';

import {
  IgcAccordionComponent,
  IgcInputComponent,
  defineComponents,
} from 'igniteui-webcomponents';

defineComponents(IgcAccordionComponent, IgcInputComponent);

// region default
const metadata: Meta<IgcAccordionComponent> = {
  title: 'Accordion',
  component: 'igc-accordion',
  parameters: {
    docs: {
      description: {
        component:
          'The Accordion is a container-based component that can house multiple expansion panels\nand offers keyboard navigation.',
      },
    },
  },
  argTypes: {
    singleExpand: {
      type: 'boolean',
      description: 'Allows only one panel to be expanded at a time.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { singleExpand: false },
};

export default metadata;

interface IgcAccordionArgs {
  /** Allows only one panel to be expanded at a time. */
  singleExpand: boolean;
}
type Story = StoryObj<IgcAccordionArgs>;

// endregion

Object.assign(metadata.parameters!, {
  actions: {
    handles: ['igcOpening', 'igcOpened', 'igcClosing', 'igcClosed'],
  },
});

export const Default: Story = {
  render: (args) => html`
    <igc-accordion ?single-expand=${args.singleExpand}>
      ${Array.from(range(1, 4)).map(
        (i) =>
          html` <igc-expansion-panel>
            <h1 slot="title">Title ${i}</h1>
            <h2 slot="subtitle">Subtitle ${i}</h2>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi
              adipisci, ratione ut praesentium qui, similique molestiae
              voluptate at excepturi, a animi quam blanditiis. Tenetur tempore
              explicabo blanditiis harum ut delectus!
            </p>
          </igc-expansion-panel>`
      )}
      <igc-expansion-panel>
        <h1 slot="title">Title 4</h1>
        <h2 slot="subtitle">Subtitle 4</h2>
        <igc-accordion>
          <igc-expansion-panel>
            <h1 slot="title">Title 4.1 title</h1>
            <h2 slot="subtitle">Subtitle 4.1 subtitle</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum quia
              placeat natus illo voluptatum, praesentium similique excepturi
              corporis sequi at earum labore provident asperiores dolorem fugit
              explicabo ipsa distinctio doloremque?
            </p>
          </igc-expansion-panel>
          <igc-expansion-panel>
            <h1 slot="title">Title 4.2</h1>
            <h2 slot="subtitle">Subtitle 4.2</h2>
            <igc-input placeholder="Your feedback"></igc-input>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Similique modi, cumque consequuntur omnis quis odio id facere
              placeat amet velit quos natus ipsam quasi, consequatur qui impedit
              ullam officiis earum.
            </p>
          </igc-expansion-panel>
        </igc-accordion>
      </igc-expansion-panel>
    </igc-accordion>
  `,
};

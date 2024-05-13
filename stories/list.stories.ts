import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcListComponent,
  defineComponents,
} from '../src/index.js';

defineComponents(IgcListComponent, IgcAvatarComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcListComponent> = {
  title: 'List',
  component: 'igc-list',
  parameters: {
    docs: {
      description: {
        component:
          'Displays a collection of data items in a templatable list format.',
      },
    },
  },
};

export default metadata;

type Story = StoryObj;

// endregion

const employeeData = [
  {
    name: 'John Smith',
    position: 'Software Developer',
    avatar:
      'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg',
  },
  {
    name: 'Abraham Lee',
    position: 'Team Lead',
    avatar:
      'https://www.infragistics.com/angular-demos/assets/images/men/2.jpg',
  },
  {
    name: 'Jonathan Deberkow',
    position: 'UX Designer',
    avatar:
      'https://www.infragistics.com/angular-demos/assets/images/men/3.jpg',
  },
];

const BasicTemplate = () => {
  const employees = new Array(48);

  return html`
    <igc-list>
      <igc-list-header>
        <h1>Job Positions</h1>
      </igc-list-header>
      ${employees
        .fill(employeeData[0], 0, 15)
        .fill(employeeData[1], 16, 31)
        .fill(employeeData[2], 31)
        .map((employee) => {
          return html`
            <igc-list-item>
              <igc-avatar slot="start" src=${employee.avatar} shape="circle"
                >AA</igc-avatar
              >
              <h2 slot="title">${employee.name}</h2>
              <span slot="subtitle">${employee.position}</span>
              <igc-button slot="end">Text</igc-button>
              <igc-button slot="end">Call</igc-button>
            </igc-list-item>
          `;
        })}
    </igc-list>
  `;
};

export const Basic: Story = BasicTemplate.bind({});

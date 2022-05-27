import { html } from 'lit';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'List',
  component: 'igc-list',
  argTypes: {
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
  size: 'small' | 'medium' | 'large';
}
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

const BasicTemplate: Story<ArgTypes, Context> = (
  { size }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const employees = new Array(48);

  return html`
    <igc-list .size="${size}" dir=${direction}>
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

export const Basic = BasicTemplate.bind({});

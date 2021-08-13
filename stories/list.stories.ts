import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story, Context } from './story.js';

export default {
  title: 'List',
  component: 'igc-list',
  argTypes: {
    size: {
      control: {
        type: 'inline-radio',
        options: ['small', 'medium', 'large'],
      },
      defaultValue: 'large',
    },
  },
};

interface ArgTypes {
  size: 'small' | 'medium' | 'large';
}

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
  return html`
    <igc-list .size="${size}" dir=${direction}>
      <igc-list-header>
        <h1>Job Positions</h1>
      </igc-list-header>
      ${employeeData.map((employee) => {
        return html`
          <igc-list-item>
            <igc-avatar slot="start" src=${employee.avatar} shape="circle"
              >AA</igc-avatar
            >
            <h2 slot="title">${employee.name}</h2>
            <span slot="subtitle">${employee.position}</span>
            <igc-button slot="end" .size="${size}" variant="outlined"
              >Text</igc-button
            >
            <igc-button slot="end" .size="${size}" variant="outlined"
              >Call</igc-button
            >
          </igc-list-item>
        `;
      })}
    </igc-list>
  `;
};

export const Basic = BasicTemplate.bind({});

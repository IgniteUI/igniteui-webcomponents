import { html } from 'lit-html';
import '../igniteui-webcomponents.js';

import 'hammerjs';
import { Story } from './story.js';

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

const data = [
  { name: 'Elizabeth Lincoln', position: 'Accounting Manager' },
  { name: 'Frédérique Citeaux', position: 'Marketing Manager' },
  { name: 'Hanna Moos', position: 'Sales Representative' },
  { name: 'Christina Berglund', position: 'Order Administrator' },
];

const itemClicked = (event: any) => {
  console.log('Item is clicked -', event.target);
};

const itemFocus = (event: any) => {
  event.target.style.border = '1px solid black';
  event.target.style.display = 'block';
  event.target.style.width = '100%';
};

const itemBlur = (event: any) => {
  event.target.style.border = 'none';
  event.target.style.display = 'block';
  event.target.style.width = '100%';
};

const itemPan = (event: any) => {
  const hammetime = new Hammer(event.target);
  hammetime.on('panmove', (e) => {
    e.target.style.transform = `translateX(${e.deltaX}px)`;
  });

  hammetime.on('panend', (e) => {
    e.target.style.transform = 'translateX(0)';
  });
};

const BasicTemplate: Story<ArgTypes, {}> = ({ size }: ArgTypes) => {
  return html`
    <igc-list .size="${size}">
      <igc-list-item>
        <span slot="start">Icon</span>
        <h2 slot="title">Title</h2>
        <span slot="subtitle">Sub title</span>
        <span slot="end">Action btns</span>
      </igc-list-item>
      <igc-list-item>
        <span slot="start">Icon</span>
        <h2 slot="title">Title</h2>
        <span slot="subtitle">Sub title</span>
        <span slot="end">Action btns</span>
      </igc-list-item>
      <igc-list-item>
        <span slot="start">Icon</span>
        <h2 slot="title">Title</h2>
        <span slot="subtitle">Sub title</span>
        <span slot="end">Action btns</span>
      </igc-list-item>
    </igc-list>
  `;
};

const ListHeaderTemplate: Story<ArgTypes, {}> = ({ size }: ArgTypes) => {
  return html`
    <igc-list .size="${size}">
      <igc-list-header>
        <h1>List Header</h1>
      </igc-list-header>
      <igc-list-item>
        <span slot="start">Icon</span>
        <h2 slot="title">Title</h2>
        <span slot="subtitle">Sub title</span>
        <span slot="end">Action btns</span>
      </igc-list-item>
      <igc-list-item>
        <span slot="start">Icon</span>
        <h2 slot="title">Title</h2>
        <span slot="subtitle">Sub title</span>
        <span slot="end">Action btns</span>
      </igc-list-item>
      <igc-list-header>
        <h1>List Header</h1>
      </igc-list-header>
      <igc-list-item>
        <span slot="start">Icon</span>
        <h2 slot="title">Title</h2>
        <span slot="subtitle">Sub title</span>
        <span slot="end">Action btns</span>
      </igc-list-item>
    </igc-list>
  `;
};

const EventTemplate: Story<ArgTypes, {}> = ({ size }: ArgTypes) => {
  return html`
    <igc-list .size="${size}" @click="${itemClicked}">
      <igc-list-header role="separator">
        <h1>Job Positions</h1>
      </igc-list-header>
      ${data.map((d, index) => {
        return html`
          <igc-list-item
            tabindex="${index}"
            @focus="${itemFocus}"
            @blur="${itemBlur}"
          >
            <span slot="start">Icon</span>
            <h2>${d.name}</h2>
            <span slot="subtitle">${d.position}</span>
            <span slot="end">Action btns</span>
          </igc-list-item>
        `;
      })}
    </igc-list>
  `;
};

const GestureTemplate: Story<ArgTypes, {}> = ({ size }: ArgTypes) => {
  return html`
    <igc-list .size="${size}" role="list" @click="${itemPan}">
      <igc-list-header>
        <h1>Job Positions</h1>
      </igc-list-header>
      ${data.map((d) => {
        return html`
          <igc-list-item
            role="listitem"
            @focus="${itemFocus}"
            @blur="${itemBlur}"
          >
            <span slot="start">Icon</span>
            <h2 slot="title">${d.name}</h2>
            <span slot="subtitle">${d.position}</span>
            <span slot="end">Action btns</span>
          </igc-list-item>
        `;
      })}
    </igc-list>

    <style>
      igc-list-item {
        width: 100%;
        height: 150px;
        display: flex;
        background-color: lightgrey;
        margin-bottom: 10px;
      }
    </style>
  `;
};

export const Basic = BasicTemplate.bind({});
export const Header = ListHeaderTemplate.bind({});
export const Events = EventTemplate.bind({});
export const Gestures = GestureTemplate.bind({});

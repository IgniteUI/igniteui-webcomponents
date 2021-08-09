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

interface Context {
  globals: { theme: string; direction: string };
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

const BasicTemplate: Story<ArgTypes, Context> = (
  { size }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-list .size="${size}" dir="${direction}">
      <igc-list-item>
        <igc-avatar
          slot="start"
          src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
          shape="circle"
          >AA</igc-avatar
        >
        <h2 slot="title">John Smith</h2>
        <span slot="subtitle">Software Developer</span>
        <igc-button slot="end" .size="${size}" variant="outlined"
          >Text</igc-button
        >
        <igc-button slot="end" .size="${size}" variant="outlined"
          >Call</igc-button
        >
      </igc-list-item>
      <igc-list-item>
        <igc-avatar
          slot="start"
          src="https://www.infragistics.com/angular-demos/assets/images/men/2.jpg"
          shape="circle"
          >AB</igc-avatar
        >
        <h2 slot="title">Abraham Lee</h2>
        <span slot="subtitle">Team Lead</span>
        <igc-button slot="end" .size="${size}" variant="outlined"
          >Text</igc-button
        >
        <igc-button slot="end" .size="${size}" variant="outlined"
          >Call</igc-button
        >
      </igc-list-item>
      <igc-list-item>
        <igc-avatar
          slot="start"
          src="https://www.infragistics.com/angular-demos/assets/images/men/3.jpg"
          shape="circle"
          >AB</igc-avatar
        >
        <h2 slot="title">Jonathan Deberkow</h2>
        <span slot="subtitle">UX Designer</span>
        <igc-button slot="end" .size="${size}" variant="outlined"
          >Text</igc-button
        >
        <igc-button slot="end" .size="${size}" variant="outlined"
          >Call</igc-button
        >
      </igc-list-item>
    </igc-list>
  `;
};

const ListHeaderTemplate: Story<ArgTypes, Context> = (
  { size }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-list .size="${size}" dir=${direction}>
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

const EventTemplate: Story<ArgTypes, Context> = (
  { size }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-list .size="${size}" @click="${itemClicked}" direction="${direction}">
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

const GestureTemplate: Story<ArgTypes, Context> = (
  { size }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-list
      .size="${size}"
      role="list"
      @click="${itemPan}"
      dir="${direction}"
    >
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

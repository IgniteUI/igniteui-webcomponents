import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcListComponent,
  defineComponents,
} from 'igniteui-webcomponents';

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

interface Employee {
  name: string;
  position: string;
  department: string;
  avatar: string;
}

const employees: Employee[] = [
  {
    name: 'John Smith',
    position: 'Software Developer',
    department: 'Engineering',
    avatar:
      'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg',
  },
  {
    name: 'Abraham Lee',
    position: 'Team Lead',
    department: 'Engineering',
    avatar:
      'https://www.infragistics.com/angular-demos/assets/images/men/2.jpg',
  },
  {
    name: 'Jonathan Deberkow',
    position: 'UX Designer',
    department: 'Design',
    avatar:
      'https://www.infragistics.com/angular-demos/assets/images/men/3.jpg',
  },
  {
    name: 'Lisa Wagner',
    position: 'Product Manager',
    department: 'Management',
    avatar:
      'https://www.infragistics.com/angular-demos/assets/images/women/1.jpg',
  },
  {
    name: 'Kate Manson',
    position: 'UI Designer',
    department: 'Design',
    avatar:
      'https://www.infragistics.com/angular-demos/assets/images/women/2.jpg',
  },
  {
    name: 'Alice Moore',
    position: 'Engineering Manager',
    department: 'Management',
    avatar:
      'https://www.infragistics.com/angular-demos/assets/images/women/3.jpg',
  },
];

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A basic list showcasing items with the **start**, **title**, **subtitle**, and **end** slots populated.',
      },
    },
  },
  render: () => html`
    <igc-list>
      <igc-list-header>
        <h1>Contacts</h1>
      </igc-list-header>
      ${employees.map(
        (employee) => html`
          <igc-list-item>
            <igc-avatar
              slot="start"
              src=${employee.avatar}
              shape="circle"
            ></igc-avatar>
            <h2 slot="title">${employee.name}</h2>
            <span slot="subtitle">${employee.position}</span>
            <igc-button slot="end" variant="flat">Message</igc-button>
            <igc-button slot="end" variant="flat">Call</igc-button>
          </igc-list-item>
        `
      )}
    </igc-list>
  `,
};

export const Grouped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use `igc-list-header` elements to visually group related list items under labeled sections.',
      },
    },
  },
  render: () => {
    const departments = ['Engineering', 'Design', 'Management'];

    return html`
      <igc-list>
        ${departments.map(
          (dept) => html`
            <igc-list-header>
              <h2>${dept}</h2>
            </igc-list-header>
            ${employees
              .filter((e) => e.department === dept)
              .map(
                (employee) => html`
                  <igc-list-item>
                    <igc-avatar
                      slot="start"
                      src=${employee.avatar}
                      shape="circle"
                    ></igc-avatar>
                    <h3 slot="title">${employee.name}</h3>
                    <span slot="subtitle">${employee.position}</span>
                  </igc-list-item>
                `
              )}
          `
        )}
      </igc-list>
    `;
  },
};

export const Selected: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'List items support a `selected` boolean attribute to visually highlight them within the list. Click an item to toggle its selection state.',
      },
    },
  },
  render: () => {
    const selected = new Set<number>();

    const toggle = (e: MouseEvent, index: number) => {
      const item = (e.currentTarget as HTMLElement).closest('igc-list-item');
      if (!item) return;

      if (selected.has(index)) {
        selected.delete(index);
        item.removeAttribute('selected');
      } else {
        selected.add(index);
        item.setAttribute('selected', '');
      }
    };

    return html`
      <igc-list>
        <igc-list-header>
          <h1>Team Members</h1>
        </igc-list-header>
        ${employees.map(
          (employee, i) => html`
            <igc-list-item @click=${(e: MouseEvent) => toggle(e, i)}>
              <igc-avatar
                slot="start"
                src=${employee.avatar}
                shape="circle"
              ></igc-avatar>
              <h2 slot="title">${employee.name}</h2>
              <span slot="subtitle">${employee.position}</span>
            </igc-list-item>
          `
        )}
      </igc-list>
    `;
  },
};

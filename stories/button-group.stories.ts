import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonGroupComponent,
  IgcIconComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcButtonGroupComponent, IgcIconComponent);

registerIconFromText(
  'bold',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>`
);
registerIconFromText(
  'italic',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>`
);
registerIconFromText(
  'underline',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>`
);
registerIconFromText(
  'align-left',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>`
);
registerIconFromText(
  'align-center',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>`
);
registerIconFromText(
  'align-right',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>`
);
registerIconFromText(
  'align-justify',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/></svg>`
);
registerIconFromText(
  'view-list',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/></svg>`
);
registerIconFromText(
  'view-module',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/></svg>`
);
registerIconFromText(
  'view-quilt',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 18h5v-6h-5v6zm-6 0h5V5H4v13zm12 0h5v-6h-5v6zM10 5v6h11V5H10z"/></svg>`
);

// region default
const metadata: Meta<IgcButtonGroupComponent> = {
  title: 'ButtonGroup',
  component: 'igc-button-group',
  parameters: {
    docs: {
      description: {
        component:
          'The `igc-button-group` groups a series of `igc-toggle-button`s together, exposing features such as layout and selection.',
      },
    },
    actions: { handles: ['igcSelect', 'igcDeselect'] },
  },
  argTypes: {
    disabled: {
      type: 'boolean',
      description: 'Disables all buttons inside the group.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    alignment: {
      type: '"horizontal" | "vertical"',
      description: 'Sets the orientation of the buttons in the group.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    selection: {
      type: '"single" | "single-required" | "multiple"',
      description: 'Controls the mode of selection for the button group.',
      options: ['single', 'single-required', 'multiple'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'single' } },
    },
  },
  args: { disabled: false, alignment: 'horizontal', selection: 'single' },
};

export default metadata;

interface IgcButtonGroupArgs {
  /** Disables all buttons inside the group. */
  disabled: boolean;
  /** Sets the orientation of the buttons in the group. */
  alignment: 'horizontal' | 'vertical';
  /** Controls the mode of selection for the button group. */
  selection: 'single' | 'single-required' | 'multiple';
}
type Story = StoryObj<IgcButtonGroupArgs>;

// endregion

export const Basic: Story = {
  render: ({ selection, disabled, alignment }) => html`
    <igc-button-group
      .selection=${selection}
      .disabled=${disabled}
      .alignment=${alignment}
    >
      <igc-toggle-button value="left">Left</igc-toggle-button>
      <igc-toggle-button value="center">Center</igc-toggle-button>
      <igc-toggle-button value="right">Right</igc-toggle-button>
      <igc-toggle-button value="justify">Justify</igc-toggle-button>
    </igc-button-group>
  `,
};

export const SelectionModes: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Three selection modes are available: <code>single</code> allows at most
      one selected item (deselectable), <code>single-required</code> always
      keeps one selected, and <code>multiple</code> allows any combination.
    </p>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div>
        <p style="margin: 0 0 0.5rem; font-weight: 600;">
          single — one or none selected
        </p>
        <igc-button-group selection="single">
          <igc-toggle-button value="day">Day</igc-toggle-button>
          <igc-toggle-button value="week" selected>Week</igc-toggle-button>
          <igc-toggle-button value="month">Month</igc-toggle-button>
          <igc-toggle-button value="year">Year</igc-toggle-button>
        </igc-button-group>
      </div>
      <div>
        <p style="margin: 0 0 0.5rem; font-weight: 600;">
          single-required — exactly one always selected
        </p>
        <igc-button-group selection="single-required">
          <igc-toggle-button value="xs">XS</igc-toggle-button>
          <igc-toggle-button value="sm">SM</igc-toggle-button>
          <igc-toggle-button value="md" selected>MD</igc-toggle-button>
          <igc-toggle-button value="lg">LG</igc-toggle-button>
          <igc-toggle-button value="xl">XL</igc-toggle-button>
        </igc-button-group>
      </div>
      <div>
        <p style="margin: 0 0 0.5rem; font-weight: 600;">
          multiple — any number selected
        </p>
        <igc-button-group selection="multiple">
          <igc-toggle-button value="bold" aria-label="Bold">
            <igc-icon name="bold" collection="default"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="italic" aria-label="Italic" selected>
            <igc-icon name="italic" collection="default"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="underline" aria-label="Underline" selected>
            <igc-icon name="underline" collection="default"></igc-icon>
          </igc-toggle-button>
        </igc-button-group>
      </div>
    </div>
  `,
};

export const Alignment: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      The <code>alignment</code> attribute controls whether the buttons are
      arranged horizontally (default) or vertically.
    </p>
    <div style="display: flex; gap: 3rem; align-items: flex-start;">
      <div>
        <p style="margin: 0 0 0.5rem; font-weight: 600;">Horizontal</p>
        <igc-button-group alignment="horizontal" selection="single-required">
          <igc-toggle-button value="list" aria-label="List view">
            <igc-icon name="view-list" collection="default"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="module" aria-label="Module view" selected>
            <igc-icon name="view-module" collection="default"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="quilt" aria-label="Quilt view">
            <igc-icon name="view-quilt" collection="default"></igc-icon>
          </igc-toggle-button>
        </igc-button-group>
      </div>
      <div>
        <p style="margin: 0 0 0.5rem; font-weight: 600;">Vertical</p>
        <igc-button-group alignment="vertical" selection="single-required">
          <igc-toggle-button value="left" aria-label="Align left">
            <igc-icon name="align-left" collection="default"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="center" aria-label="Align center" selected>
            <igc-icon name="align-center" collection="default"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="right" aria-label="Align right">
            <igc-icon name="align-right" collection="default"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="justify" aria-label="Justify">
            <igc-icon name="align-justify" collection="default"></igc-icon>
          </igc-toggle-button>
        </igc-button-group>
      </div>
    </div>
  `,
};

export const WithIcons: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Icon-only toggle buttons work well for compact toolbars. Provide an
      <code>aria-label</code> on each button for accessibility.
    </p>
    <div
      style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;"
    >
      <igc-button-group selection="multiple">
        <igc-toggle-button value="bold" aria-label="Bold">
          <igc-icon name="bold" collection="default"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="italic" aria-label="Italic">
          <igc-icon name="italic" collection="default"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="underline" aria-label="Underline">
          <igc-icon name="underline" collection="default"></igc-icon>
        </igc-toggle-button>
      </igc-button-group>

      <igc-button-group selection="single-required">
        <igc-toggle-button value="left" aria-label="Align left" selected>
          <igc-icon name="align-left" collection="default"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="center" aria-label="Align center">
          <igc-icon name="align-center" collection="default"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="right" aria-label="Align right">
          <igc-icon name="align-right" collection="default"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="justify" aria-label="Justify">
          <igc-icon name="align-justify" collection="default"></igc-icon>
        </igc-toggle-button>
      </igc-button-group>
    </div>
  `,
};

export const Disabled: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Setting <code>disabled</code> on the group disables all buttons.
      Individual buttons can also be disabled independently.
    </p>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div>
        <p style="margin: 0 0 0.5rem; font-weight: 600;">
          Entire group disabled
        </p>
        <igc-button-group selection="single" disabled>
          <igc-toggle-button value="day" selected>Day</igc-toggle-button>
          <igc-toggle-button value="week">Week</igc-toggle-button>
          <igc-toggle-button value="month">Month</igc-toggle-button>
        </igc-button-group>
      </div>
      <div>
        <p style="margin: 0 0 0.5rem; font-weight: 600;">
          Individual buttons disabled
        </p>
        <igc-button-group selection="single">
          <igc-toggle-button value="xs">XS</igc-toggle-button>
          <igc-toggle-button value="sm" selected>SM</igc-toggle-button>
          <igc-toggle-button value="md" disabled>MD</igc-toggle-button>
          <igc-toggle-button value="lg" disabled>LG</igc-toggle-button>
          <igc-toggle-button value="xl">XL</igc-toggle-button>
        </igc-button-group>
      </div>
    </div>
  `,
};

export const ProgrammaticSelection: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const setItems = (values: string[]) => {
      const group = document.querySelector<any>('#prog-group');
      if (group) group.selectedItems = values;
    };

    const onSelect = (e: CustomEvent<string>) => {
      const log = document.querySelector<HTMLElement>('#sel-log');
      if (log) log.textContent = `igcSelect — value: "${e.detail}"`;
    };

    const onDeselect = (e: CustomEvent<string>) => {
      const log = document.querySelector<HTMLElement>('#sel-log');
      if (log) log.textContent = `igcDeselect — value: "${e.detail}"`;
    };

    return html`
      <p>
        Use the <code>selectedItems</code> property to get or set the selection
        programmatically. The <code>igcSelect</code> and
        <code>igcDeselect</code> events fire on user interaction only.
      </p>
      <igc-button-group
        id="prog-group"
        selection="multiple"
        @igcSelect=${onSelect}
        @igcDeselect=${onDeselect}
      >
        <igc-toggle-button value="bold" aria-label="Bold">
          <igc-icon name="bold" collection="default"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="italic" aria-label="Italic">
          <igc-icon name="italic" collection="default"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="underline" aria-label="Underline">
          <igc-icon name="underline" collection="default"></igc-icon>
        </igc-toggle-button>
      </igc-button-group>

      <div
        style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;"
      >
        <igc-button variant="flat" @click=${() => setItems(['bold'])}
          >Select Bold</igc-button
        >
        <igc-button
          variant="flat"
          @click=${() => setItems(['italic', 'underline'])}
        >
          Select Italic + Underline
        </igc-button>
        <igc-button
          variant="flat"
          @click=${() => setItems(['bold', 'italic', 'underline'])}
        >
          Select All
        </igc-button>
        <igc-button variant="flat" @click=${() => setItems([])}
          >Clear</igc-button
        >
      </div>

      <div style="margin-top: 1rem;">
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Event log:</p>
        <pre
          id="sel-log"
          style="margin: 0; padding: 0.75rem; background: var(--ig-gray-100, #f5f5f5); border-radius: 4px; font-size: 0.8rem;"
        >
Interact with the buttons to see events.</pre
        >
      </div>
    `;
  },
};

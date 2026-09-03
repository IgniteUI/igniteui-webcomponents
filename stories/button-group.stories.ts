import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcButtonGroupComponent,
  type IgcCheckboxChangeEventArgs,
  IgcIconComponent,
  IgcSwitchComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcButtonGroupComponent,
  IgcIconComponent,
  IgcSwitchComponent
);

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
          'Groups a series of toggle buttons together, exposing features such as layout and selection.',
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
      type: { name: 'enum', value: ['horizontal', 'vertical'] },
      description: 'The orientation of the buttons in the group.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    selection: {
      type: { name: 'enum', value: ['single', 'single-required', 'multiple'] },
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
  /** The orientation of the buttons in the group. */
  alignment: 'horizontal' | 'vertical';
  /** Controls the mode of selection for the button group. */
  selection: 'single' | 'single-required' | 'multiple';
}
type Story = StoryObj<IgcButtonGroupArgs>;

// endregion

const scenarioStyles = html`
  <style>
    .scenario {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 46rem;
    }

    .scenario p {
      margin: 0;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 2rem;
    }

    .case {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .case > strong {
      font-size: 0.875rem;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--ig-gray-200, #e0e0e0);
      border-radius: 4px;
    }

    .log {
      margin: 0;
      min-height: 1.25rem;
      font-family: monospace;
      color: var(--ig-primary-500, #09f);
    }
  </style>
`;

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
  parameters: {
    docs: {
      description: {
        story:
          'The three selection modes differ in what a click on an already selected button does: `single` deselects it, `single-required` keeps it selected, and `multiple` toggles each button on its own. The mode also drives the announced semantics - the single modes expose a `radiogroup` of `radio` buttons, while `multiple` exposes a `group` of toggle buttons with `aria-pressed`. Mind that `single-required` does not select a button for you: it only refuses to give up a selection it already has.',
      },
    },
  },
  render: () => html`
    ${scenarioStyles}
    <div class="scenario">
      <div class="case">
        <strong>single - one or none selected</strong>
        <igc-button-group selection="single">
          <igc-toggle-button value="day">Day</igc-toggle-button>
          <igc-toggle-button value="week" selected>Week</igc-toggle-button>
          <igc-toggle-button value="month">Month</igc-toggle-button>
          <igc-toggle-button value="year">Year</igc-toggle-button>
        </igc-button-group>
      </div>

      <div class="case">
        <strong>single-required - the selection cannot be given up</strong>
        <igc-button-group selection="single-required">
          <igc-toggle-button value="xs">XS</igc-toggle-button>
          <igc-toggle-button value="sm">SM</igc-toggle-button>
          <igc-toggle-button value="md" selected>MD</igc-toggle-button>
          <igc-toggle-button value="lg">LG</igc-toggle-button>
          <igc-toggle-button value="xl">XL</igc-toggle-button>
        </igc-button-group>
      </div>

      <div class="case">
        <strong>multiple - every button toggles on its own</strong>
        <igc-button-group selection="multiple">
          <igc-toggle-button value="bold" aria-label="Bold">
            <igc-icon name="bold"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="italic" aria-label="Italic" selected>
            <igc-icon name="italic"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="underline" aria-label="Underline" selected>
            <igc-icon name="underline"></igc-icon>
          </igc-toggle-button>
        </igc-button-group>
      </div>
    </div>
  `,
};

export const Alignment: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `alignment` attribute lays the buttons out in a row (default) or in a column. The group keeps the rounded corners on the leading and trailing button of whichever axis it runs along.',
      },
    },
  },
  render: () => html`
    ${scenarioStyles}
    <div class="row">
      <div class="case">
        <strong>horizontal</strong>
        <igc-button-group alignment="horizontal" selection="single-required">
          <igc-toggle-button value="list" aria-label="List view">
            <igc-icon name="view-list"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="module" aria-label="Module view" selected>
            <igc-icon name="view-module"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="quilt" aria-label="Quilt view">
            <igc-icon name="view-quilt"></igc-icon>
          </igc-toggle-button>
        </igc-button-group>
      </div>

      <div class="case">
        <strong>vertical</strong>
        <igc-button-group alignment="vertical" selection="single-required">
          <igc-toggle-button value="left" aria-label="Align left">
            <igc-icon name="align-left"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="center" aria-label="Align center" selected>
            <igc-icon name="align-center"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="right" aria-label="Align right">
            <igc-icon name="align-right"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="justify" aria-label="Justify">
            <igc-icon name="align-justify"></igc-icon>
          </igc-toggle-button>
        </igc-button-group>
      </div>
    </div>
  `,
};

export const WithIcons: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Icon-only buttons keep a toolbar compact, but an icon carries no accessible name. Put an `aria-label` on the toggle button - it is forwarded to the native button that assistive technology actually reports.',
      },
    },
  },
  render: () => html`
    ${scenarioStyles}
    <div class="row">
      <igc-button-group selection="multiple">
        <igc-toggle-button value="bold" aria-label="Bold">
          <igc-icon name="bold"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="italic" aria-label="Italic">
          <igc-icon name="italic"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="underline" aria-label="Underline">
          <igc-icon name="underline"></igc-icon>
        </igc-toggle-button>
      </igc-button-group>

      <igc-button-group selection="single-required">
        <igc-toggle-button value="left" aria-label="Align left" selected>
          <igc-icon name="align-left"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="center" aria-label="Align center">
          <igc-icon name="align-center"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="right" aria-label="Align right">
          <igc-icon name="align-right"></igc-icon>
        </igc-toggle-button>
        <igc-toggle-button value="justify" aria-label="Justify">
          <igc-icon name="align-justify"></igc-icon>
        </igc-toggle-button>
      </igc-button-group>
    </div>
  `,
};

export const OptionalValues: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A `value` is optional. The group tracks its buttons by identity, so a group of buttons without values selects and deselects like any other - the value only decides what `selectedItems` reports and what the `selectedItems` setter can match. Buttons that carry no value are simply left out of the reported collection.',
      },
    },
  },
  render: () => {
    const log = createRef<HTMLElement>();

    function report(event: Event) {
      const group = event.currentTarget as IgcButtonGroupComponent;

      if (log.value) {
        log.value.textContent = `selectedItems: ${JSON.stringify(group.selectedItems)}`;
      }
    }

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <div class="case">
          <strong>No values at all - the selection still moves</strong>
          <igc-button-group selection="single">
            <igc-toggle-button>Day</igc-toggle-button>
            <igc-toggle-button>Week</igc-toggle-button>
            <igc-toggle-button>Month</igc-toggle-button>
          </igc-button-group>
        </div>

        <div class="case">
          <strong>Only the buttons with a value are reported</strong>
          <igc-button-group
            selection="multiple"
            @igcSelect=${report}
            @igcDeselect=${report}
          >
            <igc-toggle-button value="bold" aria-label="Bold">
              <igc-icon name="bold"></igc-icon>
            </igc-toggle-button>
            <igc-toggle-button value="italic" aria-label="Italic">
              <igc-icon name="italic"></igc-icon>
            </igc-toggle-button>
            <igc-toggle-button aria-label="Underline">
              <igc-icon name="underline"></igc-icon>
            </igc-toggle-button>
          </igc-button-group>
          <p class="log" ${ref(log)}>selectedItems: []</p>
        </div>
      </div>
    `;
  },
};

export const Disabled: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A disabled group turns its buttons off without touching their own `disabled` property. Switch the group back on and MD - which is disabled in its own right - stays disabled, while the rest become interactive again. Buttons added to a group that is already disabled inherit that state as well.',
      },
    },
  },
  render: () => {
    const group = createRef<IgcButtonGroupComponent>();

    function toggleGroup({ detail }: CustomEvent<IgcCheckboxChangeEventArgs>) {
      if (group.value) {
        group.value.disabled = detail.checked;
      }
    }

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <div class="settings-row">
          <div>
            <div><strong>Disable the whole group</strong></div>
            <small>MD is disabled on its own and stays that way.</small>
          </div>

          <igc-switch @igcChange=${toggleGroup}></igc-switch>
        </div>

        <igc-button-group ${ref(group)} selection="single">
          <igc-toggle-button value="xs">XS</igc-toggle-button>
          <igc-toggle-button value="sm" selected>SM</igc-toggle-button>
          <igc-toggle-button value="md" disabled>MD</igc-toggle-button>
          <igc-toggle-button value="lg">LG</igc-toggle-button>
          <igc-toggle-button value="xl">XL</igc-toggle-button>
        </igc-button-group>
      </div>
    `;
  },
};

export const ProgrammaticSelection: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `selectedItems` property reads and writes the whole selection: assigning to it replaces what was selected before rather than adding to it, and an empty array clears the group. Programmatic changes are silent - `igcSelect` and `igcDeselect` only report what a user did.',
      },
    },
  },
  render: () => {
    const group = createRef<IgcButtonGroupComponent>();
    const log = createRef<HTMLElement>();

    function report(message: string) {
      if (log.value) {
        log.value.textContent = message;
      }
    }

    function select(values: string[]) {
      const element = group.value;

      if (element) {
        element.selectedItems = values;
        report(`selectedItems: ${JSON.stringify(element.selectedItems)}`);
      }
    }

    function reportEvent(name: string, event: CustomEvent<string | undefined>) {
      report(`${name}: "${event.detail}"`);
    }

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <igc-button-group
          ${ref(group)}
          selection="multiple"
          @igcSelect=${(e: CustomEvent<string | undefined>) =>
            reportEvent('igcSelect', e)}
          @igcDeselect=${(e: CustomEvent<string | undefined>) =>
            reportEvent('igcDeselect', e)}
        >
          <igc-toggle-button value="bold" aria-label="Bold">
            <igc-icon name="bold"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="italic" aria-label="Italic">
            <igc-icon name="italic"></igc-icon>
          </igc-toggle-button>
          <igc-toggle-button value="underline" aria-label="Underline">
            <igc-icon name="underline"></igc-icon>
          </igc-toggle-button>
        </igc-button-group>

        <div class="actions">
          <igc-button variant="outlined" @click=${() => select(['bold'])}>
            Bold
          </igc-button>
          <igc-button
            variant="outlined"
            @click=${() => select(['italic', 'underline'])}
          >
            Italic + Underline
          </igc-button>
          <igc-button variant="outlined" @click=${() => select([])}>
            Clear
          </igc-button>
        </div>

        <p class="log" ${ref(log)}>Interact with the buttons to see events.</p>
      </div>
    `;
  },
};

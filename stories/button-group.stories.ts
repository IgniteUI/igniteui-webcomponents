import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, render } from 'lit';
import { ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcButtonGroupComponent,
  IgcIconComponent,
  IgcSwitchComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcButtonGroupComponent,
  IgcIconComponent,
  IgcSwitchComponent
);

registerMaterialIcons(
  'align-center',
  'align-justify',
  'align-left',
  'align-right',
  'bold',
  'crop-square',
  'edit',
  'italic',
  'list-bulleted',
  'list-numbered',
  'near-me',
  'pan-tool',
  'text-fields',
  'underline'
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
      type: { name: 'enum', value: ['multiple', 'single', 'single-required'] },
      description: 'Controls the mode of selection for the button group.',
      options: ['multiple', 'single', 'single-required'],
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
  selection: 'multiple' | 'single' | 'single-required';
}
type Story = StoryObj<IgcButtonGroupArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .bg-stack {
      display: grid;
      gap: 1.5rem;
      max-width: 48rem;
    }

    .bg-field {
      display: grid;
      gap: 0.5rem;
      justify-items: start;
    }

    .bg-label {
      font-weight: 600;
    }

    .bg-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }

    .bg-panel {
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }
  </style>
`;

export const Default: Story = {
  args: { selection: 'single-required' },
  parameters: {
    docs: {
      description: {
        story:
          'The view switcher of a calendar. Use the controls panel to change the selection mode, the alignment and the disabled state. In `single`, a click on the selected button deselects it. In `single-required`, the selection stays. Both single modes expose a `radiogroup`: the group is one tab stop, and the arrow keys move the focus and the selection. In `multiple`, the group exposes a `group` of toggle buttons with `aria-pressed`, each button is a tab stop, and the arrow keys do nothing.',
      },
    },
  },
  render: ({ selection, disabled, alignment }) => html`
    <igc-button-group
      aria-label="Calendar view"
      .selection=${selection}
      .disabled=${disabled}
      .alignment=${alignment}
    >
      <igc-toggle-button value="day">Day</igc-toggle-button>
      <igc-toggle-button value="week" selected>Week</igc-toggle-button>
      <igc-toggle-button value="month">Month</igc-toggle-button>
      <igc-toggle-button value="year">Year</igc-toggle-button>
    </igc-button-group>
  `,
};

export const TextEditor: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The toolbar of a text editor with three groups. The text style group uses `multiple`, because bold, italic and underline combine. The alignment group uses `single-required`, because text always has an alignment. The list group uses `single`, so a click on the selected list type turns the list off. The buttons show only an icon, so each has an `aria-label`, and each group has an `aria-label` too. The handlers of `igcSelect` and `igcDeselect` read `selectedItems` and apply the result to the preview.',
      },
    },
  },
  render: () => {
    const lines = [
      'Pack the tent and the sleeping bags.',
      'Buy food for three days.',
      'Check the weather forecast.',
    ];
    const state = { marks: [] as string[], align: 'left', list: '' };

    const toggles = (
      items: [value: string, label: string, icon: string][],
      selected?: string
    ) =>
      items.map(
        ([value, label, icon]) => html`
          <igc-toggle-button
            value=${value}
            aria-label=${label}
            ?selected=${value === selected}
          >
            <igc-icon name=${icon}></igc-icon>
          </igc-toggle-button>
        `
      );

    const preview = renderInto(() => {
      const { marks, align, list } = state;
      const style = [
        `font-weight: ${marks.includes('bold') ? 700 : 400}`,
        `font-style: ${marks.includes('italic') ? 'italic' : 'normal'}`,
        `text-decoration: ${marks.includes('underline') ? 'underline' : 'none'}`,
        `text-align: ${align}`,
      ].join('; ');
      const items = lines.map((line) => html`<li>${line}</li>`);

      return list === 'bulleted'
        ? html`<ul style=${style}>
            ${items}
          </ul>`
        : list === 'numbered'
          ? html`<ol style=${style}>
              ${items}
            </ol>`
          : html`<p style=${style}>${lines.join(' ')}</p>`;
    });

    const sync =
      (key: 'marks' | 'align' | 'list') =>
      ({ currentTarget }: Event) => {
        const values = (currentTarget as IgcButtonGroupComponent).selectedItems;

        if (key === 'marks') {
          state.marks = values;
        } else {
          state[key] = values[0] ?? '';
        }

        preview.update();
      };

    return html`
      ${styles}
      <style>
        .bg-editor {
          display: grid;
          gap: 1rem;
        }

        .bg-editor [data-preview] {
          min-height: 6rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 6px;
        }
      </style>
      <div class="bg-stack bg-editor">
        <div class="bg-row">
          <igc-button-group
            selection="multiple"
            aria-label="Text style"
            @igcSelect=${sync('marks')}
            @igcDeselect=${sync('marks')}
          >
            ${toggles([
              ['bold', 'Bold', 'bold'],
              ['italic', 'Italic', 'italic'],
              ['underline', 'Underline', 'underline'],
            ])}
          </igc-button-group>

          <igc-button-group
            selection="single-required"
            aria-label="Alignment"
            @igcSelect=${sync('align')}
          >
            ${toggles(
              [
                ['left', 'Align left', 'align-left'],
                ['center', 'Align center', 'align-center'],
                ['right', 'Align right', 'align-right'],
                ['justify', 'Justify', 'align-justify'],
              ],
              'left'
            )}
          </igc-button-group>

          <igc-button-group
            selection="single"
            aria-label="List"
            @igcSelect=${sync('list')}
            @igcDeselect=${sync('list')}
          >
            ${toggles([
              ['bulleted', 'Bulleted list', 'list-bulleted'],
              ['numbered', 'Numbered list', 'list-numbered'],
            ])}
          </igc-button-group>
        </div>
        <div
          data-preview
          aria-label="Preview"
          role="region"
          ${preview.mount}
        ></div>
      </div>
    `;
  },
};

const tools = [
  {
    value: 'select',
    label: 'Select',
    icon: 'near-me',
    hint: 'Click a shape to select it.',
  },
  { value: 'pen', label: 'Pen', icon: 'edit', hint: 'Drag to draw a line.' },
  {
    value: 'rectangle',
    label: 'Rectangle',
    icon: 'crop-square',
    hint: 'Drag to draw a rectangle.',
  },
  {
    value: 'text',
    label: 'Text',
    icon: 'text-fields',
    hint: 'Click to add a text box.',
  },
  {
    value: 'pan',
    label: 'Pan',
    icon: 'pan-tool',
    hint: 'Drag to move the canvas.',
  },
];

export const ToolPalette: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The tool palette of a drawing application. `alignment="vertical"` stacks the buttons in a column, and Arrow Up and Arrow Down move between the tools. The palette uses `single-required`, because one tool is always active. The canvas shows the active tool and changes the cursor.',
      },
    },
  },
  render: () => {
    const pick = ({ currentTarget }: Event) => {
      const palette = currentTarget as IgcButtonGroupComponent;
      const tool = tools.find(
        ({ value }) => value === palette.selectedItems[0]
      )!;
      const canvas = palette.nextElementSibling as HTMLElement;

      canvas.dataset.tool = tool.value;
      canvas.querySelector('p')!.textContent = `${tool.label}: ${tool.hint}`;
    };

    return html`
      ${styles}
      <style>
        .bg-drawing {
          display: flex;
          gap: 1rem;
          max-width: 48rem;
        }

        .bg-canvas {
          flex: 1;
          display: grid;
          place-items: center;
          min-height: 18rem;
          border: 1px dashed var(--ig-gray-400);
          border-radius: 8px;
          background-image: radial-gradient(
            var(--ig-gray-300) 1px,
            transparent 1px
          );
          background-size: 16px 16px;
        }

        .bg-canvas[data-tool='pen'],
        .bg-canvas[data-tool='rectangle'] {
          cursor: crosshair;
        }

        .bg-canvas[data-tool='text'] {
          cursor: text;
        }

        .bg-canvas[data-tool='pan'] {
          cursor: grab;
        }
      </style>
      <div class="bg-drawing">
        <igc-button-group
          alignment="vertical"
          selection="single-required"
          aria-label="Tools"
          @igcSelect=${pick}
        >
          ${tools.map(
            ({ value, label, icon }, index) => html`
              <igc-toggle-button
                value=${value}
                aria-label=${label}
                ?selected=${index === 0}
              >
                <igc-icon name=${icon}></igc-icon>
              </igc-toggle-button>
            `
          )}
        </igc-button-group>
        <div class="bg-canvas" data-tool="select">
          <p class="muted" role="status">Select: ${tools[0].hint}</p>
        </div>
      </div>
    `;
  },
};

const hotels = [
  {
    name: 'Harbor View Hotel',
    rating: 4.6,
    amenities: ['wifi', 'parking', 'breakfast', 'pool'],
  },
  { name: 'City Loft Suites', rating: 4.2, amenities: ['wifi', 'pets'] },
  {
    name: 'Pine Lodge',
    rating: 4.8,
    amenities: ['parking', 'breakfast', 'pets'],
  },
  {
    name: 'Sunset Resort',
    rating: 4.4,
    amenities: ['wifi', 'parking', 'pool', 'breakfast'],
  },
  { name: 'Budget Inn', rating: 3.6, amenities: ['wifi', 'parking'] },
  {
    name: 'Garden Guesthouse',
    rating: 4,
    amenities: ['breakfast', 'pets', 'wifi'],
  },
];

const amenities = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'parking', label: 'Parking' },
  { value: 'pool', label: 'Pool' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'pets', label: 'Pets allowed' },
];

export const SearchFilters: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The filters of a hotel search. The amenities use `multiple`, and a hotel must have all selected amenities. The rating uses `single`, so a click on the selected rating clears it. The presets set `selectedItems`, which replaces the selection, and an empty array clears it. A change through `selectedItems` emits no event, so the preset handlers update the results themselves. Each group takes its accessible name from the visible label through `aria-labelledby`.',
      },
    },
  },
  render: () => {
    let root: HTMLElement | undefined;

    const update = () => {
      if (!root) {
        return;
      }

      const [amenityGroup, ratingGroup] =
        root.querySelectorAll('igc-button-group');
      const wanted = amenityGroup.selectedItems;
      const minimum = Number(ratingGroup.selectedItems[0] ?? 0);
      const results = hotels.filter(
        (hotel) =>
          hotel.rating >= minimum &&
          wanted.every((amenity) => hotel.amenities.includes(amenity))
      );

      render(
        html`
          <p class="muted" role="status">
            ${results.length} of ${hotels.length} hotels
          </p>
          <ul>
            ${results.map(
              ({ name, rating }) => html`<li>${name}, rated ${rating}</li>`
            )}
          </ul>
        `,
        root.querySelector<HTMLElement>('[data-results]')!
      );
    };

    const preset = (amenityValues: string[], ratingValues: string[]) => () => {
      const [amenityGroup, ratingGroup] =
        root!.querySelectorAll('igc-button-group');

      amenityGroup.selectedItems = amenityValues;
      ratingGroup.selectedItems = ratingValues;
      update();
    };

    const mount = (element?: Element) => {
      root = element as HTMLElement | undefined;
      update();
    };

    return html`
      ${styles}
      <div class="bg-stack" ${ref(mount)}>
        <div class="bg-field">
          <span class="bg-label" id="bg-amenities">Amenities</span>
          <igc-button-group
            selection="multiple"
            aria-labelledby="bg-amenities"
            @igcSelect=${update}
            @igcDeselect=${update}
          >
            ${amenities.map(
              ({ value, label }) => html`
                <igc-toggle-button value=${value}>${label}</igc-toggle-button>
              `
            )}
          </igc-button-group>
        </div>
        <div class="bg-field">
          <span class="bg-label" id="bg-rating">Guest rating</span>
          <igc-button-group
            selection="single"
            aria-labelledby="bg-rating"
            @igcSelect=${update}
            @igcDeselect=${update}
          >
            <igc-toggle-button value="3.5">3.5 and up</igc-toggle-button>
            <igc-toggle-button value="4">4 and up</igc-toggle-button>
            <igc-toggle-button value="4.5">4.5 and up</igc-toggle-button>
          </igc-button-group>
        </div>
        <div class="bg-row">
          <igc-button
            variant="outlined"
            @click=${preset(['pool', 'breakfast', 'parking'], ['4'])}
          >
            Family trip
          </igc-button>
          <igc-button variant="outlined" @click=${preset(['wifi'], ['4.5'])}>
            Business trip
          </igc-button>
          <igc-button variant="flat" @click=${preset([], [])}>
            Clear filters
          </igc-button>
        </div>
        <section class="bg-panel" aria-label="Results" data-results></section>
      </div>
    `;
  },
};

export const NotificationSettings: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The notification settings of an account. The switch disables both groups through `disabled` on the group. "Instant" is disabled on its own, because it needs the Pro plan, so it stays disabled when the switch turns the groups on again. The button group is not a form control, so `FormData` does not hold its selection: the submit handler reads `selectedItems` of each group.',
      },
    },
  },
  render: () => {
    const toggle = ({ currentTarget }: Event) => {
      const form = (currentTarget as HTMLElement).closest('form')!;
      const enabled = (currentTarget as IgcSwitchComponent).checked;

      for (const group of form.querySelectorAll('igc-button-group')) {
        group.disabled = !enabled;
      }
    };

    const submit = (event: SubmitEvent) => {
      event.preventDefault();

      const form = event.target as HTMLFormElement;
      const [frequency, topics] = form.querySelectorAll('igc-button-group');
      const data = {
        ...Object.fromEntries(new FormData(form)),
        frequency: frequency.selectedItems[0],
        topics: topics.selectedItems,
      };

      form.querySelector('output')!.value = JSON.stringify(data, null, 2);
    };

    return html`
      ${styles}
      <style>
        .bg-settings output {
          display: block;
          white-space: pre;
          font-family: monospace;
        }
      </style>
      <form class="bg-stack bg-panel bg-settings" @submit=${submit}>
        <igc-switch name="email" value="on" checked @igcChange=${toggle}>
          Email notifications
        </igc-switch>
        <div class="bg-field">
          <span class="bg-label" id="bg-frequency">Frequency</span>
          <igc-button-group
            selection="single-required"
            aria-labelledby="bg-frequency"
          >
            <igc-toggle-button value="instant" disabled
              >Instant</igc-toggle-button
            >
            <igc-toggle-button value="daily" selected>
              Daily digest
            </igc-toggle-button>
            <igc-toggle-button value="weekly">Weekly digest</igc-toggle-button>
          </igc-button-group>
          <small class="muted">Instant emails need the Pro plan.</small>
        </div>
        <div class="bg-field">
          <span class="bg-label" id="bg-topics">Topics</span>
          <igc-button-group selection="multiple" aria-labelledby="bg-topics">
            <igc-toggle-button value="mentions" selected>
              Mentions
            </igc-toggle-button>
            <igc-toggle-button value="comments" selected>
              Comments
            </igc-toggle-button>
            <igc-toggle-button value="releases">Releases</igc-toggle-button>
          </igc-button-group>
        </div>
        <div>
          <igc-button type="submit">Save</igc-button>
        </div>
        <output aria-label="Submitted data"></output>
      </form>
    `;
  },
};

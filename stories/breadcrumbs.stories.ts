import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcBreadcrumbComponent,
  IgcBreadcrumbsComponent,
  IgcDropdownComponent,
  type IgcDropdownItemComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcListComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';
import { html, render } from 'lit';

defineComponents(
  IgcBreadcrumbsComponent,
  IgcDropdownComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcListComponent
);

const materialIcons = 'https://unpkg.com/material-design-icons@3.0.1';

for (const [name, path] of [
  ['home', 'action/svg/production/ic_home_24px.svg'],
  ['settings', 'action/svg/production/ic_settings_24px.svg'],
  ['people', 'social/svg/production/ic_people_24px.svg'],
  ['lock', 'action/svg/production/ic_lock_24px.svg'],
  ['folder', 'file/svg/production/ic_folder_24px.svg'],
  ['description', 'action/svg/production/ic_description_24px.svg'],
  ['image', 'image/svg/production/ic_image_24px.svg'],
]) {
  registerIcon(name, `${materialIcons}/${path}`);
}

// region default
const metadata: Meta<IgcBreadcrumbsComponent> = {
  title: 'Breadcrumbs',
  component: 'igc-breadcrumbs',
  parameters: {
    docs: {
      description: {
        component:
          'A breadcrumb navigation component that renders an ordered list of breadcrumb items.',
      },
    },
  },
  argTypes: {
    separator: {
      type: 'string',
      description:
        'The icon name used as the default separator between breadcrumb items.\nCan be overridden per-item using the `separator` slot on an individual breadcrumb item.',
      control: 'text',
      table: { defaultValue: { summary: 'tree_expand' } },
    },
  },
  args: { separator: 'tree_expand' },
};

export default metadata;

interface IgcBreadcrumbsArgs {
  /**
   * The icon name used as the default separator between breadcrumb items.
   * Can be overridden per-item using the `separator` slot on an individual breadcrumb item.
   */
  separator: string;
}
type Story = StoryObj<IgcBreadcrumbsArgs>;

// endregion

/**
 * Simulates single-page-application routing: following a link does not reload the
 * page, it only moves the `current` marker to the activated breadcrumb.
 */
function markCurrent(event: Event): void {
  event.preventDefault();

  const anchor = event.currentTarget as HTMLAnchorElement;
  const trail = anchor.closest(IgcBreadcrumbsComponent.tagName)!;

  for (const item of trail.querySelectorAll(IgcBreadcrumbComponent.tagName)) {
    item.current = false;
  }

  anchor.closest(IgcBreadcrumbComponent.tagName)!.current = true;
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A product page on an e-commerce site. Each level of the catalog is a link back to that category and the last item is the current page. Click a link to move the `current` state to it. Use the **Controls** panel to change the `separator` icon for the whole trail.',
      },
    },
  },
  render: ({ separator }) => html`
    <nav aria-label="Breadcrumb">
      <igc-breadcrumbs separator=${separator}>
        <igc-breadcrumb>
          <a href="/" @click=${markCurrent}>Home</a>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="/electronics" @click=${markCurrent}>Electronics</a>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="/electronics/laptops" @click=${markCurrent}>Laptops</a>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="/electronics/laptops/ultrabooks" @click=${markCurrent}
            >Ultrabooks</a
          >
        </igc-breadcrumb>
        <igc-breadcrumb current>
          <a
            href="/electronics/laptops/ultrabooks/x1-carbon"
            @click=${markCurrent}
            >ThinkPad X1 Carbon Gen 12</a
          >
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </nav>
  `,
};

export const DocumentationSite: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A documentation site that uses a plain text `/` separator provided per item through the `separator` slot. The component hides separators from assistive technology, so screen readers do not announce "slash" between levels. The first item carries a home icon in its `prefix` slot and the API reference item uses the `suffix` slot to flag a link that opens a different site.',
      },
    },
  },
  render: () => html`
    <nav aria-label="Breadcrumb">
      <igc-breadcrumbs>
        <igc-breadcrumb>
          <igc-icon slot="prefix" name="home"></igc-icon>
          <a href="/docs" @click=${markCurrent}>Docs</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="/docs/components" @click=${markCurrent}>Components</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="https://example.com/api" target="_blank" rel="noopener"
            >API reference</a
          >
          <igc-icon
            slot="suffix"
            name="open_in_new"
            collection="default"
            title="Opens in a new tab"
          ></igc-icon>
          <span slot="separator">/</span>
        </igc-breadcrumb>
        <igc-breadcrumb current>
          <a href="/docs/components/breadcrumbs" @click=${markCurrent}
            >Breadcrumbs</a
          >
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </nav>
  `,
};

export const AdminConsole: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A user detail page in an admin console. Every level has an icon in its `prefix` slot. The "Settings" level is a grouping node that has no page of its own, so it is rendered `disabled` to keep the hierarchy visible without offering a dead link. The lock icon in the `suffix` slot of "Users" marks a section that needs elevated permissions.',
      },
    },
  },
  render: () => html`
    <nav aria-label="Breadcrumb">
      <igc-breadcrumbs separator="chevron_right">
        <igc-breadcrumb>
          <igc-icon slot="prefix" name="home"></igc-icon>
          <a href="/admin" @click=${markCurrent}>Dashboard</a>
        </igc-breadcrumb>
        <igc-breadcrumb disabled>
          <igc-icon slot="prefix" name="settings"></igc-icon>
          <a href="/admin/settings">Settings</a>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <igc-icon slot="prefix" name="people"></igc-icon>
          <a href="/admin/settings/users" @click=${markCurrent}>Users</a>
          <igc-icon
            slot="suffix"
            name="lock"
            title="Requires the Administrator role"
          ></igc-icon>
        </igc-breadcrumb>
        <igc-breadcrumb current>
          <a href="/admin/settings/users/1042" @click=${markCurrent}
            >Jane Doe</a
          >
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </nav>
  `,
};

interface DriveNode {
  name: string;
  kind: 'folder' | 'document' | 'image';
  children?: DriveNode[];
}

const drive: DriveNode = {
  name: 'My Drive',
  kind: 'folder',
  children: [
    {
      name: 'Projects',
      kind: 'folder',
      children: [
        {
          name: 'Website redesign',
          kind: 'folder',
          children: [
            {
              name: 'Assets',
              kind: 'folder',
              children: [
                {
                  name: 'Icons',
                  kind: 'folder',
                  children: [
                    { name: 'logo.svg', kind: 'image' },
                    { name: 'favicon.png', kind: 'image' },
                  ],
                },
                { name: 'Hero banner.png', kind: 'image' },
                { name: 'Brand guidelines.pdf', kind: 'document' },
              ],
            },
            { name: 'Functional spec.docx', kind: 'document' },
          ],
        },
        {
          name: 'Mobile app',
          kind: 'folder',
          children: [{ name: 'Q3 roadmap.pdf', kind: 'document' }],
        },
      ],
    },
    {
      name: 'Finance',
      kind: 'folder',
      children: [
        {
          name: '2026',
          kind: 'folder',
          children: [
            {
              name: 'Q3',
              kind: 'folder',
              children: [
                { name: 'Revenue by region.xlsx', kind: 'document' },
                { name: 'Expenses.xlsx', kind: 'document' },
              ],
            },
          ],
        },
      ],
    },
    { name: 'Onboarding checklist.pdf', kind: 'document' },
  ],
};

/** Number of trail items to show before the middle levels collapse into a menu. */
const COLLAPSE_THRESHOLD = 4;

function createFileExplorer(container: HTMLElement): void {
  let path: DriveNode[] = [drive];

  const update = () => render(template(), container);

  const navigateTo = (depth: number) => {
    path = path.slice(0, depth + 1);
    update();
  };

  const open = (node: DriveNode) => {
    if (node.kind === 'folder') {
      path = [...path, node];
      update();
    }
  };

  const crumb = (node: DriveNode, depth: number) => html`
    <igc-breadcrumb ?current=${depth === path.length - 1}>
      <a
        href="#${depth}"
        @click=${(event: Event) => {
          event.preventDefault();
          navigateTo(depth);
        }}
        >${node.name}</a
      >
    </igc-breadcrumb>
  `;

  const collapsedCrumb = (hidden: DriveNode[], offset: number) => html`
    <igc-breadcrumb>
      <igc-dropdown
        @igcChange=${({ detail }: CustomEvent<IgcDropdownItemComponent>) =>
          navigateTo(Number(detail.value))}
      >
        <igc-icon-button
          slot="target"
          variant="flat"
          name="more_horiz"
          collection="default"
          aria-label="Show hidden folders"
        ></igc-icon-button>
        ${hidden.map(
          (node, i) => html`
            <igc-dropdown-item value=${offset + i}>
              <igc-icon slot="prefix" name="folder"></igc-icon>
              ${node.name}
            </igc-dropdown-item>
          `
        )}
      </igc-dropdown>
    </igc-breadcrumb>
  `;

  const trail = () => {
    if (path.length <= COLLAPSE_THRESHOLD) {
      return path.map(crumb);
    }

    const hidden = path.slice(1, -2);
    const tail = path.slice(-2);

    return [
      crumb(path[0], 0),
      collapsedCrumb(hidden, 1),
      ...tail.map((node, i) => crumb(node, path.length - 2 + i)),
    ];
  };

  const template = () => {
    const folder = path.at(-1)!;

    return html`
      <nav aria-label="Folder path">
        <igc-breadcrumbs>${trail()}</igc-breadcrumbs>
      </nav>

      <igc-list aria-label="Folder contents" style="margin-top: 1rem">
        ${folder.children?.map(
          (node) => html`
            <igc-list-item>
              <igc-icon slot="start" name=${node.kind}></igc-icon>
              ${
                node.kind === 'folder'
                  ? html`<a
                      slot="title"
                      href="#"
                      @click=${(event: Event) => {
                        event.preventDefault();
                        open(node);
                      }}
                      >${node.name}</a
                    >`
                  : html`<span slot="title">${node.name}</span>`
              }
            </igc-list-item>
          `
        )}
      </igc-list>
    `;
  };

  update();
}

export const FileExplorer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A cloud storage file browser where the breadcrumb trail is driven by application state. Open a folder from the list to push a new level, or follow a breadcrumb link to go back up. Once the path is deeper than four levels, the middle folders collapse into an ellipsis menu (an `igc-dropdown` placed inside a breadcrumb item) so the trail stays short. Picking a folder from that menu navigates to it.',
      },
    },
  },
  render: () => {
    const container = document.createElement('div');
    createFileExplorer(container);
    return container;
  },
};

export const LongTrail: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A deep knowledge-base article shown in a narrow column, such as a sidebar or a phone screen. The trail wraps onto multiple lines instead of overflowing its container.',
      },
    },
  },
  render: () => html`
    <nav aria-label="Breadcrumb" style="max-width: 360px">
      <igc-breadcrumbs separator="chevron_right">
        <igc-breadcrumb>
          <a href="/help" @click=${markCurrent}>Help Center</a>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="/help/billing" @click=${markCurrent}>Billing</a>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="/help/billing/subscriptions" @click=${markCurrent}
            >Subscriptions</a
          >
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="/help/billing/subscriptions/plans" @click=${markCurrent}
            >Plans and pricing</a
          >
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="/help/billing/subscriptions/plans/team" @click=${markCurrent}
            >Team plan</a
          >
        </igc-breadcrumb>
        <igc-breadcrumb current>
          <a
            href="/help/billing/subscriptions/plans/team/add-seats"
            @click=${markCurrent}
            >How to add seats to an existing subscription</a
          >
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </nav>
  `,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The trail follows the `--ig-size` custom property, so it can match a compact toolbar, the page body, or a large page header.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1.5rem">
      ${[1, 2, 3].map(
        (size) => html`
          <nav aria-label="Breadcrumb, size ${size}" style="--ig-size: ${size}">
            <igc-breadcrumbs>
              <igc-breadcrumb>
                <igc-icon slot="prefix" name="home"></igc-icon>
                <a href="/" @click=${markCurrent}>Home</a>
              </igc-breadcrumb>
              <igc-breadcrumb>
                <a href="/projects" @click=${markCurrent}>Projects</a>
              </igc-breadcrumb>
              <igc-breadcrumb current>
                <a href="/projects/website" @click=${markCurrent}
                  >Website redesign</a
                >
              </igc-breadcrumb>
            </igc-breadcrumbs>
          </nav>
        `
      )}
    </div>
  `,
};

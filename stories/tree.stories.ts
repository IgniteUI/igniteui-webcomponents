import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { type TemplateResult, html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';

import {
  IgcButtonComponent,
  IgcChipComponent,
  IgcIconComponent,
  IgcTreeComponent,
  type IgcTreeItemComponent,
  type IgcTreeSelectionEventArgs,
  defineComponents,
} from 'igniteui-webcomponents';
import { type MaterialIconName, registerMaterialIcons } from './story-icons.js';
import {
  delay,
  disableStoryControls,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcChipComponent,
  IgcIconComponent,
  IgcTreeComponent
);

// region default
const metadata: Meta<IgcTreeComponent> = {
  title: 'Tree',
  component: 'igc-tree',
  parameters: {
    docs: {
      description: {
        component:
          'The tree allows users to represent hierarchical data in a tree-view structure,\nmaintaining parent-child relationships, as well as to define static tree-view structure without a corresponding data model.',
      },
    },
    actions: {
      handles: [
        'igcSelection',
        'igcItemCollapsed',
        'igcItemCollapsing',
        'igcItemExpanded',
        'igcItemExpanding',
        'igcActiveItem',
      ],
    },
  },
  argTypes: {
    singleBranchExpand: {
      type: 'boolean',
      description:
        "Whether a single or multiple of a parent's child items can be expanded.",
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    toggleNodeOnClick: {
      type: 'boolean',
      description:
        'Whether clicking over nodes will change their expanded state or not.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    selection: {
      type: { name: 'enum', value: ['none', 'multiple', 'cascade'] },
      description: 'The selection state of the tree.',
      options: ['none', 'multiple', 'cascade'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'none' } },
    },
    locale: {
      type: 'string',
      description:
        'The locale for the resource strings. Falls back to the global locale.',
      control: 'text',
    },
  },
  args: {
    singleBranchExpand: false,
    toggleNodeOnClick: false,
    selection: 'none',
  },
};

export default metadata;

interface IgcTreeArgs {
  /** Whether a single or multiple of a parent's child items can be expanded. */
  singleBranchExpand: boolean;
  /** Whether clicking over nodes will change their expanded state or not. */
  toggleNodeOnClick: boolean;
  /** The selection state of the tree. */
  selection: 'none' | 'multiple' | 'cascade';
  /** The locale for the resource strings. Falls back to the global locale. */
  locale: string;
}
type Story = StoryObj<IgcTreeArgs>;

// endregion

registerMaterialIcons(
  'cloud',
  'code-brackets',
  'description',
  'folder',
  'folder-open',
  'group',
  'image',
  'person'
);

const styles = html`
  ${storyStyles}
  <style>
    .tr-panel {
      max-width: 24rem;
      padding-block: 0.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .tr-panel > h3,
    .tr-panel > p {
      margin: 0.5rem 1rem;
    }

    .tr-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tr-label igc-icon {
      --ig-icon-size: 1.25rem;

      flex: none;
    }

    /* An item reflects \`expanded\`, so CSS picks the folder icon. */
    igc-tree-item[expanded] > .tr-label > .tr-closed,
    igc-tree-item:not([expanded]) > .tr-label > .tr-open {
      display: none;
    }

    .tr-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
  </style>
`;

/** The folder icons of an item: closed, and open while the item is expanded. */
const folderIcons = html`
  <igc-icon class="tr-closed" name="folder"></igc-icon>
  <igc-icon class="tr-open" name="folder-open"></igc-icon>
`;

interface FileNode {
  name: string;
  expanded?: boolean;
  children?: FileNode[];
}

const projectFiles: FileNode[] = [
  {
    name: 'src',
    expanded: true,
    children: [
      {
        name: 'components',
        expanded: true,
        children: [
          { name: 'button.ts' },
          { name: 'dialog.ts' },
          { name: 'tree.ts' },
        ],
      },
      {
        name: 'styles',
        children: [{ name: 'theme.scss' }, { name: 'tokens.scss' }],
      },
      { name: 'main.ts' },
    ],
  },
  {
    name: 'public',
    children: [{ name: 'favicon.svg' }, { name: 'logo.png' }],
  },
  {
    name: 'tests',
    children: [{ name: 'button.spec.ts' }, { name: 'dialog.spec.ts' }],
  },
  { name: 'package.json' },
  { name: 'README.md' },
];

function fileIcon(name: string): MaterialIconName {
  if (/\.(png|svg|jpe?g)$/.test(name)) {
    return 'image';
  }

  return /\.(ts|scss)$/.test(name) ? 'code-brackets' : 'description';
}

function fileItem({ name, expanded, children }: FileNode): TemplateResult {
  return html`
    <igc-tree-item .value=${name} ?expanded=${expanded}>
      <span slot="label" class="tr-label">
        ${
          children
            ? folderIcons
            : html`<igc-icon name=${fileIcon(name)}></igc-icon>`
        }
        ${name}
      </span>
      ${children?.map(fileItem)}
    </igc-tree-item>
  `;
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The files of a web project. Each item puts an icon and the file name in the `label` slot. An item reflects `expanded`, so CSS shows the open folder icon on an expanded folder. Click the arrow of a folder, or use the keyboard: Right Arrow expands a folder and then goes to its first child, Left Arrow collapses it or goes to its parent, Home and End go to the first and the last item, and `*` expands all the folders on the same level. Use the controls panel to turn on selection, single branch expand and toggle on click.',
      },
    },
  },
  render: ({
    selection,
    singleBranchExpand,
    toggleNodeOnClick,
    locale,
  }) => html`
    ${styles}
    <div class="tr-panel">
      <h3 id="tr-files-title">Project files</h3>
      <igc-tree
        aria-labelledby="tr-files-title"
        .selection=${selection}
        .singleBranchExpand=${singleBranchExpand}
        .toggleNodeOnClick=${toggleNodeOnClick}
        .locale=${locale}
      >
        ${projectFiles.map(fileItem)}
      </igc-tree>
    </div>
  `,
};

interface DocPage {
  id: string;
  title: string;
  text: string;
}

const docSections: { title: string; pages: DocPage[] }[] = [
  {
    title: 'Get started',
    pages: [
      {
        id: 'installation',
        title: 'Installation',
        text: 'Install the package from npm, then register the components that your app uses with defineComponents().',
      },
      {
        id: 'quick-start',
        title: 'Quick start',
        text: 'Add a button and an input to a page, and handle the events that they send.',
      },
      {
        id: 'theming',
        title: 'Theming',
        text: 'Load one of the four themes, then change the palette, the typography and the elevations with CSS variables.',
      },
    ],
  },
  {
    title: 'Components',
    pages: [
      {
        id: 'button',
        title: 'Button',
        text: 'A button runs an action. Use the flat, outlined, contained and fab variants to show how important the action is.',
      },
      {
        id: 'dialog',
        title: 'Dialog',
        text: 'A dialog shows content above the page and keeps the focus inside until the user closes it.',
      },
      {
        id: 'tree',
        title: 'Tree',
        text: 'A tree shows data in a hierarchy. The user expands and collapses the items, and can select them.',
      },
    ],
  },
  {
    title: 'Guides',
    pages: [
      {
        id: 'forms',
        title: 'Forms',
        text: 'The form controls take part in native forms: they submit their values, reset and validate.',
      },
      {
        id: 'localization',
        title: 'Localization',
        text: 'Set a locale on a component or for the whole app to change the resource strings and the formats.',
      },
      {
        id: 'accessibility',
        title: 'Accessibility',
        text: 'The components follow the WAI-ARIA patterns and work with the keyboard and with screen readers.',
      },
    ],
  },
];

const releaseNotes: DocPage = {
  id: 'release-notes',
  title: 'Release notes',
  text: 'The changes of each version, with the new features, the fixes and the deprecations.',
};

const docPages = new Map(
  [...docSections.flatMap(({ pages }) => pages), releaseNotes].map((page) => [
    page.id,
    page,
  ])
);

export const DocsNavigation: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The navigation of a documentation site. Each page is a link in the `label` slot. The item then gives the `treeitem` role and its tab stop to the link, so the keyboard and screen readers reach the same element, and the user can still open a page in a new tab. The open page is `active`, which also expands its section, and its link has `aria-current="page"`. The page follows `igcActiveItem`. Up Arrow and Down Arrow move the active item, so the page follows the keyboard; Ctrl + Up Arrow and Ctrl + Down Arrow move only the focus. With `toggle-node-on-click`, a click on a section expands it, and `single-branch-expand` keeps one section open. The story cancels the link navigation, as a router of a single-page app does.',
      },
    },
  },
  render: () => {
    let current = 'tree';

    const open = ({ detail }: CustomEvent<IgcTreeItemComponent>) => {
      if (docPages.has(detail.value)) {
        current = detail.value;
        story.update();
      }
    };

    const stayHere = (event: MouseEvent) => {
      if ((event.target as Element).closest('a')) {
        event.preventDefault();
      }
    };

    const pageItem = ({ id, title }: DocPage) => html`
      <igc-tree-item .value=${id} ?active=${id === 'tree'}>
        <a
          slot="label"
          href="#/docs/${id}"
          aria-current=${ifDefined(current === id ? 'page' : undefined)}
          >${title}</a
        >
      </igc-tree-item>
    `;

    const story = renderInto(() => {
      const page = docPages.get(current)!;

      return html`
        <nav class="tr-docs-nav" aria-labelledby="tr-docs-title">
          <h3 id="tr-docs-title">Documentation</h3>
          <igc-tree
            aria-labelledby="tr-docs-title"
            single-branch-expand
            toggle-node-on-click
            @igcActiveItem=${open}
            @click=${stayHere}
          >
            ${docSections.map(
              ({ title, pages }) => html`
                <igc-tree-item label=${title}>
                  ${pages.map(pageItem)}
                </igc-tree-item>
              `
            )}
            ${pageItem(releaseNotes)}
          </igc-tree>
        </nav>
        <article class="tr-docs-page" aria-labelledby="tr-docs-page-title">
          <h3 id="tr-docs-page-title">${page.title}</h3>
          <p>${page.text}</p>
        </article>
      `;
    });

    return html`
      ${styles}
      <style>
        .tr-docs {
          display: grid;
          grid-template-columns: minmax(12rem, 16rem) 1fr;
          gap: 1.5rem;
          max-width: 46rem;
        }

        .tr-docs-nav {
          border-inline-end: 1px solid var(--ig-gray-300);
        }

        .tr-docs-nav h3 {
          margin: 0 1rem 0.5rem;
        }

        .tr-docs-nav a {
          color: inherit;
          text-decoration: none;
        }

        .tr-docs-nav a[aria-current='page'] {
          font-weight: 600;
        }

        .tr-docs-page h3 {
          margin-block-start: 0;
        }
      </style>
      <div class="tr-docs" ${story.mount}></div>
    `;
  },
};

interface Permission {
  id: string;
  label: string;
}

const permissionGroups: {
  title: string;
  disabled?: boolean;
  permissions: Permission[];
}[] = [
  {
    title: 'Content',
    permissions: [
      { id: 'content.view', label: 'View pages' },
      { id: 'content.create', label: 'Create pages' },
      { id: 'content.edit', label: 'Edit pages' },
      { id: 'content.publish', label: 'Publish pages' },
      { id: 'content.delete', label: 'Delete pages' },
    ],
  },
  {
    title: 'Media library',
    permissions: [
      { id: 'media.upload', label: 'Upload files' },
      { id: 'media.delete', label: 'Delete files' },
    ],
  },
  {
    title: 'Members',
    permissions: [
      { id: 'members.view', label: 'View members' },
      { id: 'members.invite', label: 'Invite members' },
      { id: 'members.remove', label: 'Remove members' },
    ],
  },
  {
    title: 'Billing',
    disabled: true,
    permissions: [
      { id: 'billing.invoices', label: 'View invoices' },
      { id: 'billing.plan', label: 'Change the plan' },
    ],
  },
];

const requiredPermission = 'content.view';

const grantable = permissionGroups
  .filter(({ disabled }) => !disabled)
  .flatMap(({ permissions }) => permissions.map(({ id }) => id));

const editorPermissions = [
  'content.view',
  'content.create',
  'content.edit',
  'media.upload',
  'members.view',
];

export const RolePermissions: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The permissions of a role, with `selection="cascade"`. Checking a group turns on all its permissions, and a group shows a partly checked box when only some of them are on. `igcSelection` comes before the change and lists the new selection, so the summary updates from it. View pages is required: the handler cancels any change that removes it, such as unchecking Content, and tells why. Billing is `disabled`, because only the owner manages it. Discard changes calls `deselect()` and then `select()` with the saved permissions. These methods send no event, so the story updates its own state.',
      },
    },
  },
  render: () => {
    const tree = createRef<IgcTreeComponent>();
    let saved = new Set(editorPermissions);
    let granted = new Set(saved);
    let message = '';

    const changed = () =>
      granted.size !== saved.size || [...granted].some((id) => !saved.has(id));

    const select = (event: CustomEvent<IgcTreeSelectionEventArgs>) => {
      const ids = new Set(
        event.detail.newSelection
          .map(({ value }) => value as string)
          .filter((id) => grantable.includes(id))
      );

      if (!ids.has(requiredPermission)) {
        event.preventDefault();
        message =
          'Editors must be able to view pages. To take all access away, remove the role from the member.';
      } else {
        granted = ids;
        message = '';
      }

      story.update();
    };

    const save = () => {
      saved = new Set(granted);
      message = 'Saved the permissions of the Editor role.';
      story.update();
    };

    const discard = () => {
      const items = tree.value!.items;

      tree.value!.deselect();
      tree.value!.select(items.filter(({ value }) => saved.has(value)));
      granted = new Set(saved);
      message = 'Discarded the changes.';
      story.update();
    };

    const story = renderInto(
      () => html`
        <p id="tr-role-summary" class="muted">
          ${granted.size} of ${grantable.length} permissions
        </p>
        <igc-tree
          ${ref(tree)}
          selection="cascade"
          aria-labelledby="tr-role-title"
          aria-describedby="tr-role-summary"
          @igcSelection=${select}
        >
          ${permissionGroups.map(
            ({ title, disabled, permissions }) => html`
              <igc-tree-item ?expanded=${!disabled} ?disabled=${disabled}>
                <span slot="label">
                  ${title}
                  ${
                    disabled
                      ? html`<span class="muted">(only the owner)</span>`
                      : nothing
                  }
                </span>
                ${permissions.map(
                  ({ id, label }) => html`
                    <igc-tree-item
                      .value=${id}
                      label=${label}
                      ?disabled=${disabled}
                      ?selected=${editorPermissions.includes(id)}
                    ></igc-tree-item>
                  `
                )}
              </igc-tree-item>
            `
          )}
        </igc-tree>
        <div class="tr-actions">
          <igc-button ?disabled=${!changed()} @click=${save}>Save</igc-button>
          <igc-button variant="flat" ?disabled=${!changed()} @click=${discard}>
            Discard changes
          </igc-button>
        </div>
        <p role="status">${message}</p>
      `
    );

    return html`
      ${styles}
      <div class="tr-panel tr-role">
        <h3 id="tr-role-title">Editor role</h3>
        <div ${story.mount}></div>
      </div>
      <style>
        .tr-role p,
        .tr-role .tr-actions {
          margin: 0.5rem 1rem;
        }
      </style>
    `;
  },
};

interface Recipient {
  id: string;
  name: string;
  detail: string;
  disabled?: boolean;
  members?: Recipient[];
}

const people: Recipient[] = [
  {
    id: 'product',
    name: 'Product',
    detail: 'Team',
    members: [
      { id: 'ana', name: 'Ana Petrova', detail: 'Product manager' },
      { id: 'liam', name: 'Liam Chen', detail: 'Product designer' },
    ],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    detail: 'Team',
    members: [
      {
        id: 'platform',
        name: 'Platform',
        detail: 'Team',
        members: [
          { id: 'omar', name: 'Omar Haddad', detail: 'Engineering lead' },
          { id: 'grace', name: 'Grace Kim', detail: 'Developer' },
        ],
      },
      {
        id: 'mobile',
        name: 'Mobile',
        detail: 'Team',
        members: [
          { id: 'lucas', name: 'Lucas Silva', detail: 'Developer' },
          { id: 'mia', name: 'Mia Novak', detail: 'QA engineer' },
        ],
      },
    ],
  },
  {
    id: 'partners',
    name: 'Partners',
    detail: 'Guests',
    members: [
      {
        id: 'kenji',
        name: 'Kenji Watanabe',
        detail: 'Guests cannot open drafts',
        disabled: true,
      },
    ],
  },
];

function flatten(list: Recipient[]): Recipient[] {
  return list.flatMap((each) => [each, ...flatten(each.members ?? [])]);
}

const recipients = new Map(flatten(people).map((each) => [each.id, each]));

// One object per chip, because a new object on each render updates the chip.
const removeStrings = new Map(
  [...recipients.values()].map(({ id, name }) => [
    id,
    { chip_remove: `Remove ${name}` },
  ])
);

export const ShareDocument: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The share panel of a document, with `selection="multiple"`. The user can pick a team, a person, or both, and checking a team does not check its members. Shift + click on a box selects all the items from the active one to it. Each pick becomes a removable chip, and its remove control names the pick through `resourceStrings.chip_remove`. Removing a chip calls `deselect()`, which sends no `igcSelection` event. Then the focus goes to the next chip, or to the tree when no chip is left. Guests cannot open drafts, so that person is `disabled`.',
      },
    },
  },
  render: () => {
    const tree = createRef<IgcTreeComponent>();
    let picked: string[] = [];
    let message = '';

    const inTreeOrder = (ids: Set<string>) =>
      tree
        .value!.items.map(({ value }) => value as string)
        .filter((id) => ids.has(id));

    const select = ({ detail }: CustomEvent<IgcTreeSelectionEventArgs>) => {
      picked = inTreeOrder(
        new Set(detail.newSelection.map(({ value }) => value as string))
      );
      message = '';
      story.update();
    };

    const remove = (id: string) => () => {
      const index = picked.indexOf(id);
      const item = tree.value!.items.find(({ value }) => value === id);

      tree.value!.deselect(item ? [item] : []);
      picked = picked.filter((each) => each !== id);
      story.update();

      const next = picked[index] ?? picked[index - 1];
      const chip = next
        ? story.host?.querySelector<HTMLElement>(`[data-id="${next}"]`)
        : tree.value?.querySelector<HTMLElement>('igc-tree-item[tabindex="0"]');

      chip?.focus();
    };

    const share = async () => {
      const names = picked.map((id) => recipients.get(id)!.name);
      message = 'Sharing…';
      story.update();
      await delay(600);
      message = `Shared Q3 roadmap with ${new Intl.ListFormat('en').format(names)}.`;
      story.update();
    };

    const recipientItem = ({
      id,
      name,
      detail,
      disabled,
      members,
    }: Recipient): TemplateResult => html`
      <igc-tree-item
        .value=${id}
        ?expanded=${members && id !== 'partners'}
        ?disabled=${disabled}
      >
        <span slot="label" class="tr-label">
          <igc-icon name=${members ? 'group' : 'person'}></igc-icon>
          ${name}
          <span class="muted">${detail}</span>
        </span>
        ${members?.map(recipientItem)}
      </igc-tree-item>
    `;

    const story = renderInto(
      () => html`
        <igc-tree
          ${ref(tree)}
          selection="multiple"
          aria-labelledby="tr-share-people"
          @igcSelection=${select}
        >
          ${people.map(recipientItem)}
        </igc-tree>
        <h4 id="tr-share-picked">Share with</h4>
        ${
          picked.length
            ? html`
                <ul class="tr-chips" aria-labelledby="tr-share-picked">
                  ${repeat(
                    picked,
                    (id) => id,
                    (id) => html`
                      <li>
                        <igc-chip
                          data-id=${id}
                          removable
                          .resourceStrings=${removeStrings.get(id)!}
                          @igcRemove=${remove(id)}
                        >
                          ${recipients.get(id)!.name}
                        </igc-chip>
                      </li>
                    `
                  )}
                </ul>
              `
            : html`<p class="muted">Nobody yet. Check a team or a person.</p>`
        }
        <div class="tr-actions">
          <igc-button ?disabled=${!picked.length} @click=${share}>
            Share
          </igc-button>
          <span role="status">${message}</span>
        </div>
      `
    );

    return html`
      ${styles}
      <div class="tr-panel tr-share">
        <h3>Share Q3 roadmap</h3>
        <p id="tr-share-people" class="muted">People and teams</p>
        <div ${story.mount}></div>
      </div>
      <style>
        .tr-share h4,
        .tr-share .tr-chips,
        .tr-share .muted,
        .tr-share .tr-actions {
          margin: 0.5rem 1rem;
        }

        .tr-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0;
          list-style: none;
        }
      </style>
    `;
  },
};

interface DriveFolder {
  folders: string[];
  files: string[];
}

const drive: Record<string, DriveFolder> = {
  'My files': {
    folders: ['Invoices', 'Photos'],
    files: ['Budget 2026.xlsx', 'Notes.txt'],
  },
  'My files/Invoices': {
    folders: [],
    files: ['January.pdf', 'February.pdf', 'March.pdf'],
  },
  'My files/Photos': { folders: ['Lisbon trip'], files: ['Profile.jpg'] },
  'My files/Photos/Lisbon trip': {
    folders: [],
    files: ['Tram.jpg', 'Belem tower.jpg', 'Sunset.jpg'],
  },
  'Shared with me': { folders: ['Marketing'], files: ['Brand guide.pdf'] },
  'Shared with me/Marketing': {
    folders: [],
    files: ['Launch plan.docx', 'Logo.svg'],
  },
  Archive: { folders: [], files: ['2024 taxes.pdf', 'Old resume.docx'] },
};

type FolderState = 'loading' | 'loaded' | 'failed';

export const CloudDrive: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A cloud drive that loads the content of a folder when the user expands it. An item shows an expand arrow only when it has child items, so each folder starts with one "Loading…" child. `igcItemExpanding` starts the request and sets `loading`, which shows a progress ring in place of the arrow. When the content arrives, it takes the place of the "Loading…" item. The first request for Archive fails: the folder then shows an error with a button that tries again. A button in the `label` slot takes the `treeitem` role, so the keyboard reaches it as an item. A status message tells screen reader users when a folder has loaded.',
      },
    },
  },
  render: () => {
    const folders = new Map<string, FolderState>();
    let archiveFailed = false;
    let message = '';

    const load = async (path: string) => {
      const name = path.split('/').at(-1);

      folders.set(path, 'loading');
      message = `Loading ${name}…`;
      story.update();
      await delay(900);

      if (path === 'Archive' && !archiveFailed) {
        archiveFailed = true;
        folders.set(path, 'failed');
        message = `Could not load ${name}.`;
      } else {
        const { folders: subfolders, files } = drive[path];
        folders.set(path, 'loaded');
        message = `${name} has ${subfolders.length + files.length} items.`;
      }

      story.update();
    };

    const expanding = ({ detail }: CustomEvent<IgcTreeItemComponent>) => {
      const path = detail.value as string | undefined;

      if (path && path in drive && !folders.has(path)) {
        load(path);
      }
    };

    const contents = (path: string): unknown => {
      switch (folders.get(path)) {
        case 'loaded':
          return html`
            ${drive[path].folders.map((name) => folderItem(`${path}/${name}`))}
            ${drive[path].files.map(
              (name) => html`
                <igc-tree-item>
                  <span slot="label" class="tr-label">
                    <igc-icon name=${fileIcon(name)}></igc-icon>
                    ${name}
                  </span>
                </igc-tree-item>
              `
            )}
          `;
        case 'failed':
          return html`
            <igc-tree-item>
              <button
                slot="label"
                type="button"
                class="tr-retry"
                @click=${() => load(path)}
              >
                Could not load the folder. <span>Try again</span>
              </button>
            </igc-tree-item>
          `;
        default:
          return html`<igc-tree-item label="Loading…"></igc-tree-item>`;
      }
    };

    const folderItem = (path: string): TemplateResult => html`
      <igc-tree-item .value=${path} ?loading=${folders.get(path) === 'loading'}>
        <span slot="label" class="tr-label">
          ${folderIcons} ${path.split('/').at(-1)}
        </span>
        ${contents(path)}
      </igc-tree-item>
    `;

    const story = renderInto(
      () => html`
        <igc-tree
          aria-labelledby="tr-drive-title"
          @igcItemExpanding=${expanding}
        >
          ${['My files', 'Shared with me', 'Archive'].map(folderItem)}
        </igc-tree>
        <p class="sr-only" role="status">${message}</p>
      `
    );

    return html`
      ${styles}
      <div class="tr-panel">
        <h3 id="tr-drive-title" class="tr-label">
          <igc-icon name="cloud"></igc-icon> Drive
        </h3>
        <div ${story.mount}></div>
      </div>
      <style>
        .tr-retry {
          padding: 0;
          border: 0;
          background: none;
          color: inherit;
          font: inherit;
          cursor: pointer;
        }

        .tr-retry span {
          text-decoration: underline;
        }
      </style>
    `;
  },
};

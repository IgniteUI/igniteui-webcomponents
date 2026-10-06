import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';

import {
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcFileInputComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcListComponent,
  IgcSwitchComponent,
  IgcTooltipComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, storyStyles } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcFileInputComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcListComponent,
  IgcSwitchComponent,
  IgcTooltipComponent
);

registerMaterialIcons('person');
registerIconFromText(
  'robot',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/></svg>'
);

// region default
const metadata: Meta<IgcAvatarComponent> = {
  title: 'Avatar',
  component: 'igc-avatar',
  parameters: {
    docs: {
      description: {
        component:
          'An avatar component is used as a representation of a user identity\ntypically in a user profile.',
      },
    },
  },
  argTypes: {
    src: {
      type: 'string',
      description: 'The image source to use.',
      control: 'text',
    },
    alt: {
      type: 'string',
      description: 'Alternative text for the image.',
      control: 'text',
    },
    initials: {
      type: 'string',
      description: 'Initials to use as a fallback when no image is available.',
      control: 'text',
    },
    shape: {
      type: { name: 'enum', value: ['square', 'circle', 'rounded'] },
      description: 'The shape of the avatar.',
      options: ['square', 'circle', 'rounded'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'square' } },
    },
  },
  args: { shape: 'square' },
};

export default metadata;

interface IgcAvatarArgs {
  /** The image source to use. */
  src: string;
  /** Alternative text for the image. */
  alt: string;
  /** Initials to use as a fallback when no image is available. */
  initials: string;
  /** The shape of the avatar. */
  shape: 'square' | 'circle' | 'rounded';
}
type Story = StoryObj<IgcAvatarArgs>;

// endregion

type AvatarShape = IgcAvatarComponent['shape'];

interface AvatarContent {
  label: string;
  src?: string;
  alt?: string;
  initials?: string;
}

const imageUrl = (id: number, gender: 'men' | 'women' = 'men') =>
  `https://www.infragistics.com/angular-demos/assets/images/${gender}/${id}.jpg`;

/** A URL on a reserved domain that never resolves, so the image fails to load. */
const brokenUrl = (name: string) =>
  `https://photos.invalid/${encodeURIComponent(name)}.jpg`;

/** Returns the first letters of the first two words of `name`. */
const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();

const styles = html`
  ${storyStyles}
  <style>
    .av-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
    }

    .av-small {
      --ig-size: var(--ig-size-small);
    }

    .av-medium {
      --ig-size: var(--ig-size-medium);
    }

    .av-large {
      --ig-size: var(--ig-size-large);
    }

    .av-presence {
      position: relative;
      display: inline-flex;
    }

    .av-presence igc-badge {
      position: absolute;
      inset-block-end: 0;
      inset-inline-end: 0;
    }
  </style>
`;

export const Default: Story = {
  args: {
    src: imageUrl(12, 'women'),
    alt: 'Maria Garcia',
    initials: 'MG',
    shape: 'circle',
  },
  parameters: {
    docs: {
      description: {
        story:
          'An avatar with all three kinds of content. The image shows when `src` loads. Clear `src` in the controls panel to see `initials`, and clear `initials` too to see the icon in the default slot. The accessible name comes from `alt`, or from `initials` when `alt` is empty.',
      },
    },
  },
  render: ({ src, alt, initials, shape }) => html`
    <igc-avatar
      src=${ifDefined(src || undefined)}
      alt=${ifDefined(alt || undefined)}
      initials=${ifDefined(initials || undefined)}
      shape=${shape}
    >
      <igc-icon name="person"></igc-icon>
    </igc-avatar>
  `,
};

export const Appearance: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The three shapes for each kind of content, and the three sizes. The avatar has no size property: it follows `--ig-size`, which the size toolbar of Storybook also sets. Use `square` for an organization or a product, and `circle` for a person.',
      },
    },
  },
  render: () => {
    const shapes = ['square', 'rounded', 'circle'] as const;
    const sizes = [
      { label: 'Small', className: 'av-small' },
      { label: 'Medium', className: 'av-medium' },
      { label: 'Large', className: 'av-large' },
    ];
    const content: AvatarContent[] = [
      { label: 'Image', src: imageUrl(5), alt: 'James Wilson' },
      { label: 'Initials', initials: 'JW' },
      { label: 'Icon', alt: 'Guest' },
    ];

    const avatar = (
      { src, alt, initials }: AvatarContent,
      shape: AvatarShape,
      className = ''
    ) => html`
      <igc-avatar
        class=${className}
        shape=${shape}
        src=${ifDefined(src)}
        alt=${ifDefined(alt)}
        initials=${ifDefined(initials)}
      >
        ${src || initials ? nothing : html`<igc-icon name="person"></igc-icon>`}
      </igc-avatar>
    `;

    return html`
      ${styles}
      <style>
        .av-table {
          border-spacing: 2rem 1rem;
          text-align: center;
        }

        .av-table td {
          vertical-align: middle;
        }
      </style>
      <div style="overflow-x: auto">
        <table class="av-table">
          <caption>
            Shapes
          </caption>
          <thead>
            <tr>
              <td></td>
              ${shapes.map((shape) => html`<th scope="col">${shape}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${content.map(
              (entry) => html`
                <tr>
                  <th scope="row">${entry.label}</th>
                  ${shapes.map(
                    (shape) => html`<td>${avatar(entry, shape)}</td>`
                  )}
                </tr>
              `
            )}
          </tbody>
        </table>
        <table class="av-table">
          <caption>
            Sizes
          </caption>
          <thead>
            <tr>
              <td></td>
              ${sizes.map(({ label }) => html`<th scope="col">${label}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${content.map(
              (entry) => html`
                <tr>
                  <th scope="row">${entry.label}</th>
                  ${sizes.map(
                    ({ className }) =>
                      html`<td>${avatar(entry, 'circle', className)}</td>`
                  )}
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  },
};

interface Member {
  name: string;
  role: string;
  photo?: string;
  note: string;
  service?: boolean;
}

const team: Member[] = [
  {
    name: 'Maria Garcia',
    role: 'Product designer',
    photo: imageUrl(12, 'women'),
    note: 'Photo',
  },
  {
    name: 'James Wilson',
    role: 'Engineering manager',
    photo: imageUrl(5),
    note: 'Photo',
  },
  {
    name: 'Daniel Okafor',
    role: 'Backend engineer',
    note: 'No photo, so the initials show',
  },
  {
    name: 'Sofia Rossi',
    role: 'QA engineer',
    photo: brokenUrl('Sofia Rossi'),
    note: 'The photo fails to load, so the initials show',
  },
  {
    name: 'Build Bot',
    role: 'Service account',
    note: 'No photo and no initials, so the icon shows',
    service: true,
  },
];

export const Fallback: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A team directory. The avatar shows the first content that is available: the image, then the initials, then the icon in the default slot. While the image loads, the initials show behind it, so the layout does not move. A new `src` after an error makes the avatar try again: turn on the switch to break all photo URLs, and turn it off to restore them.',
      },
    },
  },
  render: () => {
    const outage = (event: Event) => {
      const toggle = event.currentTarget as IgcSwitchComponent;
      const list = toggle.nextElementSibling!;

      for (const avatar of list.querySelectorAll<IgcAvatarComponent>(
        'igc-avatar[data-photo]'
      )) {
        avatar.src = toggle.checked
          ? brokenUrl(avatar.alt ?? '')
          : avatar.dataset.photo;
      }
    };

    return html`
      ${styles}
      <div style="max-width: 36rem">
        <igc-switch @igcChange=${outage}>
          Simulate a photo service outage
        </igc-switch>
        <igc-list>
          ${team.map(
            ({ name, role, photo, note, service }) => html`
              <igc-list-item>
                <igc-avatar
                  slot="start"
                  shape="circle"
                  src=${ifDefined(photo)}
                  alt=${name}
                  initials=${ifDefined(service ? undefined : initialsOf(name))}
                  data-photo=${ifDefined(photo)}
                >
                  <igc-icon name="robot"></igc-icon>
                </igc-avatar>
                <span slot="title">${name}</span>
                <span slot="subtitle">${role}</span>
                <span slot="end" class="muted">${note}</span>
              </igc-list-item>
            `
          )}
        </igc-list>
      </div>
    `;
  },
};

export const ProfilePhoto: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The profile settings of an account. The initials follow the display name as you type. Select an image file to set `src` to an object URL, and remove the photo to fall back to the initials. Clear the name too, and the icon shows. The preview shows the same avatar at the sizes that the application uses: `--ig-avatar-size` sets a custom size for the profile, and `--ig-size` sets the size in the header and in a comment.',
      },
    },
  },
  render: () => {
    let objectUrl: string | undefined;

    const avatars = (element: Element) =>
      element
        .closest('.av-profile')!
        .querySelectorAll<IgcAvatarComponent>('igc-avatar');

    const removeButton = (element: Element) =>
      element.closest('.av-profile')!.querySelector('igc-button')!;

    const rename = ({ currentTarget, detail }: CustomEvent<string>) => {
      for (const avatar of avatars(currentTarget as Element)) {
        avatar.initials = initialsOf(detail);
        avatar.alt = detail.trim() || undefined;
      }
    };

    const setPhoto = (element: Element, file?: File) => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      objectUrl = file ? URL.createObjectURL(file) : undefined;

      for (const avatar of avatars(element)) {
        avatar.src = objectUrl;
      }

      removeButton(element).disabled = !file;
    };

    const upload = ({ currentTarget }: Event) => {
      const input = currentTarget as IgcFileInputComponent;
      setPhoto(input, input.files[0]);
    };

    const remove = ({ currentTarget }: Event) => {
      const button = currentTarget as IgcButtonComponent;
      const input = button
        .closest('.av-profile')!
        .querySelector('igc-file-input')!;

      input.value = '';
      setPhoto(button);
    };

    // Storybook can disconnect the story and connect it again, so each
    // connection gets its own URL.
    const connect = (profile?: Element) => {
      if (profile) {
        setPhoto(profile, profile.querySelector('igc-file-input')!.files[0]);
      } else if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = undefined;
      }
    };

    const profileAvatar = (className: string) => html`
      <igc-avatar
        class=${className}
        shape="circle"
        initials="MG"
        alt="Maria Garcia"
      >
        <igc-icon name="person"></igc-icon>
      </igc-avatar>
    `;

    return html`
      ${styles}
      <style>
        .av-profile {
          --av-hero-size: 7rem;

          display: grid;
          grid-template-columns: var(--av-hero-size) minmax(16rem, 24rem);
          justify-content: start;
          gap: 1.5rem 2rem;
          align-items: start;
        }

        .av-profile form {
          display: grid;
          gap: 1rem;
        }

        .av-profile form igc-button {
          justify-self: start;
        }

        .av-hero {
          --ig-avatar-size: var(--av-hero-size);
        }

        .av-preview {
          grid-column: 1 / -1;
          display: grid;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .av-preview h4 {
          margin: 0;
        }

        .av-appbar,
        .av-comment {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .av-appbar {
          justify-content: space-between;
          padding-block-end: 1rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }

        .av-comment {
          align-items: start;
        }

        .av-comment p {
          margin: 0;
        }
      </style>
      <div class="av-profile" ${ref(connect)}>
        ${profileAvatar('av-hero')}
        <form @submit=${(event: Event) => event.preventDefault()}>
          <igc-input
            label="Display name"
            value="Maria Garcia"
            @igcInput=${rename}
          ></igc-input>
          <igc-file-input
            label="Profile photo"
            accept="image/*"
            @igcChange=${upload}
          ></igc-file-input>
          <igc-button variant="outlined" disabled @click=${remove}>
            Remove photo
          </igc-button>
        </form>
        <section class="av-preview" aria-label="Preview">
          <h4>Preview</h4>
          <div class="av-appbar">
            <strong>Acme Workspace</strong>
            ${profileAvatar('av-medium')}
          </div>
          <div class="av-comment">
            ${profileAvatar('av-small')}
            <p>
              Looks good to me. I updated the spacing of the cards, please check
              the new version.
            </p>
          </div>
        </section>
      </div>
    `;
  },
};

type Presence = 'online' | 'away' | 'busy' | 'offline';

const presence: Record<
  Presence,
  { label: string; variant: IgcBadgeComponent['variant']; style?: string }
> = {
  online: { label: 'Online', variant: 'success' },
  away: { label: 'Away', variant: 'warning' },
  busy: { label: 'Do not disturb', variant: 'danger' },
  offline: {
    label: 'Offline',
    variant: 'primary',
    style: '--ig-badge-background-color: var(--ig-gray-500)',
  },
};

const contacts: {
  name: string;
  photo?: string;
  status: Presence;
  message: string;
  unread: number;
}[] = [
  {
    name: 'Maria Garcia',
    photo: imageUrl(12, 'women'),
    status: 'online',
    message: 'I sent you the new mockups.',
    unread: 3,
  },
  {
    name: 'Daniel Okafor',
    status: 'busy',
    message: 'In a meeting until 3 PM.',
    unread: 0,
  },
  {
    name: 'Aiko Tanaka',
    photo: imageUrl(21, 'women'),
    status: 'away',
    message: 'Back in 10 minutes.',
    unread: 1,
  },
  {
    name: 'James Wilson',
    photo: imageUrl(5),
    status: 'offline',
    message: 'Thanks, see you tomorrow!',
    unread: 0,
  },
];

export const Presence: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The contacts of a chat application. A dot badge shows the presence of each contact. The avatar clips its content and puts the initials over the default slot, so the badge goes next to the avatar in a wrapper with `position: relative`, and not inside the avatar. `outlined` separates the dot from the photo. The color alone means nothing to assistive technologies, so the subtitle also states the presence. The offline dot sets `--ig-badge-background-color`.',
      },
    },
  },
  render: () => html`
    ${styles}
    <igc-list style="max-width: 32rem">
      ${contacts.map(({ name, photo, status, message, unread }) => {
        const { label, variant, style } = presence[status];

        return html`
          <igc-list-item>
            <span slot="start" class="av-presence">
              <igc-avatar
                shape="circle"
                src=${ifDefined(photo)}
                alt=${name}
                initials=${initialsOf(name)}
              ></igc-avatar>
              <igc-badge
                dot
                outlined
                variant=${variant}
                style=${ifDefined(style)}
              ></igc-badge>
            </span>
            <span slot="title">${name}</span>
            <span slot="subtitle">${label} · ${message}</span>
            <igc-badge slot="end" variant="danger" ?hidden=${!unread}>
              ${unread}<span class="sr-only"> unread messages</span>
            </igc-badge>
          </igc-list-item>
        `;
      })}
    </igc-list>
  `,
};

const projects = [
  {
    name: 'Website redesign',
    members: [
      { name: 'Maria Garcia', photo: imageUrl(12, 'women') },
      { name: 'James Wilson', photo: imageUrl(5) },
      { name: 'Daniel Okafor' },
      { name: 'Aiko Tanaka', photo: imageUrl(21, 'women') },
      { name: 'Sofia Rossi' },
      { name: 'Liam Chen', photo: imageUrl(9) },
      { name: 'Emma Novak', photo: imageUrl(30, 'women') },
    ],
  },
  {
    name: 'Mobile app',
    members: [
      { name: 'Aiko Tanaka', photo: imageUrl(21, 'women') },
      { name: 'Liam Chen', photo: imageUrl(9) },
      { name: 'Noah Schmidt' },
    ],
  },
];

export const Group: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Project cards with the members in a stack. The stack shows four avatars, and the last avatar counts the other members. The `base` part gets a ring in the color of the card, so that the avatars stay apart where they overlap. The count is a button, so that keyboard users can reach the tooltip with the names of the other members. The `alt` of each avatar gives it its accessible name.',
      },
    },
  },
  render: () => {
    const visible = 4;

    return html`
      ${storyStyles}
      <style>
        .av-projects {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .av-project {
          display: grid;
          gap: 1rem;
          min-width: 16rem;
          padding: 1rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
          background: var(--ig-surface-500);
        }

        .av-project h4 {
          margin: 0;
        }

        .av-stack {
          display: flex;
          align-items: center;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .av-stack li + li {
          margin-inline-start: -0.75rem;
        }

        .av-stack igc-avatar::part(base) {
          box-shadow: 0 0 0 2px var(--ig-surface-500);
        }

        .av-more {
          display: inline-flex;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: none;
          cursor: pointer;
        }
      </style>
      <div class="av-projects">
        ${projects.map(({ name, members }, index) => {
          const shown = members.slice(0, visible);
          const others = members.slice(visible);
          const moreId = `av-more-${index}`;

          return html`
            <article class="av-project" aria-label=${name}>
              <h4>${name}</h4>
              <ul class="av-stack" aria-label="Members">
                ${shown.map(
                  ({ name: member, photo }) => html`
                    <li>
                      <igc-avatar
                        shape="circle"
                        src=${ifDefined(photo)}
                        alt=${member}
                        initials=${initialsOf(member)}
                      ></igc-avatar>
                    </li>
                  `
                )}
                ${
                  others.length
                    ? html`
                        <li>
                          <button
                            id=${moreId}
                            class="av-more"
                            aria-label="${others.length} more members"
                          >
                            <igc-avatar
                              shape="circle"
                              initials="+${others.length}"
                              aria-hidden="true"
                            ></igc-avatar>
                          </button>
                          <igc-tooltip anchor=${moreId}>
                            ${others.map(({ name: member }) => member).join(', ')}
                          </igc-tooltip>
                        </li>
                      `
                    : ''
                }
              </ul>
              <span class="muted">${members.length} members</span>
            </article>
          `;
        })}
      </div>
    `;
  },
};

/** Background and text pairs with a contrast ratio above 4.5:1. */
const avatarColors = [
  ['#1e3a8a', '#ffffff'],
  ['#065f46', '#ffffff'],
  ['#9d174d', '#ffffff'],
  ['#7c2d12', '#ffffff'],
  ['#5b21b6', '#ffffff'],
  ['#fde68a', '#78350f'],
  ['#bae6fd', '#0c4a6e'],
  ['#d9f99d', '#365314'],
];

/** Picks the same color pair for the same name, with an FNV-1a hash. */
const colorsOf = (name: string) => {
  let hash = 2166136261;

  for (const char of name) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  }

  const [background, color] = avatarColors[hash % avatarColors.length];
  return `--ig-avatar-background: ${background}; --ig-avatar-color: ${color}`;
};

export const Styling: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'CSS custom properties change the colors and the shape. The people get a color from a hash of the name, through `--ig-avatar-background` and `--ig-avatar-color`, so that the same person always has the same color. Each pair has a contrast ratio above 4.5:1. The workspace switcher uses the `rounded` shape with `--ig-avatar-border-radius`, and a ring on the `base` part marks the active workspace.',
      },
    },
  },
  render: () => {
    const names = [
      'Daniel Okafor',
      'Sofia Rossi',
      'Noah Schmidt',
      'Priya Patel',
      'Omar Haddad',
      'Aiko Tanaka',
      'Emma Novak',
      'Grace Okoro',
    ];

    const workspaces = [
      { name: 'Acme Design', initials: 'AD', color: '#4338ca', active: true },
      { name: 'Northwind Sales', initials: 'NS', color: '#0f766e' },
      { name: 'Open Source', initials: 'OS', color: '#b91c1c' },
    ];

    return html`
      ${styles}
      <style>
        .av-styling {
          display: grid;
          gap: 2rem;
        }

        .av-styling h4 {
          margin: 0 0 0.75rem;
        }

        .av-people igc-avatar::part(initials) {
          font-weight: 600;
        }

        .av-workspaces {
          display: flex;
          gap: 0.75rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .av-workspaces igc-avatar {
          --ig-avatar-border-radius: 12px;
          --ig-avatar-color: #ffffff;
        }

        .av-workspaces [aria-current] igc-avatar::part(base) {
          box-shadow:
            0 0 0 2px var(--ig-surface-500),
            0 0 0 4px var(--ig-primary-500);
        }

        .av-workspaces a {
          display: inline-flex;
          border-radius: 12px;
          text-decoration: none;
        }
      </style>
      <div class="av-styling">
        <section>
          <h4>Colors from the name</h4>
          <div class="av-row av-people">
            ${names.map(
              (name) => html`
                <igc-avatar
                  shape="circle"
                  initials=${initialsOf(name)}
                  alt=${name}
                  style=${colorsOf(name)}
                ></igc-avatar>
              `
            )}
          </div>
        </section>
        <nav aria-label="Workspaces">
          <h4>Workspace switcher</h4>
          <ul class="av-workspaces">
            ${workspaces.map(
              ({ name, initials, color, active }) => html`
                <li>
                  <a
                    href="#"
                    aria-label=${name}
                    aria-current=${ifDefined(active ? 'page' : undefined)}
                    @click=${(event: Event) => event.preventDefault()}
                  >
                    <igc-avatar
                      shape="rounded"
                      initials=${initials}
                      aria-hidden="true"
                      style="--ig-avatar-background: ${color}"
                    ></igc-avatar>
                  </a>
                </li>
              `
            )}
          </ul>
        </nav>
      </div>
    `;
  },
};

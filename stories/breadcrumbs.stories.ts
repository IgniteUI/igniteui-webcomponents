import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcBreadcrumbComponent,
  IgcBreadcrumbsComponent,
  IgcIconComponent,
  registerIconFromText,
  defineComponents,
} from 'igniteui-webcomponents';
import { html } from 'lit';

defineComponents(IgcBreadcrumbsComponent, IgcIconComponent);
registerIconFromText(
  'biking',
  '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="biking" class="svg-inline--fa fa-biking fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M400 96a48 48 0 1 0-48-48 48 48 0 0 0 48 48zm-4 121a31.9 31.9 0 0 0 20 7h64a32 32 0 0 0 0-64h-52.78L356 103a31.94 31.94 0 0 0-40.81.68l-112 96a32 32 0 0 0 3.08 50.92L288 305.12V416a32 32 0 0 0 64 0V288a32 32 0 0 0-14.25-26.62l-41.36-27.57 58.25-49.92zm116 39a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64zM128 256a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64z"/></svg>'
);
registerIconFromText(
  'notification',
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path> <path d="M13.73 21a2 2 0 0 1-3.46 0"></path> </svg>'
);
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

function markCurrent(anchor: HTMLAnchorElement): void {
  const allAnchors = anchor
    .closest(IgcBreadcrumbsComponent.tagName)!
    .querySelectorAll<HTMLAnchorElement>('a');

  for (const a of allAnchors) {
    a.closest(IgcBreadcrumbComponent.tagName)!.current = false;
  }

  anchor.closest(IgcBreadcrumbComponent.tagName)!.current = true;
}

function attachBreadcrumbHandlers(root: HTMLElement): void {
  for (const anchor of root.querySelectorAll<HTMLAnchorElement>(
    'igc-breadcrumbs a'
  )) {
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      markCurrent(event.currentTarget as HTMLAnchorElement);
    });
  }
}

export const Default: Story = {
  play: ({ canvasElement }) => attachBreadcrumbHandlers(canvasElement),
  parameters: {
    docs: {
      description: {
        story:
          'Basic breadcrumb navigation. Click a link to move the `current` state to that item.',
      },
    },
  },
  render: () => html`
    <nav aria-label="Breadcrumb">
      <igc-breadcrumbs>
        <igc-breadcrumb>
          <a href="#">Home</a>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="#">Products</a>
        </igc-breadcrumb>
        <igc-breadcrumb current>
          <a href="#">Laptop</a>
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </nav>
  `,
};

export const CustomSeparator: Story = {
  play: ({ canvasElement }) => attachBreadcrumbHandlers(canvasElement),
  parameters: {
    docs: {
      description: {
        story:
          'Breadcrumbs with a custom separator provided via the `separator` slot on each `igc-breadcrumb` item.',
      },
    },
  },
  render: () => html`
    <nav aria-label="Breadcrumb">
      <igc-breadcrumbs>
        <igc-breadcrumb>
          <a href="#">Home</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="#">Category</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
        <igc-breadcrumb current>
          <a href="#">Item</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </nav>
  `,
};

export const WithPrefixAndSuffix: Story = {
  play: ({ canvasElement }) => attachBreadcrumbHandlers(canvasElement),
  parameters: {
    docs: {
      description: {
        story:
          'Breadcrumbs using the `prefix` and `suffix` slots to place additional content around each breadcrumb label.',
      },
    },
  },
  render: () => html`
    <nav aria-label="Breadcrumb with Emojis">
      <igc-breadcrumbs>
        <igc-breadcrumb>
          <span slot="prefix">🏠</span>
          <a href="#">Home</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="#">Products</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
        <igc-breadcrumb current>
          <a href="#">Laptop</a>
          <span slot="separator">/</span>
          <span slot="suffix">💻</span>
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </nav>
    <br />
    <nav aria-label="Breadcrumb with Icons">
      <igc-breadcrumbs>
        <igc-breadcrumb>
          <igc-icon slot="prefix" name="biking"></igc-icon>
          <a href="#">Home</a>
          <span slot="separator">/</span>
          <igc-icon slot="suffix" name="biking"></igc-icon>
        </igc-breadcrumb>
        <igc-breadcrumb current>
          <a href="#">Products</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
        <igc-breadcrumb disabled>
          <igc-icon slot="prefix" name="notification"></igc-icon>
          <a href="#">Messages</a>
          <span slot="separator">/</span>
          <igc-icon slot="suffix" name="notification"></igc-icon>
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </nav>
  `,
};

export const LongTrail: Story = {
  play: ({ canvasElement }) => attachBreadcrumbHandlers(canvasElement),
  parameters: {
    docs: {
      description: {
        story:
          'A longer breadcrumb trail demonstrating wrapping behavior when the list overflows the container width.',
      },
    },
  },
  render: () => html`
    <nav aria-label="Breadcrumb" style="max-width: 500px">
      <igc-breadcrumbs>
        <igc-breadcrumb><a href="#">Home</a></igc-breadcrumb>
        <igc-breadcrumb><a href="#">Electronics</a></igc-breadcrumb>
        <igc-breadcrumb><a href="#">Computers</a></igc-breadcrumb>
        <igc-breadcrumb><a href="#">Laptops</a></igc-breadcrumb>
        <igc-breadcrumb><a href="#">Gaming Laptops</a></igc-breadcrumb>
        <igc-breadcrumb current
          ><a href="#">ASUS ROG Strix G16</a></igc-breadcrumb
        >
      </igc-breadcrumbs>
    </nav>
  `,
};

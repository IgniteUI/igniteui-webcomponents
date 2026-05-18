import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcBreadcrumbComponent,
  IgcBreadcrumbsComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html } from 'lit';

defineComponents(IgcBreadcrumbsComponent);

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
};

export default metadata;

type Story = StoryObj;

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
    <nav aria-label="Breadcrumb">
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
          <span slot="prefix">💻</span>
          <a href="#">Laptop</a>
          <span slot="separator">/</span>
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

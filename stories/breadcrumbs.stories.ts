import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  type IgcBreadcrumbComponent,
  IgcBreadcrumbsComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html } from 'lit';

defineComponents(IgcBreadcrumbsComponent);

// region default
const metadata: Meta<IgcBreadcrumbsComponent> = {
  title: 'Breadcrumbs',
  component: 'igc-breadcrumbs',
  parameters: { docs: { description: { component: '' } } },
};

export default metadata;

type Story = StoryObj;

// endregion

function setBreadCrumpCurrentState(anchor: HTMLAnchorElement, state: boolean) {
  (anchor.parentElement as IgcBreadcrumbComponent).current = state;
}

function breadcrumbsStoryState() {
  const anchors = document.querySelectorAll('a');

  const handler = (event: Event) => {
    const current = event.target as HTMLAnchorElement;
    event.preventDefault();

    for (const anchor of anchors) {
      setBreadCrumpCurrentState(anchor, false);
    }
    setBreadCrumpCurrentState(current, true);
  };

  for (const anchor of anchors) {
    anchor.addEventListener('click', handler);
  }
}

export const Default: Story = {
  play: breadcrumbsStoryState,
  render: () => html`
    <div>
      <p>Default look</p>
      <igc-breadcrumbs>
        <igc-breadcrumb>
          <a href="#grandparent">Grandparent</a>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="#parent">Parent</a>
        </igc-breadcrumb>
        <igc-breadcrumb current>
          <a href="#child">Child</a>
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </div>

    <div>
      <p>Custom separators</p>
      <igc-breadcrumbs>
        <igc-breadcrumb>
          <a href="#">First</a>
          <span slot="separator">👉</span>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="#">Second</a>
          <span slot="separator">👉</span>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="#">Third</a>
          <span slot="separator">👉</span>
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </div>
    <div>
      <p>Custom separators & slotted items in breadcrumbs</p>
      <igc-breadcrumbs>
        <igc-breadcrumb>
          <span slot="prefix">💖</span>
          <a href="#">First</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <a href="#">Second</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
        <igc-breadcrumb>
          <span slot="prefix">⚠️</span>
          <span slot="suffix">⚠️</span>
          <a href="#">Third</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
      </igc-breadcrumbs>
    </div>
  `,
};

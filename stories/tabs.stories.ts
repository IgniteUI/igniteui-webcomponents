import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { range } from 'lit/directives/range.js';

import {
  IgcTabComponent,
  IgcTabsComponent,
  defineComponents,
  registerIcon,
  registerIconFromText,
} from 'igniteui-webcomponents';

defineComponents(IgcTabsComponent);

// region default
const metadata: Meta<IgcTabsComponent> = {
  title: 'Tabs',
  component: 'igc-tabs',
  parameters: {
    docs: {
      description: {
        component:
          '`IgcTabsComponent` provides a wizard-like workflow by dividing content into logical tabs.\n\nThe tabs component allows the user to navigate between multiple tabs.\nIt supports keyboard navigation and provides API methods to control the selected tab.',
      },
    },
    actions: { handles: ['igcChange'] },
  },
  argTypes: {
    alignment: {
      type: '"start" | "end" | "center" | "justify"',
      description: 'Sets the alignment for the tab headers',
      options: ['start', 'end', 'center', 'justify'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'start' } },
    },
    activation: {
      type: '"auto" | "manual"',
      description:
        'Determines the tab activation. When set to auto,\nthe tab is instantly selected while navigating with the Left/Right Arrows, Home or End keys\nand the corresponding panel is displayed.\nWhen set to manual, the tab is only focused. The selection happens after pressing Space or Enter.',
      options: ['auto', 'manual'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'auto' } },
    },
  },
  args: { alignment: 'start', activation: 'auto' },
};

export default metadata;

interface IgcTabsArgs {
  /** Sets the alignment for the tab headers */
  alignment: 'start' | 'end' | 'center' | 'justify';
  /**
   * Determines the tab activation. When set to auto,
   * the tab is instantly selected while navigating with the Left/Right Arrows, Home or End keys
   * and the corresponding panel is displayed.
   * When set to manual, the tab is only focused. The selection happens after pressing Space or Enter.
   */
  activation: 'auto' | 'manual';
}
type Story = StoryObj<IgcTabsArgs>;

// endregion

const icons = [
  {
    name: 'home',
    url: 'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg',
  },
  {
    name: 'search',
    url: 'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg',
  },
  {
    name: 'favorite',
    url: 'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_favorite_24px.svg',
  },
];
await Promise.all(icons.map(async (each) => registerIcon(each.name, each.url)));

function remove({ target }: PointerEvent) {
  (target as Element).closest(IgcTabComponent.tagName)!.remove();
}

const removableTabs = Array.from(range(1, 11)).map(
  (i) => html`
    <igc-tab>
      <div slot="label">Item ${i}</div>
      <igc-icon
        @click=${remove}
        slot="suffix"
        collection="internal"
        name="chip_cancel"
      ></igc-icon>
      <h2>Content for tab ${i}</h2>
    </igc-tab>
  `
);

function* lipsums(paragraphs = 3, repeats = 3) {
  const lipsum =
    'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ducimus aliquid voluptatibus molestias laboriosam, illo totam eaque amet iusto officiis accusamus in deleniti beatae harum culpa laudantium accusantium natus nisi eligendi.';

  for (let i = 0; i < paragraphs; i++) {
    yield html`<p>${lipsum.repeat(repeats)}</p>`;
  }
}

const manyTabs = Array.from(range(1, 31)).map((idx) => {
  switch (idx) {
    case 2:
      return html`
        <igc-tab>
          <div slot="label">
            I am a very long tab header that will try to take as much space as
            possible.
          </div>
          <h2>Content 3</h2>
          <div>${Array.from(lipsums(3, 5))}</div>
        </igc-tab>
      `;
    case 10:
      return html`
        <igc-tab>
          <div slot="label">Another long tab header</div>
          <h2>Content 11</h2>
          ${Array.from(lipsums(3, 5))}
        </igc-tab>
      `;
    default:
      return html`
        <igc-tab ?disabled=${idx === 3}>
          <div slot="label">Item ${idx}</div>
          <h2>Content ${idx}</h2>
          ${Array.from(lipsums())}
        </igc-tab>
      `;
  }
});

export const Basic: Story = {
  render: (args) => html`
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      ${Array.from(range(1, 4)).map(
        (idx) => html`
          <igc-tab>
            <div slot="label">Tab ${idx}</div>
            <h2>Content for tab ${idx}</h2>
            <p>${Array.from(lipsums())}</p>
            <igc-button>Read more</igc-button>
          </igc-tab>
        `
      )}
    </igc-tabs>
  `,
};

export const Variants: Story = {
  render: (args) => html`
    <h2>Tab headers with icon only</h2>
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      <igc-tab>
        <igc-icon name="home" slot="label"></igc-icon>
        <h3>Content 1</h3>
        ${Array.from(lipsums(4, 4))}
      </igc-tab>
      <igc-tab>
        <igc-icon name="search" slot="label"></igc-icon>
        <h3>Content 2</h3>
        ${Array.from(lipsums(3, 4))}
      </igc-tab>
      <igc-tab disabled>
        <igc-icon name="favorite" slot="label"></igc-icon>
        <h3>Content 3</h3>
      </igc-tab>
    </igc-tabs>

    <h2>Tab headers with icon and text</h2>
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      <igc-tab>
        <igc-icon name="home" slot="label"></igc-icon>
        <div slot="label">Test</div>
        <h3>Content 1</h3>
        ${Array.from(lipsums(3, 4))}
      </igc-tab>
      <igc-tab>
        <igc-icon name="search" slot="label"></igc-icon>
        <div slot="label">Test</div>
        <h3>Content 2</h3>
        ${Array.from(lipsums(3, 6))}
      </igc-tab>
      <igc-tab disabled>
        <igc-icon name="favorite" slot="label"></igc-icon>
        <div slot="label">Test</div>
        <h3>Content 3</h3>
      </igc-tab>
    </igc-tabs>

    <h2>Tab headers with icons into prefix and suffix slots and text</h2>
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      <igc-tab>
        <igc-icon name="home" slot="prefix"></igc-icon>
        <span slot="label">Label with suffix/prefix</span>
        <h3>Content 1</h3>
        ${Array.from(lipsums(3, 5))}
        <igc-icon name="home" slot="suffix"></igc-icon>
      </igc-tab>
      <igc-tab>
        <igc-icon name="search" slot="prefix"></igc-icon>
        <span slot="label">Label with suffix/prefix</span>
        <h3>Content 2</h3>
        ${Array.from(lipsums())}
        <igc-icon name="search" slot="suffix"></igc-icon>
      </igc-tab>
      <igc-tab>
        <igc-icon name="favorite" slot="prefix"></igc-icon>
        <span slot="label">Label with suffix/prefix</span>
        <h3>Content 3</h3>
        ${Array.from(lipsums(3, 6))}
        <igc-icon name="favorite" slot="suffix"></igc-icon>
      </igc-tab>
    </igc-tabs>

    <h2>Having too many tabs will show up the scroll buttons</h2>
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      ${manyTabs}
    </igc-tabs>
  `,
};

export const Strip: Story = {
  render: (args) => html`
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      ${Array.from(range(1, 11)).map(
        (i) => html` <igc-tab label=${i}></igc-tab> `
      )}
    </igc-tabs>
  `,
};

export const Removable: Story = {
  render: (args) => html`
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      ${removableTabs}
    </igc-tabs>
  `,
};

const logos = [
  {
    name: 'vite',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 257"><defs><linearGradient id="logosVitejs0" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41d1ff"/><stop offset="100%" stop-color="#bd34fe"/></linearGradient><linearGradient id="logosVitejs1" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#ffea83"/><stop offset="8.333%" stop-color="#ffdd35"/><stop offset="100%" stop-color="#ffa800"/></linearGradient></defs><path fill="url(#logosVitejs0)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.5 6.5 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62"/><path fill="url(#logosVitejs1)" d="M185.432.063L96.44 17.501a3.27 3.27 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113"/></svg>',
  },
  {
    name: 'webpack',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="0.89em" height="1em" viewBox="0 0 256 290"><path fill="#fff" d="m128 .048l128 72.405V217.31l-128 72.405L0 217.31V72.453z"/><path fill="#8ed6fb" d="m233.153 212.287l-100.902 57.14V224.99l62.889-34.632zm6.907-6.231V86.654l-36.902 21.3v76.8zm-217.6 6.23l100.903 57.094v-44.438l-62.889-34.584zm-6.907-6.23V86.654l36.903 21.3v76.8zm4.3-127.13l103.51-58.543v42.99L57.045 99.84l-.532.29zm215.86 0L132.251 20.382v42.99l66.27 36.515l.531.29z"/><path fill="#1c78c0" d="m123.363 214.847l-62.02-34.15v-67.574l62.02 35.792zm8.888 0l62.02-34.101v-67.623l-62.02 35.792zM65.497 105.298l62.31-34.246l62.26 34.246l-62.26 35.937z"/></svg>',
  },
  {
    name: 'esbuild',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><circle cx="128" cy="128" r="128" fill="#ffcf00"/><path fill="#191919" d="M69.285 58.715L138.571 128l-69.286 69.285l-16.97-16.97L104.629 128L52.315 75.685zm76.8 0L215.371 128l-69.286 69.285l-16.97-16.97L181.429 128l-52.314-52.315z"/></svg>',
  },
  {
    name: 'angular',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="0.95em" height="1em" viewBox="0 0 256 271"><defs><linearGradient id="logosAngularIcon0" x1="25.071%" x2="96.132%" y1="90.929%" y2="55.184%"><stop offset="0%" stop-color="#e40035"/><stop offset="24%" stop-color="#f60a48"/><stop offset="35.2%" stop-color="#f20755"/><stop offset="49.4%" stop-color="#dc087d"/><stop offset="74.5%" stop-color="#9717e7"/><stop offset="100%" stop-color="#6c00f5"/></linearGradient><linearGradient id="logosAngularIcon1" x1="21.863%" x2="68.367%" y1="12.058%" y2="68.21%"><stop offset="0%" stop-color="#ff31d9"/><stop offset="100%" stop-color="#ff5be1" stop-opacity="0"/></linearGradient></defs><path fill="url(#logosAngularIcon0)" d="m256 45.179l-9.244 145.158L158.373 0zm-61.217 187.697l-66.782 38.105l-66.784-38.105L74.8 199.958h106.4zM128.001 72.249l34.994 85.076h-69.99zM9.149 190.337L0 45.179L97.627 0z"/><path fill="url(#logosAngularIcon1)" d="m256 45.179l-9.244 145.158L158.373 0zm-61.217 187.697l-66.782 38.105l-66.784-38.105L74.8 199.958h106.4zM128.001 72.249l34.994 85.076h-69.99zM9.149 190.337L0 45.179L97.627 0z"/></svg>',
  },
  {
    name: 'react',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1.13em" height="1em" viewBox="0 0 256 228"><path fill="#00d8ff" d="M210.483 73.824a172 172 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171 171 0 0 0-6.375 5.848a156 156 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a171 171 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a146 146 0 0 0 6.921 2.165a168 168 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a146 146 0 0 0 5.342-4.923a168 168 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145 145 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844m-6.365 70.984q-2.102.694-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14m-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a157 157 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345q.785 3.162 1.386 6.193M87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a157 157 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a135 135 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94M50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a135 135 0 0 1-6.318-1.979m12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144 144 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160 160 0 0 1-1.76-7.887m110.427 27.268a348 348 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381 381 0 0 0-7.365-13.322m-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322 322 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18M82.802 87.83a323 323 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a322 322 0 0 0-7.848 12.897m8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321 321 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147m37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486m52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382 382 0 0 0 7.859-13.026a347 347 0 0 0 7.425-13.565m-16.898 8.101a359 359 0 0 1-12.281 19.815a329 329 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310 310 0 0 1-12.513-19.846h.001a307 307 0 0 1-10.923-20.627a310 310 0 0 1 10.89-20.637l-.001.001a307 307 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329 329 0 0 1 12.335 19.695a359 359 0 0 1 11.036 20.54a330 330 0 0 1-11 20.722m22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026q-.518 2.504-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a161 161 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3M128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86"/></svg>',
  },
  {
    name: 'vue',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1.16em" height="1em" viewBox="0 0 256 221"><path fill="#41b883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0z"/><path fill="#41b883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0z"/><path fill="#35495e" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0z"/></svg>',
  },
  {
    name: 'svelte',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="0.84em" height="1em" viewBox="0 0 256 308"><path fill="#ff3e00" d="M239.682 40.707C211.113-.182 154.69-12.301 113.895 13.69L42.247 59.356a82.2 82.2 0 0 0-37.135 55.056a86.57 86.57 0 0 0 8.536 55.576a82.4 82.4 0 0 0-12.296 30.719a87.6 87.6 0 0 0 14.964 66.244c28.574 40.893 84.997 53.007 125.787 27.016l71.648-45.664a82.18 82.18 0 0 0 37.135-55.057a86.6 86.6 0 0 0-8.53-55.577a82.4 82.4 0 0 0 12.29-30.718a87.57 87.57 0 0 0-14.963-66.244"/><path fill="#fff" d="M106.889 270.841c-23.102 6.007-47.497-3.036-61.103-22.648a52.7 52.7 0 0 1-9.003-39.85a50 50 0 0 1 1.713-6.693l1.35-4.115l3.671 2.697a92.5 92.5 0 0 0 28.036 14.007l2.663.808l-.245 2.659a16.07 16.07 0 0 0 2.89 10.656a17.14 17.14 0 0 0 18.397 6.828a15.8 15.8 0 0 0 4.403-1.935l71.67-45.672a14.92 14.92 0 0 0 6.734-9.977a15.92 15.92 0 0 0-2.713-12.011a17.16 17.16 0 0 0-18.404-6.832a15.8 15.8 0 0 0-4.396 1.933l-27.35 17.434a52.3 52.3 0 0 1-14.553 6.391c-23.101 6.007-47.497-3.036-61.101-22.649a52.68 52.68 0 0 1-9.004-39.849a49.43 49.43 0 0 1 22.34-33.114l71.664-45.677a52.2 52.2 0 0 1 14.563-6.398c23.101-6.007 47.497 3.036 61.101 22.648a52.7 52.7 0 0 1 9.004 39.85a51 51 0 0 1-1.713 6.692l-1.35 4.116l-3.67-2.693a92.4 92.4 0 0 0-28.037-14.013l-2.664-.809l.246-2.658a16.1 16.1 0 0 0-2.89-10.656a17.14 17.14 0 0 0-18.398-6.828a15.8 15.8 0 0 0-4.402 1.935l-71.67 45.674a14.9 14.9 0 0 0-6.73 9.975a15.9 15.9 0 0 0 2.709 12.012a17.16 17.16 0 0 0 18.404 6.832a15.8 15.8 0 0 0 4.402-1.935l27.345-17.427a52.2 52.2 0 0 1 14.552-6.397c23.101-6.006 47.497 3.037 61.102 22.65a52.68 52.68 0 0 1 9.003 39.848a49.45 49.45 0 0 1-22.34 33.12l-71.664 45.673a52.2 52.2 0 0 1-14.563 6.398"/></svg>',
  },
].forEach(({ name, svg }) => registerIconFromText(name, svg, 'logos'));

export const NestedTabs: Story = {
  args: {
    alignment: 'justify',
  },
  render: (args) => html`
    <style>
      #frontend {
        max-width: 75dvw;
        margin: 0 auto;
      }
      .nested {
        padding: 1rem;
        background: var(--ig-gray-50);
      }
    </style>
    <igc-tabs
      id="frontend"
      .alignment=${args.alignment}
      .activation=${args.activation}
    >
      <igc-tab label="Build tools" id="build-tools">
        <igc-tabs
          class="nested"
          .alignment=${args.alignment}
          .activation=${args.activation}
        >
          <igc-tab id="vite">
            <igc-icon
              slot="label"
              title="Vite"
              name="vite"
              collection="logos"
            ></igc-icon>
            <p>
              Vite (French: [vit], like "veet") is a local development server
              written by Evan You, the creator of Vue.js, and used by default by
              Vue and for React project templates. It has support for TypeScript
              and JSX. It uses Rollup and esbuild internally for bundling.
            </p>
            <igc-button
              variant="outlined"
              href="https://en.wikipedia.org/wiki/Vite_(software)"
              target="_blank"
              >Read more</igc-button
            >
          </igc-tab>

          <igc-tab id="webpack">
            <igc-icon
              slot="label"
              title="Webpack"
              name="webpack"
              collection="logos"
            ></igc-icon>
            <p>
              Webpack is a free and open-source module bundler for JavaScript.
              It is made primarily for JavaScript, but it can transform
              front-end assets such as HTML, CSS, and images if the
              corresponding loaders are included. Webpack takes modules with
              dependencies and generates static assets representing those
              modules.
            </p>
            <igc-button
              variant="outlined"
              href="https://en.wikipedia.org/wiki/Webpack"
              target="_blank"
              >Read more</igc-button
            >
          </igc-tab>

          <igc-tab id="esbuild">
            <igc-icon
              slot="label"
              title="ESBuild"
              name="esbuild"
              collection="logos"
            ></igc-icon>
            <p>
              esbuild is a free and open-source module bundler and minifier for
              JavaScript and CSS written by Evan Wallace.Written in Go instead
              of JavaScript, esbuild claims to be "10 to 100 times" faster than
              other bundlers by using parallelism and shared memory usage.It
              supports TypeScript, JSX, tree-shaking and is extensible through
              plugins.
            </p>
            <igc-button
              variant="outlined"
              href="https://en.wikipedia.org/wiki/Esbuild"
              target="_blank"
              >Read more</igc-button
            >
          </igc-tab>
        </igc-tabs>
      </igc-tab>

      <igc-tab label="Front-end frameworks" id="frameworks">
        <igc-tabs
          class="nested"
          .alignment=${args.alignment}
          .activation=${args.activation}
        >
          <igc-tab id="angular">
            <igc-icon
              slot="label"
              title="Angular"
              name="angular"
              collection="logos"
            ></igc-icon>
            <p>
              Angular (also referred to as "Angular 2+") is a TypeScript-based
              free and open-source single-page web application framework. It is
              developed by Google and by a community of individuals and
              corporations. Angular is a complete rewrite from the same team
              that built AngularJS. The Angular ecosystem consists of a diverse
              group of over 1.7 million developers, library authors, and content
              creators. According to the Stack Overflow Developer Survey,
              Angular is one of the most commonly used web frameworks.
            </p>
            <igc-button
              variant="outlined"
              href="https://en.wikipedia.org/wiki/Angular_(web_framework)"
              target="_blank"
              >Read more</igc-button
            >
          </igc-tab>

          <igc-tab id="react">
            <igc-icon
              slot="label"
              title="React"
              name="react"
              collection="logos"
            ></igc-icon>
            <p>
              React (also known as React.js or ReactJS) is a free and
              open-source front-end JavaScript library for building user
              interfaces based on components by Facebook Inc. It is maintained
              by Meta (formerly Facebook) and a community of individual
              developers and companies.
            </p>
            <p>
              React can be used to develop single-page, mobile, or
              server-rendered applications with frameworks like Next.js. Because
              React is only concerned with the user interface and rendering
              components to the DOM, React applications often rely on libraries
              for routing and other client-side functionality. A key advantage
              of React is that it only rerenders those parts of the page that
              have changed, avoiding unnecessary re-rendering of unchanged DOM
              elements. It was first launched on 29 May 2013.
            </p>
            <igc-button
              variant="outlined"
              href="https://en.wikipedia.org/wiki/React_(JavaScript_library)"
              target="_blank"
              >Read more</igc-button
            >
          </igc-tab>

          <igc-tab id="vue">
            <igc-icon
              slot="label"
              title="Vue"
              name="vue"
              collection="logos"
            ></igc-icon>
            <p>
              Vue.js (commonly referred to as Vue; pronounced "view") is an
              open-source model-view-viewmodel front end JavaScript framework
              for building user interfaces and single-page applications. It was
              created by Evan You and is maintained by him and the rest of the
              active core team members.
            </p>
            <igc-button
              variant="outlined"
              href="https://en.wikipedia.org/wiki/Vue.js"
              target="_blank"
              >Read more</igc-button
            >
          </igc-tab>

          <igc-tab id="svelte">
            <igc-icon
              slot="label"
              title="Svelte"
              name="svelte"
              collection="logos"
            ></igc-icon>
            <p>
              Svelte is a free and open-source component-based front-end
              software framework, and language created by Rich Harris and
              maintained by the Svelte core team members.
            </p>
            <p>
              Svelte is not a monolithic JavaScript library imported by
              applications: instead, Svelte compiles HTML templates to
              specialized code that manipulates the DOM directly, which may
              reduce the size of transferred files and give better client
              performance. Application code is also processed by the compiler,
              inserting calls to automatically recompute data and re-render UI
              elements when the data they depend on is modified. This also
              avoids the overhead associated with runtime intermediate
              representations, such as virtual DOM, unlike traditional
              frameworks (such as React and Vue) which carry out the bulk of
              their work at runtime, i.e. in the browser.
            </p>
            <igc-button
              variant="outlined"
              href="https://en.wikipedia.org/wiki/Svelte"
              target="_blank"
              >Read more</igc-button
            >
          </igc-tab>
        </igc-tabs>
      </igc-tab>
    </igc-tabs>
  `,
};

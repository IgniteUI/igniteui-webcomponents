import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardActionsComponent,
  IgcCardComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcChipComponent,
  IgcDividerComponent,
  IgcExpansionPanelComponent,
  IgcHighlightComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  IgcListComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardActionsComponent,
  IgcCardComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcChipComponent,
  IgcDividerComponent,
  IgcExpansionPanelComponent,
  IgcHighlightComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  IgcListComponent,
  IgcListHeaderComponent,
  IgcListItemComponent
);

// region default
const metadata: Meta<IgcHighlightComponent> = {
  title: 'Highlight',
  component: 'igc-highlight',
  parameters: {
    docs: {
      description: {
        component:
          'The highlight component provides efficient searching and highlighting of text\nprojected into it via its default slot. It uses the native CSS Custom Highlight API\nto apply highlight styles to matched text nodes without modifying the DOM.\n\nThe component supports case-sensitive matching, programmatic navigation between\nmatches, and automatic scroll-into-view of the active match.',
      },
    },
  },
  argTypes: {
    caseSensitive: {
      type: 'boolean',
      description:
        'Whether to match the searched text with case sensitivity in mind.\nWhen `true`, only exact-case occurrences of `searchText` are highlighted.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    searchText: {
      type: 'string',
      description:
        'The string to search and highlight in the DOM content of the component.\nSetting this property triggers a new search automatically.\nAn empty string clears all highlights.',
      control: 'text',
    },
  },
  args: { caseSensitive: false },
};

export default metadata;

interface IgcHighlightArgs {
  /**
   * Whether to match the searched text with case sensitivity in mind.
   * When `true`, only exact-case occurrences of `searchText` are highlighted.
   */
  caseSensitive: boolean;
  /**
   * The string to search and highlight in the DOM content of the component.
   * Setting this property triggers a new search automatically.
   * An empty string clears all highlights.
   */
  searchText: string;
}
type Story = StoryObj<IgcHighlightArgs>;

// endregion

function createSearchController() {
  const highlightRef = createRef<IgcHighlightComponent>();
  const statusRef = createRef<HTMLElement>();

  function updateStatus() {
    const highlight = highlightRef.value;
    const status = statusRef.value;
    if (!highlight || !status) return;

    status.textContent = highlight.size
      ? `${highlight.current + 1} of ${highlight.size} match${highlight.size === 1 ? '' : 'es'}`
      : '';
  }

  function onInput({ detail }: CustomEvent<string>) {
    if (!highlightRef.value) return;
    highlightRef.value.searchText = detail;
    updateStatus();
  }

  function prev() {
    highlightRef.value?.previous();
    updateStatus();
  }

  function next() {
    highlightRef.value?.next();
    updateStatus();
  }

  return { highlightRef, statusRef, onInput, prev, next };
}

function SearchBar(controller: ReturnType<typeof createSearchController>) {
  const { statusRef, onInput, prev, next } = controller;

  return html`
    <div class="search-bar">
      <igc-input label="Search" @igcInput=${onInput}>
        <igc-icon-button
          aria-label="Go to previous match"
          variant="flat"
          name="navigate_before"
          collection="internal"
          @click=${prev}
          slot="suffix"
        ></igc-icon-button>
        <igc-icon-button
          aria-label="Go to next match"
          variant="flat"
          @click=${next}
          slot="suffix"
          name="navigate_next"
          collection="internal"
        ></igc-icon-button>
        <p ${ref(statusRef)} slot="helper-text"></p>
      </igc-input>
      <igc-divider></igc-divider>
    </div>
  `;
}

function generateParagraphs(count: number): string[] {
  const words = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
  ];

  return Array.from({ length: count }, () => {
    const wordCount = Math.floor(Math.random() * 30) + 40;
    return Array.from(
      { length: wordCount },
      () => words[Math.floor(Math.random() * words.length)]
    ).join(' ');
  });
}

export const Default: Story = {
  render: (args) => html`
    <igc-highlight
      search-text=${ifDefined(args.searchText)}
      ?case-sensitive=${args.caseSensitive}
    >
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quae doloribus
        odit id excepturi ipsum provident eaque dignissimos beatae! Rerum vero
        distinctio libero, quasi magni quod natus nesciunt doloremque temporibus
        voluptate?
      </p>
    </igc-highlight>
  `,
  args: { searchText: 'lorem' },
};

export const CustomStyling: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <style>
      .blue-highlight {
        --background: royalblue;
        --foreground: white;
        --background-active: dodgerblue;
        --foreground-active: white;
      }
      .dark-highlight {
        --foreground-active: #000;
        --foreground: yellow;
        --background-active: yellow;
        --background: #000;
      }
    </style>
    <igc-highlight search-text="lorem" class="blue-highlight">
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quae doloribus
        odit id excepturi ipsum provident eaque dignissimos beatae! Rerum vero
        distinctio libero, quasi magni quod natus nesciunt doloremque temporibus
        voluptate?
      </p>
    </igc-highlight>
    <igc-divider></igc-divider>
    <igc-highlight search-text="dolor" class="dark-highlight">
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quae doloribus
        odit id excepturi ipsum provident eaque dignissimos beatae! Rerum vero
        distinctio libero, quasi magni quod natus nesciunt doloremque temporibus
        voluptate?
      </p>
    </igc-highlight>
  `,
};

export const SearchUI: Story = {
  render: (args) => {
    const controller = createSearchController();

    return html`
      <style>
        :root {
          scroll-behavior: smooth;
        }
        .search-bar {
          position: sticky;
          top: 0;
          z-index: 1;
          background-color: #fff;
        }
        @container style(--ig-theme-variant: dark) {
          .search-bar {
            background-color: #000;
          }
        }
      </style>

      ${SearchBar(controller)}

      <igc-highlight
        ${ref(controller.highlightRef)}
        ?case-sensitive=${args.caseSensitive}
        .searchText=${args.searchText}
      >
        <h1>Document Object Model</h1>
        <p>
          <em
            >Source:
            <a href="https://en.wikipedia.org/wiki/Document_Object_Model"
              >Wikipedia</a
            ></em
          >
        </p>
        <igc-expansion-panel open>
          <h2 slot="title">Overview</h2>
          <section>
            <p>
              The Document Object Model (DOM) is a cross-platform and
              language-independent interface that treats an HTML or XML document
              as a tree structure wherein each node is an object representing a
              part of the document. The DOM represents a document with a logical
              tree. Each branch of the tree ends in a node, and each node
              contains objects. DOM methods allow programmatic access to the
              tree; with them one can change the structure, style or content of
              a document. Nodes can have event handlers (also known as event
              listeners) attached to them. Once an event is triggered, the event
              handlers get executed.
            </p>
            <p>
              The principal standardization of the DOM was handled by the World
              Wide Web Consortium (W3C), which last developed a recommendation
              in 2004. WHATWG took over the development of the standard,
              publishing it as a living document. The W3C now publishes stable
              snapshots of the WHATWG standard.
            </p>
            <p>In HTML DOM (Document Object Model), every element is a node:</p>
            <ul>
              <li>A document is a document node.</li>
              <li>All HTML elements are element nodes.</li>
              <li>All HTML attributes are attribute nodes.</li>
              <li>Text inserted into HTML elements are text nodes.</li>
              <li>Comments are comment nodes.</li>
            </ul>
          </section>
        </igc-expansion-panel>

        <igc-expansion-panel open>
          <h2 slot="title">History</h2>
          <section>
            <p>
              The history of the Document Object Model is intertwined with the
              history of the "browser wars" of the late 1990s between Netscape
              Navigator and Microsoft Internet Explorer, as well as with that of
              JavaScript and JScript, the first scripting languages to be widely
              implemented in the JavaScript engines of web browsers.
            </p>
            <p>
              JavaScript was released by Netscape Communications in 1995 within
              Netscape Navigator 2.0. Netscape's competitor, Microsoft, released
              Internet Explorer 3.0 the following year with a reimplementation
              of JavaScript called JScript. JavaScript and JScript let web
              developers create web pages with client-side interactivity. The
              limited facilities for detecting user-generated events and
              modifying the HTML document in the first generation of these
              languages eventually became known as "DOM Level 0" or "Legacy
              DOM." No independent standard was developed for DOM Level 0, but
              it was partly described in the specifications for HTML 4.
            </p>
            <p>
              Legacy DOM was limited in the kinds of elements that could be
              accessed. Form, link and image elements could be referenced with a
              hierarchical name that began with the root document object. A
              hierarchical name could make use of either the names or the
              sequential index of the traversed elements. For example, a form
              input element could be accessed as either document.myForm.myInput
              or
              <code>document.forms[0].elements[0]</code>.
            </p>
            <p>
              The Legacy DOM enabled client-side form validation and simple
              interface interactivity like creating tooltips.
            </p>
            <p>
              In 1997, Netscape and Microsoft released version 4.0 of Netscape
              Navigator and Internet Explorer respectively, adding support for
              Dynamic HTML (DHTML) functionality enabling changes to a loaded
              HTML document. DHTML required extensions to the rudimentary
              document object that was available in the Legacy DOM
              implementations. Although the Legacy DOM implementations were
              largely compatible since JScript was based on JavaScript, the
              DHTML DOM extensions were developed in parallel by each browser
              maker and remained incompatible. These versions of the DOM became
              known as the "Intermediate DOM".
            </p>
            <p>
              After the standardization of ECMAScript, the W3C DOM Working Group
              began drafting a standard DOM specification. The completed
              specification, known as "DOM Level 1", became a W3C Recommendation
              in late 1998. By 2005, large parts of W3C DOM were well-supported
              by common ECMAScript-enabled browsers, including Internet Explorer
              6 (from 2001), Opera, Safari and Gecko-based browsers (like
              Mozilla, Firefox, SeaMonkey and Camino).
            </p>
          </section>
        </igc-expansion-panel>
      </igc-highlight>
    `;
  },
};

export const Performance: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const controller = createSearchController();
    const paragraphs = generateParagraphs(250);

    return html`
      <style>
        .perf-highlight {
          --foreground-active: #222;
          --background-active: yellow;
          --foreground: yellow;
          --background: #222;
        }
        .search-bar {
          position: sticky;
          top: 0;
          z-index: 1;
          background-color: #fff;
        }
        @container style(--ig-theme-variant: dark) {
          .search-bar {
            background-color: #000;
          }
        }
      </style>

      ${SearchBar(controller)}

      <igc-highlight ${ref(controller.highlightRef)} class="perf-highlight">
        ${paragraphs.map((p) => html`<p>${p}</p>`)}
      </igc-highlight>
    `;
  },
};

const articles = [
  {
    initials: 'AJ',
    title: 'Getting Started with Web Components',
    author: 'Alice Johnson',
    date: 'Mar 15, 2026',
    category: 'Tutorial',
    tags: ['web-components', 'custom-elements', 'beginner'],
    excerpt:
      'Web Components are a suite of web platform APIs that allow you to create reusable custom elements with encapsulated functionality. Built on Custom Elements, Shadow DOM, and HTML Templates, they work in any JavaScript framework or without one at all. This tutorial walks you through defining your first custom element, attaching a shadow root, and using HTML templates to stamp out reusable markup.',
  },
  {
    initials: 'ML',
    title: 'Reactive Rendering with the Lit Framework',
    author: 'Marcus Lee',
    date: 'Mar 10, 2026',
    category: 'Framework',
    tags: ['lit', 'reactive', 'performance'],
    excerpt:
      "Lit is a lightweight library built on top of the Web Components standard that adds reactive properties and a declarative template system. Its efficient update cycle batches property changes and only re-renders the portions of the DOM that actually changed. By leveraging tagged template literals and the browser's native custom element lifecycle, Lit components stay small, fast, and framework-agnostic.",
  },
  {
    initials: 'ST',
    title: 'Accessibility in Component Design',
    author: 'Sarah Torres',
    date: 'Mar 5, 2026',
    category: 'Accessibility',
    tags: ['accessibility', 'aria', 'wcag'],
    excerpt:
      'Building accessible components means more than adding an aria-label. Every interactive element must be keyboard-navigable, focusable in a logical order, and communicate its state through ARIA roles and properties. Shadow DOM complicates accessibility trees, so authors must ensure focus management and screen-reader announcements work correctly across shadow boundaries. Following WCAG 2.2 guidelines from the start is far less costly than retrofitting them later.',
  },
  {
    initials: 'DK',
    title: 'Deep Dive into Shadow DOM',
    author: 'David Kim',
    date: 'Feb 28, 2026',
    category: 'Web Standards',
    tags: ['shadow-dom', 'encapsulation', 'css'],
    excerpt:
      'Shadow DOM creates an isolated DOM subtree attached to a host element, preventing styles and scripts from leaking in or out. Selectors like :host and ::slotted let component authors style the host and slotted light-DOM content respectively, while CSS custom properties pierce the shadow boundary, enabling external theming. Understanding the difference between open and closed shadow roots is essential for building well-encapsulated, themeable custom elements.',
  },
  {
    initials: 'EC',
    title: 'TypeScript Patterns for Lit Components',
    author: 'Emily Chen',
    date: 'Feb 22, 2026',
    category: 'TypeScript',
    tags: ['typescript', 'decorators', 'types'],
    excerpt:
      "Strong TypeScript typing transforms large component libraries into self-documenting, refactor-safe codebases. Property decorators like @property and @state provide both the Lit reactive system and TypeScript's type checker with metadata at once. Defining strict interfaces for component events and using generic types for slot-aware helpers makes cross-component composition predictable and IDE-friendly across the entire library.",
  },
  {
    initials: 'JR',
    title: 'Theming with CSS Custom Properties',
    author: 'James Rivera',
    date: 'Feb 18, 2026',
    category: 'Styling',
    tags: ['css', 'custom-properties', 'design-tokens'],
    excerpt:
      'CSS custom properties — often called CSS variables — pierce the shadow boundary, making them the natural choice for theming custom elements. By mapping design tokens to custom properties at the :root or :host level, a single theme change cascades through an entire component library. Pairing this approach with a dedicated theming package lets consumers switch between light, dark, and brand-specific palettes without touching component internals.',
  },
];

export const KnowledgeBase: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const controller = createSearchController();

    return html`
      <style>
        .kb-layout {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 1rem 0;
        }
        .kb-section-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.75rem;
          color: var(--ig-gray-700, #374151);
        }
        .kb-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
        .kb-card-excerpt {
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--ig-gray-600, #4b5563);
          margin: 0;
        }
        .kb-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 0.75rem;
        }
        .search-bar {
          position: sticky;
          top: 0;
          z-index: 1;
          background-color: #fff;
        }
        @container style(--ig-theme-variant: dark) {
          .search-bar {
            background-color: #000;
          }
        }
      </style>

      ${SearchBar(controller)}

      <igc-highlight ${ref(controller.highlightRef)}>
        <div class="kb-layout">
          <section>
            <p class="kb-section-title">Article Index</p>
            <igc-list>
              <igc-list-header><h4>Recent Publications</h4></igc-list-header>
              ${articles.map(
                (a) => html`
                  <igc-list-item>
                    <igc-avatar
                      slot="start"
                      initials=${a.initials}
                      shape="circle"
                    ></igc-avatar>
                    <span slot="title">${a.title}</span>
                    <span slot="subtitle"
                      >${a.author} &middot; ${a.date} &middot;
                      ${a.category}</span
                    >
                  </igc-list-item>
                `
              )}
            </igc-list>
          </section>

          <igc-divider></igc-divider>

          <section>
            <p class="kb-section-title">Featured Articles</p>
            <div class="kb-card-grid">
              ${articles.map(
                (a) => html`
                  <igc-card>
                    <igc-card-header>
                      <igc-avatar
                        slot="thumbnail"
                        initials=${a.initials}
                        shape="circle"
                      ></igc-avatar>
                      <h3 slot="title">${a.title}</h3>
                      <h5 slot="subtitle">${a.author} &middot; ${a.date}</h5>
                    </igc-card-header>
                    <igc-card-content>
                      <p class="kb-card-excerpt">${a.excerpt}</p>
                      <div class="kb-tags">
                        ${a.tags.map(
                          (t) => html`<igc-chip tabindex="-1">${t}</igc-chip>`
                        )}
                      </div>
                    </igc-card-content>
                    <igc-card-actions>
                      <igc-button slot="start" variant="flat"
                        >Read More</igc-button
                      >
                      <span slot="end">${a.category}</span>
                    </igc-card-actions>
                  </igc-card>
                `
              )}
            </div>
          </section>
        </div>
      </igc-highlight>
    `;
  },
};

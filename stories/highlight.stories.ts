import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcDividerComponent,
  IgcExpansionPanelComponent,
  IgcHighlightComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcIconButtonComponent,
  IgcExpansionPanelComponent,
  IgcInputComponent,
  IgcHighlightComponent,
  IgcDividerComponent
);

// region default
const metadata: Meta<IgcHighlightComponent> = {
  title: 'Highlight',
  component: 'igc-highlight',
  parameters: {
    docs: {
      description: {
        component:
          'The highlight component provides a way for efficient searching and highlighting of\ntext projected into it.',
      },
    },
  },
  argTypes: {
    caseSensitive: {
      type: 'boolean',
      description:
        'Whether to match the searched text with case sensitivity in mind.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    searchText: {
      type: 'string',
      description:
        'The string to search and highlight in the DOM content of the component.',
      control: 'text',
    },
  },
  args: { caseSensitive: false },
};

export default metadata;

interface IgcHighlightArgs {
  /** Whether to match the searched text with case sensitivity in mind. */
  caseSensitive: boolean;
  /** The string to search and highlight in the DOM content of the component. */
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
          background-color: var(--ig-surface-color, #fff);
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
          background-color: var(--ig-surface-color, #fff);
        }
      </style>

      ${SearchBar(controller)}

      <igc-highlight ${ref(controller.highlightRef)} class="perf-highlight">
        ${paragraphs.map((p) => html`<p>${p}</p>`)}
      </igc-highlight>
    `;
  },
};

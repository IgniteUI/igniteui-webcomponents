import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcExpansionPanelComponent,
  IgcHighlightComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  defineComponents,
} from '../src/index.js';

defineComponents(
  IgcIconButtonComponent,
  IgcExpansionPanelComponent,
  IgcInputComponent,
  IgcHighlightComponent
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
      table: { defaultValue: { summary: false } },
    },
    theme: {
      type: 'string',
      description: 'The highlight theme name to use for the matched ranges.',
      control: 'text',
      table: { defaultValue: { summary: 'igc-default-highlight' } },
    },
    activeTheme: {
      type: 'string',
      description:
        'The highlight theme name to use for the current active range.',
      control: 'text',
      table: { defaultValue: { summary: 'igc-default-active-highlight' } },
    },
    condition: {
      type: '"contains" | "startsWith"',
      description: 'The condition to apply when matching text nodes.',
      options: ['contains', 'startsWith'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'contains' } },
    },
    search: {
      type: 'string',
      description:
        'The string to search and highlight in the DOM content of the component.',
      control: 'text',
    },
  },
  args: {
    caseSensitive: false,
    theme: 'igc-default-highlight',
    activeTheme: 'igc-default-active-highlight',
    condition: 'contains',
  },
};

export default metadata;

interface IgcHighlightArgs {
  /** Whether to match the searched text with case sensitivity in mind. */
  caseSensitive: boolean;
  /** The highlight theme name to use for the matched ranges. */
  theme: string;
  /** The highlight theme name to use for the current active range. */
  activeTheme: string;
  /** The condition to apply when matching text nodes. */
  condition: 'contains' | 'startsWith';
  /** The string to search and highlight in the DOM content of the component. */
  search: string;
}
type Story = StoryObj<IgcHighlightArgs>;

// endregion

function updateStatus(current: number, matches: number) {
  document.getElementById('result')!.textContent = matches
    ? `Showing: ${current} of ${matches} result${matches === 1 ? '' : 's'}`
    : '';
}

async function onInputSearch({ detail }: CustomEvent<string>) {
  const highlight = document.querySelector(IgcHighlightComponent.tagName)!;
  highlight.search = detail;
  await highlight.updateComplete;

  updateStatus(highlight.current + 1, highlight.size);
}

function prev() {
  const highlight = document.querySelector(IgcHighlightComponent.tagName)!;
  highlight.previous();

  updateStatus(highlight.current + 1, highlight.size);
}

function next() {
  const highlight = document.querySelector(IgcHighlightComponent.tagName)!;
  highlight.next();
  updateStatus(highlight.current + 1, highlight.size);
}

export const Default: Story = {
  render: (args, { globals: { variant } }) => html`
    <style>
      .sticky {
        position: sticky;
        top: 0;
        padding: 1rem 0;
        z-index: 1;
        background: ${variant === 'dark' ? '#000' : '#fff'};
      }

      ::highlight(igc-default-highlight) {
        background-color: deeppink;
        color: floralwhite;
      }

      ::highlight(igc-default-active-highlight) {
        background-color: #222;
        color: deeppink;
      }

      ::highlight(coldsnap) {
        background-color: steelblue;
        color: floralwhite;
        font-weight: bold;
      }

      ::highlight(coldsnap-current) {
        background-color: #222;
        color: floralwhite;
        font-weight: bold;
      }
    </style>

    <igc-input class="sticky" label="Search" @igcInput=${onInputSearch}>
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
      <p id="result" slot="helper-text"></p>
    </igc-input>

    <igc-highlight
      ?case-sensitive=${args.caseSensitive}
      .activeTheme=${args.activeTheme}
      .theme=${args.theme}
      .search=${args.search}
      .condition=${args.condition}
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
            tree. Each branch of the tree ends in a node, and each node contains
            objects. DOM methods allow programmatic access to the tree; with
            them one can change the structure, style or content of a document.
            Nodes can have event handlers (also known as event listeners)
            attached to them. Once an event is triggered, the event handlers get
            executed.
          </p>
          <p>
            The principal standardization of the DOM was handled by the World
            Wide Web Consortium (W3C), which last developed a recommendation in
            2004. WHATWG took over the development of the standard, publishing
            it as a living document. The W3C now publishes stable snapshots of
            the WHATWG standard.
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
            Internet Explorer 3.0 the following year with a reimplementation of
            JavaScript called JScript. JavaScript and JScript let web developers
            create web pages with client-side interactivity. The limited
            facilities for detecting user-generated events and modifying the
            HTML document in the first generation of these languages eventually
            became known as "DOM Level 0" or "Legacy DOM." No independent
            standard was developed for DOM Level 0, but it was partly described
            in the specifications for HTML 4.
          </p>
          <p>
            Legacy DOM was limited in the kinds of elements that could be
            accessed. Form, link and image elements could be referenced with a
            hierarchical name that began with the root document object. A
            hierarchical name could make use of either the names or the
            sequential index of the traversed elements. For example, a form
            input element could be accessed as either document.myForm.myInput or
            <code>document.forms[0].elements[0]</code>.
          </p>
          <p>
            The Legacy DOM enabled client-side form validation and simple
            interface interactivity like creating tooltips.
          </p>
          <p>
            In 1997, Netscape and Microsoft released version 4.0 of Netscape
            Navigator and Internet Explorer respectively, adding support for
            Dynamic HTML (DHTML) functionality enabling changes to a loaded HTML
            document. DHTML required extensions to the rudimentary document
            object that was available in the Legacy DOM implementations.
            Although the Legacy DOM implementations were largely compatible
            since JScript was based on JavaScript, the DHTML DOM extensions were
            developed in parallel by each browser maker and remained
            incompatible. These versions of the DOM became known as the
            "Intermediate DOM".
          </p>
          <p>
            After the standardization of ECMAScript, the W3C DOM Working Group
            began drafting a standard DOM specification. The completed
            specification, known as "DOM Level 1", became a W3C Recommendation
            in late 1998. By 2005, large parts of W3C DOM were well-supported by
            common ECMAScript-enabled browsers, including Internet Explorer 6
            (from 2001), Opera, Safari and Gecko-based browsers (like Mozilla,
            Firefox, SeaMonkey and Camino).
          </p>
        </section>
      </igc-expansion-panel>
    </igc-highlight>
  `,
};

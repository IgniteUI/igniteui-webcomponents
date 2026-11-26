import { expect, fixture, html, nextFrame, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import type { TemplateResult } from 'lit';
import { spy, useFakeTimers } from 'sinon';

import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  hoverWithMouse,
  isFocused,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import {
  simulateCancelableKeydown,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import { runValueStateMotionTests } from '#internals/testing/value-state.spec.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
import IgcListHeaderComponent from './list-header.js';
import type IgcListItemComponent from './list-item.js';
import IgcListComponent from './list.js';

describe('List', () => {
  before(() => {
    defineComponents(IgcListComponent);
  });

  let list: IgcListComponent;

  describe('List with items', () => {
    beforeEach(async () => {
      list = await fixture<IgcListComponent>(html`
        <igc-list>
          <igc-list-item></igc-list-item>
          <igc-list-item></igc-list-item>
        </igc-list>
      `);
    });

    it('is accessible', async () => {
      await expect(list).dom.to.be.accessible();
      await expect(list).shadowDom.to.be.accessible();
    });

    it('list items are projected', async () => {
      expect(list.children.length).to.equal(2);
    });
  });

  describe('List with items and headers', () => {
    beforeEach(async () => {
      list = await fixture<IgcListComponent>(html`
        <igc-list>
          <igc-list-header></igc-list-header>
          <igc-list></igc-list>
          <igc-list-header></igc-list-header>
          <igc-list></igc-list>
        </igc-list>
      `);
    });

    it('is accessible', async () => {
      await expect(list).dom.to.be.accessible();
      await expect(list).shadowDom.to.be.accessible();
    });

    it('list items are projected', async () => {
      expect(list.children.length).to.equal(4);
    });
  });

  describe('Headers', () => {
    it('exposes a header as a list item, the only role that a list owns', async () => {
      list = await fixture<IgcListComponent>(html`
        <igc-list>
          <igc-list-header><h3>Team</h3></igc-list-header>
          <igc-list-item><span slot="title">Jane Doe</span></igc-list-item>
        </igc-list>
      `);

      const header = list.querySelector(IgcListHeaderComponent.tagName)!;
      expect(internalsOf(header)?.getARIA('role')).to.equal('listitem');
    });
  });

  describe('Item structure', () => {
    it('adds no role around the title and the subtitle', async () => {
      const item = await fixture<IgcListItemComponent>(html`
        <igc-list-item>
          <span slot="title">Jane Doe</span>
          <span slot="subtitle">Product designer</span>
        </igc-list-item>
      `);

      // A `header` element in a `section` has the `sectionheader` role in Chromium.
      const container = item.renderRoot.querySelector('[part~="header"]')!;
      expect(container.localName).to.equal('div');
    });
  });

  describe('Hidden attribute', () => {
    it('hides an item and a header', async () => {
      list = await fixture<IgcListComponent>(html`
        <igc-list navigation="listbox">
          <igc-list-header hidden>Team</igc-list-header>
          <igc-list-item hidden>A</igc-list-item>
          <igc-list-item>B</igc-list-item>
        </igc-list>
      `);
      const [header] = list.querySelectorAll('igc-list-header');
      const [hidden, shown] = list.querySelectorAll('igc-list-item');

      expect(header.checkVisibility()).to.be.false;
      expect(hidden.checkVisibility()).to.be.false;
      expect(shown.getAttribute('tabindex')).to.equal('0');
    });
  });

  describe('Items far from the view', () => {
    // The item box always renders; its content is what skips.
    const skipped = (item: IgcListItemComponent) =>
      !item
        .querySelector('span')!
        .checkVisibility({ contentVisibilityAuto: true });

    let items: IgcListItemComponent[];

    beforeEach(async () => {
      const box = await fixture<HTMLElement>(html`
        <div style="height: 200px; overflow: auto">
          <igc-list>
            ${Array.from(
              { length: 100 },
              (_, i) =>
                html`<igc-list-item>
                  <span slot="title">Item ${i}</span>
                </igc-list-item>`
            )}
          </igc-list>
        </div>
      `);
      items = Array.from(box.querySelectorAll('igc-list-item'));
      await nextFrame();
      await nextFrame();
    });

    it('skip their rendering', () => {
      expect(getComputedStyle(items[0]).contentVisibility).to.equal('auto');
      expect(skipped(items[0])).to.be.false;
      expect(skipped(items[99])).to.be.true;
    });

    it('render when they scroll into view', async () => {
      // `scrollIntoView()` renders its target at once; the others follow in a frame.
      items[99].scrollIntoView();
      await waitUntil(() => skipped(items[0]), 'The first item still renders');

      expect(skipped(items[99])).to.be.false;
    });
  });

  describe('Listbox navigation', () => {
    let items: IgcListItemComponent[];
    let headers: IgcListHeaderComponent[];

    const aria = <K extends keyof ARIAMixin>(element: Element, name: K) =>
      internalsOf(element)?.getARIA(name);

    const titleOf = (item: Element) => item.querySelector('[slot="title"]')!;

    const tabIndexes = () => items.map((item) => item.getAttribute('tabindex'));

    /** Lets the list and its items take in the context and the DOM changes. */
    async function settle(): Promise<void> {
      for (let i = 0; i < 3; i++) {
        await list.updateComplete;
        await Promise.all(
          Array.from(
            list.querySelectorAll<
              IgcListItemComponent | IgcListHeaderComponent
            >('igc-list-item, igc-list-header'),
            (element) => element.updateComplete
          )
        );
      }
    }

    async function create(template: TemplateResult): Promise<void> {
      const root = await fixture<HTMLElement>(template);
      list = root.matches('igc-list')
        ? (root as IgcListComponent)
        : root.querySelector('igc-list')!;
      await settle();
      items = Array.from(list.querySelectorAll('igc-list-item'));
      headers = Array.from(list.querySelectorAll('igc-list-header'));
    }

    const people = html`
      <igc-list navigation="listbox" aria-label="People">
        <igc-list-header>Team</igc-list-header>
        <igc-list-item>
          <span slot="title">Kate</span>
          <span slot="subtitle">Designer</span>
        </igc-list-item>
        <igc-list-item><span slot="title">Bob</span></igc-list-item>
        <igc-list-header>Guests</igc-list-header>
        <igc-list-item><span slot="title">Ann</span></igc-list-item>
        <igc-list-item>Joe Content</igc-list-item>
      </igc-list>
    `;

    describe('Roles and states', () => {
      beforeEach(async () => {
        await create(people);
      });

      it('is a listbox of options that expose their selected state', async () => {
        expect(aria(list, 'role')).to.equal('listbox');

        for (const item of items) {
          expect(aria(item, 'role')).to.equal('option');
          expect(aria(item, 'ariaSelected')).to.equal('false');
        }

        items[1].selected = true;
        await settle();

        expect(aria(items[1], 'ariaSelected')).to.equal('true');
      });

      it('hides the headers', () => {
        for (const header of headers) {
          expect(aria(header, 'ariaHidden')).to.equal('true');
        }
      });

      it('names an item by its title, and describes it by its subtitle and its header', () => {
        const subtitle = items[0].querySelector('[slot="subtitle"]')!;

        expect(aria(items[0], 'ariaLabelledByElements')).to.eql([
          titleOf(items[0]),
        ]);
        expect(aria(items[0], 'ariaDescribedByElements')).to.eql([
          subtitle,
          headers[0],
        ]);
        expect(aria(items[1], 'ariaDescribedByElements')).to.eql([headers[0]]);
        expect(aria(items[2], 'ariaDescribedByElements')).to.eql([headers[1]]);
      });

      it('names an item without a title by its content', () => {
        expect(aria(items[3], 'ariaLabelledByElements')).to.be.null;
        expect(aria(items[3], 'ariaDescribedByElements')).to.eql([headers[1]]);
      });

      it('lets an aria-label of the app name an item that has a title', async () => {
        const subtitle = items[0].querySelector('[slot="subtitle"]')!;

        items[0].setAttribute('aria-label', 'App label');
        await settle();

        expect(aria(items[0], 'ariaLabelledByElements')).to.be.null;
        expect(aria(items[0], 'ariaDescribedByElements')).to.eql([
          subtitle,
          headers[0],
        ]);

        items[0].removeAttribute('aria-label');
        await settle();

        expect(aria(items[0], 'ariaLabelledByElements')).to.eql([
          titleOf(items[0]),
        ]);
      });

      it('writes no ARIA attribute, so the attributes of the app win', () => {
        for (const element of [list, ...items, ...headers]) {
          const written = element
            .getAttributeNames()
            .filter((name) => name.startsWith('aria-') || name === 'role');

          expect(written).to.eql(element === list ? ['aria-label'] : []);
        }
      });

      it('is accessible', async () => {
        await expect(list).to.be.accessible();
      });
    });

    describe('Static list', () => {
      it('keeps the list roles, and its items out of the tab order', async () => {
        await create(html`
          <igc-list>
            <igc-list-header>Team</igc-list-header>
            <igc-list-item selected>
              <span slot="title">Kate</span>
            </igc-list-item>
          </igc-list>
        `);

        expect(aria(list, 'role')).to.equal('list');
        expect(aria(items[0], 'role')).to.equal('listitem');
        expect(aria(items[0], 'ariaSelected')).to.be.null;
        expect(aria(items[0], 'ariaLabelledByElements')).to.be.null;
        expect(aria(headers[0], 'ariaHidden')).to.be.null;
        expect(items[0].hasAttribute('tabindex')).to.be.false;
        expect(list.hasAttribute('tabindex')).to.be.false;
      });

      it('ignores the navigation keys', async () => {
        await create(html`
          <igc-list>
            <igc-list-item tabindex="0">A</igc-list-item>
            <igc-list-item tabindex="0">B</igc-list-item>
          </igc-list>
        `);
        const click = spy();
        items[0].addEventListener('click', click);
        items[0].focus();

        simulateKeyboard(items[0], 'ArrowDown');
        simulateKeyboard(items[0], 'Enter');

        expect(isFocused(items[0])).to.be.true;
        expect(click.called).to.be.false;
      });
    });

    describe('Tab stop', () => {
      it('is the first item when no item is selected', async () => {
        await create(people);

        expect(tabIndexes()).to.eql(['0', '-1', '-1', '-1']);
        expect(headers.some((header) => header.hasAttribute('tabindex'))).to.be
          .false;
        expect(list.hasAttribute('tabindex')).to.be.false;
      });

      it('is the first selected item', async () => {
        await create(html`
          <igc-list navigation="listbox">
            <igc-list-item>A</igc-list-item>
            <igc-list-item selected>B</igc-list-item>
            <igc-list-item selected>C</igc-list-item>
          </igc-list>
        `);

        expect(tabIndexes()).to.eql(['-1', '0', '-1']);
      });

      it('is the item focused last, also after a selection elsewhere', async () => {
        await create(people);

        items[2].focus();
        await settle();
        expect(tabIndexes()).to.eql(['-1', '-1', '0', '-1']);

        items[3].selected = true;
        await settle();
        expect(tabIndexes()).to.eql(['-1', '-1', '0', '-1']);
      });

      it('is not a hidden item', async () => {
        await create(html`
          <igc-list navigation="listbox">
            <igc-list-item hidden>A</igc-list-item>
            <igc-list-item>B</igc-list-item>
          </igc-list>
        `);

        expect(tabIndexes()).to.eql(['-1', '0']);
      });

      it('moves off an item that gets hidden', async () => {
        await create(people);

        items[0].hidden = true;
        await settle();

        expect(tabIndexes()).to.eql(['-1', '0', '-1', '-1']);
      });

      it('is reached with one Tab and left with the next', async () => {
        await create(html`
          <div>
            <button id="before">Before</button>
            ${people}
            <button id="after">After</button>
          </div>
        `);
        const before = list.parentElement!.querySelector('#before')!;
        const after = list.parentElement!.querySelector('#after')!;
        (before as HTMLElement).focus();

        await sendKeys({ press: 'Tab' });
        expect(isFocused(items[0])).to.be.true;

        await sendKeys({ press: 'Tab' });
        expect(isFocused(after)).to.be.true;

        await sendKeys({ press: 'Shift+Tab' });
        expect(isFocused(items[0])).to.be.true;

        await sendKeys({ press: 'Shift+Tab' });
        expect(isFocused(before)).to.be.true;
      });
    });

    describe('Keyboard', () => {
      beforeEach(async () => {
        await create(people);
        items[0].focus();
      });

      const pressOnFocused = (key: string | string[]) =>
        simulateKeyboard(document.activeElement!, key);

      it('moves with Up and Down over the headers, and stops at the ends', () => {
        pressOnFocused('ArrowUp');
        expect(isFocused(items[0])).to.be.true;

        pressOnFocused('ArrowDown');
        pressOnFocused('ArrowDown');
        expect(isFocused(items[2])).to.be.true;

        pressOnFocused('ArrowDown');
        pressOnFocused('ArrowDown');
        expect(isFocused(items[3])).to.be.true;

        pressOnFocused('ArrowUp');
        expect(isFocused(items[2])).to.be.true;
      });

      it('jumps with Home and End', () => {
        pressOnFocused('End');
        expect(isFocused(items[3])).to.be.true;

        pressOnFocused('Home');
        expect(isFocused(items[0])).to.be.true;
      });

      it('skips a hidden item', () => {
        items[1].style.display = 'none';

        pressOnFocused('ArrowDown');
        expect(isFocused(items[2])).to.be.true;
      });

      it('clicks the focused item on Enter and on Space, once per press', () => {
        const click = spy();
        items[0].addEventListener('click', click);

        pressOnFocused('Enter');
        pressOnFocused(' ');
        expect(click.callCount).to.equal(2);

        simulateKeyboard(items[0], 'Enter', 1, { repeat: true });
        expect(click.callCount).to.equal(2);
      });

      it('keeps the page from scrolling on Space and on the arrow keys', () => {
        expect(simulateCancelableKeydown(items[0], ' ')).to.be.true;
        expect(simulateCancelableKeydown(items[0], 'ArrowDown')).to.be.true;
      });

      it('ignores the keys of content inside an item', async () => {
        const button = document.createElement('button');
        items[0].append(button);
        await settle();
        const click = spy();
        items[0].addEventListener('click', click);
        button.focus();

        simulateKeyboard(button, 'ArrowDown');
        simulateKeyboard(button, 'Enter');

        expect(isFocused(button)).to.be.true;
        expect(click.called).to.be.false;
      });
    });

    describe('Type-ahead', () => {
      let clock: ReturnType<typeof useFakeTimers>;

      beforeEach(async () => {
        clock = useFakeTimers({ now: 1000, toFake: ['Date'] });
        await create(html`
          <igc-list navigation="listbox">
            <igc-list-item>
              <span slot="title">Kate</span>
              <span slot="subtitle">Designer</span>
            </igc-list-item>
            <igc-list-item><span slot="title">Ann Lee</span></igc-list-item>
            <igc-list-item><span slot="title">Ann Marie</span></igc-list-item>
            <igc-list-item><span slot="title">Bob</span></igc-list-item>
            <igc-list-item>Dora Content</igc-list-item>
          </igc-list>
        `);
        items[0].focus();
      });

      afterEach(() => {
        clock.restore();
      });

      const type = (text: string) => {
        for (const key of text) {
          simulateKeyboard(document.activeElement!, key);
        }
      };

      it('moves to the item whose title starts with the typed letters', () => {
        type('bo');
        expect(isFocused(items[3])).to.be.true;
      });

      it('cycles through the items that start with a letter typed again', () => {
        type('a');
        expect(isFocused(items[1])).to.be.true;

        type('a');
        expect(isFocused(items[2])).to.be.true;
      });

      it('matches the title, not the subtitle, and the content of an item without a title', () => {
        type('d');
        expect(isFocused(items[4])).to.be.true;
      });

      it('starts a new search after a pause', () => {
        type('b');
        clock.tick(501);
        type('k');
        expect(isFocused(items[0])).to.be.true;
      });

      it('takes a Space during a search as a letter, not as a click', () => {
        const click = spy();
        list.addEventListener('click', click);

        type('ann m');

        expect(isFocused(items[2])).to.be.true;
        expect(click.called).to.be.false;
      });
    });

    describe('Empty list', () => {
      const emptyContainer = () =>
        list.renderRoot.querySelector<HTMLElement>('slot[name="empty"]')
          ?.parentElement;

      const append = async (text: string) => {
        const item = document.createElement('igc-list-item');
        item.textContent = text;
        list.append(item);
        await settle();
        items = Array.from(list.querySelectorAll('igc-list-item'));
        return item;
      };

      beforeEach(async () => {
        await create(html`
          <igc-list navigation="listbox" aria-label="People">
            <igc-list-header>Team</igc-list-header>
            <span slot="empty">No results</span>
          </igc-list>
        `);
      });

      it('shows the empty content as an option while the list has no items', async () => {
        expect(emptyContainer()?.getAttribute('role')).to.equal('option');

        await append('Kate');
        expect(emptyContainer()).to.be.undefined;
      });

      it('is a tab stop while it has no items', async () => {
        expect(list.getAttribute('tabindex')).to.equal('0');

        const item = await append('Kate');
        expect(list.hasAttribute('tabindex')).to.be.false;
        expect(item.getAttribute('tabindex')).to.equal('0');
      });

      it('moves the focus to the items that arrive while it has the focus', async () => {
        list.focus();
        const item = await append('Kate');

        expect(isFocused(item)).to.be.true;
      });

      it('moves the focus to an item that rendered before and comes back', async () => {
        const item = await append('Kate');
        item.remove();
        await settle();

        list.focus();
        list.append(item);
        await settle();

        expect(isFocused(item)).to.be.true;
      });

      it('restores the tabindex of the host', async () => {
        await create(html`
          <igc-list navigation="listbox" tabindex="-1"></igc-list>
        `);
        expect(list.getAttribute('tabindex')).to.equal('0');

        list.navigation = 'none';
        await settle();
        expect(list.getAttribute('tabindex')).to.equal('-1');
      });

      it('gives the empty container no role without content', async () => {
        await create(html`<igc-list navigation="listbox"></igc-list>`);
        expect(emptyContainer()?.hasAttribute('role')).to.be.false;
      });

      it('gives the empty container no role in a static list', async () => {
        list.navigation = 'none';
        await settle();
        expect(emptyContainer()?.hasAttribute('role')).to.be.false;
        expect(list.hasAttribute('tabindex')).to.be.false;
      });

      it('is accessible', async () => {
        // The list sets its `listbox` role through ElementInternals, which axe
        // does not read, so axe sees the empty option without its parent.
        await expect(list).to.be.accessible({
          ignoredRules: ['aria-required-parent'],
        });
        expect(aria(list, 'role')).to.equal('listbox');
      });
    });

    describe('Removal of the focused item', () => {
      beforeEach(async () => {
        await create(people);
      });

      it('moves the focus to the item that took its place', async () => {
        items[1].focus();
        items[1].remove();
        await settle();

        expect(isFocused(items[2])).to.be.true;
      });

      it('moves the focus to the new last item', async () => {
        items[3].focus();
        items[3].remove();
        await settle();

        expect(isFocused(items[2])).to.be.true;
      });

      it('moves the focus to the list when no item is left', async () => {
        items[0].focus();
        for (const item of items) {
          item.remove();
        }
        await settle();

        expect(isFocused(list)).to.be.true;
        expect(list.getAttribute('tabindex')).to.equal('0');
      });

      it('skips a next item that does not render', async () => {
        items[1].focus();
        items[2].hidden = true;
        items[1].remove();
        await settle();

        expect(isFocused(items[3])).to.be.true;
      });

      it('moves the focus to an item that replaces the focused one', async () => {
        const fresh = document.createElement('igc-list-item');
        fresh.textContent = 'Fresh';
        items[1].focus();
        items[1].replaceWith(fresh);
        await settle();

        expect(isFocused(fresh)).to.be.true;
      });

      it('does not take the focus back after it went to no element', async () => {
        items[1].focus();
        items[1].blur();
        await settle();
        items[1].remove();
        await settle();

        expect(document.activeElement).to.equal(document.body);
      });

      it('leaves the focus alone when another item goes', async () => {
        items[0].focus();
        items[2].remove();
        await settle();

        expect(isFocused(items[0])).to.be.true;
      });

      it('moves only the tab stop when the removed item had no focus', async () => {
        const outside = document.createElement('button');
        list.after(outside);
        items[1].focus();
        outside.focus();
        items[1].remove();
        await settle();

        expect(isFocused(outside)).to.be.true;
        expect(items[0].getAttribute('tabindex')).to.equal('0');
        outside.remove();
      });
    });

    describe('Ownership', () => {
      it('navigates the items inside wrapper elements', async () => {
        await create(html`
          <igc-list navigation="listbox">
            <div><igc-list-item>A</igc-list-item></div>
            <div><igc-list-item>B</igc-list-item></div>
          </igc-list>
        `);

        expect(aria(items[1], 'role')).to.equal('option');

        items[0].focus();
        simulateKeyboard(items[0], 'ArrowDown');
        expect(isFocused(items[1])).to.be.true;
      });

      it('leaves the items of a nested list to it', async () => {
        await create(html`
          <igc-list navigation="listbox">
            <igc-list-item>
              A
              <igc-list>
                <igc-list-item>Nested</igc-list-item>
              </igc-list>
            </igc-list-item>
            <igc-list-item>B</igc-list-item>
          </igc-list>
        `);
        const nested = items[1];

        expect(aria(nested, 'role')).to.equal('listitem');
        expect(nested.hasAttribute('tabindex')).to.be.false;

        items[0].focus();
        simulateKeyboard(items[0], 'ArrowDown');
        expect(isFocused(items[2])).to.be.true;
      });
    });

    describe('Change of the navigation', () => {
      it('turns on at runtime', async () => {
        await create(html`
          <igc-list>
            <igc-list-item>A</igc-list-item>
            <igc-list-item>B</igc-list-item>
          </igc-list>
        `);

        list.navigation = 'listbox';
        await settle();

        expect(aria(list, 'role')).to.equal('listbox');
        expect(aria(items[0], 'role')).to.equal('option');
        expect(tabIndexes()).to.eql(['0', '-1']);
      });

      it('undoes everything that it set when it turns off', async () => {
        await create(html`
          <igc-list navigation="listbox">
            <igc-list-header>Team</igc-list-header>
            <igc-list-item tabindex="3">
              <span slot="title">A</span>
            </igc-list-item>
            <igc-list-item>B</igc-list-item>
          </igc-list>
        `);

        list.navigation = 'none';
        await settle();

        expect(aria(list, 'role')).to.equal('list');
        expect(aria(headers[0], 'ariaHidden')).to.be.null;
        for (const item of items) {
          expect(aria(item, 'role')).to.equal('listitem');
          expect(aria(item, 'ariaSelected')).to.be.null;
          expect(aria(item, 'ariaLabelledByElements')).to.be.null;
          expect(aria(item, 'ariaDescribedByElements')).to.be.null;
        }
        expect(items[0].getAttribute('tabindex')).to.equal('3');
        expect(items[1].hasAttribute('tabindex')).to.be.false;
      });
    });

    describe('Focus ring', () => {
      // The test page loads no palette, and the ring color comes from it.
      const palette = [bootstrap.styleSheet!];

      it('shows on the item that the keyboard focused', async () => {
        await create(people);
        items[0].focus();

        simulateKeyboard(items[0], 'ArrowDown');

        await withDocumentSheets(palette, () => {
          const style = getComputedStyle(items[1]);

          expect(items[1].matches(':focus-visible')).to.be.true;
          expect(style.outlineStyle).to.equal('solid');
          expect(style.outlineWidth).to.equal('1px');
        });
      });

      it('shows on an empty list that has the focus', async () => {
        await create(html`<igc-list navigation="listbox"></igc-list>`);
        list.focus();

        await withDocumentSheets(palette, () => {
          expect(getComputedStyle(list).outlineStyle).to.equal('solid');
        });
      });
    });
  });

  // The user cannot select an item, so a hover is the user interaction.
  runValueStateMotionTests<IgcListItemComponent>({
    template: html`<igc-list><igc-list-item>Item</igc-list-item></igc-list>`,
    changedTemplate: html`
      <igc-list><igc-list-item selected>Item</igc-list-item></igc-list>
    `,
    control: (list) => list.querySelector('igc-list-item')!,
    changeFromCode: (item) => {
      item.selected = true;
    },
    changeByUser: (item) => hoverWithMouse(item),
  });
});

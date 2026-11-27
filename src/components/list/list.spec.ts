import {
  defineCE,
  expect,
  fixture,
  html,
  nextFrame,
  waitUntil,
} from '@open-wc/testing';
import { emulateMedia, sendKeys } from '@web/test-runner-commands';
import { LitElement, type TemplateResult } from 'lit';
import { spy, useFakeTimers } from 'sinon';

import {
  addInternalsController,
  internalsOf,
} from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  axeListInternalsRolesOptions,
  clickWithMouse,
  hoverWithMouse,
  isFocused,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import {
  simulateCancelableKeydown,
  simulateClick,
  simulateFocusOut,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import { runValueStateMotionTests } from '#internals/testing/value-state.spec.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
import { styles as indigo } from '../../styles/themes/light/indigo.css.js';
import { configureTheme } from '../../theming/config.js';
import IgcButtonGroupComponent from '../button-group/button-group.js';
import IgcButtonComponent from '../button/button.js';
import IgcCheckboxComponent from '../checkbox/checkbox.js';
import IgcComboComponent from '../combo/combo.js';
import IgcInputComponent from '../input/input.js';
import IgcRadioGroupComponent from '../radio-group/radio-group.js';
import IgcSelectComponent from '../select/select.js';
import IgcTabsComponent from '../tabs/tabs.js';
import IgcListHeaderComponent from './list-header.js';
import type IgcListItemComponent from './list-item.js';
import IgcListComponent from './list.js';

describe('List', () => {
  before(() => {
    defineComponents(IgcListComponent);
  });

  let list: IgcListComponent;

  let items: IgcListItemComponent[];
  let headers: IgcListHeaderComponent[];

  const aria = <K extends keyof ARIAMixin>(element: Element, name: K) =>
    internalsOf(element)?.getARIA(name);

  const titleOf = (item: Element) => item.querySelector('[slot="title"]')!;

  const tabIndexes = () => items.map((item) => item.getAttribute('tabindex'));

  /** Lets the list, its items and their controls take in the DOM changes. */
  async function settle(): Promise<void> {
    for (let i = 0; i < 3; i++) {
      await list.updateComplete;
      await Promise.all(
        Array.from(
          list.querySelectorAll('*'),
          (element) => (element as Partial<LitElement>).updateComplete
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

    it('hides the content of an item that has `hidden`', async () => {
      const item = await fixture<IgcListItemComponent>(html`
        <igc-list-item>
          <span slot="start" hidden>JD</span>
          <span slot="title">Jane Doe</span>
        </igc-list-item>
      `);

      expect(item.querySelector('[slot="start"]')!.checkVisibility()).to.be
        .false;
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
        await expect(list).shadowDom.to.be.accessible();
        await expect(items[0]).shadowDom.to.be.accessible();
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
        await expect(list).to.be.accessible(axeListInternalsRolesOptions);
        await expect(list).shadowDom.to.be.accessible(
          axeListInternalsRolesOptions
        );
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

      it('shows on a selected item', async () => {
        await create(people);
        items[1].selected = true;
        await settle();
        items[0].focus();

        await sendKeys({ press: 'ArrowDown' });

        await withDocumentSheets(palette, () => {
          expect(getComputedStyle(items[1]).outlineWidth).to.equal('1px');
        });
      });

      it('does not show after a click', async () => {
        await create(people);
        // The items above a later item can change size as they first render.
        await clickWithMouse(items[0]);

        await withDocumentSheets(palette, () => {
          expect(isFocused(items[0])).to.be.true;
          expect(getComputedStyle(items[0]).outlineStyle).to.equal('none');
        });
      });

      it('is 2px wide in the Indigo theme', async () => {
        await create(people);

        try {
          configureTheme('indigo');
          await settle();
          items[0].focus();
          await sendKeys({ press: 'ArrowDown' });

          await withDocumentSheets([indigo.styleSheet!], () => {
            expect(getComputedStyle(items[1]).outlineWidth).to.equal('2px');
          });
        } finally {
          configureTheme('bootstrap');
        }
      });

      it('uses the system highlight color in forced colors mode', async () => {
        await create(people);
        items[1].selected = true;
        await settle();

        const probe = document.createElement('div');
        probe.style.color = 'Highlight';
        document.body.append(probe);

        try {
          await emulateMedia({ forcedColors: 'active' });
          items[0].focus();
          await sendKeys({ press: 'ArrowDown' });

          await withDocumentSheets(palette, () => {
            const style = getComputedStyle(items[1]);

            // Thicker than the ring of a selected item.
            expect(style.outlineWidth).to.equal('2px');
            expect(style.outlineColor).to.equal(getComputedStyle(probe).color);
          });
        } finally {
          probe.remove();
          await emulateMedia({ forcedColors: 'none' });
        }
      });

      it('leaves the focus of an item in a static list to the browser', async () => {
        const root = await fixture<HTMLElement>(html`
          <div>
            <button>Before</button>
            <igc-list>
              <igc-list-item tabindex="0">Kate</igc-list-item>
            </igc-list>
          </div>
        `);
        const item = root.querySelector('igc-list-item')!;

        root.querySelector('button')!.focus();
        await sendKeys({ press: 'Tab' });

        await withDocumentSheets(palette, () => {
          expect(isFocused(item)).to.be.true;
          expect(getComputedStyle(item).outlineOffset).to.equal('0px');
        });
      });
    });
  });

  describe('Grid navigation', () => {
    let link: HTMLAnchorElement;
    let call: IgcButtonComponent;
    let remove: HTMLButtonElement;
    let note: IgcInputComponent;
    let pin: IgcCheckboxComponent;

    before(() => {
      defineComponents(
        IgcButtonComponent,
        IgcButtonGroupComponent,
        IgcCheckboxComponent,
        IgcComboComponent,
        IgcInputComponent,
        IgcRadioGroupComponent,
        IgcSelectComponent,
        IgcTabsComponent
      );
    });

    const cellOf = (item: IgcListItemComponent) =>
      item.renderRoot.querySelector<HTMLElement>('[data-cell]');

    const press = (key: string) => sendKeys({ press: key });

    const pressOnFocused = (key: string) =>
      simulateKeyboard(document.activeElement!, key);

    // The link comes last in the DOM, but first in the layout of the row.
    const contacts = html`
      <igc-list navigation="grid" aria-label="Contacts">
        <igc-list-header>Team</igc-list-header>
        <igc-list-item>
          <span slot="title">Kate</span>
          <igc-button slot="end" id="call">Call</igc-button>
          <button slot="end" id="remove">Delete</button>
          <a slot="start" href="#kate" id="link">Profile</a>
        </igc-list-item>
        <igc-list-item>
          <span slot="title">Bob</span>
          <igc-input slot="end" label="Note" id="note"></igc-input>
          <igc-checkbox slot="end" id="pin">Pin</igc-checkbox>
        </igc-list-item>
        <igc-list-item><span slot="title">Ann</span></igc-list-item>
      </igc-list>
    `;

    async function createContacts(template = contacts): Promise<void> {
      await create(template);
      link = list.querySelector('#link')!;
      call = list.querySelector('#call')!;
      remove = list.querySelector('#remove')!;
      note = list.querySelector('#note')!;
      pin = list.querySelector('#pin')!;
    }

    describe('Roles and states', () => {
      beforeEach(async () => {
        await createContacts();
      });

      it('is a grid of rows with one cell each', () => {
        expect(aria(list, 'role')).to.equal('grid');

        for (const item of items) {
          expect(aria(item, 'role')).to.equal('row');
          expect(cellOf(item)?.getAttribute('role')).to.equal('gridcell');
          expect(getComputedStyle(cellOf(item)!).display).to.equal('contents');
        }
      });

      it('names a row by its title, and describes it by its header', () => {
        expect(aria(items[0], 'ariaLabelledByElements')).to.eql([
          titleOf(items[0]),
        ]);
        expect(aria(items[0], 'ariaDescribedByElements')).to.eql([headers[0]]);
      });

      it('exposes only a selected row without aria-multiselectable', async () => {
        items[1].selected = true;
        await settle();

        expect(aria(items[0], 'ariaSelected')).to.be.null;
        expect(aria(items[1], 'ariaSelected')).to.equal('true');
      });

      it('exposes the selected state of every row with aria-multiselectable', async () => {
        const states = () => items.map((item) => aria(item, 'ariaSelected'));
        items[1].selected = true;

        for (const value of ['true', 'false']) {
          list.setAttribute('aria-multiselectable', value);
          await settle();

          expect(states()).to.eql(['false', 'true', 'false']);
        }

        list.removeAttribute('aria-multiselectable');
        await settle();

        expect(states()).to.eql([null, 'true', null]);
      });

      it('is accessible', async () => {
        await expect(list).to.be.accessible(axeListInternalsRolesOptions);
        await expect(list).shadowDom.to.be.accessible(
          axeListInternalsRolesOptions
        );
        await expect(items[0]).shadowDom.to.be.accessible(
          axeListInternalsRolesOptions
        );
      });
    });

    describe('Tab order', () => {
      it('takes the controls of the rows out of the tab order', async () => {
        await createContacts();

        for (const control of [link, call, remove, note, pin]) {
          expect(control.getAttribute('tabindex')).to.equal('-1');
        }
        expect(tabIndexes()).to.eql(['0', '-1', '-1']);
      });

      it('is one tab stop, also when a control has the focus', async () => {
        await createContacts(html`
          <div>
            <button id="before">Before</button>
            ${contacts}
            <button id="after">After</button>
          </div>
        `);
        const before = document.getElementById('before')!;
        const after = document.getElementById('after')!;
        before.focus();

        await press('Tab');
        expect(isFocused(items[0])).to.be.true;

        await press('ArrowRight');
        expect(isFocused(link)).to.be.true;

        await press('Tab');
        expect(isFocused(after)).to.be.true;

        await press('Shift+Tab');
        expect(isFocused(items[0])).to.be.true;

        await press('ArrowRight');
        await press('Shift+Tab');
        expect(isFocused(before)).to.be.true;
      });

      it('takes out a control that arrives later, once it renders', async () => {
        await createContacts();
        const button = document.createElement('igc-button');
        button.textContent = 'Later';
        items[2].append(button);
        await settle();

        expect(button.getAttribute('tabindex')).to.equal('-1');
      });

      /** A custom element whose shadow root shows a button after `reveal()`. */
      class LateControl extends HTMLElement {
        constructor() {
          super();
          this.attachShadow({ mode: 'open' });
        }

        public reveal(): void {
          this.shadowRoot!.innerHTML = '<button>Late</button>';
        }
      }

      it('takes out a control that turns up with no mutation once its row takes the focus', async () => {
        await createContacts();
        const tag = `list-late-${crypto.randomUUID()}`;
        const late = document.createElement(tag) as LateControl;
        const shown = document.createElement(
          defineCE(class extends LateControl {})
        ) as LateControl;
        items[2].append(late, shown);
        await settle();

        // Defined after it joined the row, and a control rendered later.
        customElements.define(tag, class extends LateControl {});
        late.reveal();
        shown.reveal();
        expect(late.hasAttribute('tabindex')).to.be.false;
        expect(shown.hasAttribute('tabindex')).to.be.false;

        items[2].focus();

        expect(late.getAttribute('tabindex')).to.equal('-1');
        expect(shown.getAttribute('tabindex')).to.equal('-1');
      });

      it('leaves the focus on a late control that Shift+Tab reached', async () => {
        await createContacts(html`
          <div>
            <igc-list navigation="grid">
              <igc-list-item>Kate</igc-list-item>
              <igc-list-item>Bob</igc-list-item>
            </igc-list>
            <button id="after">After</button>
          </div>
        `);
        const late = document.createElement(
          defineCE(class extends LateControl {})
        ) as LateControl;
        items[0].append(late);
        await settle();
        late.reveal();
        document.getElementById('after')!.focus();

        await press('Shift+Tab');

        expect(isFocused(late)).to.be.true;
        expect(late.getAttribute('tabindex')).to.equal('-1');
        expect(tabIndexes()).to.eql(['0', '-1']);
      });

      it('takes out a control once it is enabled', async () => {
        await createContacts(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <igc-button id="call" disabled>Call</igc-button>
            </igc-list-item>
          </igc-list>
        `);
        expect(call.hasAttribute('tabindex')).to.be.false;

        call.disabled = false;
        await settle();

        expect(call.getAttribute('tabindex')).to.equal('-1');
      });

      it('takes out an element that becomes focusable', async () => {
        await createContacts();
        const anchor = document.createElement('a');
        const tag = document.createElement('span');
        const note = document.createElement('div');
        const elements = [anchor, tag, note];

        anchor.textContent = 'Docs';
        tag.textContent = 'Tag';
        note.textContent = 'Note';
        items[2].append(...elements);
        await settle();

        expect(elements.map((each) => each.getAttribute('tabindex'))).to.eql([
          null,
          null,
          null,
        ]);

        anchor.href = '#docs';
        tag.tabIndex = 0;
        note.contentEditable = 'true';
        await settle();

        expect(elements.map((each) => each.getAttribute('tabindex'))).to.eql([
          '-1',
          '-1',
          '-1',
        ]);
      });

      it('gives the app its tabindex back when the mode changes', async () => {
        await createContacts();
        list.navigation = 'none';
        await settle();
        remove.setAttribute('tabindex', '2');
        list.navigation = 'grid';
        await settle();
        expect(remove.getAttribute('tabindex')).to.equal('-1');

        list.navigation = 'listbox';
        await settle();

        expect(remove.getAttribute('tabindex')).to.equal('2');
        expect(link.hasAttribute('tabindex')).to.be.false;
        expect(call.hasAttribute('tabindex')).to.be.false;
      });

      it('gives the app its tabindex back when a control leaves the list', async () => {
        await createContacts(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <button id="remove" tabindex="2">Delete</button>
            </igc-list-item>
          </igc-list>
        `);
        expect(remove.getAttribute('tabindex')).to.equal('-1');

        list.after(remove);
        await settle();

        expect(remove.getAttribute('tabindex')).to.equal('2');
        remove.remove();
      });
    });

    describe('Keyboard', () => {
      beforeEach(async () => {
        await createContacts();
        items[0].focus();
      });

      it('moves with Right through the controls of a row, in their layout order, and back to the row', () => {
        for (const stop of [link, call, remove, items[0]]) {
          pressOnFocused('ArrowRight');
          expect(isFocused(stop)).to.be.true;
        }
      });

      it('moves with Left through the controls of a row the other way', () => {
        for (const stop of [remove, call, link, items[0]]) {
          pressOnFocused('ArrowLeft');
          expect(isFocused(stop)).to.be.true;
        }
      });

      it('mirrors Left and Right in a right-to-left list', () => {
        list.dir = 'rtl';

        pressOnFocused('ArrowLeft');
        expect(isFocused(link)).to.be.true;

        pressOnFocused('ArrowRight');
        expect(isFocused(items[0])).to.be.true;
      });

      it('skips a disabled control and one that does not render', async () => {
        call.disabled = true;
        link.hidden = true;
        await settle();

        pressOnFocused('ArrowRight');
        expect(isFocused(remove)).to.be.true;
      });

      it('leaves Left and Right alone on a row without controls', () => {
        items[2].focus();

        expect(simulateCancelableKeydown(items[2], 'ArrowRight')).to.be.false;
        expect(isFocused(items[2])).to.be.true;
      });

      it('moves with Up, Down, Home and End on the rows, also from a control, and stops at the ends', () => {
        pressOnFocused('ArrowDown');
        expect(isFocused(items[1])).to.be.true;

        items[0].focus();
        pressOnFocused('ArrowLeft');
        pressOnFocused('ArrowUp');
        expect(isFocused(remove)).to.be.true;

        pressOnFocused('ArrowDown');
        expect(isFocused(items[1])).to.be.true;

        pressOnFocused('End');
        expect(isFocused(items[2])).to.be.true;

        pressOnFocused('ArrowDown');
        expect(isFocused(items[2])).to.be.true;

        pressOnFocused('Home');
        expect(isFocused(items[0])).to.be.true;
      });

      it('moves with Up from a control of a library component', async () => {
        items[1].focus();
        await press('ArrowLeft');
        expect(isFocused(pin)).to.be.true;

        await press('ArrowUp');
        expect(isFocused(items[0])).to.be.true;
      });

      it('leaves the arrow keys to a text field', async () => {
        items[1].focus();
        await press('ArrowRight');
        expect(isFocused(note)).to.be.true;

        for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
          await press(key);
          expect(isFocused(note)).to.be.true;
        }
      });

      it('leaves the arrow keys to a widget with an arrow-key role', async () => {
        const slider = document.createElement('div');
        Object.assign(slider, { role: 'slider', ariaLabel: 'Volume' });
        slider.tabIndex = 0;
        items[2].append(slider);
        await settle();
        slider.focus();

        expect(simulateCancelableKeydown(slider, 'ArrowRight')).to.be.false;
        expect(simulateCancelableKeydown(slider, 'ArrowDown')).to.be.false;
        expect(isFocused(slider)).to.be.true;
      });

      it('leaves the arrow keys to a component whose role comes from its internals', async () => {
        const tag = defineCE(
          class extends LitElement {
            constructor() {
              super();
              addInternalsController(this, { initialARIA: { role: 'slider' } });
            }
          }
        );
        const widget = document.createElement(tag);
        widget.tabIndex = 0;
        items[2].append(widget);
        await settle();
        widget.focus();

        expect(simulateCancelableKeydown(widget, 'ArrowDown')).to.be.false;
        expect(simulateCancelableKeydown(widget, 'ArrowRight')).to.be.false;
        expect(isFocused(widget)).to.be.true;
      });

      it('leaves alone a key that a control handled', () => {
        remove.addEventListener('keydown', (event) => event.preventDefault());
        remove.focus();

        simulateCancelableKeydown(remove, 'ArrowRight');
        simulateCancelableKeydown(remove, 'Escape');
        expect(isFocused(remove)).to.be.true;
      });

      it('returns from a control to its row on Escape and on F2', async () => {
        for (const key of ['Escape', 'F2']) {
          link.focus();
          expect(simulateCancelableKeydown(link, key)).to.be.true;
          expect(isFocused(items[0])).to.be.true;
        }

        items[1].focus();
        await press('ArrowRight');
        await press('Escape');
        expect(isFocused(items[1])).to.be.true;
      });

      it('lets an open popup close on Escape, and returns to the row on the next Escape', async () => {
        const select = document.createElement('igc-select');
        select.setAttribute('label', 'Status');
        select.append(document.createElement('igc-select-item'));
        items[2].append(select);
        await settle();
        items[2].focus();

        await press('ArrowRight');
        await select.show();
        await press('Escape');
        await waitUntil(() => !select.open);
        expect(isFocused(select)).to.be.true;

        await press('Escape');
        expect(isFocused(items[2])).to.be.true;
      });

      it('leaves Escape to a closed combo that handles it, and returns to the row on F2', async () => {
        const combo = document.createElement(
          IgcComboComponent.tagName
        ) as IgcComboComponent<{ name: string }>;
        combo.setAttribute('label', 'Tags');
        combo.valueKey = 'name';
        combo.displayKey = 'name';
        combo.data = [{ name: 'Design' }, { name: 'Code' }];
        combo.value = ['Design'];
        items[2].append(combo);
        await settle();
        items[2].focus();

        await press('ArrowRight');
        expect(isFocused(combo)).to.be.true;

        await press('Escape');
        expect(combo.value).to.be.empty;
        expect(isFocused(combo)).to.be.true;

        await press('F2');
        expect(isFocused(items[2])).to.be.true;
      });

      it('clicks the row on Enter and on Space, but not from a control', () => {
        const click = spy();
        items[0].addEventListener('click', click);

        pressOnFocused('Enter');
        pressOnFocused(' ');
        expect(click.callCount).to.equal(2);

        remove.focus();
        pressOnFocused('Enter');
        pressOnFocused(' ');
        expect(click.callCount).to.equal(2);
      });

      it('searches the rows by type-ahead, but not from a control', () => {
        pressOnFocused('b');
        expect(isFocused(items[1])).to.be.true;

        remove.focus();
        pressOnFocused('a');
        expect(isFocused(remove)).to.be.true;
      });
    });

    describe('Focus', () => {
      beforeEach(async () => {
        await createContacts();
      });

      it('makes the row of a focused control the tab stop', async () => {
        pin.focus();
        await settle();

        expect(tabIndexes()).to.eql(['-1', '0', '-1']);
      });

      it('keeps the row of a control that keeps the focus while the window loses it', async () => {
        remove.focus();
        simulateFocusOut(remove);
        await settle();
        items[0].remove();
        await settle();

        expect(isFocused(items[1])).to.be.true;
      });

      it('moves the focus to the next row when a control removes its row', async () => {
        remove.addEventListener('click', () => items[0].remove());
        remove.focus();
        simulateClick(remove);
        await settle();

        expect(isFocused(items[1])).to.be.true;
      });

      it('moves the focus to the row when a control removes itself', async () => {
        remove.addEventListener('click', () => remove.remove());
        remove.focus();
        simulateClick(remove);
        await settle();

        expect(isFocused(items[0])).to.be.true;
      });

      it('moves the focus to the row when a control with a shadow tree goes away', async () => {
        call.focus();
        call.remove();
        await settle();

        expect(isFocused(items[0])).to.be.true;
      });

      it('keeps the focus on a control when another control of its row goes away', async () => {
        call.focus();
        remove.remove();
        await settle();

        expect(isFocused(call)).to.be.true;
      });

      it('does not take the focus back after it went to no element', async () => {
        remove.focus();
        remove.blur();
        await settle();
        remove.remove();
        await settle();

        expect(document.activeElement).to.equal(document.body);
      });

      it('moves the focus to the row when a focused control can no longer take it', async () => {
        const cases: [HTMLElement, () => void][] = [
          [remove, () => (remove.disabled = true)],
          [call, () => (call.disabled = true)],
          [link, () => (link.hidden = true)],
        ];

        for (const [control, turnOff] of cases) {
          control.focus();
          turnOff();
          await waitUntil(() => isFocused(items[0]));
        }
      });

      it('moves the focus to the row when a focused control becomes inert or invisible', async () => {
        const turnOffs = [
          (button: HTMLButtonElement) => (button.inert = true),
          (button: HTMLButtonElement) => (button.style.visibility = 'hidden'),
          (button: HTMLButtonElement) => (button.style.display = 'none'),
        ];

        for (const turnOff of turnOffs) {
          const button = document.createElement('button');
          button.textContent = 'Archive';
          items[2].append(button);
          await settle();

          button.focus();
          turnOff(button);
          await waitUntil(() => isFocused(items[2]));
        }
      });

      it('leaves the focus on the page after a blur when the control can still take it', async () => {
        remove.focus();
        remove.blur();
        await settle();

        expect(document.activeElement).to.equal(document.body);
      });

      it('leaves the focus in a nested grid to that grid', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <span slot="title">Kate</span>
              <igc-list navigation="grid" aria-label="Tasks">
                <igc-list-item>Review <button>Done</button></igc-list-item>
              </igc-list>
            </igc-list-item>
          </igc-list>
        `);
        const [, task] = items;
        const button = list.querySelector('button')!;

        button.focus();
        button.remove();
        await settle();

        expect(isFocused(task)).to.be.true;
      });
    });

    describe('Ownership', () => {
      it('navigates the rows and the controls inside wrapper elements', async () => {
        await create(html`
          <igc-list navigation="grid">
            <div>
              <igc-list-item>A <button>Edit</button></igc-list-item>
            </div>
            <div><igc-list-item>B</igc-list-item></div>
          </igc-list>
        `);
        const button = list.querySelector('button')!;

        expect(aria(items[1], 'role')).to.equal('row');
        expect(button.getAttribute('tabindex')).to.equal('-1');

        items[0].focus();
        pressOnFocused('ArrowRight');
        expect(isFocused(button)).to.be.true;

        pressOnFocused('ArrowDown');
        expect(isFocused(items[1])).to.be.true;
      });

      it('treats a nested list that navigates as one control', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <span slot="title">Kate</span>
              <igc-list navigation="listbox" aria-label="Tags">
                <igc-list-item>Design</igc-list-item>
                <igc-list-item>Code</igc-list-item>
              </igc-list>
              <button slot="end">Delete</button>
            </igc-list-item>
            <igc-list-item>Bob</igc-list-item>
          </igc-list>
        `);
        const [row, design, code, bob] = items;
        const nested = list.querySelector('igc-list')!;
        const button = list.querySelector('button')!;

        // The tabindex on the nested list also takes its tab stop out.
        expect(tabIndexes()).to.eql(['0', '0', '-1', '-1']);
        expect(nested.getAttribute('tabindex')).to.equal('-1');
        expect(button.getAttribute('tabindex')).to.equal('-1');

        row.focus();
        await press('ArrowRight');
        expect(isFocused(design)).to.be.true;

        // Up and Down stay in the nested list, also at its ends.
        await press('ArrowDown');
        await press('ArrowDown');
        expect(isFocused(code)).to.be.true;

        await press('ArrowUp');
        await press('ArrowUp');
        expect(isFocused(design)).to.be.true;

        await press('ArrowLeft');
        expect(isFocused(row)).to.be.true;

        await press('ArrowLeft');
        expect(isFocused(button)).to.be.true;

        await press('ArrowLeft');
        expect(isFocused(design)).to.be.true;

        await press('Escape');
        expect(isFocused(row)).to.be.true;
        expect(isFocused(bob)).to.be.false;
      });

      it('treats a static nested list as content', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <igc-list>
                <igc-list-item><button>Open</button></igc-list-item>
              </igc-list>
            </igc-list-item>
          </igc-list>
        `);
        const button = list.querySelector('button')!;

        expect(button.getAttribute('tabindex')).to.equal('-1');

        items[0].focus();
        pressOnFocused('ArrowRight');
        expect(isFocused(button)).to.be.true;
      });

      it('finds the controls of components inside a wrapper with a shadow root', async () => {
        const wrapper = defineCE(
          class extends HTMLElement {
            constructor() {
              super();
              this.attachShadow({ mode: 'open' }).innerHTML =
                '<div><slot></slot></div>';
            }
          }
        );
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>Kate</igc-list-item>
          </igc-list>
        `);
        const button = (text: string) =>
          Object.assign(document.createElement(IgcButtonComponent.tagName), {
            textContent: text,
          });
        const [edit, share, open] = ['Edit', 'Share', 'Open'].map(button);
        const wrap = document.createElement(wrapper);
        const nested = document.createElement(IgcListComponent.tagName);
        const nestedItem = document.createElement('igc-list-item');

        wrap.append(edit, share);
        nestedItem.append(open);
        nested.append(nestedItem);
        items[0].append(wrap, nested);
        await settle();

        expect(wrap.hasAttribute('tabindex')).to.be.false;
        expect(nested.hasAttribute('tabindex')).to.be.false;

        items[0].focus();

        for (const stop of [edit, share, open, items[0]]) {
          pressOnFocused('ArrowRight');
          expect(isFocused(stop)).to.be.true;
        }
      });
    });

    describe('Composite controls', () => {
      it('enters a control with a composite role at its own tab stop', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <igc-button-group>
                <igc-toggle-button value="day">Day</igc-toggle-button>
                <igc-toggle-button value="week" selected
                  >Week</igc-toggle-button
                >
              </igc-button-group>
            </igc-list-item>
            <igc-list-item>
              <igc-radio-group>
                <igc-radio name="size" value="s">S</igc-radio>
                <igc-radio name="size" value="m" checked>M</igc-radio>
              </igc-radio-group>
            </igc-list-item>
            <igc-list-item>
              <igc-tabs>
                <igc-tab label="One"></igc-tab>
                <igc-tab label="Two" selected></igc-tab>
              </igc-tabs>
            </igc-list-item>
            <igc-list-item>
              <div role="toolbar" aria-label="Format">
                <button tabindex="-1">Bold</button>
                <button>Italic</button>
              </div>
            </igc-list-item>
          </igc-list>
        `);
        const entries = [
          list.querySelector('[value="week"]')!,
          list.querySelector('[value="m"]')!,
          list.querySelector('[label="Two"]')!,
          list.querySelector('button:not([tabindex="-1"])')!,
        ];
        const composites = [
          'igc-button-group',
          'igc-radio-group',
          'igc-tabs',
          '[role="toolbar"]',
        ].map((selector) => list.querySelector(selector)!);

        for (const [i, row] of items.entries()) {
          expect(composites[i].getAttribute('tabindex')).to.equal('-1');

          for (const key of ['ArrowRight', 'ArrowLeft']) {
            row.focus();
            pressOnFocused(key);
            expect(isFocused(entries[i])).to.be.true;
          }
        }
      });

      it('takes a composite control in a shadow root out of the tab order as one', async () => {
        await create(html`
          <div>
            <igc-list navigation="grid">
              <igc-list-item>
                <span slot="title">Kate</span>
                <igc-button-group>
                  <igc-toggle-button value="day">Day</igc-toggle-button>
                  <igc-toggle-button value="week" selected
                    >Week</igc-toggle-button
                  >
                </igc-button-group>
                <igc-list navigation="listbox" aria-label="Tags">
                  <igc-list-item>Design</igc-list-item>
                </igc-list>
              </igc-list-item>
            </igc-list>
            <button id="after">After</button>
          </div>
        `);
        const week = list.querySelector('[value="week"]')!;

        items[0].focus();
        await press('Tab');
        expect(isFocused(document.getElementById('after')!)).to.be.true;

        await press('Shift+Tab');
        expect(isFocused(items[0])).to.be.true;

        // A selection inside the group keeps it out of the tab order.
        await press('ArrowRight');
        expect(isFocused(week)).to.be.true;
        await press('ArrowLeft');
        await press('Tab');
        expect(isFocused(document.getElementById('after')!)).to.be.true;
      });

      it('keeps the buttons of a group in multiple mode out of the tab order', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <igc-button-group selection="multiple">
                <igc-toggle-button value="bold">Bold</igc-toggle-button>
                <igc-toggle-button value="italic">Italic</igc-toggle-button>
              </igc-button-group>
            </igc-list-item>
          </igc-list>
        `);
        const buttons = Array.from(list.querySelectorAll('igc-toggle-button'));
        const values = () =>
          buttons.map((button) => button.getAttribute('tabindex'));

        expect(values()).to.eql(['-1', '-1']);

        items[0].focus();
        pressOnFocused('ArrowRight');
        expect(isFocused(buttons[0])).to.be.true;
        pressOnFocused('ArrowRight');
        expect(isFocused(buttons[1])).to.be.true;

        buttons[0].selected = true;
        await settle();
        expect(values()).to.eql(['-1', '-1']);

        list.navigation = 'none';
        await settle();
        expect(values()).to.eql([null, null]);
      });

      it('enters an empty nested list that is its own tab stop, and keeps it out of the tab order', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <span slot="title">Kate</span>
              <igc-list navigation="listbox" aria-label="Tags"></igc-list>
            </igc-list-item>
          </igc-list>
        `);
        const nested = list.querySelector('igc-list')!;
        expect(nested.getAttribute('tabindex')).to.equal('-1');

        items[0].focus();
        pressOnFocused('ArrowRight');
        expect(isFocused(nested)).to.be.true;

        const tag = document.createElement('igc-list-item');
        nested.append(tag);
        await settle();

        expect(nested.getAttribute('tabindex')).to.equal('-1');
        expect(tag.getAttribute('tabindex')).to.equal('0');
      });

      it('leaves the arrow keys that a composite does not handle to the grid', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <igc-tabs>
                <igc-tab label="One" selected></igc-tab>
                <igc-tab label="Two"></igc-tab>
              </igc-tabs>
              <igc-button-group>
                <igc-toggle-button value="day" selected>Day</igc-toggle-button>
                <igc-toggle-button value="week">Week</igc-toggle-button>
              </igc-button-group>
            </igc-list-item>
            <igc-list-item>Bob</igc-list-item>
          </igc-list>
        `);
        const [one, two] = list.querySelectorAll('igc-tab');
        const day = list.querySelector('igc-toggle-button')!;

        items[0].focus();
        await press('ArrowRight');
        expect(isFocused(one)).to.be.true;

        // The tabs handle Left and Right, and leave Up and Down to the grid.
        await press('ArrowRight');
        expect(isFocused(two)).to.be.true;

        await press('ArrowDown');
        expect(isFocused(items[1])).to.be.true;

        // A single-selection toggle button is a radio: it keeps every arrow key.
        items[0].focus();
        await press('ArrowLeft');
        expect(isFocused(day)).to.be.true;

        await press('ArrowDown');
        expect(isFocused(day)).to.be.true;
      });

      it('leaves every arrow key to the radios of a radio group', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <igc-radio-group>
                <igc-radio name="size" value="s" checked>S</igc-radio>
                <igc-radio name="size" value="m">M</igc-radio>
              </igc-radio-group>
            </igc-list-item>
            <igc-list-item>Bob</igc-list-item>
          </igc-list>
        `);
        const [small, medium] = list.querySelectorAll('igc-radio');

        items[0].focus();
        await press('ArrowRight');
        expect(isFocused(small)).to.be.true;

        await press('ArrowDown');
        expect(isFocused(medium)).to.be.true;

        await press('ArrowLeft');
        expect(isFocused(small)).to.be.true;
      });

      it('turns an element that gets a composite role into one control', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <div id="bar">
                <button id="bold">Bold</button>
                <button id="italic" tabindex="-1">Italic</button>
              </div>
            </igc-list-item>
          </igc-list>
        `);
        const bar = list.querySelector<HTMLElement>('#bar')!;
        const bold = list.querySelector('#bold')!;
        const italic = list.querySelector('#italic')!;
        expect(bold.getAttribute('tabindex')).to.equal('-1');

        Object.assign(bar, { role: 'toolbar', ariaLabel: 'Format' });
        await settle();

        expect(bar.getAttribute('tabindex')).to.equal('-1');
        expect(bold.hasAttribute('tabindex')).to.be.false;
        expect(italic.getAttribute('tabindex')).to.equal('-1');

        items[0].focus();
        pressOnFocused('ArrowRight');
        expect(isFocused(bold)).to.be.true;
      });

      it('turns a button group into separate controls and back when its selection changes mode', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <igc-button-group>
                <igc-toggle-button value="day">Day</igc-toggle-button>
                <igc-toggle-button value="week" selected
                  >Week</igc-toggle-button
                >
              </igc-button-group>
            </igc-list-item>
          </igc-list>
        `);
        const group = list.querySelector(IgcButtonGroupComponent.tagName)!;
        const [day, week] = list.querySelectorAll('igc-toggle-button');

        group.selection = 'multiple';
        await settle();

        expect(group.hasAttribute('tabindex')).to.be.false;
        expect(day.getAttribute('tabindex')).to.equal('-1');
        expect(week.getAttribute('tabindex')).to.equal('-1');

        items[0].focus();
        pressOnFocused('ArrowRight');
        expect(isFocused(day)).to.be.true;

        group.selection = 'single';
        await settle();

        // The mode change clears the selection, so the first button is the
        // tab stop of the group.
        expect(group.getAttribute('tabindex')).to.equal('-1');
        expect(day.hasAttribute('tabindex')).to.be.false;

        items[0].focus();
        pressOnFocused('ArrowRight');
        expect(isFocused(day)).to.be.true;
      });

      it('skips a composite with no item that can take the focus', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <button>Edit</button>
              <div role="toolbar" aria-label="Format">
                <button disabled>Bold</button>
              </div>
            </igc-list-item>
          </igc-list>
        `);
        const edit = list.querySelector('button')!;

        items[0].focus();
        pressOnFocused('ArrowLeft');
        expect(isFocused(edit)).to.be.true;

        pressOnFocused('ArrowRight');
        expect(isFocused(items[0])).to.be.true;
      });

      it('enters an app widget that is its own tab stop as itself', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <div
                role="listbox"
                tabindex="0"
                aria-label="Tags"
                aria-activedescendant="design"
              >
                <div role="option" id="design">Design</div>
              </div>
            </igc-list-item>
          </igc-list>
        `);
        const tags = list.querySelector<HTMLElement>('[role="listbox"]')!;
        expect(tags.getAttribute('tabindex')).to.equal('-1');

        items[0].focus();
        pressOnFocused('ArrowRight');
        expect(isFocused(tags)).to.be.true;

        list.navigation = 'none';
        await settle();
        expect(tags.getAttribute('tabindex')).to.equal('0');
      });

      it('enters a group of native radios at its checked radio', async () => {
        await create(html`
          <igc-list navigation="grid">
            <igc-list-item>
              <button>Edit</button>
              <input type="radio" name="size" value="s" aria-label="Small" />
              <input
                type="radio"
                name="size"
                value="m"
                aria-label="Medium"
                checked
              />
              <input type="radio" name="size" value="l" aria-label="Large" />
            </igc-list-item>
          </igc-list>
        `);
        const edit = list.querySelector('button')!;
        const medium = list.querySelector<HTMLInputElement>('[value="m"]')!;

        items[0].focus();
        pressOnFocused('ArrowRight');
        expect(isFocused(edit)).to.be.true;

        pressOnFocused('ArrowRight');
        expect(isFocused(medium)).to.be.true;

        items[0].focus();
        pressOnFocused('ArrowLeft');
        expect(isFocused(medium)).to.be.true;
      });
    });

    describe('Empty list', () => {
      it('shows the empty content as a row with one cell', async () => {
        await create(html`
          <igc-list navigation="grid" aria-label="Contacts">
            <span slot="empty">No results</span>
          </igc-list>
        `);
        const cell =
          list.renderRoot.querySelector('slot[name="empty"]')!.parentElement!;

        expect(cell.getAttribute('role')).to.equal('gridcell');
        expect(cell.parentElement!.getAttribute('role')).to.equal('row');
        expect(list.getAttribute('tabindex')).to.equal('0');
      });

      it('moves the focus to the rows that arrive while it has the focus', async () => {
        await create(html`<igc-list navigation="grid"></igc-list>`);
        const item = document.createElement('igc-list-item');
        item.textContent = 'Kate';
        list.focus();

        list.append(item);
        await settle();

        expect(isFocused(item)).to.be.true;
        expect(aria(item, 'role')).to.equal('row');
      });
    });

    describe('Change of the navigation', () => {
      it('turns into a listbox', async () => {
        await createContacts();

        list.navigation = 'listbox';
        await settle();

        expect(aria(list, 'role')).to.equal('listbox');
        expect(aria(items[0], 'role')).to.equal('option');
        expect(aria(items[0], 'ariaSelected')).to.equal('false');
        expect(cellOf(items[0])).to.be.null;
        expect(link.hasAttribute('tabindex')).to.be.false;

        items[0].focus();
        pressOnFocused('ArrowRight');
        expect(isFocused(items[0])).to.be.true;
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

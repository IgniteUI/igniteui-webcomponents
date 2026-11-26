import { expect } from '@open-wc/testing';
import { type SinonFakeTimers, useFakeTimers } from 'sinon';
import { createTypeahead, type TypeaheadOptions } from './typeahead.js';

function createItems(...texts: string[]): HTMLElement[] {
  return texts.map((text) => {
    const item = document.createElement('div');
    item.textContent = text;
    return item;
  });
}

function keydown(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, ...init });
}

describe('Typeahead', () => {
  let clock: SinonFakeTimers;
  let items: HTMLElement[];

  const create = (options: Partial<TypeaheadOptions<HTMLElement>> = {}) =>
    createTypeahead<HTMLElement>({ items: () => items, ...options });

  /** Types each character of `text` with no pause, and returns the last result. */
  const type = (
    typeahead: ReturnType<typeof create>,
    text: string,
    current?: HTMLElement | null
  ) => {
    let result: HTMLElement | undefined;
    for (const key of text) {
      result = typeahead.search(key, current);
    }
    return result;
  };

  beforeEach(() => {
    clock = useFakeTimers({ now: 1000, toFake: ['Date'] });
    items = createItems('  Apple ', 'Banana', 'Blueberry', 'Cherry', 'Bean');
  });

  afterEach(() => {
    clock.restore();
  });

  describe('accepts', () => {
    it('accepts a single printable character', () => {
      const typeahead = create();

      expect(typeahead.accepts(keydown('a'))).to.be.true;
      expect(typeahead.accepts(keydown('Z'))).to.be.true;
      expect(typeahead.accepts(keydown('1'))).to.be.true;
      expect(typeahead.accepts(keydown('😀'))).to.be.true;
    });

    it('rejects named keys', () => {
      const typeahead = create();

      for (const key of ['ArrowDown', 'Enter', 'Tab', 'Escape', 'F2']) {
        expect(typeahead.accepts(keydown(key)), key).to.be.false;
      }
    });

    it('rejects a character typed with Ctrl, Meta or Alt', () => {
      const typeahead = create();

      expect(typeahead.accepts(keydown('a', { ctrlKey: true }))).to.be.false;
      expect(typeahead.accepts(keydown('a', { metaKey: true }))).to.be.false;
      expect(typeahead.accepts(keydown('a', { altKey: true }))).to.be.false;
    });

    it('accepts a Space by default', () => {
      expect(create().accepts(keydown(' '))).to.be.true;
    });

    it('accepts a Space only during a search when Space does not start one', () => {
      const typeahead = create({ spaceStartsSearch: false });

      expect(typeahead.accepts(keydown(' '))).to.be.false;

      typeahead.search('b');
      expect(typeahead.accepts(keydown(' '))).to.be.true;

      clock.tick(501);
      expect(typeahead.accepts(keydown(' '))).to.be.false;
    });
  });

  describe('search without a current item', () => {
    it('finds the first item that starts with the term, ignoring case and outer spaces', () => {
      const typeahead = create();

      expect(typeahead.search('A')).to.equal(items[0]);
      clock.tick(501);
      expect(typeahead.search('b')).to.equal(items[1]);
    });

    it('builds the term from keys typed in quick succession', () => {
      expect(type(create(), 'blu')).to.equal(items[2]);
    });

    it('returns undefined when no item matches', () => {
      expect(type(create(), 'xyz')).to.be.undefined;
    });

    it('starts a new term after a pause of more than half a second', () => {
      const typeahead = create();

      expect(type(typeahead, 'bl')).to.equal(items[2]);
      clock.tick(500);
      expect(typeahead.search('x')).to.be.undefined;

      clock.tick(501);
      expect(typeahead.search('c')).to.equal(items[3]);
    });

    it('matches the text that the options give', () => {
      const typeahead = create({
        text: (item) => item.dataset.title ?? '',
      });
      items[3].dataset.title = 'Zucchini';

      expect(typeahead.search('z')).to.equal(items[3]);
    });

    it('reads the items on every search', () => {
      const typeahead = create();

      items = createItems('Date');

      expect(typeahead.search('d')).to.equal(items[0]);
    });
  });

  describe('search from a current item', () => {
    it('goes to the next item that starts with a single letter', () => {
      expect(create().search('b', items[1])).to.equal(items[2]);
    });

    it('cycles through the items that start with a letter typed again', () => {
      const typeahead = create();

      expect(typeahead.search('b', items[0])).to.equal(items[1]);
      expect(typeahead.search('b', items[1])).to.equal(items[2]);
      expect(typeahead.search('b', items[2])).to.equal(items[4]);
      expect(typeahead.search('b', items[4])).to.equal(items[1]);
    });

    it('keeps the current item while a longer term still matches it', () => {
      const typeahead = create();

      expect(typeahead.search('b', items[0])).to.equal(items[1]);
      expect(typeahead.search('a', items[1])).to.equal(items[1]);
      expect(typeahead.search('n', items[1])).to.equal(items[1]);
    });

    it('moves on when a longer term no longer matches the current item', () => {
      const typeahead = create();

      expect(typeahead.search('b', items[0])).to.equal(items[1]);
      expect(typeahead.search('e', items[1])).to.equal(items[4]);
    });

    it('wraps around to the items before the current one', () => {
      expect(create().search('a', items[3])).to.equal(items[0]);
    });

    it('returns the current item when it is the only match', () => {
      expect(create().search('c', items[3])).to.equal(items[3]);
    });

    it('searches from the start when the current item is not in the set', () => {
      const outside = document.createElement('div');

      expect(create().search('b', outside)).to.equal(items[1]);
      clock.tick(501);
      expect(type(create(), 'bl', outside)).to.equal(items[2]);
    });

    it('returns undefined when no item matches', () => {
      expect(create().search('x', items[1])).to.be.undefined;
    });

    it('returns undefined for an empty set', () => {
      items = [];

      expect(create().search('a', document.createElement('div'))).to.be
        .undefined;
    });
  });
});

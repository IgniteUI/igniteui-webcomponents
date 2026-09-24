import { expect, html } from '@open-wc/testing';
import { nothing, render } from 'lit';
import { AsyncDirective, directive } from 'lit/async-directive.js';
import { keyed } from 'lit/directives/keyed.js';
import { recycle } from './recycle.js';

describe('recycle directive', () => {
  let container: HTMLElement;
  const events: string[] = [];

  class Track extends AsyncDirective {
    private _key = -1;

    public render(key: number): number {
      this._key = key;
      return key;
    }

    protected override disconnected(): void {
      events.push(`disconnected ${this._key}`);
    }

    protected override reconnected(): void {
      events.push(`reconnected ${this._key}`);
    }
  }
  const track = directive(Track);

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    events.length = 0;
  });

  afterEach(() => {
    render(nothing, container);
    container.remove();
  });

  const buttonTemplate = (key: number) =>
    html`<li data-key=${key}><button>${key}</button></li>`;

  const trackTemplate = (key: number) => html`<li>${track(key)}</li>`;

  function renderKeys(keys: number[], template = buttonTemplate): void {
    render(
      html`<ul>
        ${recycle(keys, (key) => key, template)}
      </ul>`,
      container
    );
  }

  function range(start: number, end: number): number[] {
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  function list(): HTMLUListElement {
    return container.querySelector('ul')!;
  }

  function elements(): HTMLLIElement[] {
    return Array.from(list().querySelectorAll('li'));
  }

  function renderedKeys(): number[] {
    return elements().map((li) => Number(li.dataset.key));
  }

  function elementByKey(): Map<number, HTMLLIElement> {
    return new Map(elements().map((li) => [Number(li.dataset.key), li]));
  }

  function commentCount(): number {
    return Array.from(list().childNodes).filter(
      (node) => node.nodeType === Node.COMMENT_NODE
    ).length;
  }

  /** Records the elements added to the list while `action` runs. */
  function addedElements(action: () => void): Element[] {
    const observer = new MutationObserver(() => {});
    observer.observe(list(), { childList: true });
    action();

    return observer
      .takeRecords()
      .flatMap((record) => Array.from(record.addedNodes))
      .filter((node): node is Element => node instanceof Element);
  }

  it('renders the items in order', () => {
    renderKeys(range(0, 5));

    expect(renderedKeys()).to.eql([0, 1, 2, 3, 4]);
    expect(list().textContent!.replace(/\s/g, '')).to.equal('01234');
  });

  it('keeps the element of each key that stays', () => {
    renderKeys(range(0, 10));
    const before = elementByKey();

    renderKeys(range(3, 13));
    const after = elementByKey();

    expect(renderedKeys()).to.eql(range(3, 13));
    for (const key of range(3, 10)) {
      expect(after.get(key)).to.equal(before.get(key));
    }
  });

  it('reuses the elements of departed keys without a DOM move', () => {
    renderKeys(range(0, 10));
    const before = elements();

    const added = addedElements(() => renderKeys(range(100, 110)));

    expect(renderedKeys()).to.eql(range(100, 110));
    expect(elements()).to.have.ordered.members(before);
    expect(added).to.be.empty;
  });

  it('moves only the recycled elements when the keys shift', () => {
    renderKeys(range(0, 10));
    const before = elementByKey();

    const down = addedElements(() => renderKeys(range(2, 12)));
    expect(renderedKeys()).to.eql(range(2, 12));
    expect(down).to.have.ordered.members([before.get(1), before.get(0)]);

    const middle = elementByKey();
    const up = addedElements(() => renderKeys(range(0, 10)));
    expect(renderedKeys()).to.eql(range(0, 10));
    expect(up).to.have.ordered.members([middle.get(11), middle.get(10)]);
  });

  it('moves the kept elements only when they are fewer than half the recycled ones', () => {
    renderKeys(range(0, 10));
    let before = elementByKey();

    // Four keys stay and six leave: the recycled elements move.
    let added = addedElements(() => renderKeys(range(6, 16)));
    expect(added).to.have.ordered.members(
      [5, 4, 3, 2, 1, 0].map((key) => before.get(key))
    );

    // Two keys stay and eight leave: the kept elements move.
    before = elementByKey();
    added = addedElements(() => renderKeys(range(14, 24)));
    expect(renderedKeys()).to.eql(range(14, 24));
    expect(added).to.have.ordered.members([before.get(15), before.get(14)]);
  });

  it('puts the items in key order for random changes of keys', () => {
    let seed = 1;
    const random = (max: number) => {
      seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;
      return Math.floor((seed / 2 ** 32) * max);
    };

    for (let step = 0; step < 200; step++) {
      const start = random(30);
      const keys = range(start, start + random(20));
      if (random(4) === 0) {
        for (let i = keys.length - 1; i > 0; i--) {
          const j = random(i + 1);
          [keys[i], keys[j]] = [keys[j], keys[i]];
        }
      }

      renderKeys(keys);
      expect(renderedKeys()).to.eql(keys);
    }
  });

  it('creates no elements once the window has its full size', () => {
    renderKeys(range(0, 10));
    const pool = elements();

    for (let start = 1; start < 50; start += 3) {
      renderKeys(range(start, start + 10));
    }
    renderKeys(range(500, 510));

    expect(elements()).to.have.members(pool);
  });

  it('keeps two markers for each item and leaks no comments', () => {
    renderKeys(range(0, 10));
    const initial = commentCount();

    for (let start = 1; start <= 100; start++) {
      renderKeys(range(start, start + 10));
    }
    expect(commentCount()).to.equal(initial);

    renderKeys(range(0, 4));
    expect(commentCount()).to.equal(initial - 2 * 6);
  });

  it('puts the items in key order for any change of keys', () => {
    const sequences = [
      range(0, 8),
      range(0, 8).reverse(),
      [3, 1, 4, 0, 5, 2, 7, 6],
      [10, 3, 11, 1, 12],
      range(0, 12),
      range(0, 4),
      range(0, 9),
      [11, 5, 0, 20, 21, 4, 9],
      [],
      [7, 8, 9],
      [9, 30, 8, 31, 7, 32, 33, 34, 35],
      [1, 1, 2],
      [2, 1, 1, 1],
    ];

    for (const keys of sequences) {
      renderKeys(keys);
      expect(renderedKeys()).to.eql(keys);
    }
  });

  it('keeps the focus in a kept item while the keys shift', () => {
    renderKeys(range(0, 10));
    const button = elementByKey().get(5)!.querySelector('button')!;
    button.focus();

    renderKeys(range(3, 13));
    expect(document.activeElement).to.equal(button);

    renderKeys(range(1, 11));
    expect(document.activeElement).to.equal(button);
  });

  it('keeps the focused kept element in place when the kept elements move', () => {
    renderKeys(range(0, 10));
    const button = elementByKey().get(9)!.querySelector('button')!;
    button.focus();

    renderKeys(range(8, 18));
    expect(renderedKeys()).to.eql(range(8, 18));
    expect(document.activeElement).to.equal(button);
  });

  it('keeps the focus in a kept item when the keys reverse', () => {
    renderKeys(range(0, 10));
    const button = elementByKey().get(3)!.querySelector('button')!;
    button.focus();

    renderKeys(range(0, 10).reverse());
    expect(renderedKeys()).to.eql(range(0, 10).reverse());
    expect(document.activeElement).to.equal(button);
  });

  it('disconnects the async directives of removed parts', () => {
    renderKeys(range(0, 5), trackTemplate);
    renderKeys(range(0, 2), trackTemplate);

    expect(events).to.eql([
      'disconnected 2',
      'disconnected 3',
      'disconnected 4',
    ]);
  });

  describe('Pool', () => {
    it('reuses a detached part when the window grows again', () => {
      renderKeys(range(0, 10));
      const last = elementByKey().get(9)!;

      renderKeys(range(0, 9));
      expect(last.isConnected).to.be.false;

      const added = addedElements(() => renderKeys(range(0, 10)));
      expect(renderedKeys()).to.eql(range(0, 10));
      expect(added).to.have.ordered.members([last]);
    });

    it('keeps at most as many parts as the window has items', () => {
      renderKeys(range(0, 10));
      const initial = new Set(elements());

      renderKeys(range(0, 3));
      renderKeys(range(0, 10));

      // Keys 0-2 kept their parts, three came from the pool, four are new.
      const reused = elements().filter((element) => initial.has(element));
      expect(reused).to.have.length(6);
    });

    it('drops the pool when the window is empty', () => {
      renderKeys(range(0, 5));
      const initial = new Set(elements());

      renderKeys([]);
      expect(elements()).to.be.empty;

      renderKeys(range(0, 5));
      expect(elements().some((element) => initial.has(element))).to.be.false;
    });

    it('disconnects the async directives of a detached part and reconnects them on reuse', () => {
      renderKeys(range(0, 5), trackTemplate);
      renderKeys(range(0, 4), trackTemplate);
      expect(events).to.eql(['disconnected 4']);

      renderKeys(range(0, 5), trackTemplate);
      expect(events).to.eql(['disconnected 4', 'reconnected 4']);
    });
  });

  it('takes over from and gives way to other content', () => {
    const renderValue = (value: unknown) =>
      render(
        html`<ul>
          ${value}
        </ul>`,
        container
      );
    const items = (keys: number[]) =>
      recycle(
        keys,
        (key) => key,
        (key) => html`<li data-key=${key}>${key}</li>`
      );

    renderValue('empty');
    renderValue(items(range(0, 3)));
    expect(renderedKeys()).to.eql([0, 1, 2]);

    renderValue(items(range(1, 4)));
    expect(renderedKeys()).to.eql([1, 2, 3]);

    renderValue('empty');
    expect(elements()).to.be.empty;
    expect(list().textContent!.trim()).to.equal('empty');
  });

  describe('Unbound DOM state', () => {
    const checkboxTemplate = (key: number) =>
      html`<li data-key=${key}><input type="checkbox" /></li>`;

    function checkbox(key: number): HTMLInputElement {
      return elementByKey().get(key)!.querySelector('input')!;
    }

    it('moves with a recycled element to the key that enters', () => {
      renderKeys(range(0, 3), checkboxTemplate);
      checkbox(0).checked = true;

      renderKeys(range(1, 4), checkboxTemplate);
      expect(checkbox(3).checked).to.be.true;
    });

    it('stays with its key when the template is keyed', () => {
      const template = (key: number) =>
        html`${keyed(key, checkboxTemplate(key))}`;
      renderKeys(range(0, 3), template);
      checkbox(0).checked = true;

      renderKeys(range(1, 4), template);
      expect(checkbox(3).checked).to.be.false;
      expect(renderedKeys()).to.eql([1, 2, 3]);
    });
  });
});

import { expect, html } from '@open-wc/testing';
import { nothing, render } from 'lit';
import { AsyncDirective, directive } from 'lit/async-directive.js';
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
});

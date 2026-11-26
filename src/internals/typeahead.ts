import { spaceBar } from './controllers/keys.js';

/** The pause, in milliseconds, after which the next key starts a new search. */
const SEARCH_TIMEOUT = 500;

/** One printable character: a single code point. */
const PRINTABLE = /^.$/u;

type TypeaheadOptions<T extends Element> = {
  /** The items to search, in order. */
  items: () => readonly T[];
  /**
   * The text that the search term must start with. Defaults to the trimmed
   * `textContent` of the item.
   */
  text?: (item: T) => string;
  /**
   * Whether a Space can start a search. With `false`, it only extends one, so
   * the host can use Space to activate. Default `true`.
   */
  spaceStartsSearch?: boolean;
};

function defaultText(item: Element): string {
  return item.textContent?.trim() ?? '';
}

/**
 * Finds an item from the first letters of its text, as the user types them.
 * Keys typed less than half a second apart build one search term; a longer
 * pause starts a new one. The host checks a key with {@link Typeahead.accepts},
 * and then moves to the result of {@link Typeahead.search}.
 */
class Typeahead<T extends Element> {
  private readonly _options: TypeaheadOptions<T>;
  private _term = '';
  private _lastKeyTime = 0;

  /** Whether a search runs: its last key came before the pause ended. */
  private get _running(): boolean {
    return (
      this._term !== '' && Date.now() - this._lastKeyTime <= SEARCH_TIMEOUT
    );
  }

  constructor(options: TypeaheadOptions<T>) {
    this._options = options;
  }

  private _text(item: T): string {
    return (this._options.text ?? defaultText)(item).toLocaleLowerCase();
  }

  /**
   * Whether `event` is a key of a search: one printable character, without
   * Ctrl, Meta or Alt, which make it a shortcut. When `spaceStartsSearch` is
   * `false`, a Space counts only while a search runs.
   */
  public accepts(event: KeyboardEvent): boolean {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      !PRINTABLE.test(event.key)
    ) {
      return false;
    }

    return (
      event.key !== spaceBar ||
      this._options.spaceStartsSearch !== false ||
      this._running
    );
  }

  /**
   * Adds `key` to the search term and returns the item that the term finds, or
   * `undefined` when no item matches.
   *
   * @remarks
   * Without `current`, the first item whose text starts with the term matches.
   * With `current`, the search goes on from it and wraps around: a longer term
   * can keep `current`, and a single letter, also when typed again, goes to the
   * next item that starts with it.
   */
  public search(key: string, current?: T | null): T | undefined {
    const now = Date.now();

    if (now - this._lastKeyTime > SEARCH_TIMEOUT) {
      this._term = '';
    }

    this._lastKeyTime = now;
    this._term += key.toLocaleLowerCase();

    const items = this._options.items();

    if (!current) {
      return items.find((item) => this._text(item).startsWith(this._term));
    }

    const letters = Array.from(this._term);
    const repeated = letters.every((letter) => letter === letters[0]);
    const term = repeated ? letters[0] : this._term;
    const index = items.indexOf(current);
    const start = repeated ? index + 1 : Math.max(index, 0);

    for (let offset = 0; offset < items.length; offset++) {
      const item = items[(start + offset) % items.length];

      if (this._text(item).startsWith(term)) {
        return item;
      }
    }

    return undefined;
  }
}

/** Creates a {@link Typeahead} search over the items of a host. */
export function createTypeahead<T extends Element>(
  options: TypeaheadOptions<T>
): Typeahead<T> {
  return new Typeahead(options);
}

export type { Typeahead, TypeaheadOptions };

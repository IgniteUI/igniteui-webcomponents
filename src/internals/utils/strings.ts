/**
 * Builds a string from format specifiers and replacement parameters.
 * Will coerce non-string parameters to their string representations.
 *
 * @example
 * ```typescript
 * formatString('{0} says "{1}".', 'John', 'Hello'); // 'John says "Hello".'
 * formatString('{1} is greater than {0}', 0, 1); // '1 is greater than 0'
 * ```
 */
export function formatString(template: string, ...params: unknown[]): string {
  const length = params.length;

  return template.replace(/{(\d+)}/g, (match: string, index: number) =>
    index >= length ? match : `${params[index]}`
  );
}

/**
 * Splits a string into its words, treating whitespace, `-`, `_` and
 * camelCase boundaries as separators.
 */
export function splitToWords(text: string) {
  const input = text.replaceAll(/[^a-zA-Z0-9\s-_]/g, '');
  if (/[\s-_]+/.test(input)) return input.split(/[\s-_]+/);
  return input.split(/(?=[A-Z])+/);
}

/** Converts a string to kebab-case. */
export function toKebabCase(text: string): string {
  const input = text.trim();
  return splitToWords(input).join('-').toLowerCase();
}

/**
 *  Escapes any potential regex syntax characters in a string, and returns a new string
 *  that can be safely used as a literal pattern for the `RegExp()` constructor.
 *
 *  @remarks
 *  Substitute with `RegExp.escape` once it has enough support:
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape#browser_compatibility
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a generator of monotonically increasing DOM ids based on the given prefix.
 *
 * @example
 * ```typescript
 * const nextId = createIdGenerator('radio');
 * nextId(); // 'radio-1'
 * nextId(); // 'radio-2'
 * ```
 */
export function createIdGenerator(prefix: string): () => string {
  let id = 0;
  return () => `${prefix}-${++id}`;
}

let pool: Uint8Array<ArrayBuffer>;
let poolOffset: number;
const urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

function fillPool(bytes: number): void {
  if (!pool || pool.length < bytes) {
    pool = new Uint8Array(new ArrayBuffer(bytes * 128));
    crypto.getRandomValues(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    crypto.getRandomValues(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
}

/**
 * Generates a unique string ID of the specified size using a URL-friendly alphabet.
 * The default size is 21 characters, which provides a very low probability of collisions.
 */
export function nanoid(size = 21): string {
  const bytes = size | 0;
  fillPool(bytes);

  let id = '';
  for (let i = poolOffset - bytes; i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }

  return id;
}

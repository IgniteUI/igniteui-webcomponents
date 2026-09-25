/**
 * Builds a string from format specifiers and replacement parameters.
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
 * Splits a string into words at whitespace, `-`, `_` and camelCase
 * boundaries.
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
 * Escapes each regular expression character in a string, so that `RegExp()`
 * reads it as a literal pattern.
 *
 * @remarks
 * Replace with `RegExp.escape` once browser support is sufficient:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape#browser_compatibility
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a function that returns DOM ids with the given prefix.
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
 * Generates a unique string id of the given size, from a URL-safe alphabet.
 * The default of 21 characters makes a collision very unlikely.
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

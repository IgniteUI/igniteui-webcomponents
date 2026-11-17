import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { formatCopiedText } from './format.js';

/** The no-break space, the em space and the ideographic space. */
const UNICODE_SPACES = [0xa0, 0x2003, 0x3000].map((code) =>
  String.fromCodePoint(code)
);

/** Strings with many kinds of whitespace, and arbitrary strings. */
const text = fc.oneof(
  fc.string({
    unit: fc.constantFrom(' ', '\t', '\n', '\r', 'a', 'b', ...UNICODE_SPACES),
    maxLength: 40,
  }),
  fc.string({ unit: 'grapheme', maxLength: 40 })
);

const withoutWhitespace = (value: string) => value.replaceAll(/\s/g, '');

describe('Copy to clipboard text format', () => {
  describe('plain', () => {
    const plain = (value: string) => formatCopiedText(value, 'plain');

    it('is idempotent', () => {
      fc.assert(
        fc.property(text, (value) => {
          expect(plain(plain(value))).to.equal(plain(value));
        })
      );
    });

    it('keeps the other characters in their order', () => {
      fc.assert(
        fc.property(text, (value) => {
          expect(withoutWhitespace(plain(value))).to.equal(
            withoutWhitespace(value)
          );
        })
      );
    });

    it('leaves only single spaces and single line breaks, trimmed', () => {
      fc.assert(
        fc.property(text, (value) => {
          const result = plain(value);

          expect(result).to.equal(result.trim());
          expect(result).to.not.match(/[^\S \n]| {2}|\n\n| \n|\n /);
        })
      );
    });
  });

  describe('preserve', () => {
    const preserve = (value: string) => formatCopiedText(value, 'preserve');

    it('is idempotent', () => {
      fc.assert(
        fc.property(text, (value) => {
          expect(preserve(preserve(value))).to.equal(preserve(value));
        })
      );
    });

    it('removes only the leading and trailing line breaks', () => {
      fc.assert(
        fc.property(text, (value) => {
          const result = preserve(value);

          expect(result).to.not.match(/^\n|\n$/);
          expect(value).to.include(result);
          expect(result.replaceAll('\n', '')).to.equal(
            value.replaceAll('\n', '')
          );
        })
      );
    });
  });
});

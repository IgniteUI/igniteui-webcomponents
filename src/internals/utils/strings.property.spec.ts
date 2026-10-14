import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';

import {
  createIdGenerator,
  escapeRegex,
  formatString,
  nanoid,
  toKebabCase,
} from './strings.js';

const text = fc.string({ unit: 'grapheme', maxLength: 40 });

describe('String utilities properties', () => {
  it('escapeRegex makes a pattern that matches only the string itself', () => {
    fc.assert(
      fc.property(text, text, (value, other) => {
        for (const flags of ['', 'u']) {
          const pattern = new RegExp(`^${escapeRegex(value)}$`, flags);

          expect(pattern.test(value)).to.be.true;
          expect(pattern.test(other)).to.equal(other === value);
        }
      })
    );
  });

  it('toKebabCase is idempotent and gives lowercase words', () => {
    fc.assert(
      fc.property(text, (value) => {
        const kebab = toKebabCase(value);

        expect(kebab).to.match(/^[a-z0-9-]*$/);
        expect(toKebabCase(kebab)).to.equal(kebab);
      })
    );
  });

  it('formatString leaves a template without specifiers unchanged', () => {
    const template = text.filter((value) => !/{\d+}/.test(value));

    fc.assert(
      fc.property(template, fc.array(fc.anything()), (value, params) => {
        expect(formatString(value, ...params)).to.equal(value);
      })
    );
  });

  it('formatString replaces each specifier that has a parameter', () => {
    const pieces = fc.array(
      fc.oneof(
        text.filter((value) => !/[{}]/.test(value)),
        fc.nat(5).map((index) => `{${index}}`)
      ),
      { maxLength: 10 }
    );
    const params = fc.array(fc.string({ maxLength: 5 }), { maxLength: 4 });

    fc.assert(
      fc.property(pieces, params, (parts, values) => {
        const expected = parts
          .map((part) => {
            const index = /^{(\d+)}$/.exec(part)?.[1];
            return index !== undefined && Number(index) < values.length
              ? values[Number(index)]
              : part;
          })
          .join('');

        expect(formatString(parts.join(''), ...values)).to.equal(expected);
      })
    );
  });

  it('nanoid returns ids of the given size from its alphabet', () => {
    fc.assert(
      fc.property(fc.array(fc.nat(100), { maxLength: 20 }), (sizes) => {
        for (const size of sizes) {
          expect(nanoid(size)).to.match(new RegExp(`^[A-Za-z0-9_-]{${size}}$`));
        }
      })
    );
  });

  it('createIdGenerator never repeats an id', () => {
    fc.assert(
      fc.property(text, fc.nat(200), (prefix, count) => {
        const next = createIdGenerator(prefix);
        const ids = new Set(Array.from({ length: count }, next));

        expect(ids.size).to.equal(count);
        for (const id of ids) {
          expect(id.startsWith(`${prefix}-`)).to.be.true;
        }
      })
    );
  });
});

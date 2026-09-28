import { expect } from '@open-wc/testing';

import { fc, orderedPair } from '#internals/testing/fast-check-setup.spec.js';
import { escapeMaskFlags, MaskParser } from './mask-parser.js';

/** The characters each flag accepts. The oracle for the parser output. */
const FLAG_PATTERNS: Record<string, RegExp> = {
  C: /^[\s\S]$/u,
  '&': /^[^\p{Separator}]$/u,
  a: /^[\p{Letter}\p{Number}\p{Separator}]$/u,
  A: /^[\p{Letter}\p{Number}]$/u,
  '?': /^[\p{Letter}\p{Separator}]$/u,
  L: /^\p{Letter}$/u,
  '0': /^\p{Number}$/u,
  '9': /^[\p{Number}\p{Separator}]$/u,
  '#': /^[\p{Number}\-+]$/u,
};

const FLAGS = Object.keys(FLAG_PATTERNS).join('');

/** Single code unit characters of each class that the flags check. */
const POOL = [...'abcxyzABCXYZéßжλ0123456789 -+!.@/'];

const VALID_CHARS = Object.fromEntries(
  Object.entries(FLAG_PATTERNS).map(([flag, pattern]) => [
    flag,
    POOL.filter((char) => pattern.test(char)),
  ])
);

/** Prompts that are not in the {@link POOL}. */
const SAFE_PROMPTS = ['_', '*', '•'];

/** Zero digits of some of the numbering systems the parser normalizes. */
const UNICODE_ZEROS = [0x0660, 0x06f0, 0x0966, 0x0e50, 0xff10];

type Token = { kind: 'flag' | 'escaped' | 'literal'; char: string };

const flag = fc.constantFrom(...FLAGS);

/** A grapheme with no flag and no escape character in it. */
const literalChar = fc
  .string({ unit: 'grapheme', minLength: 1, maxLength: 1 })
  .filter((s) => !s.split('').some((c) => FLAGS.includes(c) || c === '\\'));

const tokenOf = (kind: Token['kind'], chars: fc.Arbitrary<string>) =>
  chars.map((char): Token => ({ kind, char }));

const token = fc.oneof(
  { weight: 4, arbitrary: tokenOf('flag', flag) },
  { weight: 1, arbitrary: tokenOf('escaped', flag) },
  { weight: 2, arbitrary: tokenOf('literal', literalChar) }
);

const tokens = fc.array(token, { minLength: 1, maxLength: 20 });

const anyInput = fc.string({ unit: 'grapheme', maxLength: 40 });
const anyPrompt = fc.string({ unit: 'grapheme', maxLength: 3 });

/** A parser for `parts`, and the escaped mask and literal positions it must have. */
function setup(parts: Token[], prompt?: string) {
  const format = parts
    .map(({ kind, char }) =>
      kind === 'escaped' ? escapeMaskFlags(char) : char
    )
    .join('');
  const literals = new Set<number>();
  let escaped = '';

  for (const { kind, char } of parts) {
    for (const unit of char.split('')) {
      if (kind !== 'flag') {
        literals.add(escaped.length);
      }
      escaped += unit;
    }
  }

  const parser = new MaskParser({ format, promptCharacter: prompt });
  return { parser, escaped, literals };
}

/** A mask, a prompt and the characters that fill each input position. */
const filledMask = tokens.chain((parts) =>
  fc
    .tuple(
      fc.constantFrom(...SAFE_PROMPTS),
      fc.tuple(
        ...parts
          .filter((part) => part.kind === 'flag')
          .map((part) => fc.constantFrom(...VALID_CHARS[part.char]))
      )
    )
    .map(([prompt, fill]) => ({ parts, prompt, input: fill.join('') }))
);

describe('Mask parser properties', () => {
  it('builds the escaped mask and the literal positions from the format', () => {
    fc.assert(
      fc.property(tokens, (parts) => {
        const { parser, escaped, literals } = setup(parts);

        expect(parser.escapedMask).to.equal(escaped);
        expect([...parser.literalPositions]).to.have.members([...literals]);
      })
    );
  });

  it('never throws for any format, prompt and input', () => {
    fc.assert(
      fc.property(anyInput, anyPrompt, anyInput, (format, prompt, input) => {
        const parser = new MaskParser({ format, promptCharacter: prompt });
        const masked = parser.apply(input);

        expect(masked).to.have.lengthOf(parser.escapedMask.length);
        parser.parse(masked);
        parser.isValidString(masked);
      })
    );
  });

  it('keeps the mask length, the literals and the flag rules when it applies input', () => {
    fc.assert(
      fc.property(tokens, anyPrompt, anyInput, (parts, prompt, input) => {
        const { parser, escaped, literals } = setup(parts, prompt);
        const masked = parser.apply(input);

        expect(masked).to.have.lengthOf(escaped.length);
        expect(masked.isWellFormed(), masked).to.be.true;

        for (let i = 0; i < escaped.length; i++) {
          if (literals.has(i)) {
            expect(masked[i]).to.equal(escaped[i]);
          } else if (masked[i] !== parser.prompt) {
            expect(masked[i]).to.match(FLAG_PATTERNS[escaped[i]]);
          }
        }
      })
    );
  });

  it('parses the empty mask to an empty string', () => {
    fc.assert(
      fc.property(tokens, anyPrompt, (parts, prompt) => {
        const { parser } = setup(parts, prompt);

        expect(parser.parse(parser.emptyMask)).to.equal('');
      })
    );
  });

  it('round-trips valid input through apply and parse', () => {
    fc.assert(
      fc.property(filledMask, ({ parts, prompt, input }) => {
        const { parser } = setup(parts, prompt);
        const masked = parser.apply(input);

        expect(parser.parse(masked)).to.equal(input);
        expect(parser.apply(parser.parse(masked))).to.equal(masked);
        expect(parser.isValidString(masked)).to.be.true;
      })
    );
  });

  it('places each valid character of a replace at the next input position', () => {
    fc.assert(
      fc.property(filledMask, ({ parts, prompt, input }) => {
        const { parser } = setup(parts, prompt);

        expect(parser.replace(parser.emptyMask, input, 0, 0).value).to.equal(
          parser.apply(input)
        );
      })
    );
  });

  it('keeps the mask length and the literals when it replaces a range', () => {
    const replaceCase = fc
      .tuple(tokens, anyPrompt, anyInput, anyInput)
      .chain(([parts, prompt, initial, value]) =>
        orderedPair(fc.nat(setup(parts).escaped.length)).map((range) => ({
          parts,
          prompt,
          initial,
          value,
          range,
        }))
      );

    fc.assert(
      fc.property(
        replaceCase,
        ({ parts, prompt, initial, value, range: [start, end] }) => {
          const { parser, escaped, literals } = setup(parts, prompt);
          const result = parser.replace(
            parser.apply(initial),
            value,
            start,
            end
          );

          expect(result.value).to.have.lengthOf(escaped.length);
          expect(result.value.isWellFormed(), result.value).to.be.true;
          expect(result.end).to.be.within(start, escaped.length);

          for (const i of literals) {
            expect(result.value[i]).to.equal(escaped[i]);
          }
        }
      )
    );
  });

  it('normalizes Unicode digits to ASCII', () => {
    const digits = fc.array(fc.integer({ min: 0, max: 9 }), {
      minLength: 1,
      maxLength: 12,
    });

    fc.assert(
      fc.property(
        digits,
        fc.constantFrom(...UNICODE_ZEROS),
        fc.constantFrom('0', '9', '#'),
        (values, zero, digitFlag) => {
          const parser = new MaskParser({
            format: digitFlag.repeat(values.length),
          });
          const ascii = parser.apply(values.join(''));
          const unicode = String.fromCharCode(...values.map((v) => zero + v));

          expect(parser.apply(unicode)).to.equal(ascii);
          expect(parser.replace('', unicode, 0, 0).value).to.equal(ascii);
        }
      )
    );
  });

  it('finds the nearest non-literal positions', () => {
    fc.assert(
      fc.property(tokens, fc.integer({ min: -5, max: 45 }), (parts, start) => {
        const { parser, escaped, literals } = setup(parts);
        const length = escaped.length;

        const next = parser.getNextNonLiteralPosition(start);
        expect(next).to.be.within(Math.min(Math.max(0, start), length), length);
        if (next < length) {
          expect(literals.has(next)).to.be.false;
        }
        for (let i = Math.max(0, start); i < Math.min(next, length); i++) {
          expect(literals.has(i)).to.be.true;
        }

        const previous = parser.getPreviousNonLiteralPosition(start);
        expect(previous).to.be.at.least(0);
        if (previous > 0) {
          expect(previous).to.be.below(start);
          expect(literals.has(previous)).to.be.false;
          for (let i = previous + 1; i < Math.min(start, length); i++) {
            expect(literals.has(i)).to.be.true;
          }
        }
      })
    );
  });

  it('keeps a single non-flag prompt character', () => {
    fc.assert(
      fc.property(fc.array(anyPrompt, { maxLength: 5 }), (prompts) => {
        const parser = new MaskParser();

        for (const prompt of prompts) {
          const previous = parser.prompt;
          parser.prompt = prompt;

          const first = prompt[0] ?? '';
          const accepted =
            first !== '' && !FLAGS.includes(first) && first.isWellFormed();

          expect(parser.prompt).to.equal(accepted ? first : previous);
        }
      })
    );
  });
});

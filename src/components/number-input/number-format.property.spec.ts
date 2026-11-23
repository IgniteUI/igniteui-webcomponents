import { expect } from '@open-wc/testing';

import { fc, orderedPair } from '#internals/testing/fast-check-setup.spec.js';
import {
  formatFormValue,
  getNumberInputFormat,
  type NumberInputFormat,
  type NumberInputFormatOptions,
} from './number-format.js';

/** Locales with other separators, numbering systems, minus signs and bidi marks. */
const LOCALES = [
  'en',
  'de',
  'fr',
  'de-CH',
  'sv',
  'ru',
  'ar-EG',
  'fa',
  'he',
  'hi-IN-u-nu-deva',
  'ja',
];

const locale = fc.constantFrom(...LOCALES);

const style: fc.Arbitrary<NumberInputFormatOptions> = fc.oneof(
  fc.constant({ style: 'decimal' as const }),
  fc.constant({ style: 'percent' as const }),
  fc.record({
    style: fc.constant('currency' as const),
    currency: fc.constantFrom('USD', 'EUR', 'JPY', 'BHD'),
    currencyDisplay: fc.constantFrom(
      'symbol' as const,
      'narrowSymbol' as const,
      'code' as const,
      'name' as const
    ),
    currencySign: fc.constantFrom('standard' as const, 'accounting' as const),
  }),
  fc.record({
    style: fc.constant('unit' as const),
    unit: fc.constantFrom('kilometer-per-hour', 'celsius', 'liter', 'percent'),
    unitDisplay: fc.constantFrom(
      'short' as const,
      'narrow' as const,
      'long' as const
    ),
  })
);

const digits = fc.option(fc.integer({ min: 0, max: 6 }), { nil: undefined });

const rest: fc.Arbitrary<NumberInputFormatOptions> = fc.record(
  {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    roundingMode: fc.constantFrom(
      'ceil' as const,
      'floor' as const,
      'expand' as const,
      'trunc' as const,
      'halfCeil' as const,
      'halfFloor' as const,
      'halfExpand' as const,
      'halfTrunc' as const,
      'halfEven' as const
    ),
    useGrouping: fc.boolean(),
    signDisplay: fc.constantFrom(
      'auto' as const,
      'always' as const,
      'exceptZero' as const,
      'negative' as const
    ),
  },
  { requiredKeys: [] }
);

/** Valid options: the minimum fraction digits never exceed the maximum. */
const options = fc.tuple(style, rest).map(([a, b]) => {
  const result = { ...a, ...b };
  const { minimumFractionDigits: min, maximumFractionDigits: max } = result;

  if (min !== undefined && max !== undefined && min > max) {
    result.minimumFractionDigits = max;
    result.maximumFractionDigits = min;
  }

  return result;
});

const finite = fc.double({ min: -1e12, max: 1e12, noNaN: true });

const bounds = orderedPair(fc.double({ min: -1e6, max: 1e6, noNaN: true }));

/** The number of decimals of a value that the format keeps. A percent shows its value times 100. */
function keptDecimals(
  format: NumberInputFormat,
  options: NumberInputFormatOptions
): number {
  return format.maximumFractionDigits + (options.style === 'percent' ? 2 : 0);
}

describe('Number input format properties', () => {
  it('keeps a value that has no more decimals than the format shows', () => {
    fc.assert(
      fc.property(
        locale,
        options,
        fc.integer({ min: -1e9, max: 1e9 }),
        fc.integer({ min: 0, max: 8 }),
        (tag, opts, n, k) => {
          const format = getNumberInputFormat(tag, opts);
          const x = Number(`${n}e-${Math.min(k, keptDecimals(format, opts))}`);

          expect(format.round(x)).to.equal(x);
          expect(format.parse(format.formatDisplay(x))).to.equal(x);
          expect(format.parse(format.formatEdit(x))).to.equal(x);
        }
      )
    );
  });

  it('rounds any value once, as close as the format shows it, and reads its display text back', () => {
    fc.assert(
      fc.property(locale, options, finite, (tag, opts, x) => {
        const format = getNumberInputFormat(tag, opts);
        const rounded = format.round(x);
        const unit = format.smallestStep;

        expect(format.round(rounded)).to.equal(rounded);
        expect(format.parse(format.formatDisplay(x))).to.equal(rounded);
        expect(Math.abs(rounded - x)).to.be.at.most(
          unit * (1 + 1e-9) + Math.abs(x) * 1e-15
        );
      })
    );
  });

  it('accepts each start of an edit text as a partial number', () => {
    fc.assert(
      fc.property(locale, options, finite, (tag, opts, x) => {
        const format = getNumberInputFormat(tag, opts);

        for (const [value, allowNegative] of [
          [x, true],
          [Math.abs(x), false],
        ] as const) {
          const chars = [...format.formatEdit(value)];

          for (let end = 0; end <= chars.length; end++) {
            const text = chars.slice(0, end).join('');
            expect(format.isValidPartial(text, allowNegative), text).to.be.true;
          }
        }
      })
    );
  });

  it('parses any text without throwing, and returns null only for a blank text', () => {
    const pool = [..."0123456789.,-+() $%١٫٬−  '’‎eE"];
    const text = fc.oneof(
      fc.string({ unit: 'grapheme', maxLength: 20 }),
      fc.string({ unit: fc.constantFrom(...pool), maxLength: 20 })
    );

    fc.assert(
      fc.property(locale, options, text, (tag, opts, input) => {
        const result = getNumberInputFormat(tag, opts).parse(input);
        const blank = !input.normalize('NFKC').replace(/[\p{Cf}\s]/gu, '');

        expect(result === null, input).to.equal(blank);
        if (result !== null && !Number.isNaN(result)) {
          expect(Number.isFinite(result)).to.be.true;
          expect(Object.is(result, -0)).to.be.false;
        }
      })
    );
  });

  it('fits a value into its bounds, on a shown value when the bounds allow one', () => {
    fc.assert(
      fc.property(options, finite, bounds, (opts, x, [min, max]) => {
        const format = getNumberInputFormat('en', opts);
        const fitted = format.fit(x, min, max);

        expect(fitted).to.be.within(min, max);
        if (max - min >= format.smallestStep) {
          expect(format.round(fitted)).to.equal(fitted);
        }
      })
    );
  });

  describe('spin', () => {
    /** A format and a spin request, with ordered bounds that each may be unset. */
    const spinCase = fc
      .tuple(
        options,
        fc.integer({ min: -20, max: 20 }).filter(Boolean),
        fc.option(fc.double({ min: -10, max: 1e3, noNaN: true }), {
          nil: undefined,
        }),
        bounds,
        fc.boolean(),
        fc.boolean()
      )
      .map(([opts, count, step, [low, high], hasMin, hasMax]) => {
        const format = getNumberInputFormat('en', opts);
        const min = hasMin ? low : undefined;
        const max = hasMax ? high : undefined;
        const roomy =
          min === undefined ||
          max === undefined ||
          max - min >= format.smallestStep;

        return { format, request: { count, step, min, max }, roomy };
      });

    const value = fc.option(finite, { nil: null });

    it('never moves a value against the direction of the step', () => {
      fc.assert(
        fc.property(spinCase, value, ({ format, request }, x) => {
          const result = format.spin(x, request)!;

          if (x !== null) {
            expect(request.count > 0 ? result >= x : result <= x).to.be.true;
          }
        })
      );
    });

    it('stays in range from an empty value or a value in range, on a shown value', () => {
      fc.assert(
        fc.property(spinCase, value, ({ format, request, roomy }, x) => {
          const { min, max } = request;
          const start = x === null ? null : format.fit(x, min, max);
          const result = format.spin(start, request)!;

          expect(result).to.be.within(min ?? -Infinity, max ?? Infinity);
          if (roomy) {
            expect(format.round(result)).to.equal(result);
          }
        })
      );
    });

    it('spins an empty value to 0, fit into the bounds', () => {
      fc.assert(
        fc.property(spinCase, ({ format, request }) => {
          const { min, max } = request;
          expect(format.spin(null, request)).to.equal(format.fit(0, min, max));
        })
      );
    });
  });

  it('formats a form value that reads back as the same number', () => {
    const value = fc
      .double({ noNaN: true, noDefaultInfinity: true })
      // `Intl` stops at 100 fraction digits: 17 significant digits fit down to 1e-83.
      .filter((x) => x === 0 || Math.abs(x) >= 1e-80);

    fc.assert(
      fc.property(value, (x) => {
        const text = formatFormValue(x);

        expect(text).to.match(/^-?\d+(\.\d+)?$/);
        expect(Number(text)).to.equal(x);
      })
    );
  });
});

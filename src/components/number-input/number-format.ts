import { getOrCreateForLocale } from '#internals/i18n/locale.js';
import {
  addSteps,
  clamp,
  numberInRangeInclusive,
  numberOfDecimals,
} from '#internals/utils/math.js';

/** How a value rounds to the maximum number of fraction digits. */
export type NumberInputRoundingMode =
  | 'ceil'
  | 'floor'
  | 'expand'
  | 'trunc'
  | 'halfCeil'
  | 'halfFloor'
  | 'halfExpand'
  | 'halfTrunc'
  | 'halfEven';

/**
 * The format of a number input value: the options of `Intl.NumberFormat`
 * that the input can parse back.
 */
export interface NumberInputFormatOptions {
  /**
   * The format style: `decimal` (default), `currency`, `percent` or `unit`.
   * A `percent` value is a fraction, so `0.25` shows as 25%.
   */
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  /** The ISO 4217 currency code, such as `USD`. The `currency` style needs it. */
  currency?: string;
  /** How the currency shows: `symbol` (default), `narrowSymbol`, `code` or `name`. */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  /** With `accounting`, a negative amount shows in parentheses. Default is `standard`. */
  currencySign?: 'standard' | 'accounting';
  /** The unit of the `unit` style, such as `kilometer-per-hour`. */
  unit?: string;
  /** How the unit shows: `short` (default), `narrow` or `long`. */
  unitDisplay?: 'short' | 'narrow' | 'long';
  /** The minimum number of fraction digits. */
  minimumFractionDigits?: number;
  /**
   * The maximum number of fraction digits. A committed value rounds to it.
   * Default is the digits of the currency for the `currency` style, else 20.
   */
  maximumFractionDigits?: number;
  /** How a value rounds to `maximumFractionDigits`. Default is `halfExpand`. */
  roundingMode?: NumberInputRoundingMode;
  /** Whether the value shows group separators. */
  useGrouping?: boolean;
  /** When the sign shows: `auto` (default), `always`, `exceptZero` or `negative`. */
  signDisplay?: 'auto' | 'always' | 'exceptZero' | 'negative';
}

const OPTION_NAMES = [
  'style',
  'currency',
  'currencyDisplay',
  'currencySign',
  'unit',
  'unitDisplay',
  'minimumFractionDigits',
  'maximumFractionDigits',
  'roundingMode',
  'useGrouping',
  'signDisplay',
] as const satisfies readonly (keyof NumberInputFormatOptions)[];

/** `Intl` defaults to 3 fraction digits, which rounds a value that the user did not ask to round. */
const DEFAULT_MAX_FRACTION_DIGITS = 20;

/** Values that give each plural form of a currency or unit name, with their negatives. */
const PLURAL_SAMPLES = [0, 1, 2, 3, 5, 11, 21, 100, 1.5, 1e6].flatMap((n) => [
  n,
  -n,
]);

/** The parts of a display text that are not the number. */
const LITERAL_PARTS = new Set(['currency', 'percentSign', 'unit', 'literal']);

/** Bidi marks and whitespace. A whitespace group separator is removed with them. */
const NOISE = /[\p{Cf}\s]/gu;
const BIDI_MARK = /\p{Cf}/gu;
const NOT_BIDI_MARK = /[^\p{Cf}]/gu;

type Token = number | 'decimal' | 'group' | 'minus' | 'plus';

type ParseTables = {
  tokens: Map<string, Token>;
  /** The currency, percent, unit and literal texts, longest first. */
  literals: string[];
  decimalSeparator: string;
};

type NumberParts = {
  signed: boolean;
  negative: boolean;
  decimal: boolean;
  integer: string;
  fraction: string;
};

const cache = new Map<string, NumberInputFormat>();
let formValueFormat: Intl.NumberFormat | undefined;

/**
 * Folds compatibility characters, such as full-width digits, into their plain
 * form, and removes the bidi marks and the whitespace.
 */
function clean(text: string): string {
  return text.normalize('NFKC').replace(NOISE, '');
}

function toIntlOptions(
  options: NumberInputFormatOptions
): Intl.NumberFormatOptions {
  const result: Intl.NumberFormatOptions = {};

  for (const name of OPTION_NAMES) {
    if (options[name] !== undefined) {
      Object.assign(result, { [name]: options[name] });
    }
  }

  if (
    result.maximumFractionDigits === undefined &&
    result.style !== 'currency'
  ) {
    result.maximumFractionDigits = Math.max(
      DEFAULT_MAX_FRACTION_DIGITS,
      result.minimumFractionDigits ?? 0
    );
  }

  return result;
}

/** A step of a number input: `stepUp`, `stepDown`, a key, the wheel or a spin button. */
export interface NumberInputSpinRequest {
  /** The number of steps. A negative count steps down. */
  count: number;
  /** The amount of one step. Unset or not positive gives 1, or 0.01 for a percent. */
  step?: number;
  min?: number;
  max?: number;
}

/**
 * Formats and parses the numbers of a number input in one locale and format.
 *
 * - The display text is the value in the full format, for the input without focus.
 * - The edit text is the same number with no group separators and no currency,
 *   percent or unit symbols, for the input with focus. A percent shows its value
 *   times 100.
 * - The parser reads both texts, the digits of the locale numbering system and
 *   ASCII digits, full-width characters, and a `.` or `,` decimal separator that
 *   is not the group separator of the locale.
 */
export class NumberInputFormat {
  private readonly _locale: string;
  private readonly _display: Intl.NumberFormat;
  private readonly _edit: Intl.NumberFormat;
  private readonly _percent: boolean;
  /** The decimals of a shown value: the fraction digits, and 2 more for a percent. */
  private readonly _decimals: number;
  /** Built at the first parse, as only an edit needs them. */
  private _tables?: ParseTables;

  /** The maximum number of fraction digits of the edit text. */
  public readonly maximumFractionDigits: number;

  /** The value change of one unit in the last shown digit, such as `0.01` for dollars. */
  public readonly smallestStep: number;

  /** The decimal separator of the locale, as the input shows it. */
  public get decimalSeparator(): string {
    return this._parseTables.decimalSeparator;
  }

  private get _parseTables(): ParseTables {
    this._tables ??= this._readTables();
    return this._tables;
  }

  constructor(locale: string, options: NumberInputFormatOptions = {}) {
    this._locale = locale;

    try {
      this._display = new Intl.NumberFormat(locale, toIntlOptions(options));
    } catch (error) {
      // oxlint-disable-next-line no-console -- the default format is the only other signal
      console.warn(
        `The number input cannot use its format options, so it uses the default format. ${error}`
      );
      this._display = new Intl.NumberFormat(locale, toIntlOptions({}));
    }

    const { numberingSystem, style, maximumFractionDigits, roundingMode } =
      this._display.resolvedOptions();

    this._percent = style === 'percent';
    // Set, because the options have no significant digits.
    this.maximumFractionDigits = maximumFractionDigits!;
    // A percent shows the value times 100.
    this._decimals = this.maximumFractionDigits + (this._percent ? 2 : 0);
    this.smallestStep = 10 ** -this._decimals;
    this._edit = new Intl.NumberFormat(locale, {
      numberingSystem,
      roundingMode,
      style: this._percent ? 'percent' : 'decimal',
      useGrouping: false,
      signDisplay: 'negative',
      minimumFractionDigits: 0,
      maximumFractionDigits: this.maximumFractionDigits,
    });
  }

  /** Returns the display text of `value`, or an empty string for `null`. */
  public formatDisplay(value: number | null): string {
    return value === null ? '' : this._display.format(value || 0);
  }

  /** Returns the edit text of `value`, or an empty string for `null`. */
  public formatEdit(value: number | null): string {
    if (value === null) {
      return '';
    }

    let text = '';
    let started = false;

    for (const { type, value: part } of this._edit.formatToParts(value)) {
      if (type === 'literal') {
        // Keep the bidi marks before the number, so that a minus sign stays in place.
        text += started ? '' : part.replace(NOT_BIDI_MARK, '');
      } else if (type !== 'percentSign') {
        started = true;
        text += part;
      }
    }

    return text;
  }

  /**
   * Returns the number in `text`. Returns `null` for an empty text and `NaN`
   * for a text that is not a number in this format.
   */
  public parse(text: string): number | null {
    let chars = clean(text);

    if (!chars) {
      return null;
    }

    for (const literal of this._parseTables.literals) {
      chars = chars.replaceAll(literal, '');
    }

    const parens =
      chars.length > 1 && chars.startsWith('(') && chars.endsWith(')');
    const parts = this._read(parens ? chars.slice(1, -1) : chars, false);

    if (
      !parts ||
      !(parts.integer || parts.fraction) ||
      (parens && parts.signed)
    ) {
      return Number.NaN;
    }

    const sign = parens || parts.negative ? '-' : '';
    const value = Number(
      `${sign}${parts.integer || '0'}.${parts.fraction || '0'}e${this._percent ? -2 : 0}`
    );

    return Number.isFinite(value) ? value || 0 : Number.NaN;
  }

  /**
   * Returns whether `text` is the start of an edit text: digits, group separators,
   * a decimal separator when the format has fraction digits, and a leading sign.
   * A minus sign counts only when `allowNegative` is true.
   */
  public isValidPartial(text: string, allowNegative = true): boolean {
    // A space stays, so that it counts only as a group separator of the locale.
    const parts = this._read(
      text.normalize('NFKC').replace(BIDI_MARK, ''),
      true
    );

    return (
      !!parts &&
      (allowNegative || !parts.negative) &&
      (this.maximumFractionDigits > 0 || !parts.decimal)
    );
  }

  /** Returns `value` rounded as the format shows it. */
  public round(value: number): number {
    // `Intl` shows a double as its shortest decimal, so a value with no more
    // decimals than the format shows is a shown value.
    if (Number.isFinite(value) && numberOfDecimals(value) <= this._decimals) {
      return value || 0;
    }

    return this.parse(this.formatEdit(value))!;
  }

  /**
   * Clamps `value` to `min` and `max` and rounds it as the format shows it. A
   * bound between two shown values gives the nearest shown value inside it.
   * Bounds closer than one shown step give the clamped value.
   */
  public fit(value: number, min = -Infinity, max = Infinity): number {
    const clamped = clamp(value, min, max);
    let fitted = this.round(clamped);

    if (fitted > max) {
      fitted = this.round(addSteps(fitted, this.smallestStep, -1));
    } else if (fitted < min) {
      fitted = this.round(addSteps(fitted, this.smallestStep));
    }

    return numberInRangeInclusive(fitted, min, max) ? fitted : clamped;
  }

  /**
   * Steps `value` by `count` steps and fits the result into the bounds. A step
   * finer than the last shown digit steps by that digit, so that it shows. An
   * empty value takes the seed, 0 fit into the bounds, without a step. No step
   * moves the value against its direction, as from a value out of range. A
   * `count` of 0 keeps the value.
   */
  public spin(
    value: number | null,
    { count, step, min, max }: NumberInputSpinRequest
  ): number | null {
    if (!count) {
      return value;
    }

    const size = Math.max(
      step !== undefined && step > 0 ? step : this._percent ? 0.01 : 1,
      this.smallestStep
    );
    const next = this.fit(
      value === null ? 0 : addSteps(value, size, count),
      min,
      max
    );

    return value !== null && (count > 0 ? next < value : next > value)
      ? value
      : next;
  }

  /** Splits a cleaned text into its sign and digits, or returns `null` for a character out of place. */
  private _read(text: string, partial: boolean): NumberParts | null {
    const { tokens } = this._parseTables;
    const parts: NumberParts = {
      signed: false,
      negative: false,
      decimal: false,
      integer: '',
      fraction: '',
    };
    let ended = false;

    for (const char of text) {
      const token = tokens.get(char);

      if (token === undefined || ended) {
        return null;
      }

      if (token === 'minus' || token === 'plus') {
        const leading = !(parts.integer || parts.decimal);

        // A trailing sign, as some formats show it, only in a full parse.
        if (parts.signed || (partial && !leading)) {
          return null;
        }

        parts.signed = true;
        parts.negative = token === 'minus';
        ended = !leading;
      } else if (token === 'decimal') {
        if (parts.decimal) {
          return null;
        }
        parts.decimal = true;
      } else if (token === 'group') {
        if (!parts.integer || parts.decimal) {
          return null;
        }
      } else if (parts.decimal) {
        parts.fraction += token;
      } else {
        parts.integer += token;
      }
    }

    return parts;
  }

  private _readTables(): ParseTables {
    const tokens = new Map<string, Token>();
    const decimalSeparator = this._readTokens(tokens);

    return { tokens, decimalSeparator, literals: this._readLiterals(tokens) };
  }

  /** Fills `tokens` and returns the decimal separator of the locale. */
  private _readTokens(tokens: Map<string, Token>): string {
    const locale = this._locale;
    const { numberingSystem } = this._display.resolvedOptions();
    const add = (char: string, token: Token): void => {
      const key = clean(char);
      if (key && !tokens.has(key)) {
        tokens.set(key, token);
      }
    };

    const digits = new Intl.NumberFormat(locale, {
      numberingSystem,
      useGrouping: false,
    }).format(9876543210);

    [...digits].forEach((char, index) => add(char, 9 - index));
    for (let digit = 0; digit < 10; digit++) {
      add(String(digit), digit);
    }

    const symbols = new Intl.NumberFormat(locale, {
      numberingSystem,
      useGrouping: true,
      minimumFractionDigits: 1,
      signDisplay: 'always',
    });

    let decimal = '.';
    const groups: string[] = [];

    for (const { type, value } of [
      ...symbols.formatToParts(-1234567.5),
      ...symbols.formatToParts(1),
    ]) {
      if (type === 'decimal') {
        decimal = value;
      } else if (type === 'group') {
        groups.push(value);
      } else if (type === 'minusSign') {
        add(value, 'minus');
      } else if (type === 'plusSign') {
        add(value, 'plus');
      }
    }

    add('-', 'minus');
    add('−', 'minus');
    add('+', 'plus');
    add(decimal, 'decimal');

    for (const group of groups) {
      add(group, 'group');
      // NFKC folds each space separator, such as the French U+202F, into U+0020.
      if (!clean(group)) {
        tokens.set(' ', 'group');
      }
      // The Swiss group separator is easier to type as an apostrophe.
      if (group === '’' || group === "'") {
        add('’', 'group');
        add("'", 'group');
      }
    }

    // A `.` or `,` that is not a group separator is a decimal separator.
    add('.', 'decimal');
    add(',', 'decimal');

    return decimal;
  }

  /** Collects the currency, percent, unit and literal texts of all plural forms. */
  private _readLiterals(tokens: Map<string, Token>): string[] {
    const literals = new Set<string>();

    for (const sample of PLURAL_SAMPLES) {
      for (const { type, value } of this._display.formatToParts(sample)) {
        const text = clean(value);

        if (
          LITERAL_PARTS.has(type) &&
          text !== '(' &&
          text !== ')' &&
          [...text].some((char) => !tokens.has(char))
        ) {
          literals.add(text);
        }
      }
    }

    return [...literals].sort((a, b) => b.length - a.length);
  }
}

/**
 * Returns the cached {@link NumberInputFormat} of `locale` and `options`. An
 * invalid locale falls back to the global locale.
 */
export function getNumberInputFormat(
  locale: string,
  options: NumberInputFormatOptions = {}
): NumberInputFormat {
  return getOrCreateForLocale(
    cache,
    locale,
    (resolved) => new NumberInputFormat(resolved, options),
    OPTION_NAMES.map((name) => options[name])
  );
}

/** Returns the format of a number input: its `locale` and `valueFormatOptions`. */
export function getHostFormat(host: {
  locale: string;
  valueFormatOptions?: NumberInputFormatOptions;
}): NumberInputFormat {
  return getNumberInputFormat(host.locale, host.valueFormatOptions);
}

/**
 * Returns `value` as the form submits it: ASCII digits, a `.` decimal separator,
 * no group separators and no exponent, such as `1234.5` or `0.0000001`. It reads
 * back as the same number down to about `1e-83`, the limit of 100 fraction digits.
 */
export function formatFormValue(value: number): string {
  formValueFormat ??= new Intl.NumberFormat('en-US', {
    useGrouping: false,
    maximumFractionDigits: 100,
  });

  return formValueFormat.format(value || 0);
}

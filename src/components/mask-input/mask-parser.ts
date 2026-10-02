/** Options for the {@link MaskParser} */
export interface MaskOptions {
  /**
   * The mask format string (e.g., '00/00/0000' for dates, 'AAA-000' for custom IDs).
   *
   * Supported flags: a, A, C, L, 0, 9, #, &, ?.
   *
   * Use `'\'` to escape a flag character if it should be treated as a literal.
   * @default 'CCCCCCCCCC'
   */
  format?: string;

  /**
   * The character used to prompt for input in unfilled mask positions.
   *
   * Only the first character is used, and a mask flag is rejected in favor of the
   * default - the same rules the `prompt` accessor applies.
   * @default '_'
   */
  promptCharacter?: string;
}

interface MaskOptionsInternal {
  format: string;
  promptCharacter: string;
}

/** The masked value and the caret position after `replace`. */
type MaskReplaceResult = {
  value: string;
  end: number;
};

const MASK_FLAGS = new Set('aACL09#&?');
const MASK_REQUIRED_FLAGS = new Set('0#LA&');

const ESCAPE_CHAR = '\\';
const DEFAULT_FORMAT = 'CCCCCCCCCC';
const DEFAULT_PROMPT = '_';

const ASCII_ZERO = 0x0030;
const DIGIT_ZERO_CODEPOINTS = [
  ASCII_ZERO, // ASCII
  0x0660, // Arabic-Indic
  0x06f0, // Extended Arabic-Indic
  0x0966, // Devanagari
  0x09e6, // Bengali
  0x0a66, // Gurmukhi
  0x0ae6, // Gujarati
  0x0b66, // Oriya
  0x0c66, // Telugu
  0x0ce6, // Kannada
  0x0d66, // Malayalam
  0x0e50, // Thai
  0x0ed0, // Lao
  0x0f20, // Tibetan
  0x1040, // Myanmar
  0x17e0, // Khmer
  0x1810, // Mongolian
  0xff10, // Full-width
] as const;

/** Maps Unicode digit code points to ASCII digits. */
const UNICODE_DIGIT_TO_ASCII = new Map<number, string>(
  DIGIT_ZERO_CODEPOINTS.flatMap((zeroCodePoint) =>
    Array.from({ length: 10 }, (_, i) => [
      zeroCodePoint + i,
      String.fromCharCode(ASCII_ZERO + i),
    ])
  )
);

/**
 * Returns the first character of the prompt. Falls back to `current` for an empty prompt,
 * an astral character or a mask flag, which is indistinguishable from typed input.
 */
function normalizePrompt(value: string | undefined, current: string): string {
  const char = value ? value.substring(0, 1) : current;
  return MASK_FLAGS.has(char) || isSurrogate(char) ? current : char;
}

/** Returns whether `char` starts with a UTF-16 surrogate, half of an astral character. */
function isSurrogate(char: string): boolean {
  return (char.charCodeAt(0) & 0xf800) === 0xd800;
}

function replaceUnicodeNumbers(text: string): string {
  const matcher = /\p{Nd}/gu;

  return text.replace(matcher, (digit) => {
    return UNICODE_DIGIT_TO_ASCII.get(digit.charCodeAt(0)) ?? digit;
  });
}

const MASK_PATTERNS = new Map<string, RegExp>([
  ['C', /[\s\S]/u], // Any single character (including newlines)
  ['&', /[^\p{Separator}]/u], // Any non-separator character (excludes spaces, line/paragraph separators)
  ['a', /[\p{Letter}\p{Number}\p{Separator}]/u], // Alphanumeric and separator characters (Unicode-aware)
  ['A', /[\p{Letter}\p{Number}]/u], // Alphanumeric (Unicode-aware)
  ['?', /[\p{Letter}\p{Separator}]/u], // Alphabetic and separator characters (Unicode-aware)
  ['L', /\p{Letter}/u], // Alphabetic (Unicode-aware)
  ['0', /\p{Number}/u], // Numeric (Unicode-aware, converted to ASCII 0-9 during processing)
  ['9', /[\p{Number}\p{Separator}]/u], // Numeric and separator characters (Unicode-aware)
  ['#', /[\p{Number}\-+]/u], // Numeric and sign characters (+, -)
]);

/**
 * Returns whether `char` fits the mask position of `flag`. A position holds one UTF-16 code
 * unit, so an astral character never fits. A missing position fits no flag.
 */
function validate(char: string | undefined, flag: string): boolean {
  return (
    char !== undefined &&
    !isSurrogate(char) &&
    (MASK_PATTERNS.get(flag)?.test(char) ?? false)
  );
}

/**
 * Escapes each mask flag in `text`, so that a mask pattern reads all of it as literal text.
 *
 * @example
 * ```ts
 * escapeMaskFlags(' at '); // ' \\at '
 * ```
 */
export function escapeMaskFlags(text: string): string {
  let result = '';

  for (const char of text) {
    result += MASK_FLAGS.has(char) ? `${ESCAPE_CHAR}${char}` : char;
  }

  return result;
}

/** Parses a mask pattern and applies it to strings. */
export class MaskParser {
  protected readonly _options: MaskOptionsInternal;

  /** Literal characters by mask position, for example '(', ')' and '-'. */
  protected readonly _literals = new Map<number, string>();

  /** The literal positions in `_escapedMask`. */
  protected _literalPositions = new Set<number>();

  /** The mask format after processing escape characters */
  protected _escapedMask = '';

  /** Cached array of required non-literal positions for validation */
  protected _requiredPositions: number[] = [];

  /**
   * Declared with no initializer. `useDefineForClassFields: false` emits nothing
   * for it, so {@link _invalidate} can run from the constructor, before the
   * subclass fields exist.
   */
  private _emptyMask?: string;

  /** The positions of the fixed characters that are not part of the input. */
  public get literalPositions(): ReadonlySet<number> {
    return this._literalPositions;
  }

  /** The mask after processing the escape sequences. */
  public get escapedMask(): string {
    return this._escapedMask;
  }

  /** The mask applied to an empty string. */
  public get emptyMask(): string {
    this._emptyMask ??= this.apply();
    return this._emptyMask;
  }

  /** The original format string. Without escape sequences, it equals `escapedMask`. */
  public get mask(): string {
    return this._options.format;
  }

  /** Parses the literals and the escaped mask again. */
  public set mask(value: string) {
    this._options.format = value || this._options.format;
    this._parseMaskLiterals();
  }

  /** The prompt character for unfilled mask positions. */
  public get prompt(): string {
    return this._options.promptCharacter;
  }

  /**
   * Only the first character is used.
   * @remarks The prompt character cannot be a mask flag character.
   */
  public set prompt(value: string) {
    this._options.promptCharacter = normalizePrompt(
      value,
      this._options.promptCharacter
    );
    this._invalidate();
  }

  constructor(options?: MaskOptions) {
    this._options = {
      format: options?.format || DEFAULT_FORMAT,
      promptCharacter: normalizePrompt(
        options?.promptCharacter,
        DEFAULT_PROMPT
      ),
    };
    this._parseMaskLiterals();
  }

  private _isEscapedFlag(char: string, nextChar: string): boolean {
    return char === ESCAPE_CHAR && MASK_FLAGS.has(nextChar);
  }

  /**
   * The pattern for the literal parser. A subclass whose public format is not a
   * mask pattern, such as a date format, converts it here.
   */
  protected _toMaskFormat(format: string): string {
    return format;
  }

  /**
   * Drops all that comes from the mask. Runs on each mask and prompt change, and
   * from the constructor, so an override must not touch an initialized field.
   */
  protected _invalidate(): void {
    this._emptyMask = undefined;
  }

  /**
   * Finds the literal characters of the mask format and builds the escaped
   * mask. Runs on each mask format change.
   */
  protected _parseMaskLiterals(): void {
    const mask = this._toMaskFormat(this._options.format);
    const length = mask.length;
    const escapedMaskChars: string[] = [];

    let currentPos = 0;

    this._literals.clear();

    for (let i = 0; i < length; i++) {
      const [current, next] = [mask.charAt(i), mask.charAt(i + 1)];

      if (this._isEscapedFlag(current, next)) {
        // Escaped flag: the next character is a literal.
        this._literals.set(currentPos, next);
        escapedMaskChars.push(next);
        i++;
      } else if (MASK_FLAGS.has(current)) {
        escapedMaskChars.push(current);
      } else {
        this._literals.set(currentPos, current);
        escapedMaskChars.push(current);
      }

      currentPos++;
    }

    this._escapedMask = escapedMaskChars.join('');
    this._literalPositions = new Set(this._literals.keys());
    this._requiredPositions = this._computeRequiredPositions();
    this._invalidate();
  }

  /**
   * The positions of the escaped mask that hold a required input flag, such as
   * '0' or 'L', and are not literals. A valid masked string fills them all.
   */
  protected _computeRequiredPositions(): number[] {
    const literalPositions = this._literalPositions;
    const escapedMask = this._escapedMask;
    const length = escapedMask.length;
    const result: number[] = [];

    for (let i = 0; i < length; i++) {
      const char = escapedMask[i];
      if (MASK_REQUIRED_FLAGS.has(char) && !literalPositions.has(i)) {
        result.push(i);
      }
    }

    return result;
  }

  /**
   * Finds the closest non-literal position *before* `start`, for backward navigation.
   *
   * @remarks
   * Returns 0 when there is none.
   */
  public getPreviousNonLiteralPosition(start: number): number {
    const literalPositions = this._literalPositions;

    for (let i = start - 1; i >= 0; i--) {
      if (!literalPositions.has(i)) {
        return i;
      }
    }

    return 0;
  }

  /**
   * Finds the closest non-literal position at or *after* `start`, for forward navigation.
   *
   * @remarks
   * Returns the mask length when there is none.
   */
  public getNextNonLiteralPosition(start: number): number {
    const literalPositions = this._literalPositions;
    const length = this._escapedMask.length;

    for (let i = Math.max(0, start); i < length; i++) {
      if (!literalPositions.has(i)) {
        return i;
      }
    }

    return length;
  }

  /**
   * Replaces a range of the masked string with input, as typing or pasting does.
   *
   * @example
   * ```ts
   * const parser = new MaskParser({ format: '00/00/0000' });
   * const current = '__/__/____';
   * const result = parser.replace(current, '12', 0, 0);
   * // result.value = '12/__/____', result.end = 2
   * ```
   */
  public replace(
    maskString: string,
    value: string,
    start: number,
    end: number
  ): MaskReplaceResult {
    const literalPositions = this.literalPositions;
    const escapedMask = this._escapedMask;
    const length = escapedMask.length;
    const prompt = this.prompt;
    const endBoundary = Math.min(end, length);

    // Split the masked string by UTF-16 code unit, like the DOM selection. Split the input
    // by code point, so that an astral character is rejected whole.
    const maskedChars = (maskString || this.emptyMask).split('');

    const inputChars = Array.from(replaceUnicodeNumbers(value));
    const inputLength = inputChars.length;

    for (let i = start; i < endBoundary; i++) {
      if (!literalPositions.has(i)) {
        maskedChars[i] = prompt;
      }
    }

    let cursor = start;
    let inputIndex = 0;
    let maskPosition = start;

    // Place valid characters. Skip literals and invalid characters.
    for (; maskPosition < length && inputIndex < inputLength; maskPosition++) {
      if (literalPositions.has(maskPosition)) {
        cursor = maskPosition + 1;
        continue;
      }

      const char = inputChars[inputIndex];

      if (validate(char, escapedMask[maskPosition]) && char !== prompt) {
        maskedChars[maskPosition] = char;
        cursor = maskPosition + 1;
        inputIndex++;
      } else {
        inputIndex++;
        maskPosition--;
      }
    }

    while (cursor < length && literalPositions.has(cursor)) {
      cursor++;
    }

    return {
      value: maskedChars.join(''),
      end: cursor,
    };
  }

  /** Unmasks the string: removes the prompts and the literals. */
  public parse(masked = ''): string {
    const literalPositions = this.literalPositions;
    const prompt = this.prompt;
    const length = masked.length;
    const result: string[] = [];

    for (let i = 0; i < length; i++) {
      const char = masked[i];
      if (!literalPositions.has(i) && char !== prompt) {
        result.push(char);
      }
    }

    return result.join('');
  }

  /** Returns whether all required positions hold valid, non-prompt characters. */
  public isValidString(input = ''): boolean {
    const prompt = this.prompt;

    return this._requiredPositions.every((position) => {
      const char = input[position];
      return validate(char, this._escapedMask[position]) && char !== prompt;
    });
  }

  /**
   * Fits the input into the mask from left to right and skips invalid characters.
   *
   * @example
   * ```ts
   * const parser = new MaskParser({ format: '00/00/0000' });
   * parser.apply('12252023'); // Returns '12/25/2023'
   * ```
   */
  public apply(input = ''): string {
    const literals = this._literals;
    const prompt = this.prompt;
    const escapedMask = this._escapedMask;
    const length = escapedMask.length;

    const result = new Array(length).fill(prompt);

    for (const [position, literal] of literals.entries()) {
      result[position] = literal;
    }

    if (!input) {
      return result.join('');
    }

    // Normalize Unicode digits to ASCII. Split by code point, so that an astral character
    // is one invalid character.
    const normalizedInput = Array.from(replaceUnicodeNumbers(input));
    const inputLength = normalizedInput.length;
    let inputIndex = 0;

    for (let i = 0; i < length; i++) {
      if (inputIndex >= inputLength) {
        break;
      }

      if (literals.has(i)) {
        continue;
      }

      if (validate(normalizedInput[inputIndex], escapedMask[i])) {
        result[i] = normalizedInput[inputIndex];
      }

      // An invalid character is consumed too.
      inputIndex++;
    }

    return result.join('');
  }
}

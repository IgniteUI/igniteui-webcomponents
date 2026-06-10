/** Options for the {@link MaskParser} */
interface MaskOptions {
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
   * Must be a single character.
   * @default '_'
   */
  promptCharacter?: string;
}

/** Internal options with all required fields */
interface MaskOptionsInternal {
  format: string;
  promptCharacter: string;
}

/**
 * Result type for the replace operation, containing the new masked value and the
 * ideal cursor position.
 */
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

/**
 * Precomputed map of Unicode digit codepoints to their ASCII equivalents.
 * This eliminates the need for iteration during conversion.
 */
const UNICODE_DIGIT_TO_ASCII = new Map<number, string>(
  DIGIT_ZERO_CODEPOINTS.flatMap((zeroCodePoint) =>
    Array.from({ length: 10 }, (_, i) => [
      zeroCodePoint + i,
      String.fromCharCode(ASCII_ZERO + i),
    ])
  )
);

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

function validate(char: string, flag: string): boolean {
  return MASK_PATTERNS.get(flag)?.test(char) ?? false;
}

/** Default mask parser options */
const MaskDefaultOptions: MaskOptionsInternal = {
  format: DEFAULT_FORMAT,
  promptCharacter: DEFAULT_PROMPT,
};

/**
 * A class for parsing and applying masks to strings, typically for input fields.
 * It handles mask definitions, literals, character validation, and cursor positioning.
 */
export class MaskParser {
  protected readonly _options: MaskOptionsInternal;

  /** Stores literal characters and their original positions in the mask (e.g., '(', ')', '-'). */
  protected readonly _literals = new Map<number, string>();

  /** A Set of positions where literals occur in the `_escapedMask`. */
  protected _literalPositions = new Set<number>();

  /** The mask format after processing escape characters */
  protected _escapedMask = '';

  /** Cached array of required non-literal positions for validation */
  protected _requiredPositions: number[] = [];

  /**
   * Returns a set of the all the literal positions in the mask.
   * These positions are fixed characters that are not part of the input.
   */
  public get literalPositions(): ReadonlySet<number> {
    return this._literalPositions;
  }

  /**
   * Returns the escaped mask string.
   * This is the mask after processing any escape sequences.
   */
  public get escapedMask(): string {
    return this._escapedMask;
  }

  /**
   * Returns the result of applying an empty string over the mask pattern.
   */
  public get emptyMask(): string {
    return this.apply();
  }

  /**
   * Gets the unescaped mask string (the original format string).
   * If the mask has no escape sequences, then `mask === escapedMask`.
   */
  public get mask(): string {
    return this._options.format;
  }

  /**
   * Sets the mask of the parser.
   * When the mask is set, it triggers a re-parsing of the mask literals and escaped mask.
   */
  public set mask(value: string) {
    this._options.format = value || this._options.format;
    this._parseMaskLiterals();
  }

  /**
   * Gets the prompt character used for unfilled mask positions.
   */
  public get prompt(): string {
    return this._options.promptCharacter;
  }

  /**
   * Sets the prompt character. Only the first character of the provided string is used.
   * @remarks The prompt character cannot be a mask flag character.
   */
  public set prompt(value: string) {
    const char = value ? value.substring(0, 1) : this._options.promptCharacter;

    // Silently ignore if prompt character conflicts with mask flags
    if (MASK_FLAGS.has(char)) {
      return;
    }

    this._options.promptCharacter = char;
  }

  constructor(options?: MaskOptions) {
    this._options = { ...MaskDefaultOptions, ...options };
    this._parseMaskLiterals();
  }

  private _isEscapedFlag(char: string, nextChar: string): boolean {
    return char === ESCAPE_CHAR && MASK_FLAGS.has(nextChar);
  }

  /**
   * Parses the mask format string to identify literal characters and
   * create the escaped mask. This method is called whenever the mask format changes.
   */
  protected _parseMaskLiterals(): void {
    const mask = this.mask;
    const length = mask.length;
    const escapedMaskChars: string[] = [];

    let currentPos = 0;

    this._literals.clear();

    for (let i = 0; i < length; i++) {
      const [current, next] = [mask.charAt(i), mask.charAt(i + 1)];

      if (this._isEscapedFlag(current, next)) {
        // Escaped character - push next as a literal character and skip processing it
        this._literals.set(currentPos, next);
        escapedMaskChars.push(next);
        i++;
      } else if (MASK_FLAGS.has(current)) {
        // Regular flag character
        escapedMaskChars.push(current);
      } else {
        // Literal character
        this._literals.set(currentPos, current);
        escapedMaskChars.push(current);
      }

      currentPos++;
    }

    this._escapedMask = escapedMaskChars.join('');
    this._literalPositions = new Set(this._literals.keys());
    this._requiredPositions = this._computeRequiredPositions();
  }

  /**
   * Computes an array of positions in the escaped mask that correspond to
   * required input flags (e.g., '0', 'L') and are not literal characters.
   *
   * These positions must be filled for the masked string to be valid.
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
   * Finds the closest non-literal position in the mask *before* the given start position.
   * Useful for backward navigation (e.g., backspace).
   *
   * @remarks
   * If no non-literal is found before `start`, return 0.
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
   * Finds the closest non-literal position in the mask *after* the given start position.
   * Useful for forward navigation (e.g., arrow keys, delete key or initial cursor placement).
   *
   * @remarks
   * If no non-literal is found after `start`, return the mask length.
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
   * Replaces a segment of the masked string with new input, simulating typing or pasting.
   * It handles clearing the selected range and inserting new characters according to the mask.
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

    // Initialize the array for the masked string or get a fresh mask with prompts and/or literals
    const maskedChars = maskString ? [...maskString] : [...this.apply('')];

    const inputChars = Array.from(replaceUnicodeNumbers(value));
    const inputLength = inputChars.length;

    // Clear any non-literal positions from `start` to `endBoundary`
    for (let i = start; i < endBoundary; i++) {
      if (!literalPositions.has(i)) {
        maskedChars[i] = prompt;
      }
    }

    let cursor = start;
    let inputIndex = 0;
    let maskPosition = start;

    // Iterate through the mask starting at `start` as long as there are input characters and mask positions available
    // and start placing characters or skipping literals and invalid characters
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

    // Move the cursor to the next non-literal position or the end of the mask
    while (cursor < length && literalPositions.has(cursor)) {
      cursor++;
    }

    return {
      value: maskedChars.join(''),
      end: cursor,
    };
  }

  /**
   * Parses the masked string, extracting only the valid input characters.
   * This effectively "unmasks" the string, removing prompts and literals.
   */
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

  /**
   * Checks if the masked string is valid, specifically if all required mask positions are filled
   * with valid, non-prompt characters.
   */
  public isValidString(input = ''): boolean {
    const prompt = this.prompt;

    return this._requiredPositions.every((position) => {
      const char = input[position];
      return validate(char, this._escapedMask[position]) && char !== prompt;
    });
  }

  /**
   * Applies the mask format to an input string. This attempts to fit the input
   * into the mask from left to right, filling valid positions and skipping invalid
   * input characters.
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

    // Initialize the result array with prompt characters
    const result = new Array(length).fill(prompt);

    // Place all literal characters into the result array
    for (const [position, literal] of literals.entries()) {
      result[position] = literal;
    }

    if (!input) {
      return result.join('');
    }

    // Normalize Unicode digits to ASCII
    const normalizedInput = replaceUnicodeNumbers(input);
    const inputLength = normalizedInput.length;
    let inputIndex = 0;

    // Iterate through the mask placing input characters skipping literals and invalid ones
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

      // Always advance - invalid characters are consumed/skipped
      inputIndex++;
    }

    return result.join('');
  }
}

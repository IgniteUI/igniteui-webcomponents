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
  format: string;

  /**
   * The character used to prompt for input in unfilled mask positions.
   * Must be a single character.
   * @default '_'
   */
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

const DIGIT_ZERO_CODEPOINTS = [
  0x0030, // ASCII
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

function replaceUnicodeNumbers(text: string): string {
  const matcher = /\p{Nd}/gu;
  const ascii_zero = 0x0030;

  return text.replace(matcher, (digit) => {
    let digitValue = 0;
    const codePoint = digit.charCodeAt(0);

    for (const zeroCodePoint of DIGIT_ZERO_CODEPOINTS) {
      if (codePoint >= zeroCodePoint && codePoint <= zeroCodePoint + 9) {
        digitValue = zeroCodePoint;
        break;
      }
    }

    digitValue = codePoint - digitValue;
    return String.fromCharCode(ascii_zero + digitValue);
  });
}

const MASK_PATTERNS = new Map([
  ['C', /(?!^$)/u], // Non-empty (any character that is not an empty string)
  ['&', /[^\p{Separator}]/u], // Any non-whitespace character (Unicode-aware)
  ['a', /[\p{Letter}\p{Number}\p{Separator}]/u], // Alphanumeric and whitespace (Unicode-aware)
  ['A', /[\p{Letter}\p{Number}]/u], // Alphanumeric (Unicode-aware)
  ['?', /[\p{Letter}\p{Separator}]/u], // Alpha and whitespace (Unicode-aware)
  ['L', /\p{Letter}/u], // Alphabetic (Unicode-aware)
  ['0', /\p{Number}/u], // Numeric (0-9) (Unicode-aware)
  ['9', /[\p{Number}\p{Separator}]/u], // Numeric and whitespace (Unicode-aware)
  ['#', /[\p{Number}\-+]/u], // Numeric and sign characters (+, -)
]);

function validate(char: string, flag: string): boolean {
  return MASK_PATTERNS.get(flag)?.test(char) ?? false;
}

/** Default mask parser options */
const MaskDefaultOptions: MaskOptions = {
  format: 'CCCCCCCCCC',
  promptCharacter: '_',
};

/**
 * A class for parsing and applying masks to strings, typically for input fields.
 * It handles mask definitions, literals, character validation, and cursor positioning.
 */
export class MaskParser {
  protected readonly _options: MaskOptions;

  /** Stores literal characters and their original positions in the mask (e.g., '(', ')', '-'). */
  protected readonly _literals = new Map<number, string>();

  /** A Set of positions where literals occur in the `_escapedMask`. */
  protected _literalPositions = new Set<number>();

  /** The mask format after processing escape characters */
  protected _escapedMask = '';

  /**
   * Returns a set of the all the literal positions in the mask.
   * These positions are fixed characters that are not part of the input.
   */
  public get literalPositions(): Set<number> {
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
   */
  public set prompt(value: string) {
    this._options.promptCharacter = value
      ? value.substring(0, 1)
      : this._options.promptCharacter;
  }

  constructor(options?: MaskOptions) {
    this._options = { ...MaskDefaultOptions, ...options };
    this._parseMaskLiterals();
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

      if (current === '\\' && MASK_FLAGS.has(next)) {
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
  }

  /**
   * Gets an array of positions in the escaped mask that correspond to
   * required input flags (e.g., '0', 'L') and are not literal characters.
   *
   * These positions must be filled for the masked string to be valid.
   */
  protected _getRequiredNonLiteralPositions(): number[] {
    const literalPositions = this.literalPositions;
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
   * If no non-literal is found before `start`, return `start`.
   */
  public getPreviousNonLiteralPosition(start: number): number {
    const literalPositions = this.literalPositions;

    for (let i = start; i > 0; i--) {
      if (!literalPositions.has(i)) {
        return i;
      }
    }

    return start;
  }

  /**
   * Finds the closest non-literal position in the mask *after* the given start position.
   * Useful for forward navigation (e.g., arrow keys, delete key or initial cursor placement).
   *
   * @remarks
   * If no non-literal is found after `start`, return `start`.
   */
  public getNextNonLiteralPosition(start: number): number {
    const literalPositions = this.literalPositions;
    const length = this._escapedMask.length;

    for (let i = start; i < length; i++) {
      if (!literalPositions.has(i)) {
        return i;
      }
    }

    return start;
  }

  /**
   * Replaces a segment of the masked string with new input, simulating typing or pasting.
   * It handles clearing the selected range and inserting new characters according to the mask.
   */
  public replace(
    maskString: string,
    value: string,
    start: number,
    end: number
  ): MaskReplaceResult {
    const literalPositions = this.literalPositions;
    const escapedMask = this._escapedMask;
    const length = this._escapedMask.length;
    const prompt = this.prompt;
    const endBoundary = Math.min(end, length);

    // Initialize the array for the masked string or get a fresh mask with prompts and/or literals
    const maskedChars = Array.from(maskString || this.apply(''));

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

    let result = '';

    for (let i = 0; i < length; i++) {
      const char = masked[i];
      if (!literalPositions.has(i) && char !== prompt) {
        result += char;
      }
    }

    return result;
  }

  /**
   * Checks if the masked string is valid, specifically if all required mask positions are filled
   * with valid, non-prompt characters.
   */
  public isValidString(input = ''): boolean {
    const prompt = this.prompt;

    return this._getRequiredNonLiteralPositions().every((position) => {
      const char = input.charAt(position);
      return (
        validate(char, this._escapedMask.charAt(position)) && char !== prompt
      );
    });
  }

  /**
   * Applies the mask format to an input string. This attempts to fit the input
   * into the mask from left to right, filling valid positions and skipping invalid
   * input characters.
   */
  public apply(input = ''): string {
    const literals = this._literals;
    const prompt = this.prompt;
    const escapedMask = this._escapedMask;
    const length = escapedMask.length;
    const inputLength = input.length;

    // Initialize the result array with prompt characters
    const result = new Array(escapedMask.length).fill(prompt);

    // Place all literal characters into the result array
    for (const [position, literal] of literals.entries()) {
      result[position] = literal;
    }

    if (!input) {
      return result.join('');
    }

    let inputIndex = 0;

    // Iterate through the mask placing input characters skipping literals and invalid ones
    for (let i = 0; i < length; i++) {
      if (inputIndex >= inputLength) {
        break;
      }

      if (literals.has(i)) {
        continue;
      }

      if (validate(input.charAt(inputIndex), escapedMask.charAt(i))) {
        result[i] = input.charAt(inputIndex);
      }

      inputIndex++;
    }

    return result.join('');
  }
}

interface MaskOptions {
  format: string;
  promptCharacter: string;
}

const FLAGS = new Set('aACL09#&?');
const REGEX = new Map([
  ['C', /(?!^$)/u], // Non-empty
  ['&', /[^\p{Separator}]/u], // Whitespace
  ['a', /[\p{Letter}\d\p{Separator}]/u], // Alphanumeric & whitespace
  ['A', /[\p{Letter}\d]/u], // Alphanumeric
  ['?', /[\p{Letter}\p{Separator}]/u], // Alpha & whitespace
  ['L', /\p{Letter}/u], // Alpha
  ['0', /\d/], // Numeric
  ['9', /[\d\p{Separator}]/u], // Numeric & whitespace
  ['#', /[\d\-+]/], // Numeric and sign
]);
const REQUIRED = new Set('0#LA&');

const replaceIMENumbers = (string: string) => {
  return string.replace(
    /[０１２３４５６７８９]/g,
    (num) =>
      ({
        '１': '1',
        '２': '2',
        '３': '3',
        '４': '4',
        '５': '5',
        '６': '6',
        '７': '7',
        '８': '8',
        '９': '9',
        '０': '0',
      })[num] as string
  );
};

export class MaskParser {
  protected options!: MaskOptions;

  constructor(
    options: MaskOptions = { format: 'CCCCCCCCCC', promptCharacter: '_' }
  ) {
    this.options = options;
    this.parseMaskLiterals();
  }

  protected literals = new Map<number, string>();
  protected _escapedMask = '';

  public get literalPositions() {
    return Array.from(this.literals.keys());
  }

  public get escapedMask() {
    return this._escapedMask;
  }

  public get mask() {
    return this.options.format;
  }

  public set mask(value: string) {
    this.options.format = value || this.options.format;
    this.parseMaskLiterals();
  }

  public get prompt() {
    return this.options.promptCharacter;
  }

  public set prompt(value: string) {
    this.options.promptCharacter = value
      ? value.substring(0, 1)
      : this.options.promptCharacter;
  }

  protected parseMaskLiterals() {
    this.literals.clear();
    this._escapedMask = this.mask;

    for (let i = 0, j = 0; i < this.mask.length; i++, j++) {
      const [current, next] = [this.mask.charAt(i), this.mask.charAt(i + 1)];

      if (current === '\\' && FLAGS.has(next)) {
        this._escapedMask = this.replaceCharAt(this._escapedMask, j, '');
        this.literals.set(j, next);
        i++;
      } else if (!FLAGS.has(current)) {
        this.literals.set(j, current);
      }
    }
  }

  protected isPromptChar(char: string) {
    return char === this.prompt;
  }

  protected replaceCharAt(string: string, pos: number, char: string) {
    return `${string.substring(0, pos)}${char}${string.substring(pos + 1)}`;
  }

  protected validate(char: string, maskedChar: string) {
    const regex = REGEX.get(maskedChar);
    return regex ? regex.test(char) : false;
  }

  protected getNonLiteralPositions(mask = '') {
    const positions = this.literalPositions;
    const result = [];
    const iter = Array.from(mask).entries();

    for (const [pos, _] of iter) {
      if (!positions.includes(pos)) {
        result.push(pos);
      }
    }

    return result;
  }

  protected getRequiredNonLiteralPositions(mask: string) {
    const positions = this.literalPositions;
    const result = [];
    const iter = Array.from(mask).entries();

    for (const [pos, char] of iter) {
      if (REQUIRED.has(char) && !positions.includes(pos)) {
        result.push(pos);
      }
    }

    return result;
  }

  public getPreviousNonLiteralPosition(start: number) {
    const positions = this.literalPositions;
    for (let i = start; i > 0; i--) {
      if (!positions.includes(i)) return i;
    }
    return start;
  }

  public getNextNonLiteralPosition(start: number) {
    const positions = this.literalPositions;
    for (let i = start; i < this._escapedMask.length; i++) {
      if (!positions.includes(i)) return i;
    }
    return start;
  }

  public replace(
    maskString: string,
    value: string,
    start: number,
    end: number
  ) {
    let masked = maskString ?? '';
    const chars = Array.from(replaceIMENumbers(value));
    const positions = this.literalPositions;
    const final = Math.min(end, masked.length);
    let cursor = start;

    for (let i = start; i < final || (chars.length && i < masked.length); i++) {
      if (positions.includes(i)) {
        if (chars[0] === masked[i]) {
          cursor = i + 1;
          chars.shift();
        }
        continue;
      }

      if (
        chars[0] &&
        !this.validate(chars[0], this._escapedMask[i]) &&
        !this.isPromptChar(chars[0])
      ) {
        break;
      }

      let char = this.prompt;
      if (chars.length) {
        cursor = i + 1;
        char = chars.shift() as string;
      }
      masked = this.replaceCharAt(masked, i, char);
    }

    return { value: masked, end: cursor };
  }

  public parse(masked = '') {
    const positions = this.literalPositions;
    const result = [];
    const iter = Array.from(masked).entries();

    for (const [pos, char] of iter) {
      !positions.includes(pos) && !this.isPromptChar(char)
        ? result.push(char)
        : result.push('');
    }

    return result.join('');
  }

  public isValidString(input = '') {
    const required = this.getRequiredNonLiteralPositions(this._escapedMask);

    if (required.length > this.parse(input).length) {
      return false;
    }

    return required.every((pos) => {
      const char = input.charAt(pos);
      return (
        this.validate(char, this._escapedMask.charAt(pos)) &&
        !this.isPromptChar(char)
      );
    });
  }

  public apply(input = '') {
    const output = new Array(this._escapedMask.length).fill(this.prompt);

    for (const [pos, char] of this.literals.entries()) {
      output[pos] = char;
    }

    if (!input) {
      return output.join('');
    }

    const nonLiteralPositions = this.getNonLiteralPositions(this._escapedMask);
    const values = nonLiteralPositions.map((pos, index) => {
      const char = input.charAt(index);
      return !this.validate(char, this._escapedMask.charAt(pos)) &&
        !this.isPromptChar(char)
        ? this.prompt
        : char;
    });

    if (values.length > nonLiteralPositions.length) {
      values.splice(nonLiteralPositions.length);
    }

    for (const [position, char] of values.entries()) {
      output[nonLiteralPositions[position]] = char;
    }

    return output.join('');
  }
}

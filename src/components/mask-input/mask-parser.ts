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
  }

  protected literals = new Map<number, string>();
  protected _escapedMask = '';

  public get literalPositions() {
    this.getMaskLiterals();
    return Array.from(this.literals.keys());
  }

  public get escapedMask() {
    this.getMaskLiterals();
    return this._escapedMask;
  }

  public get mask() {
    return this.options.format;
  }

  public set mask(value: string) {
    this.options.format = value || this.options.format;
    this.getMaskLiterals();
  }

  public get prompt() {
    return this.options.promptCharacter;
  }

  public set prompt(value: string) {
    this.options.promptCharacter = value
      ? value.substring(0, 1)
      : this.options.promptCharacter;
  }

  protected getMaskLiterals() {
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
    return Array.from(mask)
      .map((_, pos) => (!positions.includes(pos) ? pos : -1))
      .filter((pos) => pos > -1);
  }

  protected getRequiredNonLiteralPositions(mask: string) {
    const positions = this.literalPositions;
    return Array.from(mask)
      .map((char, pos) =>
        REQUIRED.has(char) && !positions.includes(pos) ? pos : -1
      )
      .filter((pos) => pos > -1);
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

  public replace(masked = '', value: string, start: number, end: number) {
    const chars = Array.from(replaceIMENumbers(value));
    const positions = this.literalPositions;
    end = Math.min(end, masked.length);
    let cursor = start;

    for (let i = start; i < end || (chars.length && i < masked.length); i++) {
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
    return Array.from(masked).reduce((prev, char, pos) => {
      return `${prev}${
        !this.literalPositions.includes(pos) && !this.isPromptChar(char)
          ? char
          : ''
      }`;
    }, '');
  }

  public isValidString(input = '') {
    const required = this.getRequiredNonLiteralPositions(this._escapedMask);

    if (required.length > this.parse(input).length) {
      return false;
    }
    return required.every((pos) => {
      const char = input.charAt(pos);
      return (
        char !== undefined &&
        this.validate(char, this._escapedMask.charAt(pos)) &&
        !this.isPromptChar(char)
      );
    });
  }

  public apply(input = '') {
    const nonLiteralPositions = this.getNonLiteralPositions(this._escapedMask);
    let output = new Array(this._escapedMask.length).fill(this.prompt).join('');

    this.literals.forEach((char, pos) => {
      output = this.replaceCharAt(output, pos, char);
    });

    if (!input) {
      return output;
    }

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

    let pos = 0;
    for (const each of values) {
      output = this.replaceCharAt(output, nonLiteralPositions[pos++], each);
    }

    return output;
  }
}

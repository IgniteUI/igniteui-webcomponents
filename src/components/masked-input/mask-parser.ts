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
      }[num] as string)
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

  protected unescapedMask!: string;

  protected get literalValues() {
    return Array.from(this.literals.values());
  }

  protected get literalPositions() {
    return Array.from(this.literals.keys());
  }

  public get mask() {
    return this.options.format;
  }

  public set mask(value: string) {
    this.options.format = value || this.options.format;
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
    this.unescapedMask = this.mask;

    for (let i = 0, j = 0; i < this.mask.length; i++, j++) {
      const [current, next] = [this.mask.charAt(i), this.mask.charAt(i + 1)];

      if (current === '\\' && FLAGS.has(next)) {
        this.unescapedMask = this.replaceCharAt(this.unescapedMask, j, '');
        this.literals.set(j, next);
        i++;
      } else {
        if (!FLAGS.has(current)) {
          this.literals.set(j, current);
        }
      }
    }
  }

  protected replaceCharAt(string: string, pos: number, char: string) {
    return string.substring(0, pos) + char + string.substring(pos + 1);
  }

  protected validate(char: string, maskedChar: string) {
    const regex = REGEX.get(maskedChar);
    return regex ? regex.test(char) : false;
  }

  protected getNonLiteralPositions(mask: string) {
    const positions = this.literalPositions;
    const result: number[] = [];

    for (let i = 0; i < mask.length; i++) {
      if (!positions.includes(i)) {
        result.push(i);
      }
    }

    return result;
  }

  protected getNonLiteralValues(input: string) {
    const result: string[] = [];

    for (const char of input) {
      if (!this.literalValues.includes(char)) {
        result.push(char);
      }
    }

    return result;
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
        !this.validate(chars[0], this.unescapedMask[i]) &&
        chars[0] !== this.prompt
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
    let output = '';
    this.getMaskLiterals();

    for (const char of masked) {
      if (!this.literalValues.includes(char) && char !== this.prompt) {
        output += char;
      }
    }

    return output;
  }

  public apply(input = '') {
    this.getMaskLiterals();

    const nonLiteralPositions = this.getNonLiteralPositions(this.mask);
    let output = new Array(this.unescapedMask.length)
      .fill(this.prompt)
      .join('');

    this.literals.forEach((char, pos) => {
      output = this.replaceCharAt(output, pos, char);
    });

    if (!input) {
      return output;
    }

    const nonLiteralValues = this.getNonLiteralValues(input);

    for (let i = 0; i < nonLiteralValues.length; i++) {
      const char = nonLiteralValues[i];
      if (
        !this.validate(
          char,
          this.unescapedMask.charAt(nonLiteralPositions[i])
        ) &&
        char !== this.prompt
      ) {
        nonLiteralValues[i] = this.prompt;
      }
    }

    if (nonLiteralValues.length > nonLiteralPositions.length) {
      nonLiteralValues.splice(nonLiteralPositions.length);
    }

    let pos = 0;
    for (const each of nonLiteralValues) {
      output = this.replaceCharAt(output, nonLiteralPositions[pos++], each);
    }

    return output;
  }
}

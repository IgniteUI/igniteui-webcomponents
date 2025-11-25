import { expect } from '@open-wc/testing';

import { MaskParser } from './mask-parser.js';

describe('Mask parser', () => {
  let parser: MaskParser;

  beforeEach(() => {
    parser = new MaskParser();
  });

  it('default mask', () => {
    expect(parser.apply()).to.equal('__________');
  });

  it('custom mask', () => {
    parser.mask = '####/##/##';

    expect(parser.apply()).to.equal('____/__/__');
  });

  it('mask validation', () => {
    parser.mask = '';
    expect(parser.apply()).to.equal('__________');
  });

  it('default prompt character', () => {
    parser.mask = 'CCCC-CCC';
    expect(parser.apply()).to.equal('____-___');
  });

  it('custom prompt character', () => {
    parser.mask = 'CCCC-CCC';
    parser.prompt = '*';

    expect(parser.apply()).to.equal('****-***');
  });

  it('prompt character validation', () => {
    parser.mask = 'CCCC-CCCC';
    parser.prompt = '';

    expect(parser.apply()).to.equal('____-____');

    parser.prompt = '$$';
    expect(parser.apply()).to.equal('$$$$-$$$$');
  });

  it('digits or whitespace', () => {
    parser.mask = '999999';
    expect(parser.apply('555 555')).to.equal('555 55');
  });

  it('sign and digits', () => {
    parser.mask = '####-### ## ## ##';
    expect(parser.apply('+359884190854')).to.equal('+359-884 19 08 54');
  });

  it('letters or whitespace (ascii)', () => {
    parser.mask = 'LL??LL??';
    expect(parser.apply('AB 2CD E')).to.equal('AB _CD E');
  });

  it('letters (unicode)', () => {
    parser.mask = 'LLLLLL!';
    expect(parser.apply('Работи')).to.equal('Работи!');
  });

  it('any keyboard input', () => {
    parser.mask = '&&&.CCC';
    expect(parser.apply(' =% p]')).to.equal('_=%. p]');
  });

  it('mask escape sequences', () => {
    parser.mask = 'CCCC-\\C-CCC';
    expect(parser.apply()).to.equal('____-C-___');

    parser.mask = '\\# \\(###)-###';
    expect(parser.apply('123456')).to.equal('# \\(123)-456');

    parser.mask = '\\C\\C-CCCC-CCC-\\9\\9';
    expect(parser.apply('ABCD99')).to.equal('CC-ABCD-99_-99');
  });

  it('validates mask pattern rules', () => {
    const validate = (string: string) =>
      parser.isValidString(parser.apply(string));

    parser.mask = '000 [000]';

    // Invalid: 121 [2__]
    expect(validate('1212')).to.be.false;

    // Valid: 121 [233] (3) dropped from `apply`
    expect(validate('1212333')).to.be.true;

    // Valid: 121 [233]
    expect(validate('121233')).to.be.true;

    parser.mask = '000 [999]';

    // Valid: 121 [___]
    expect(validate('121')).to.be.true;

    parser.mask = '00\\0 [999]';

    // Valid: 110 [___]
    expect(validate('11')).to.be.true;

    // Invalid: __0 [___]
    expect(validate('aa')).to.be.false;

    // Invalid 1_0 [___]
    expect(validate('1')).to.be.false;

    parser.mask = '(99) (0)';
    expect(validate('')).to.be.false;

    parser.mask = '(99) (9)';
    expect(validate('')).to.be.true;
  });

  it('apply', () => {
    parser.mask = '(000) 0000-000';
    parser.prompt = '*';
    expect(parser.apply('1234')).to.equal('(123) 4***-***');
  });

  it('parse', () => {
    parser.mask = '#.##';
    expect(parser.parse('3.14')).to.equal('314');

    parser.mask = '##-##';
    expect(parser.parse('-----')).to.equal('----');

    parser.mask = '+35\\9 999999';
    expect(parser.parse('+359 123456')).to.equal('123456');

    parser.mask = 'LLLL (\\and) LLL';
    expect(parser.parse('QWER (and) TYY')).to.equal('QWERTYY');
  });

  it('replace', () => {
    const value = '432#!';
    parser.mask = '(###) CCC';
    const result = parser.replace(parser.apply(), value, 0, value.length);
    expect(result.value).to.equal('(432) #!_');
  });

  it('replace (invalid start)', () => {
    const value = 'ak47';
    parser.mask = '####';
    const result = parser.replace(parser.apply(), value, 0, value.length);
    expect(result.value).to.equal('47__');
  });

  it('replace (invalid end)', () => {
    const value = '87af';
    parser.mask = '(###)';
    const result = parser.replace(parser.apply(), value, 0, value.length);
    expect(result.value).to.equal('(87_)');
  });

  it('replace with IME numbers and a number mask', () => {
    const value = '１９８７afE';
    parser.mask = '######';
    const result = parser.replace(parser.apply(), value, 0, value.length);
    expect(result.value).to.equal('1987__');
  });

  describe('Unicode digit normalization', () => {
    it('converts Arabic-Indic digits (٠-٩)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '٠١٢٣', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Extended Arabic-Indic digits (۰-۹)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '۰۱۲۳', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Devanagari digits (०-९)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '०१२३', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Bengali digits (০-৯)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '০১২৩', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Gurmukhi digits (੦-੯)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '੦੧੨੩', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Gujarati digits (૦-૯)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '૦૧૨૩', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Oriya digits (୦-୯)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '୦୧୨୩', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Telugu digits (౦-౯)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '౦౧౨౩', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Kannada digits (೦-೯)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '೦೧೨೩', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Malayalam digits (൦-൯)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '൦൧൨൩', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Thai digits (๐-๙)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '๐๑๒๓', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Lao digits (໐-໙)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '໐໑໒໓', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Tibetan digits (༠-༩)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '༠༡༢༣', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Myanmar digits (၀-၉)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '၀၁၂၃', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Khmer digits (០-៩)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '០១២៣', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Mongolian digits (᠐-᠙)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '᠐᠑᠒᠓', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('converts Full-width digits (０-９)', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '０１２３', 0, 4);
      expect(result.value).to.equal('0123');
    });

    it('handles mixed Unicode and ASCII digits', () => {
      parser.mask = '00000000';
      const result = parser.replace(parser.apply(), '12٣٤५६७8', 0, 8);
      expect(result.value).to.equal('12345678');
    });

    it('converts Unicode digits in phone mask', () => {
      parser.mask = '(000) 000-0000';
      const result = parser.replace(parser.apply(), '५५५१२३४५६७', 0, 10);
      expect(result.value).to.equal('(555) 123-4567');
    });

    it('converts Unicode digits in date mask', () => {
      parser.mask = '00/00/0000';
      const result = parser.replace(parser.apply(), '१२३१२०२४', 0, 8);
      expect(result.value).to.equal('12/31/2024');
    });

    it('handles Unicode digits with alphanumeric mask', () => {
      parser.mask = 'AAA-000';
      const result = parser.replace(parser.apply(), 'ABC१२३', 0, 6);
      expect(result.value).to.equal('ABC-123');
    });

    it('converts all digits to ASCII (0-9)', () => {
      parser.mask = '0000000000';
      const result = parser.replace(parser.apply(), '०१২३४५६७८९', 0, 10);
      expect(result.value).to.equal('0123456789');
    });

    it('preserves non-digit Unicode characters', () => {
      parser.mask = 'LLLL-0000';
      const result = parser.replace(parser.apply(), 'Test५५५५', 0, 8);
      expect(result.value).to.equal('Test-5555');
    });

    it('handles empty input with Unicode conversion', () => {
      parser.mask = '0000';
      const result = parser.replace(parser.apply(), '', 0, 0);
      expect(result.value).to.equal('____');
    });

    it('handles partial Unicode digit input', () => {
      parser.mask = '000-000';
      const result = parser.replace(parser.apply(), '१२', 0, 2);
      expect(result.value).to.equal('12_-___');
    });

    it('converts Unicode digits with sign mask', () => {
      parser.mask = '####';
      const result = parser.replace(parser.apply(), '+१२३', 0, 4);
      expect(result.value).to.equal('+123');
    });

    it('apply() normalizes Unicode digits', () => {
      parser.mask = '0000';
      expect(parser.apply('०१२३')).to.equal('0123');
    });

    it('apply() with mixed Unicode systems', () => {
      parser.mask = '00000000';
      expect(parser.apply('१२৩৪५६७८')).to.equal('12345678');
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('empty mask string', () => {
      parser.mask = '';
      // Empty mask falls back to default mask 'CCCCCCCCCC'
      expect(parser.apply('test')).to.equal('test______');
      expect(parser.parse('')).to.equal('');
    });

    it('mask with only literals', () => {
      parser.mask = '---';
      expect(parser.apply('abc')).to.equal('---');
      expect(parser.parse('---')).to.equal('');
    });

    it('mask with only escaped characters', () => {
      parser.mask = '\\C\\C\\C';
      expect(parser.apply('test')).to.equal('CCC');
      expect(parser.literalPositions.size).to.equal(3);
    });

    it('prompt character conflicts with mask flag', () => {
      parser.mask = 'CCCC';
      parser.prompt = 'C';
      // Should be ignored silently
      expect(parser.prompt).to.equal('_');
      expect(parser.apply()).to.equal('____');
    });

    it('prompt character set to mask flag 0', () => {
      parser.mask = '0000';
      parser.prompt = '0';
      // Should be ignored
      expect(parser.prompt).to.equal('_');
    });

    it('very long input exceeding mask length', () => {
      parser.mask = '000';
      expect(parser.apply('123456789')).to.equal('123');
    });

    it('input shorter than mask length', () => {
      parser.mask = '0000000';
      expect(parser.apply('123')).to.equal('123____');
    });

    it('replace with start position beyond mask length', () => {
      parser.mask = '000';
      const result = parser.replace(parser.apply(), '123', 10, 15);
      expect(result.value).to.equal('___');
    });

    it('replace with boundary positions', () => {
      parser.mask = '0000';
      // Replace processes the entire value string regardless of start/end range
      const result = parser.replace(parser.apply(), '12', 0, 2);
      expect(result.value).to.equal('12__');
    });

    it('replace with start equals end (cursor position)', () => {
      parser.mask = '0000';
      const result = parser.replace('12__', '3', 2, 2);
      expect(result.value).to.equal('123_');
      expect(result.end).to.equal(3);
    });

    it('replace entire masked string', () => {
      parser.mask = '(000) 000-0000';
      const existing = parser.apply('5551234567');
      const result = parser.replace(existing, '9998887777', 0, existing.length);
      expect(result.value).to.equal('(999) 888-7777');
    });

    it('multiple consecutive literals', () => {
      parser.mask = '000---000';
      expect(parser.apply('123456')).to.equal('123---456');
    });

    it('escape character at end of mask', () => {
      parser.mask = 'CCC\\';
      // Trailing backslash with nothing after it is treated as a literal backslash
      expect(parser.apply('test')).to.equal('tes\\');
    });

    it('double backslash should produce single backslash literal', () => {
      parser.mask = 'C\\\\C';
      // First C is flag, second \ escapes nothing (not a flag), so it's literal, third C is flag
      // Actually, \\ is not a valid escape sequence (\ doesn't escape \), so both are literals
      expect(parser.apply('ab')).to.equal('a\\C');
    });

    it('special characters in mask', () => {
      parser.mask = 'CCC-@@@';
      expect(parser.apply('abc123')).to.equal('abc-@@@');
    });

    it('unicode letters in various scripts', () => {
      parser.mask = 'LLLLLLLL';
      expect(parser.apply('Привет世界')).to.equal('Привет世界');
    });

    it('whitespace handling with question mark flag', () => {
      parser.mask = '????';
      expect(parser.apply('A B ')).to.equal('A B ');
    });

    it('numeric with spaces using 9 flag', () => {
      parser.mask = '9999';
      expect(parser.apply('1 2 ')).to.equal('1 2 ');
    });

    it('sign characters with # flag', () => {
      parser.mask = '####';
      expect(parser.apply('+1-2')).to.equal('+1-2');
    });

    it('parse with prompt character at beginning', () => {
      parser.mask = '0000';
      expect(parser.parse('__12')).to.equal('12');
    });

    it('parse with prompt character in middle', () => {
      parser.mask = '00-00';
      expect(parser.parse('12-__')).to.equal('12');
    });

    it('parse preserves valid input only', () => {
      parser.mask = '(000) 000-0000';
      const masked = '(555) 123-____';
      expect(parser.parse(masked)).to.equal('555123');
    });

    it('isValidString with all positions filled', () => {
      parser.mask = '000-000';
      expect(parser.isValidString('123-456')).to.be.true;
    });

    it('isValidString with optional positions unfilled', () => {
      parser.mask = '000-999';
      expect(parser.isValidString('123-___')).to.be.true;
    });

    it('isValidString with required positions unfilled', () => {
      parser.mask = '000-000';
      expect(parser.isValidString('123-__5')).to.be.false;
    });

    it('isValidString with invalid characters', () => {
      parser.mask = '0000';
      expect(parser.isValidString('12ab')).to.be.false;
    });

    it('getPreviousNonLiteralPosition at start', () => {
      parser.mask = '(000)';
      expect(parser.getPreviousNonLiteralPosition(0)).to.equal(0);
    });

    it('getPreviousNonLiteralPosition skips literals', () => {
      parser.mask = '000-000';
      expect(parser.getPreviousNonLiteralPosition(4)).to.equal(2);
    });

    it('getPreviousNonLiteralPosition on literal', () => {
      parser.mask = '000-000';
      expect(parser.getPreviousNonLiteralPosition(3)).to.equal(2);
    });

    it('getNextNonLiteralPosition at end', () => {
      parser.mask = '000';
      expect(parser.getNextNonLiteralPosition(3)).to.equal(3);
    });

    it('getNextNonLiteralPosition skips literals', () => {
      parser.mask = '000-000';
      expect(parser.getNextNonLiteralPosition(3)).to.equal(4);
    });

    it('getNextNonLiteralPosition at start', () => {
      parser.mask = '(000)';
      expect(parser.getNextNonLiteralPosition(0)).to.equal(1);
    });

    it('getNextNonLiteralPosition all literals after position', () => {
      parser.mask = '000)))';
      expect(parser.getNextNonLiteralPosition(3)).to.equal(6);
    });

    it('literalPositions returns correct set', () => {
      parser.mask = '(000)-000';
      const positions = parser.literalPositions;
      expect(positions.has(0)).to.be.true; // (
      expect(positions.has(4)).to.be.true; // )
      expect(positions.has(5)).to.be.true; // -
      expect(positions.has(1)).to.be.false;
      expect(positions.size).to.equal(3);
    });

    it('escapedMask removes escape sequences', () => {
      parser.mask = 'CCC\\C-\\0\\0\\0';
      expect(parser.escapedMask).to.equal('CCCC-000');
    });

    it('emptyMask getter returns properly formatted mask', () => {
      parser.mask = '(000) 000-0000';
      expect(parser.emptyMask).to.equal('(___) ___-____');
    });

    it('mask getter returns original format', () => {
      const format = 'CCC\\C-000';
      parser.mask = format;
      expect(parser.mask).to.equal(format);
    });

    it('changing mask updates literals and positions', () => {
      parser.mask = '000';
      expect(parser.literalPositions.size).to.equal(0);

      parser.mask = '(000)';
      expect(parser.literalPositions.size).to.equal(2);
    });

    it('constructor with custom options', () => {
      const customParser = new MaskParser({
        format: '####',
        promptCharacter: '*',
      });
      expect(customParser.apply()).to.equal('****');
      expect(customParser.mask).to.equal('####');
      expect(customParser.prompt).to.equal('*');
    });

    it('constructor with partial options uses defaults', () => {
      const customParser = new MaskParser({ format: '000' });
      expect(customParser.apply()).to.equal('___');
      expect(customParser.prompt).to.equal('_');
    });

    it('C flag accepts any character including special chars', () => {
      parser.mask = 'CCCC';
      expect(parser.apply('!@#$')).to.equal('!@#$');
    });

    it('& flag rejects separators', () => {
      parser.mask = '&&&&';
      // The apply method doesn't skip invalid chars, it just doesn't place them
      // So 'a b ' processes as: a(valid) -> a, space(invalid) -> skip but advance, b(valid) -> b
      expect(parser.apply('a b ')).to.equal('a_b_');
    });

    it('A flag accepts letters and numbers but not spaces', () => {
      parser.mask = 'AAAA';
      // apply() advances input index even for invalid chars, so space is skipped
      expect(parser.apply('A1 B')).to.equal('A1_B');
    });

    it('a flag accepts letters, numbers and spaces', () => {
      parser.mask = 'aaaa';
      expect(parser.apply('A1 B')).to.equal('A1 B');
    });

    it('L flag accepts only letters', () => {
      parser.mask = 'LLLL';
      expect(parser.apply('AB12')).to.equal('AB__');
    });

    it('0 flag accepts only numbers', () => {
      parser.mask = '0000';
      // apply() method advances through input even when chars are invalid
      expect(parser.apply('1a2b')).to.equal('1_2_');
    });

    it('replace with input containing prompt character', () => {
      parser.mask = '0000';
      parser.prompt = '_';
      const result = parser.replace('12__', '3_4', 2, 4);
      // Prompt char should be skipped, only 3 and 4 are valid
      expect(result.value).to.equal('1234');
    });

    it('replace preserves literals when clearing range', () => {
      parser.mask = '(000)-000';
      const existing = '(123)-456';
      // Clearing from position 1 to 8 clears non-literals but position 9 is outside the cleared range
      const result = parser.replace(existing, '', 1, 6);
      expect(result.value).to.equal('(___)-456');
    });

    it('apply with null/undefined uses empty string', () => {
      parser.mask = '000';
      expect(parser.apply()).to.equal('___');
    });

    it('parse with empty string', () => {
      parser.mask = '000';
      expect(parser.parse('')).to.equal('');
    });

    it('parse with string shorter than mask', () => {
      parser.mask = '000-000';
      expect(parser.parse('12')).to.equal('12');
    });

    it('complex real-world credit card mask', () => {
      parser.mask = '0000 0000 0000 0000';
      const result = parser.apply('1234567890123456');
      expect(result).to.equal('1234 5678 9012 3456');
      expect(parser.parse(result)).to.equal('1234567890123456');
      expect(parser.isValidString(result)).to.be.true;
    });

    it('complex real-world SSN mask', () => {
      parser.mask = '000-00-0000';
      const result = parser.apply('123456789');
      expect(result).to.equal('123-45-6789');
      expect(parser.parse(result)).to.equal('123456789');
    });

    it('complex real-world date mask with slashes', () => {
      parser.mask = '00/00/0000';
      const result = parser.apply('12312024');
      expect(result).to.equal('12/31/2024');
    });

    it('sequential replace operations maintain state', () => {
      parser.mask = '0000';
      let result = parser.replace(parser.apply(), '1', 0, 0);
      expect(result.value).to.equal('1___');

      result = parser.replace(result.value, '2', result.end, result.end);
      expect(result.value).to.equal('12__');

      result = parser.replace(result.value, '3', result.end, result.end);
      expect(result.value).to.equal('123_');
    });

    it('replace with selection in middle updates correctly', () => {
      parser.mask = '0000-0000';
      // Replacing positions 2-4 with 'XX' (invalid) clears those positions
      // But doesn't affect positions beyond the cleared range
      const result = parser.replace('1234-5678', 'XX', 2, 4);
      expect(result.value).to.equal('12__-5678');
    });
  });
});

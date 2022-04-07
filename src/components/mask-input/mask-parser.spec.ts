import { expect } from '@open-wc/testing';
import { MaskParser } from './mask-parser';

describe('Mask parser', () => {
  let parser: MaskParser;

  beforeEach(() => (parser = new MaskParser()));

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
    parser.mask = '000 [000]';

    // Invalid: 121 [2__]
    expect(parser.isValidString('1212')).to.be.false;

    // Invalid: 121 [233](3)
    expect(parser.isValidString('1212333')).to.be.false;

    // Valid: 121 [233]
    expect(parser.isValidString('121233')).to.be.true;

    parser.mask = '000 [999]';

    // Valid: 121 [___]
    expect(parser.isValidString('121')).to.be.true;

    parser.mask = '00\\0 [999]';

    // Valid: 110 [___]
    expect(parser.isValidString('11')).to.be.true;

    // Invalid: __0 [___]
    expect(parser.isValidString('aa')).to.be.false;

    // Invalid 1_0 [___]
    expect(parser.isValidString('1')).to.be.false;

    parser.mask = '(99) (0)';
    expect(parser.isValidString('')).to.be.false;

    parser.mask = '(99) (9)';
    expect(parser.isValidString('')).to.be.true;
  });

  it('apply', () => {
    parser.mask = '(000) 0000-000';
    parser.prompt = '*';
    expect(parser.apply('1234')).to.equal('(123) 4***-***');
  });

  it('parse', () => {
    parser.mask = '#.##';
    expect(parser.parse('3.14')).to.equal('314');
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
    expect(result.value).to.equal('____');
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
});

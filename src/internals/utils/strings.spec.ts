import { expect } from '@open-wc/testing';
import {
  createIdGenerator,
  escapeRegex,
  formatString,
  nanoid,
  splitToWords,
  toKebabCase,
} from './strings.js';

describe('String utilities', () => {
  describe('formatString', () => {
    it('should replace format specifiers with the passed parameters', () => {
      expect(formatString('{0} says "{1}".', 'John', 'Hello')).to.equal(
        'John says "Hello".'
      );
      expect(formatString('{1} is greater than {0}', 0, 1)).to.equal(
        '1 is greater than 0'
      );
    });

    it('should leave specifiers without a matching parameter untouched', () => {
      expect(formatString('{0} and {1}', 'one')).to.equal('one and {1}');
    });
  });

  describe('splitToWords', () => {
    it('should split on whitespace, dashes and underscores', () => {
      expect(splitToWords('hello world')).to.eql(['hello', 'world']);
      expect(splitToWords('hello-world')).to.eql(['hello', 'world']);
      expect(splitToWords('hello_world')).to.eql(['hello', 'world']);
    });

    it('should split on camelCase boundaries', () => {
      expect(splitToWords('helloWorld')).to.eql(['hello', 'World']);
      expect(splitToWords('backgroundColor')).to.eql(['background', 'Color']);
    });
  });

  describe('toKebabCase', () => {
    it('should convert strings to kebab-case', () => {
      expect(toKebabCase('backgroundColor')).to.equal('background-color');
      expect(toKebabCase('Hello World')).to.equal('hello-world');
      expect(toKebabCase('snake_case')).to.equal('snake-case');
    });
  });

  describe('escapeRegex', () => {
    it('should escape regex syntax characters', () => {
      const escaped = escapeRegex('a.b*c?(d)[e]{f}|g^$\\');
      expect(() => new RegExp(escaped)).to.not.throw();
      expect(new RegExp(escaped).test('a.b*c?(d)[e]{f}|g^$\\')).to.be.true;
    });
  });

  describe('createIdGenerator', () => {
    it('should generate monotonically increasing prefixed ids', () => {
      const nextId = createIdGenerator('radio');
      expect(nextId()).to.equal('radio-1');
      expect(nextId()).to.equal('radio-2');
    });

    it('should keep separate counters per generator', () => {
      const a = createIdGenerator('a');
      const b = createIdGenerator('b');
      a();
      expect(a()).to.equal('a-2');
      expect(b()).to.equal('b-1');
    });
  });

  describe('nanoid', () => {
    it('should generate ids of the requested size', () => {
      expect(nanoid()).to.have.lengthOf(21);
      expect(nanoid(10)).to.have.lengthOf(10);
    });

    it('should generate unique ids', () => {
      const ids = new Set(Array.from({ length: 1000 }, () => nanoid()));
      expect(ids.size).to.equal(1000);
    });
  });
});

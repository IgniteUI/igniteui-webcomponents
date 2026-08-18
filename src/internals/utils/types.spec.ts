import { expect } from '@open-wc/testing';
import {
  isDefined,
  isEventListenerObject,
  isFunction,
  isObject,
  isPlainObject,
  isRegExp,
  isString,
} from './types.js';

describe('Type guards', () => {
  describe('isDefined', () => {
    it('should return false only for `undefined`', () => {
      expect(isDefined(undefined)).to.be.false;
      expect(isDefined(null)).to.be.true;
      expect(isDefined(0)).to.be.true;
      expect(isDefined('')).to.be.true;
    });
  });

  describe('isFunction / isString / isObject', () => {
    it('should narrow their respective types', () => {
      expect(isFunction(() => {})).to.be.true;
      expect(isFunction({})).to.be.false;

      expect(isString('')).to.be.true;
      expect(isString(0)).to.be.false;

      expect(isObject({})).to.be.true;
      expect(isObject([])).to.be.true;
      expect(isObject(null)).to.be.false;
      expect(isObject('')).to.be.false;
    });
  });

  describe('isPlainObject', () => {
    it('should return true for POJOs', () => {
      expect(isPlainObject({})).to.be.true;
      expect(isPlainObject({ a: 1 })).to.be.true;
      expect(isPlainObject(Object.create(null))).to.be.true;
    });

    it('should return false for non-plain objects', () => {
      expect(isPlainObject([])).to.be.false;
      expect(isPlainObject(new Date())).to.be.false;
      expect(isPlainObject(new (class {})())).to.be.false;
      expect(isPlainObject(null)).to.be.false;
    });
  });

  describe('isRegExp', () => {
    it('should return true for regexes, including subclasses', () => {
      expect(isRegExp(/a/)).to.be.true;
      expect(isRegExp(new RegExp('a'))).to.be.true;
      expect(isRegExp(new (class extends RegExp {})('a'))).to.be.true;
    });

    it('should return false for non-regex values', () => {
      expect(isRegExp('/a/')).to.be.false;
      expect(isRegExp({})).to.be.false;
      expect(isRegExp(null)).to.be.false;
    });
  });

  describe('isEventListenerObject', () => {
    it('should detect objects with a `handleEvent` member', () => {
      expect(isEventListenerObject({ handleEvent: () => {} })).to.be.true;
      expect(isEventListenerObject(() => {})).to.be.false;
      expect(isEventListenerObject({})).to.be.false;
    });
  });
});

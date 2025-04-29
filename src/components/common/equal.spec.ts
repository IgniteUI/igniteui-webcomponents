import { expect } from '@open-wc/testing';
import { equal } from './util.js';

describe('equal', () => {
  it('should return true for strictly equal primitive values', () => {
    expect(equal(1, 1)).to.be.true;
    expect(equal('hello', 'hello')).to.be.true;
    expect(equal(true, true)).to.be.true;
    expect(equal(null, null)).to.be.true;
    expect(equal(undefined, undefined)).to.be.true;
    expect(equal(Number.NaN, Number.NaN)).to.be.true;
  });

  it('should return false for strictly unequal primitive values', () => {
    expect(equal(1, 2)).to.be.false;
    expect(equal('hello', 'world')).to.be.false;
    expect(equal(true, false)).to.be.false;
    expect(equal(null, undefined)).to.be.false;
  });

  it('should return true for objects with the same keys and values (simple)', () => {
    const obj1 = { a: 1, b: 'hello' };
    const obj2 = { a: 1, b: 'hello' };
    expect(equal(obj1, obj2)).to.be.true;
  });

  it('should return true for objects with the same keys and values (different order)', () => {
    const obj1 = { a: 1, b: 'hello' };
    const obj2 = { b: 'hello', a: 1 };
    expect(equal(obj1, obj2)).to.be.true;
  });

  it('should return false for objects with different keys', () => {
    const obj1 = { a: 1, b: 'hello' };
    const obj2 = { a: 1, c: 'hello' };
    expect(equal(obj1, obj2)).to.be.false;
  });

  it('should return false for objects with different values', () => {
    const obj1 = { a: 1, b: 'hello' };
    const obj2 = { a: 2, b: 'hello' };
    expect(equal(obj1, obj2)).to.be.false;
  });

  it('should return true for nested objects with the same structure and values', () => {
    const obj1 = { a: 1, b: { c: true, d: [1, 2] } };
    const obj2 = { a: 1, b: { c: true, d: [1, 2] } };
    expect(equal(obj1, obj2)).to.be.true;
  });

  it('should return false for nested objects with different values', () => {
    const obj1 = { a: 1, b: { c: true, d: [1, 2] } };
    const obj2 = { a: 1, b: { c: false, d: [1, 2] } };
    expect(equal(obj1, obj2)).to.be.false;
  });

  it('should return true for arrays with the same elements and order', () => {
    const arr1 = [1, 'hello', true];
    const arr2 = [1, 'hello', true];
    expect(equal(arr1, arr2)).to.be.true;
  });

  it('should return false for arrays with different elements', () => {
    const arr1 = [1, 'hello', true];
    const arr2 = [1, 'world', true];
    expect(equal(arr1, arr2)).to.be.false;
  });

  it('should return false for arrays with different lengths', () => {
    const arr1 = [1, 'hello'];
    const arr2 = [1, 'hello', true];
    expect(equal(arr1, arr2)).to.be.false;
  });

  it('should return true for Maps with the same entries', () => {
    const map1 = new Map<string, number | string>([
      ['a', 1],
      ['b', 'hello'],
    ]);
    const map2 = new Map<string, number | string>([
      ['a', 1],
      ['b', 'hello'],
    ]);
    expect(equal(map1, map2)).to.be.true;
  });

  it('should return false for Maps with different entries', () => {
    const map1 = new Map<string, number | string>([
      ['a', 1],
      ['b', 'hello'],
    ]);
    const map2 = new Map<string, number | string>([
      ['a', 2],
      ['b', 'hello'],
    ]);
    expect(equal(map1, map2)).to.be.false;
  });

  it('should return false for Maps with different sizes', () => {
    const map1 = new Map([['a', 1]]);
    const map2 = new Map<string, number | string>([
      ['a', 1],
      ['b', 'hello'],
    ]);
    expect(equal(map1, map2)).to.be.false;
  });

  it('should return true for Sets with the same values', () => {
    const set1 = new Set([1, 'hello']);
    const set2 = new Set([1, 'hello']);
    expect(equal(set1, set2)).to.be.true;
  });

  it('should return false for Sets with different values', () => {
    const set1 = new Set([1, 'hello']);
    const set2 = new Set([1, 'world']);
    expect(equal(set1, set2)).to.be.false;
  });

  it('should return false for Sets with different sizes', () => {
    const set1 = new Set([1]);
    const set2 = new Set([1, 'hello']);
    expect(equal(set1, set2)).to.be.false;
  });

  it('should return true for Dates with the same time value', () => {
    const date1 = new Date('2025-04-22T12:00:00.000Z');
    const date2 = new Date('2025-04-22T12:00:00.000Z');
    expect(equal(date1, date2)).to.be.true;
  });

  it('should return false for Dates with different time values', () => {
    const date1 = new Date('2025-04-22T12:00:00.000Z');
    const date2 = new Date('2025-04-22T12:01:00.000Z');
    expect(equal(date1, date2)).to.be.false;
  });

  it('should return true for RegExps with the same source and flags', () => {
    const regex1 = /abc/g;
    const regex2 = /abc/g;
    expect(equal(regex1, regex2)).to.be.true;
  });

  it('should return false for RegExps with different source', () => {
    const regex1 = /abc/g;
    const regex2 = /abd/g;
    expect(equal(regex1, regex2)).to.be.false;
  });

  it('should return false for RegExps with different flags', () => {
    const regex1 = /abc/g;
    const regex2 = /abc/i;
    expect(equal(regex1, regex2)).to.be.false;
  });

  it('should handle simple circular references and return true', () => {
    const obj1: any = { a: 1 };
    const obj2: any = { a: 1 };
    obj1.circular = obj1;
    obj2.circular = obj2;
    expect(equal(obj1, obj2)).to.be.true;
  });

  it('should handle nested circular references and return true', () => {
    const obj1: any = { a: 1, b: {} };
    const obj2: any = { a: 1, b: {} };
    obj1.b.circular = obj1;
    obj2.b.circular = obj2;
    expect(equal(obj1, obj2)).to.be.true;
  });

  it('should return false for objects with different values despite circular references', () => {
    const obj1: any = { a: 1 };
    const obj2: any = { a: 2 };
    obj1.circular = obj1;
    obj2.circular = obj2;
    expect(equal(obj1, obj2)).to.be.false;
  });

  it('should handle circular references in arrays and return true', () => {
    const arr1: any[] = [1];
    const arr2: any[] = [1];
    arr1.push(arr1);
    arr2.push(arr2);
    expect(equal(arr1, arr2)).to.be.true;
  });

  it('should handle circular references in Maps (key and value) and return true', () => {
    const map1: any = new Map();
    const map2: any = new Map();
    map1.set('self', map1);
    map2.set('self', map2);
    expect(equal(map1, map2)).to.be.true;

    const keyObj1: any = {};
    const keyObj2: any = {};
    const valObj1: any = {};
    const valObj2: any = {};
    const map3 = new Map([[keyObj1, valObj1]]);
    const map4 = new Map([[keyObj2, valObj2]]);
    keyObj1.ref = map3;
    keyObj2.ref = map4;
    valObj1.ref = map3;
    valObj2.ref = map4;
    expect(equal(map3, map4)).to.be.true;
  });

  it('should handle circular references in Sets and return true', () => {
    const set1: any = new Set();
    const set2: any = new Set();
    set1.add(set1);
    set2.add(set2);
    expect(equal(set1, set2)).to.be.true;

    const obj1: any = {};
    const obj2: any = {};
    const set3 = new Set([obj1]);
    const set4 = new Set([obj2]);
    obj1.ref = set3;
    obj2.ref = set4;
    expect(equal(set3, set4)).to.be.true;
  });

  it('should return false for objects with different constructors', () => {
    class ClassA {
      value: number;
      constructor(value: number) {
        this.value = value;
      }
    }
    class ClassB {
      value: number;
      constructor(value: number) {
        this.value = value;
      }
    }
    const instanceA = new ClassA(1);
    const instanceB = new ClassB(1);
    expect(equal(instanceA, instanceB)).to.be.false;
  });

  it('should handle objects with custom valueOf methods', () => {
    const obj1 = { value: 1, valueOf: () => 1 };
    const obj2 = { value: 1, valueOf: () => 1 };
    expect(equal(obj1, obj2)).to.be.true;

    const obj3 = { value: 1, valueOf: () => 1 };
    const obj4 = { value: 1, valueOf: () => 2 };
    expect(equal(obj3, obj4)).to.be.false;
  });

  it('should handle objects with custom toString methods', () => {
    const obj1 = { value: 'a', toString: () => 'a' };
    const obj2 = { value: 'a', toString: () => 'a' };
    expect(equal(obj1, obj2)).to.be.true;

    const obj3 = { value: 'a', toString: () => 'a' };
    const obj4 = { value: 'a', toString: () => 'b' };
    expect(equal(obj3, obj4)).to.be.false;
  });

  it('should return true for two empty objects', () => {
    expect(equal({}, {})).to.be.true;
  });

  it('should return true for two empty arrays', () => {
    expect(equal([], [])).to.be.true;
  });

  it('should return true for two empty Maps', () => {
    expect(equal(new Map(), new Map())).to.be.true;
  });

  it('should return true for two empty Sets', () => {
    expect(equal(new Set(), new Set())).to.be.true;
  });

  it('should return false for an empty object and a non-empty object', () => {
    expect(equal({}, { a: 1 })).to.be.false;
    expect(equal({ a: 1 }, {})).to.be.false;
  });

  it('should return false for an empty array and a non-empty array', () => {
    expect(equal([], [1])).to.be.false;
    expect(equal([1], [])).to.be.false;
  });

  it('should return false for an empty Map and a non-empty Map', () => {
    expect(equal(new Map(), new Map([['a', 1]]))).to.be.false;
    expect(equal(new Map([['a', 1]]), new Map())).to.be.false;
  });

  it('should return false for an empty Set and a non-empty Set', () => {
    expect(equal(new Set(), new Set([1]))).to.be.false;
    expect(equal(new Set([1]), new Set())).to.be.false;
  });

  it('should return false for objects with different numbers of keys', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1, b: 2 };
    expect(equal(obj1, obj2)).to.be.false;
    expect(equal(obj2, obj1)).to.be.false;
  });

  it('should return true for nested empty structures', () => {
    const obj1 = { a: {}, b: [] };
    const obj2 = { a: {}, b: [] };
    expect(equal(obj1, obj2)).to.be.true;

    const arr1 = [{}, []];
    const arr2 = [{}, []];
    expect(equal(arr1, arr2)).to.be.true;

    const map1 = new Map([['a', new Set()]]);
    const map2 = new Map([['a', new Set()]]);
    expect(equal(map1, map2)).to.be.true;

    const set1 = new Set([new Map()]);
    const set2 = new Set([new Map()]);
    expect(equal(set1, set2)).to.be.true;
  });

  it('should return false for nested structures with different emptiness', () => {
    const obj1 = { a: {}, b: [1] };
    const obj2 = { a: {}, b: [] };
    expect(equal(obj1, obj2)).to.be.false;

    const arr1 = [{}, new Map([['a', 1]])];
    const arr2 = [{}, new Map()];
    expect(equal(arr1, arr2)).to.be.false;

    const map1 = new Map([['a', new Set([1])]]);
    const map2 = new Map([['a', new Set()]]);
    expect(equal(map1, map2)).to.be.false;

    const set1 = new Set([{}]);
    const set2 = new Set([]);
    expect(equal(set1, set2)).to.be.false;
  });
});

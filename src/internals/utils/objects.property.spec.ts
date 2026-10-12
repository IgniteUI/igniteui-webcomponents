import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';

import { equal } from './objects.js';

const settings = {
  withDate: true,
  withMap: true,
  withSet: true,
  withTypedArray: true,
  withSparseArray: true,
  maxDepth: 3,
} satisfies fc.ObjectConstraints;

const value = fc.anything({ ...settings, withNullPrototype: true });

/** Values that `structuredClone` copies with the same prototypes. */
const cloneable = fc.anything(settings);

describe('equal properties', () => {
  it('is reflexive', () => {
    fc.assert(
      fc.property(value, (x) => {
        expect(equal(x, x)).to.be.true;
      })
    );
  });

  it('holds between a value and its structured clone', () => {
    fc.assert(
      fc.property(cloneable, (x) => {
        const copy = structuredClone(x);

        expect(equal(x, copy)).to.be.true;
        expect(equal(copy, x)).to.be.true;
      })
    );
  });

  it('is symmetric', () => {
    const pair = fc.oneof(
      fc.tuple(value, value),
      cloneable.map((x) => [x, structuredClone(x)] as const)
    );

    fc.assert(
      fc.property(pair, ([a, b]) => {
        expect(equal(a, b)).to.equal(equal(b, a));
      })
    );
  });

  it('is transitive over clones', () => {
    fc.assert(
      fc.property(cloneable, value, (x, y) => {
        const copy = structuredClone(x);

        if (equal(x, y)) {
          expect(equal(copy, y)).to.be.true;
        }
      })
    );
  });

  it('tells a value from the same value with one more key', () => {
    const record = fc.dictionary(fc.string(), cloneable, { maxKeys: 5 });

    fc.assert(
      fc.property(record, fc.string(), cloneable, (x, key, extra) => {
        fc.pre(!Object.hasOwn(x, key) && key !== '__proto__');
        const larger = { ...x, [key]: extra };

        expect(equal(x, larger)).to.be.false;
        expect(equal(larger, x)).to.be.false;
      })
    );
  });

  it('terminates on circular structures', () => {
    fc.assert(
      fc.property(cloneable, (x) => {
        const a: Record<string, unknown> = { x };
        const b: Record<string, unknown> = { x: structuredClone(x) };
        a.self = a;
        b.self = b;

        expect(equal(a, b)).to.be.true;
      })
    );
  });
});

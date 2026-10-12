import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';

import { asArray, chunk, isEmpty, partition, sameItems } from './arrays.js';

const items = fc.array(fc.anything(), { maxLength: 30 });

describe('Array utilities properties', () => {
  it('chunk splits an array into full chunks and one shorter last chunk', () => {
    fc.assert(
      fc.property(items, fc.integer({ min: 1, max: 40 }), (array, size) => {
        const chunks = [...chunk(array, size)];

        expect(sameItems(chunks.flat(1), array)).to.be.true;
        expect(chunks).to.have.lengthOf(Math.ceil(array.length / size));
        chunks.forEach((part, i) => {
          if (i < chunks.length - 1) {
            expect(part).to.have.lengthOf(size);
          } else {
            expect(part.length).to.be.within(1, size);
          }
        });
      })
    );
  });

  it('chunk throws for a size that is not a positive safe integer', () => {
    const size = fc.oneof(
      fc.integer({ max: 0 }),
      fc.double().filter((value) => !Number.isSafeInteger(value))
    );

    fc.assert(
      fc.property(items, size, (array, value) => {
        expect(() => [...chunk(array, value)]).to.throw();
      })
    );
  });

  it('partition keeps each item once, in order, on the side of its predicate', () => {
    const predicate = fc.func(fc.boolean());

    fc.assert(
      fc.property(items, predicate, (array, fn) => {
        // Pass one argument. `fc.func` gives an answer for each argument list, and
        // `filter` also passes the index and the array.
        const isTruthy = (item: unknown) => fn(item);
        const [truthy, falsy] = partition(array, isTruthy);

        expect(sameItems(truthy, array.filter(isTruthy))).to.be.true;
        expect(
          sameItems(
            falsy,
            array.filter((x) => !isTruthy(x))
          )
        ).to.be.true;
      })
    );
  });

  it('sameItems is symmetric and holds for a copy', () => {
    const nullable = fc.option(items, { nil: undefined });

    fc.assert(
      fc.property(items, nullable, nullable, (array, a, b) => {
        expect(sameItems(array, array.slice())).to.be.true;
        expect(sameItems(a, b)).to.equal(sameItems(b, a));
      })
    );
  });

  it('asArray wraps a single value and passes an array through', () => {
    fc.assert(
      fc.property(fc.anything(), (value) => {
        const result = asArray(value);

        if (value == null) {
          expect(result).to.deep.equal([]);
        } else if (Array.isArray(value)) {
          expect(result).to.equal(value);
        } else {
          expect(result).to.have.lengthOf(1);
          // `Object.is`, not chai's `===`, which fails for `NaN`.
          expect(Object.is(result[0], value)).to.be.true;
        }
        expect(isEmpty(result)).to.equal(result.length === 0);
      })
    );
  });
});

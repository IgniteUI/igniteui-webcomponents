import type { chai as ChaiInstance } from '@open-wc/testing';
// @ts-expect-error - `chai` is exported at runtime, but is missing from the typings of
// the side-effect free entry point. The default one must not be used here: it registers
// a fixture cleanup hook only if mocha has already defined its globals, and this module
// runs before the test framework.
import { chai as untypedChai } from '@open-wc/testing/pure';

const chai = untypedChai as typeof ChaiInstance;

/**
 * Web test runner sends session results to Node through `structuredClone`,
 * with `actual` and `expected` of a failed assertion. A value that cannot be
 * cloned, such as a sinon spy or a DOM node, makes the transport throw. The
 * test file then fails with `testsFinishTimeout` and loses its browser logs.
 *
 * This module substitutes the inspected form of such values. The
 * `testRunnerHtml` option of the runner config loads it for every test file.
 */

const MAX_INSPECT_LENGTH = 512;

function isCloneable(value: unknown): boolean {
  try {
    structuredClone(value);
    return true;
  } catch {
    return false;
  }
}

function inspect(value: unknown): string {
  try {
    return chai.util.inspect(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

function toCloneable(value: unknown): unknown {
  if (isCloneable(value)) {
    return value;
  }

  const inspected = inspect(value);

  return inspected.length > MAX_INSPECT_LENGTH
    ? `${inspected.slice(0, MAX_INSPECT_LENGTH)}...`
    : inspected;
}

type AssertionError = { actual?: unknown; expected?: unknown };

function makeReportable(error: unknown): unknown {
  if (error && typeof error === 'object') {
    const assertionError = error as AssertionError;

    if ('actual' in assertionError) {
      assertionError.actual = toCloneable(assertionError.actual);
    }

    if ('expected' in assertionError) {
      assertionError.expected = toCloneable(assertionError.expected);
    }
  }

  return error;
}

const assert = chai.Assertion.prototype.assert;

chai.Assertion.prototype.assert = function (
  ...args: Parameters<typeof assert>
): void {
  try {
    assert.apply(this, args);
  } catch (error) {
    throw makeReportable(error);
  }
};

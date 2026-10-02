import type { chai as ChaiInstance } from '@open-wc/testing';
// @ts-expect-error - `chai` exists at runtime but not in the typings of the pure entry.
// The default entry registers its fixture cleanup hook only when the mocha globals
// exist, and this module runs before mocha.
import { chai as untypedChai } from '@open-wc/testing/pure';

const chai = untypedChai as typeof ChaiInstance;

/**
 * Web test runner sends a failed assertion to Node through `structuredClone`.
 * An uncloneable `actual` or `expected` (a sinon spy, a DOM node) fails the
 * file with `testsFinishTimeout`, so this module sends its inspected form.
 * `testRunnerHtml` in the runner config loads it for every test file.
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

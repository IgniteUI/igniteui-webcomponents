import type { chai as ChaiInstance } from '@open-wc/testing';
// @ts-expect-error - `chai` is exported at runtime, but is missing from the typings of
// the side-effect free entry point. The default one must not be used here: it registers
// a fixture cleanup hook only if mocha has already defined its globals, and this module
// runs before the test framework.
import { chai as untypedChai } from '@open-wc/testing/pure';

const chai = untypedChai as typeof ChaiInstance;

/**
 * Web test runner ships the results of a browser session to the Node process
 * through `structuredClone`, `actual` and `expected` of a failed assertion
 * included. Chai defaults `actual` to the assertion subject, so asserting on a
 * value that cannot be cloned - a sinon spy, a DOM node - makes the transport
 * throw a `DataCloneError` *after* the test has already failed. The session
 * result is never delivered: instead of a diff, the test file fails with a
 * `testsFinishTimeout` after two minutes and takes the collected browser logs
 * down with it.
 *
 * Substituting the inspected form of such values keeps the failure reportable.
 * Loaded through the `testRunnerHtml` option of the runner config so that it
 * applies to every test file.
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

import { fixture, fixtureCleanup } from '@open-wc/testing';
import fc from 'fast-check';
import type { TemplateResult } from 'lit';

/**
 * Sets the global fast-check settings for the `*.property.spec.ts` tests.
 * Import `fc` from this module, so that the settings apply. The runner config
 * injects `__FAST_CHECK__` from `FC_SEED` and `FC_NUM_RUNS`. Without them, the
 * seed is fixed.
 */

type FastCheckSettings = { seed?: number; numRuns?: number };

const settings: FastCheckSettings =
  (globalThis as { __FAST_CHECK__?: FastCheckSettings }).__FAST_CHECK__ ?? {};

const numRuns = settings.numRuns ?? 100;

fc.configureGlobal({ seed: settings.seed ?? 0x16e17e, numRuns });

export { fc };

/** The run count for a slow property, such as one that renders components. */
export const SLOW_PROPERTY_RUNS = Math.max(1, Math.ceil(numRuns / 4));

/** An arbitrary of two values of `arbitrary`, in ascending order. */
export function orderedPair(
  arbitrary: fc.Arbitrary<number>
): fc.Arbitrary<readonly [number, number]> {
  return fc
    .tuple(arbitrary, arbitrary)
    .map(([a, b]) => [Math.min(a, b), Math.max(a, b)] as const);
}

/**
 * Renders `template`, runs `run` on the element, and then removes it. Each run of a
 * property starts from the same state, so that a counterexample replays.
 */
export async function withFixture<T extends Element>(
  template: TemplateResult,
  run: (element: T) => Promise<void>
): Promise<void> {
  try {
    await run(await fixture<T>(template));
  } finally {
    fixtureCleanup();
  }
}

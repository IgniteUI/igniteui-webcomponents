import { getPrefersReducedMotion } from './player.js';

/**
 * Starts a document view transition, skipped on reduced motion. Without the
 * API, runs `callback` and returns promises that settle after it.
 */
export function startViewTransition(
  callback: ViewTransitionUpdateCallback
): ViewTransition {
  const init = globalThis.document?.startViewTransition;

  /* c8 ignore next 10 */
  if (!init) {
    const done = Promise.resolve(callback()).then(() => {});

    return {
      finished: done,
      ready: done,
      updateCallbackDone: done,
      skipTransition: () => {},
    } as ViewTransition;
  }

  const transition = init.call(globalThis.document, callback);

  // A skipped transition rejects `ready`.
  transition.ready.catch(() => {});

  if (getPrefersReducedMotion()) {
    transition.skipTransition();
  }

  return transition;
}

export function getActiveViewTransition(): ViewTransition | null {
  return globalThis.document?.activeViewTransition ?? null;
}

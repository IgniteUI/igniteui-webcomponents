import { getPrefersReducedMotion } from './player.js';

/**
 * The last transition from `startViewTransition` until it finishes, for the
 * browsers without `document.activeViewTransition`.
 */
let started: ViewTransition | null = null;

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
  } else {
    const clear = () => {
      if (started === transition) {
        started = null;
      }
    };

    started = transition;
    transition.finished.then(clear, clear);
  }

  return transition;
}

/**
 * Returns the running view transition of the document. A browser without
 * `document.activeViewTransition` gives only a transition from
 * `startViewTransition`.
 */
export function getActiveViewTransition(): ViewTransition | null {
  const document = globalThis.document;

  return document && 'activeViewTransition' in document
    ? document.activeViewTransition
    : started;
}

import { getPrefersReducedMotion } from './player.js';

/**
 * The last transition from `startViewTransition` until it finishes, for the
 * browsers without `document.activeViewTransition`.
 */
let started: ViewTransition | null = null;

/** Starts a view transition of `doc`, skipped on reduced motion. */
export function startViewTransition(
  doc: Document,
  callback: ViewTransitionUpdateCallback
): ViewTransition {
  const transition = doc.startViewTransition(callback);

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

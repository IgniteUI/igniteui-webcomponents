import type { ReactiveElement } from 'lit';

/*
 * Lit renders a component in a microtask after it connects, so a `focus()`
 * call before that finds no inner control. A native control takes the focus at
 * once. The document has one focus, so the module keeps one request: a new
 * request replaces it, and a focus change cancels it.
 */

let pendingHost: ReactiveElement | null = null;
let pendingOptions: FocusOptions | undefined;

function clearRequest(): void {
  pendingHost?.ownerDocument.removeEventListener('focusin', clearRequest, true);
  pendingHost = null;
}

/**
 * Call it in `focus()`, after the component tries to move the focus. For a
 * connected `host` that has not rendered, is not disabled and has no focus,
 * `host.focus(options)` runs again after the first update.
 */
export function deferFocus(
  host: ReactiveElement & { disabled?: boolean },
  options?: FocusOptions
): void {
  if (
    host.hasUpdated ||
    !host.isConnected ||
    host.disabled ||
    host.matches(':focus-within')
  ) {
    return;
  }

  clearRequest();
  pendingHost = host;
  pendingOptions = options;
  host.ownerDocument.addEventListener('focusin', clearRequest, true);

  host.updateComplete.then(() => {
    if (pendingHost === host) {
      clearRequest();

      // A `shouldUpdate()` that returns `false` skips the render.
      if (host.hasUpdated) {
        host.focus(pendingOptions);
      }
    }
  });
}

/** Cancels the stored focus request of `host`, if it has one. */
export function cancelDeferredFocus(host: ReactiveElement): void {
  if (pendingHost === host) {
    clearRequest();
  }
}

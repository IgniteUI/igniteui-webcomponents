import type { ReactiveElement } from 'lit';
import { getDeepActiveElement } from './utils/dom.js';

/*
 * Lit renders a component in a microtask after it connects, so a `focus()`
 * call before that finds no inner control. A native control takes the focus at
 * once. The document has one focus, so the module keeps one request: a new
 * request replaces it, and a focus change cancels it.
 */

let pendingHost: ReactiveElement | null = null;
let pendingOptions: FocusOptions | undefined;
let pendingActive: Element | null = null;

function clearRequest(): void {
  pendingHost?.ownerDocument.removeEventListener('focusin', clearRequest, true);
  pendingHost = null;
}

/**
 * Call it in `focus()`, after the component tries to move the focus. For a
 * connected `host` that has not rendered, is not disabled and has no focus,
 * `host.focus(options)` runs again when the first updates are complete.
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
  pendingActive = getDeepActiveElement();
  host.ownerDocument.addEventListener('focusin', clearRequest, true);

  const repeat = (): void => {
    if (pendingHost !== host) {
      return;
    }

    // An update that comes after the first one can add the element to focus,
    // for example the carousel indicators after a `slotchange`.
    if (host.isUpdatePending) {
      host.updateComplete.then(repeat);
      return;
    }

    const active = getDeepActiveElement();
    clearRequest();

    // A `shouldUpdate()` that returns `false` skips the render. A focus change
    // inside one shadow root sends no `focusin` to the document.
    if (
      host.hasUpdated &&
      (active === pendingActive || active === host.ownerDocument.body)
    ) {
      host.focus(pendingOptions);
    }
  };

  host.updateComplete.then(repeat);
}

/** Cancels the stored focus request of `host`, if it has one. */
export function cancelDeferredFocus(host: ReactiveElement): void {
  if (pendingHost === host) {
    clearRequest();
  }
}

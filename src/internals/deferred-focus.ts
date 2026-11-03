import type { ReactiveElement } from 'lit';
import { getDeepActiveElement } from './utils/dom.js';

/*
 * Lit renders a component in a microtask after it connects, so a `focus()`
 * call before that finds no inner control. A native control takes the focus at
 * once. The document has one focus, so the module keeps one request: a new
 * request replaces it, and another element that takes the focus cancels it.
 */

type FocusRoot = Document | ShadowRoot;

let pending: {
  readonly host: ReactiveElement;
  readonly roots: readonly FocusRoot[];
} | null = null;

function clearRequest(): void {
  for (const root of pending?.roots ?? []) {
    root.removeEventListener('focusin', clearRequest, true);
  }

  pending = null;
}

/**
 * Returns the document and each shadow root around its focused element. A
 * `focusin` does not leave the shadow root that holds both the old and the new
 * focus, so each of these roots needs a listener.
 */
function getFocusRoots(doc: Document): FocusRoot[] {
  const roots: FocusRoot[] = [doc];
  let root = getDeepActiveElement(doc)?.getRootNode();

  while (root instanceof ShadowRoot) {
    roots.push(root);
    root = root.host.getRootNode();
  }

  return roots;
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
  const request = { host, roots: getFocusRoots(host.ownerDocument) };
  pending = request;

  for (const root of request.roots) {
    root.addEventListener('focusin', clearRequest, true);
  }

  const repeat = (): void => {
    if (pending !== request) {
      return;
    }

    // An update after the first one can add the element to focus, for
    // example the carousel indicators after a `slotchange`.
    if (host.isUpdatePending) {
      host.updateComplete.then(repeat);
      return;
    }

    clearRequest();

    // A `shouldUpdate()` that returns `false` skips the render.
    if (host.hasUpdated) {
      host.focus(options);
    }
  };

  host.updateComplete.then(repeat);
}

/** Cancels the stored focus request of `host`, if it has one. */
export function cancelDeferredFocus(host: ReactiveElement): void {
  if (pending?.host === host) {
    clearRequest();
  }
}

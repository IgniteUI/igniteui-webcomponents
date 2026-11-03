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
 * Returns the document of `host`, each same-origin document that holds it in a
 * frame, and each shadow root around the focused element of these documents. A
 * `focusin` does not leave the shadow root that holds both the old and the new
 * focus, or the document of a frame, so each of these roots needs a listener.
 */
function getFocusRoots(host: Element): FocusRoot[] {
  const roots: FocusRoot[] = [];

  for (
    let doc: Document | undefined = host.ownerDocument;
    doc;
    doc = doc.defaultView?.frameElement?.ownerDocument
  ) {
    roots.push(doc);
    let root = getDeepActiveElement(doc)?.getRootNode();

    while (root?.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      roots.push(root as ShadowRoot);
      root = (root as ShadowRoot).host.getRootNode();
    }
  }

  return roots;
}

/**
 * Returns the focused element, from the top same-origin document of `doc` down
 * through open shadow roots and same-origin frames. A move into a frame or into
 * the shadow root of the focused host sends no `focusin` to the roots above.
 */
function getFocusedElement(doc: Document): Element | null {
  let top = doc;

  while (top.defaultView?.frameElement) {
    top = top.defaultView.frameElement.ownerDocument;
  }

  let active = top.activeElement;
  let inner = active;

  while (inner) {
    active = inner;
    inner =
      active.shadowRoot?.activeElement ??
      (active as HTMLIFrameElement).contentDocument?.activeElement ??
      null;
  }

  return active;
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
  const request = { host, roots: getFocusRoots(host) };
  const focused = getFocusedElement(host.ownerDocument);
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
    const current = getFocusedElement(host.ownerDocument);

    // A `shouldUpdate()` that returns `false` skips the render. A blur moves
    // the focus to a body and does not cancel.
    if (
      host.hasUpdated &&
      (current === focused ||
        !current ||
        current === current.ownerDocument.body)
    ) {
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

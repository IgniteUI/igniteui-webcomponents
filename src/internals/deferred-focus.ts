import type { ReactiveElement } from 'lit';

/*
 * Lit renders a component in a microtask after it connects. Until then, the
 * component has no inner control, so a `focus()` call does nothing. A native
 * control takes the focus at once. So the component stores the call, and this
 * module repeats it after the first update of the component.
 *
 * The document has one focus. So the module keeps one request: a new request
 * replaces it, and a focus change before the repeat cancels it.
 */

type FocusRequest = {
  readonly host: ReactiveElement;
  readonly options?: FocusOptions;
};

let pending: FocusRequest | null = null;

function clearRequest(): void {
  if (pending) {
    pending.host.ownerDocument.removeEventListener(
      'focusin',
      clearRequest,
      true
    );
    pending = null;
  }
}

/**
 * Stores a focus request for a connected `host` that has not rendered and
 * does not have the focus, and returns `true`. After the first update,
 * `host.focus(options)` runs again. A later request, a focus change or
 * `cancelDeferredFocus` cancels it. In other conditions, it returns `false`
 * and does nothing.
 *
 * A host with `delegatesFocus` calls it after `super.focus()`: with
 * Declarative Shadow DOM, the native focus works before the first update.
 */
export function deferFocus(
  host: ReactiveElement,
  options?: FocusOptions
): boolean {
  if (!host.isConnected || host.hasUpdated || host.matches(':focus-within')) {
    return false;
  }

  clearRequest();

  const request: FocusRequest = { host, options };
  pending = request;
  host.ownerDocument.addEventListener('focusin', clearRequest, true);

  host.updateComplete.then(() => {
    if (pending === request) {
      clearRequest();
      host.focus(options);
    }
  });

  return true;
}

/** Cancels the stored focus request of `host`, if it has one. */
export function cancelDeferredFocus(host: ReactiveElement): void {
  if (pending?.host === host) {
    clearRequest();
  }
}

/**
 * The elements whose next update is a user change, each with the check that
 * keeps it one. The marks end with the frame, so a mark that no update takes
 * does not animate a later change.
 */
const userChanges = new Map<Element, () => boolean>();
let userChangesFrame = 0;

const always = () => true;

/**
 * Marks the next update of `element` as a user change. A control marks itself;
 * an owner marks itself, or the controls of its light DOM that it changes.
 */
export function markUserChange(element: Element): void {
  userChanges.set(element, always);
  userChangesFrame ||= requestAnimationFrame(() => {
    userChanges.clear();
    userChangesFrame = 0;
  });
}

/**
 * Keeps the user change of `element` only while `check` holds, such as while
 * the value is the one that the user wrote. Does nothing when `element` has no
 * mark, so a mark that code ended stays ended, or when the mark has a check:
 * the first check, closest to the user action, wins.
 */
export function keepUserChangeWhile(
  element: Element,
  check: () => boolean
): void {
  if (userChanges.get(element) === always) {
    userChanges.set(element, check);
  }
}

/** Ends the user change of `element`: code overrides it, or an update takes it. */
export function unmarkUserChange(element: Element): void {
  userChanges.delete(element);
}

/** Whether `element`, or the host of a shadow root around it, has a user change. */
export function isUserChange(element: Element): boolean {
  if (userChanges.size === 0) {
    return false;
  }

  for (let node: Element | undefined = element; node; node = hostOf(node)) {
    if (userChanges.get(node)?.()) {
      return true;
    }
  }

  return false;
}

function hostOf(element: Element): Element | undefined {
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? root.host : undefined;
}

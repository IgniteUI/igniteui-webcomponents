import { type ChildPart, noChange, type TemplateResult } from 'lit';
import {
  AsyncDirective,
  type DirectiveParameters,
  directive,
} from 'lit/async-directive.js';
import { sameItems } from '#internals/utils/arrays.js';
import { isFunction } from '#internals/utils/types.js';
import { getPrefersReducedMotion } from './player.js';

type ScopedViewTransitionElement = HTMLElement & {
  startViewTransition: (
    callback: () => Promise<unknown> | unknown
  ) => ViewTransition;
  activeViewTransition?: ViewTransition | null;
};

function hasScopedViewTransition(
  node: Node
): node is ScopedViewTransitionElement {
  return 'startViewTransition' in node && isFunction(node.startViewTransition);
}

/** Handles the `ready` rejection of a skipped transition, and skips it on reduced motion. */
function prepareTransition(transition: ViewTransition): ViewTransition {
  transition.ready.catch(() => {});

  if (getPrefersReducedMotion()) {
    transition.skipTransition();
  }

  return transition;
}

/**
 * Starts a document view transition and skips it if the user has requested reduced motion.
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

  return prepareTransition(init.call(globalThis.document, callback));
}

/**
 * Starts a scoped view transition on the target and skips it if the user has requested reduced motion.
 * Returns null, without calling `callback`, if the target does not support scoped view transitions.
 */
export function startScopedViewTransition(
  target: Node,
  callback: ViewTransitionUpdateCallback
): ViewTransition | null {
  return hasScopedViewTransition(target)
    ? prepareTransition(target.startViewTransition(callback))
    : null;
}

export function setTransitionName(target: HTMLElement, name: string): void {
  target.style.viewTransitionName = name;
}

export function clearTransitionName(...targets: HTMLElement[]): void {
  for (const target of targets) {
    target.style.viewTransitionName = '';
  }
}

export function getActiveViewTransition(): ViewTransition | null {
  return globalThis.document?.activeViewTransition ?? null;
}

export function getActiveScopedViewTransition(
  target: Node
): ViewTransition | null {
  return hasScopedViewTransition(target)
    ? (target.activeViewTransition ?? null)
    : null;
}

function isSameTemplate(a: TemplateResult, b: TemplateResult): boolean {
  return a.strings === b.strings && sameItems(a.values, b.values);
}

class ScopedViewTransitionDirective extends AsyncDirective {
  private _template?: TemplateResult;

  public override render(template: TemplateResult): TemplateResult {
    return template;
  }

  public override update(
    part: ChildPart,
    [template]: DirectiveParameters<this>
  ): TemplateResult | typeof noChange {
    const previous = this._template;
    this._template = template;

    if (!previous || isSameTemplate(previous, template)) {
      return this.render(template);
    }

    const transition = startScopedViewTransition(part.parentNode, () => {
      this.setValue(template);
      // Let nested elements render before the new state is captured.
      return new Promise((resolve) => requestAnimationFrame(resolve));
    });

    return transition ? noChange : this.render(template);
  }
}

/**
 * Starts a scoped view transition on the parent element when the template changes.
 * The first render and an unchanged template (same strings and values) start no transition.
 * Reduced motion skips the transition.
 *
 * @remarks
 * The parent node must implement `Element.startViewTransition()`. Otherwise the
 * template renders directly, without a transition.
 */
export const scopedViewTransition = directive(ScopedViewTransitionDirective);

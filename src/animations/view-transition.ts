import { type ChildPart, noChange, type TemplateResult } from 'lit';
import {
  AsyncDirective,
  type DirectiveParameters,
  directive,
} from 'lit/async-directive.js';
import { isFunction } from '../components/common/util.js';
import { getPrefersReducedMotion } from './player.js';

type ScopedViewTransitionElement = HTMLElement & {
  startViewTransition: (
    callback: () => Promise<unknown> | unknown
  ) => ViewTransition;
  activeViewTransition?: ViewTransition | null;
};

/**
 * Returns true if the specified node supports scoped view transitions, false otherwise.
 */
function hasScopedViewTransition(
  node: Node
): node is ScopedViewTransitionElement {
  return 'startViewTransition' in node && isFunction(node.startViewTransition);
}

/**
 * Starts a document view transition and skips it if the user has requested reduced motion.
 */
export function startViewTransition(
  callback: ViewTransitionUpdateCallback
): ViewTransition {
  const transition = document.startViewTransition(callback);

  if (getPrefersReducedMotion()) {
    transition.skipTransition();
  }

  return transition;
}

/**
 * Starts a scoped view transition on the specified target element and skips it if the user has requested reduced motion.
 */
export function startScopedViewTransition(
  target: HTMLElement,
  callback: ViewTransitionUpdateCallback
): ViewTransition | null {
  if (!hasScopedViewTransition(target)) {
    return null;
  }

  const transition = target.startViewTransition(callback);

  if (getPrefersReducedMotion()) {
    transition.skipTransition();
  }

  return transition;
}

/**
 * Sets the view transition name for the specified target element.
 */
export function setTransitionName(target: HTMLElement, name: string): void {
  target.style.viewTransitionName = name;
}

/**
 * Clears the view transition name for the specified target elements.
 */
export function clearTransitionName(...targets: HTMLElement[]): void {
  for (const target of targets) {
    target.style.viewTransitionName = '';
  }
}

/**
 * Returns the active view transition if one is currently in progress, or null otherwise.
 */
export function getActiveViewTransition(): ViewTransition | null {
  return document.activeViewTransition ?? null;
}

/**
 * Returns the active scoped view transition for the specified target element if one is currently in progress, or null otherwise.
 */
export function getActiveScopedViewTransition(
  target: ScopedViewTransitionElement
): ViewTransition | null {
  if (!hasScopedViewTransition(target)) {
    return null;
  }

  return target.activeViewTransition ?? null;
}

class ScopedViewTransitionDirective extends AsyncDirective {
  private _isFirstRender = true;

  public override render(template: TemplateResult): TemplateResult {
    return template;
  }

  public override update(
    part: ChildPart,
    [template]: DirectiveParameters<this>
  ) {
    if (this._isFirstRender) {
      this._isFirstRender = false;
      return this.render(template);
    }

    const parent = part.parentNode;

    if (!hasScopedViewTransition(parent)) {
      return this.render(template);
    }

    const transition = parent.startViewTransition(() => {
      this.setValue(template);
      return new Promise((resolve) => requestAnimationFrame(resolve));
    });

    if (getPrefersReducedMotion()) {
      transition.skipTransition();
    }

    return noChange;
  }
}

/**
 * A directive that enables scoped view transitions for a template.
 *
 * When applied, it will start a view transition whenever the template is updated,
 * provided that the parent node supports view transitions.
 * If the user has requested reduced motion, the transition will be skipped.
 *
 * @remarks
 * This directive is intended to be used with Lit templates inside a component that supports view transitions.
 * It will not work if the parent node does not support view transitions (e.g., if the parent is not a document or element that implements the ViewTransition interface).
 */
export const scopedViewTransition = directive(ScopedViewTransitionDirective);

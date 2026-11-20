import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { internalsOf } from '#internals/controllers/internals.js';
import { sameItems } from '#internals/utils/arrays.js';
import { getCSSTransitions, transitionsSettled } from './css-transitions.js';

type ValueStateHost = ReactiveControllerHost & HTMLElement;

const NO_VALUES: readonly unknown[] = [];

/**
 * The elements whose next update is a user change. The marks end with the
 * frame, so a mark that no update takes does not animate a later change.
 */
const userChanges = new Set<Element>();
let userChangesFrame = 0;

/**
 * Marks the next update of `element` as a user change. A control marks itself;
 * an owner marks itself, or the controls of its light DOM that it changes.
 */
export function markUserChange(element: Element): void {
  userChanges.add(element);
  userChangesFrame ||= requestAnimationFrame(() => {
    userChanges.clear();
    userChangesFrame = 0;
  });
}

/** Ends the user change of `element`, as when code overrides it. */
export function unmarkUserChange(element: Element): void {
  userChanges.delete(element);
}

/** Whether `element`, or the host of a shadow root around it, is marked. */
export function isUserChange(element: Element): boolean {
  if (userChanges.size === 0) {
    return false;
  }

  for (let node: Element | undefined = element; node; node = hostOf(node)) {
    if (userChanges.has(node)) {
      return true;
    }
  }

  return false;
}

function hostOf(element: Element): Element | undefined {
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? root.host : undefined;
}

/** A host takes the `ig-instant` custom state; a shadow element, `data-instant`. */
function setInstant(element: Element, instant: boolean): void {
  const internals = internalsOf(element);

  if (internals) {
    internals.setState('ig-instant', instant);
  } else {
    element.toggleAttribute('data-instant', instant);
  }
}

/**
 * The marked elements. They lose the mark in the first frame with no change
 * from code, so a scroll that changes controls in each frame keeps it.
 */
class InstantElements {
  private readonly _elements = new Set<Element>();
  private _changedInFrame = false;
  private _quietFrameCheckScheduled = false;

  public add(element: Element): void {
    setInstant(element, true);
    this._elements.add(element);
    this._changedInFrame = true;

    if (!this._quietFrameCheckScheduled) {
      this._quietFrameCheckScheduled = true;
      requestAnimationFrame(this._clearInQuietFrame);
    }
  }

  public delete(element: Element): void {
    if (this._elements.delete(element)) {
      setInstant(element, false);
    }
  }

  private readonly _clearInQuietFrame = (): void => {
    this._quietFrameCheckScheduled = this._changedInFrame;
    this._changedInFrame = false;

    if (this._quietFrameCheckScheduled) {
      requestAnimationFrame(this._clearInQuietFrame);
      return;
    }

    for (const element of this._elements) {
      setInstant(element, false);
    }
    this._elements.clear();
  };
}

// Created on first use, so a control that only marks user changes does not bundle it.
let instantElements: InstantElements | undefined;

/** A host transitions itself and its shadow root, not its slotted content. */
function transitionsOfTarget(target: Element): CSSTransition[] {
  const { shadowRoot } = target;

  return shadowRoot
    ? [...getCSSTransitions(target), ...getCSSTransitions(shadowRoot)]
    : getCSSTransitions(target, { subtree: true });
}

export interface ValueStateMotionOptions {
  /** The values whose change restyles the control, in a fixed order. */
  watch: () => readonly unknown[];
  /** The values whose change shows at once, also during a user change. */
  instant?: () => readonly unknown[];
  /** The shadow element to mark. Without it, the host, which needs ElementInternals. */
  target?: () => Element | null | undefined;
  /** Called when the transitions of a user change end. */
  settled?: () => void;
}

/**
 * Shows a change of the value state of a control at once, unless the user made
 * it. A change from code while the transitions of a user change run joins them,
 * so a framework that renders again after the event keeps the animation.
 */
export class ValueStateMotionController implements ReactiveController {
  private readonly _host: ValueStateHost;
  private readonly _options: ValueStateMotionOptions;

  private _values?: readonly unknown[];
  private _instantValues = NO_VALUES;
  private _mode?: 'animated' | 'at-once';
  private _marked?: Element;

  /** Identifies the running user change; a newer change replaces it. */
  private _userAnimation?: object;

  public get userAnimating(): boolean {
    return this._userAnimation !== undefined;
  }

  constructor(host: ValueStateHost, options: ValueStateMotionOptions) {
    this._host = host;
    this._options = options;
    host.addController(this);
  }

  /** @internal */
  public hostUpdate(): void {
    const values = this._options.watch();
    const instantValues = this._options.instant?.() ?? NO_VALUES;
    const previous = this._values;
    const cut = !sameItems(this._instantValues, instantValues);
    const marked = userChanges.delete(this._host);

    this._values = values;
    this._instantValues = instantValues;

    // The first render has no styles to transition from.
    if (!previous || (!cut && sameItems(previous, values))) {
      return;
    }

    if (!cut && (marked || this._userAnimation || isUserChange(this._host))) {
      this._userAnimation = {};
      this._mode = 'animated';
    } else {
      this._userAnimation = undefined;
      this._mode = 'at-once';
    }
  }

  /** @internal */
  public hostUpdated(): void {
    const mode = this._mode;

    if (!mode) {
      return;
    }

    const { target } = this._options;
    const element = target ? target() : this._host;
    this._mode = undefined;

    if (mode === 'animated') {
      this._trackUserAnimation(element);
    } else if (element) {
      this._marked = element;
      (instantElements ??= new InstantElements()).add(element);
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    if (this._marked) {
      instantElements?.delete(this._marked);
      this._marked = undefined;
    }
  }

  /** A disconnected control has no target and no transitions. */
  private async _trackUserAnimation(target?: Element | null): Promise<void> {
    const token = this._userAnimation;
    let transitions: CSSTransition[] = [];

    if (target) {
      instantElements?.delete(target);
      transitions = transitionsOfTarget(target);
    }

    await transitionsSettled(transitions);

    if (this._userAnimation === token) {
      this._userAnimation = undefined;
      this._options.settled?.();
    }
  }
}

export function addValueStateMotion(
  host: ValueStateHost,
  options: ValueStateMotionOptions
): ValueStateMotionController {
  return new ValueStateMotionController(host, options);
}

type FieldHost = ValueStateHost & {
  disabled: boolean;
  outlined: boolean;
};

/**
 * Shows a change from code of a text field at once. `valueState` is the part of
 * the value that restyles the field, such as its filled state.
 */
export function addFieldValueStateMotion(
  host: FieldHost,
  valueState: () => unknown
): void {
  addValueStateMotion(host, {
    watch: () => [valueState(), host.disabled, host.outlined],
  });
}

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { internalsOf } from '#internals/controllers/internals.js';
import { isUserChange, unmarkUserChange } from '#internals/user-change.js';
import { sameItems } from '#internals/utils/arrays.js';
import { getCSSTransitions, transitionsSettled } from './css-transitions.js';

type ValueStateHost = ReactiveControllerHost & HTMLElement;

const NO_VALUES: readonly unknown[] = [];

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
 * The elements with transitions off. They turn on again in the first frame with
 * no change from code, so a scroll that changes controls in each frame keeps
 * them off.
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

/**
 * A host waits for its shadow root, not for itself: the hosts that the user
 * changes have no transitions of their own, and `Element.getAnimations()`
 * scans the document, so a tree cascade of n checkboxes would cost O(n²).
 */
function transitionsOfTarget(target: Element): CSSTransition[] {
  return getCSSTransitions(target.shadowRoot ?? target, { subtree: true });
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
  private _instantElement?: Element;

  /** Identifies the running user change; a newer change replaces it. */
  private _userAnimationToken?: object;

  public get userAnimating(): boolean {
    return this._userAnimationToken !== undefined;
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
    const instantChanged = !sameItems(this._instantValues, instantValues);
    const changed =
      previous !== undefined &&
      (instantChanged || !sameItems(previous, values));
    const byUser =
      changed &&
      !instantChanged &&
      (this._userAnimationToken !== undefined || isUserChange(this._host));

    // The next update takes the mark, also one that changes nothing.
    unmarkUserChange(this._host);
    this._values = values;
    this._instantValues = instantValues;

    // The first render has no styles to transition from.
    if (!changed) {
      return;
    }

    if (byUser) {
      this._userAnimationToken = {};
      this._mode = 'animated';
    } else {
      this._userAnimationToken = undefined;
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
      this._instantElement = element;
      (instantElements ??= new InstantElements()).add(element);
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    if (this._instantElement) {
      instantElements?.delete(this._instantElement);
      this._instantElement = undefined;
    }
  }

  /** A disconnected control has no target and no transitions. */
  private async _trackUserAnimation(target?: Element | null): Promise<void> {
    const token = this._userAnimationToken;
    let transitions: CSSTransition[] = [];

    if (target) {
      instantElements?.delete(target);
      transitions = transitionsOfTarget(target);
    }

    await transitionsSettled(transitions);

    if (this._userAnimationToken === token) {
      this._userAnimationToken = undefined;
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
 * Shows a change from code of a text field at once. `filledState` returns what
 * restyles the field when it fills or empties, such as `!!value`.
 */
export function addFieldValueStateMotion(
  host: FieldHost,
  filledState: () => unknown
): void {
  addValueStateMotion(host, {
    watch: () => [filledState(), host.disabled, host.outlined],
  });
}

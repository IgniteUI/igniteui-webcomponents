import {
  type LitElement,
  noChange,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';
import {
  Directive,
  type DirectiveParameters,
  directive,
  type ElementPart,
  type PartInfo,
  PartType,
} from 'lit/directive.js';
import { sameItems } from '../utils/arrays.js';
import { setOrRemoveAttribute } from '../utils/dom.js';
import { addSafeEventListener, focusLeftHost } from '../utils/events.js';
import { isString } from '../utils/types.js';
import { internalsOf } from './internals.js';
import type { SlotController } from './slot.js';

type ControllerHost = ReactiveControllerHost & LitElement;

/** Whether the component shows its own label. */
const hasLabel = (host: object) => Boolean((host as { label?: string }).label);

/** The name sources of a component, resolved by {@link resolveNaming}. */
type ResolvedNaming = Pick<
  ResolvedARIABindings,
  'labelledBy' | 'labelledByRef' | 'label'
>;

/**
 * Resolves the name of a form associated component. The first source that is
 * present wins: the host `aria-labelledby`, the external `<label>` elements,
 * the own label of the component, the host `aria-label`, and `fallback`.
 *
 * `ownLabel` is the id of the own label in the shadow root, or `true` for an
 * own label that names the control natively, for example a `<label for>`.
 *
 * @remarks
 * Assistive technology reads the native control in the shadow root, so the
 * name moves from the host to that control. `host.ariaLabelledByElements`
 * resolves the host IDREFs in the host tree. A wrapping label contains the
 * own label text.
 */
export function resolveNaming(
  host: Element,
  ownLabel: string | boolean,
  fallback?: string
): ResolvedNaming {
  const referenced = host.ariaLabelledByElements;

  if (referenced?.length) {
    return { labelledBy: referenced };
  }

  const labels = internalsOf(host)?.labels;

  if (labels) {
    return { labelledBy: labels };
  }

  const naming: ResolvedNaming = {
    labelledBy: null,
    label: ownLabel ? undefined : host.getAttribute('aria-label') || fallback,
  };

  if (isString(ownLabel)) {
    naming.labelledByRef = ownLabel;
  }

  return naming;
}

/** Forwards the host name and description to its role or focus element. @internal */
export function hostAria(
  host: Element,
  ownLabel: string | boolean = false,
  description: Element | null = null
): ARIABindings {
  return {
    ...resolveNaming(host, ownLabel),
    ...descriptionBindings(host, description),
  };
}

/** Renders the host again on focus when its `<label>`s changed. @internal */
export function trackLabels(host: ControllerHost): void {
  let labels: ReadonlyArray<Element> | null | undefined;

  host.addController({
    hostUpdate: () => {
      labels = internalsOf(host)?.labels;
    },
  });
  addSafeEventListener(host, 'focusin', (event) => {
    if (
      focusLeftHost(host, event) &&
      !sameItems(internalsOf(host)?.labels, labels)
    ) {
      host.requestUpdate();
    }
  });
}

/** Joins element lists, or returns `null` for none. */
function joinRelations(
  ...lists: Array<ReadonlyArray<Element> | null | undefined>
): ReadonlyArray<Element> | null {
  const joined = lists.flatMap((list) => list ?? []);
  return joined.length ? joined : null;
}

/**
 * Describes a control by its own description, `extra`, then the host. Alone,
 * the own description binds as an IDREF, which attribute readers also see.
 */
function descriptionBindings(
  host: Element,
  description: Element | null,
  extra?: ReadonlyArray<Element> | null
): Pick<ResolvedARIABindings, 'describedBy' | 'describedByRef'> {
  const others = joinRelations(extra, host.ariaDescribedByElements);

  return {
    describedBy: others && joinRelations(description && [description], others),
    describedByRef: description?.id || undefined,
  };
}

/**
 * The ARIA semantics that a composite host projects onto the native editor.
 *
 * Every relation is an element reference, because an IDREF does not cross a
 * shadow boundary.
 */
export type ProjectedARIA = {
  role?: string;
  hasPopup?: string;
  expanded?: string;
  required?: string;
  label?: string;
  controls?: ReadonlyArray<Element> | null;
  describedBy?: ReadonlyArray<Element> | null;
  labelledBy?: ReadonlyArray<Element> | null;
};

/** The id of the helper-text container of `IgcValidationContainerComponent`. */
export const HELPER_TEXT_ID = 'helper-text';

/** Returns the helper-text container when the `helper-text` slot has content. */
export function helperText(
  host: LitElement,
  slots: Pick<SlotController<'helper-text'>, 'hasAssignedElements'>
): Element | null {
  return slots.hasAssignedElements('helper-text')
    ? host.renderRoot.querySelector(`#${HELPER_TEXT_ID}`)
    : null;
}

/**
 * The bindings that the {@link ariaBindings} directive applies to a native
 * editor. A scalar binds as an attribute, a relation through an ARIA
 * element-reflection property.
 */
export type ResolvedARIABindings = Omit<
  ProjectedARIA,
  'controls' | 'describedBy' | 'labelledBy'
> & {
  /** The IDREF of the own description, bound while `describedBy` is null. */
  describedByRef?: string;
  /** The IDREF of the own label, bound while `labelledBy` is null. */
  labelledByRef?: string;
  labelledBy: ReadonlyArray<Element> | null;
  controls: ReadonlyArray<Element> | null;
  describedBy: ReadonlyArray<Element> | null;
};

/** The ARIA target controller of each input-shaped component. */
const targets = new WeakMap<Element, AriaTargetController>();

/**
 * The receiving end of an ARIA projection. It names the native control in the
 * shadow root, see {@link resolveNaming}, and applies the state that a
 * composite host projects.
 *
 * @remarks
 * Not a reactive controller. The host render resolves the bindings, and
 * `HostAriaMixin` renders the host again when the name sources change.
 */
class AriaTargetController {
  private readonly _host: ControllerHost;
  /** Resolves the helper-text container, or `null` when there is none. */
  private readonly _description: () => Element | null;
  private _projected: ProjectedARIA = {};
  /** The bindings last resolved for the native editor. */
  private _resolved?: ResolvedARIABindings;

  constructor(host: ControllerHost, description: () => Element | null) {
    this._host = host;
    this._description = description;
    targets.set(host, this);
  }

  /**
   * Replaces the projected state. The host renders only when the resolved
   * bindings change, which also catches a change of its own labels.
   */
  public setProjected(state: ProjectedARIA): void {
    const previous = this._resolved;
    this._projected = state;

    if (!bindingsEqual(previous, this.resolveBindings())) {
      this._reflectStylingHooks();
      this._host.requestUpdate();
    }
  }

  /**
   * Mirrors `role` and `hasPopup` onto `data-role` and `data-haspopup` for the
   * themes. A `:host()` selector cannot see the ARIA of the editor.
   */
  private _reflectStylingHooks(): void {
    const host = this._host;
    const { role, hasPopup } = this._projected;

    setOrRemoveAttribute(host, 'data-role', role || null);
    setOrRemoveAttribute(host, 'data-haspopup', hasPopup || null);
  }

  /**
   * Resolves the binding values for the native editor element. A projected
   * value wins over the own naming.
   */
  public resolveBindings(): ResolvedARIABindings {
    const projected = this._projected;
    const description = this._description();
    const naming = projected.labelledBy
      ? projected
      : resolveNaming(this._host, hasLabel(this._host));

    this._resolved = {
      role: projected.role,
      hasPopup: projected.hasPopup,
      expanded: projected.expanded,
      required: projected.required,
      label: projected.label ?? naming.label,
      labelledBy: naming.labelledBy ?? null,
      controls: projected.controls ?? null,
      ...descriptionBindings(this._host, description, projected.describedBy),
    };

    return this._resolved;
  }
}

const scalarBindings = [
  ['role', 'role'],
  ['hasPopup', 'aria-haspopup'],
  ['expanded', 'aria-expanded'],
  ['required', 'aria-required'],
  ['label', 'aria-label'],
] as const;

/** The relations: the key, the IDREF key, the property, and the attribute. */
const relationBindings = [
  ['labelledBy', 'labelledByRef', 'ariaLabelledByElements', 'aria-labelledby'],
  [
    'describedBy',
    'describedByRef',
    'ariaDescribedByElements',
    'aria-describedby',
  ],
  ['controls', null, 'ariaControlsElements', 'aria-controls'],
] as const;

function bindingsEqual(
  a: ResolvedARIABindings | undefined,
  b: ResolvedARIABindings
): boolean {
  return (
    a !== undefined &&
    scalarBindings.every(([key]) => a[key] === b[key]) &&
    relationBindings.every(
      ([key, refKey]) =>
        sameItems(a[key], b[key]) && (!refKey || a[refKey] === b[refKey])
    )
  );
}

/** The bindings that {@link ariaBindings} accepts. Each key is optional. */
export type ARIABindings = Partial<ResolvedARIABindings>;

/**
 * Applies {@link ARIABindings} to the native editor. It writes only changed
 * values, and only to the attributes that its bindings set.
 */
class AriaBindingsDirective extends Directive {
  private _previous?: ARIABindings;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        '`ariaBindings()` can only be used as an element expression.'
      );
    }
  }

  public override render(_: ARIABindings): unknown {
    return noChange;
  }

  public override update(
    part: ElementPart,
    [bindings]: DirectiveParameters<this>
  ): unknown {
    const element = part.element;
    const previous = this._previous;
    this._previous = bindings;

    // A value is an element list, an IDREF string or null. An IDREF write
    // clears the reflection. A null write removes the attribute.
    for (const [key, refKey, property, attribute] of relationBindings) {
      const next = bindings[key] ?? (refKey && bindings[refKey]) ?? null;
      const prev = previous?.[key] ?? (refKey && previous?.[refKey]) ?? null;

      if (typeof next === 'string') {
        if (next !== prev) {
          element.setAttribute(attribute, next);
        }
      } else if (typeof prev === 'string' || !sameItems(prev, next)) {
        element[property] = next;
      }
    }

    for (const [key, attribute] of scalarBindings) {
      const value = bindings[key];

      if (previous?.[key] !== value) {
        setOrRemoveAttribute(element, attribute, value);
      }
    }

    return noChange;
  }
}

/**
 * Binds the resolved ARIA state onto a native editor element as one element
 * expression, for example `<input ${ariaBindings(aria)} />`.
 */
export const ariaBindings = directive(AriaBindingsDirective);

type AriaProjectorConfig = {
  /** Resolves the input-shaped component that receives the ARIA state. */
  target: () => Element | null | undefined;
  /** Computes the ARIA state to project, after every host update. */
  state: () => ProjectedARIA;
  /** Whether to also project the name of the host, by default `true`. */
  naming?: boolean;
  /** Resolves the name to use when no other source names the host. */
  fallbackLabel?: () => string;
};

/**
 * The sending end of an ARIA projection. A composite host such as
 * `igc-select` adds it to push the computed ARIA state onto the
 * {@link AriaTargetController} of the target after every host update.
 */
class AriaProjectorController implements ReactiveController {
  private readonly _host: ControllerHost;
  private readonly _config: AriaProjectorConfig;
  private _retryScheduled = false;

  constructor(host: ControllerHost, config: AriaProjectorConfig) {
    this._host = host;
    this._config = config;
    host.addController(this);
  }

  /** Computes the state, with the name and the description of the host. */
  private _state(): ProjectedARIA {
    const { state, naming = true, fallbackLabel } = this._config;
    const projected = state();
    const host = this._host;

    return {
      ...(naming && resolveNaming(host, hasLabel(host), fallbackLabel?.())),
      ...projected,
      describedBy: joinRelations(
        projected.describedBy,
        host.ariaDescribedByElements
      ),
    };
  }

  /** @internal */
  public hostUpdated(): void {
    const element = this._config.target();

    if (!element) {
      return;
    }

    const target = targets.get(element);

    if (target) {
      target.setProjected(this._state());
      return;
    }

    // The target exists but is not upgraded yet, because its definition
    // registered late. Project again once that definition resolves.
    if (!this._retryScheduled) {
      this._retryScheduled = true;

      customElements.whenDefined(element.localName).then(() => {
        this._retryScheduled = false;
        this._host.requestUpdate();
      });
    }
  }
}

/** Makes the native editor of a component a target of {@link addAriaProjector}. */
export function addAriaTarget(
  host: ControllerHost,
  description: () => Element | null
): AriaTargetController {
  return new AriaTargetController(host, description);
}

/** Projects the ARIA of a composite host onto the native editor of its target. */
export function addAriaProjector(
  host: ControllerHost,
  config: AriaProjectorConfig
): AriaProjectorController {
  return new AriaProjectorController(host, config);
}

export type { AriaProjectorController, AriaTargetController };

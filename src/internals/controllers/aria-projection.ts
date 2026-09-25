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
import { isString } from '../utils/types.js';
import { internalsOf } from './internals.js';
import type { SlotController } from './slot.js';

type ControllerHost = ReactiveControllerHost & LitElement;

/** The host attributes that {@link resolveNaming} reads. */
export const NAMING_ATTRIBUTES = ['aria-label', 'aria-labelledby'];

/** The name sources of a component, resolved by {@link resolveNaming}. */
export type ResolvedNaming = {
  /** The elements that name the component, bound as element references. */
  labelledBy: ReadonlyArray<Element> | null;
  /** The id of the own label in the shadow root, bound as an IDREF. */
  labelledByRef?: string;
  /** The host `aria-label` or the fallback, when no label names the component. */
  label?: string;
};

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
 * resolves the host IDREFs in the host tree. An external label replaces the
 * own label. A wrapping label contains the own label text.
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

/**
 * The ARIA semantics that a composite host projects onto the native editor.
 *
 * @remarks
 * The host delegates focus, so assistive technology lands on the editor of
 * the input-shaped component and reports it. Every relation travels as an
 * element reference, because an IDREF does not cross a shadow boundary.
 */
export type ProjectedARIA = {
  role?: string;
  hasPopup?: string;
  expanded?: string;
  disabled?: string;
  label?: string;
  controls?: ReadonlyArray<Element> | null;
  describedBy?: ReadonlyArray<Element> | null;
  labelledBy?: ReadonlyArray<Element> | null;
  activeDescendant?: Element | null;
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

type AriaTargetConfig = {
  /** Resolves the helper-text container, or `null` when there is none. */
  description?: () => Element | null;
  /** Whether an own label names the editor natively, for example a `<label for>`. */
  hasOwnLabel?: () => boolean;
};

/**
 * The binding values for a native editor element, resolved from the projected
 * state and the own ARIA of the editor, and applied by the
 * {@link ariaBindings} directive. A scalar binds as an attribute, a relation
 * through an ARIA element-reflection property.
 */
export type ResolvedARIABindings = {
  role?: string;
  hasPopup?: string;
  expanded?: string;
  disabled?: string;
  label?: string;
  /**
   * The IDREF of the own description in the same root. The directive binds it
   * while `describedBy` is null, so a tool that reads only attributes, for
   * example axe, still sees the relation.
   */
  describedByRef?: string;
  /** The IDREF of the own label in the same root. It binds as `describedByRef`. */
  labelledByRef?: string;
  labelledBy: ReadonlyArray<Element> | null;
  controls: ReadonlyArray<Element> | null;
  describedBy: ReadonlyArray<Element> | null;
  activeDescendant: Element | null;
};

/**
 * Resolves an input-shaped component to its ARIA target controller, so the
 * component needs no public member for the projection.
 */
const targets = new WeakMap<Element, AriaTargetController>();

/**
 * The receiving end of an ARIA projection. It names the native control in the
 * shadow root, see {@link resolveNaming}, and applies the state that a
 * composite host projects.
 *
 * @remarks
 * Not a reactive controller. The host render resolves the bindings, and the
 * form associated mixin renders the host again when the name sources change.
 */
class AriaTargetController {
  private readonly _host: ControllerHost;
  private readonly _config: AriaTargetConfig;
  private _projected: ProjectedARIA = {};
  /** The bindings last resolved for the native editor. */
  private _resolved?: ResolvedARIABindings;

  constructor(host: ControllerHost, config: AriaTargetConfig) {
    this._host = host;
    this._config = config;
    targets.set(host, this);
  }

  /**
   * Replaces the projected state.
   *
   * @remarks
   * A host render happens only when the resolved bindings change, so a
   * projection on every host update stays inexpensive. The comparison uses
   * the resolved bindings, so it also catches a change to the own labels or
   * description, which the component cannot observe.
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
   * Mirrors the projected `role` and `hasPopup` onto `data-role` and
   * `data-haspopup`.
   *
   * @remarks
   * The input themes style the anchor of a composite widget from these
   * attributes. The ARIA itself stays on the editor in the shadow root, where
   * a `:host()` selector cannot observe it.
   */
  private _reflectStylingHooks(): void {
    const host = this._host;
    const { role, hasPopup } = this._projected;

    role
      ? host.setAttribute('data-role', role)
      : host.removeAttribute('data-role');
    hasPopup
      ? host.setAttribute('data-haspopup', hasPopup)
      : host.removeAttribute('data-haspopup');
  }

  /**
   * Resolves the binding values for the native editor element. A projected
   * value wins over the own naming.
   */
  public resolveBindings(): ResolvedARIABindings {
    const projected = this._projected;
    const description = this._config.description?.() ?? null;
    const naming = projected.labelledBy
      ? projected
      : resolveNaming(this._host, this._config.hasOwnLabel?.() ?? false);

    this._resolved = {
      role: projected.role,
      hasPopup: projected.hasPopup,
      expanded: projected.expanded,
      disabled: projected.disabled,
      label: projected.label ?? naming.label,
      labelledBy: naming.labelledBy ?? null,
      controls: projected.controls ?? null,
      describedBy: projected.describedBy
        ? description
          ? [description, ...projected.describedBy]
          : projected.describedBy
        : null,
      describedByRef: description?.id || undefined,
      activeDescendant: projected.activeDescendant ?? null,
    };

    return this._resolved;
  }
}

const scalarBindings = [
  ['role', 'role'],
  ['hasPopup', 'aria-haspopup'],
  ['expanded', 'aria-expanded'],
  ['disabled', 'aria-disabled'],
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
    a.activeDescendant === b.activeDescendant &&
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

    const activeDescendant = bindings.activeDescendant ?? null;

    if (activeDescendant !== (previous?.activeDescendant ?? null)) {
      element.ariaActiveDescendantElement = activeDescendant;
    }

    for (const [key, attribute] of scalarBindings) {
      const value = bindings[key];

      if (previous?.[key] !== value) {
        value != null
          ? element.setAttribute(attribute, value)
          : element.removeAttribute(attribute);
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
  /**
   * Whether the host shows an own label. When set, the projector also
   * projects the name of the host, see {@link resolveNaming}.
   */
  hasOwnLabel?: () => boolean;
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

  /** Computes the state, with the name of the host when it is configured. */
  private _state(): ProjectedARIA {
    const { state, hasOwnLabel, fallbackLabel } = this._config;

    return hasOwnLabel
      ? {
          ...resolveNaming(this._host, hasOwnLabel(), fallbackLabel?.()),
          ...state(),
        }
      : state();
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

/**
 * Creates an {@link AriaTargetController} and adds it to an input-shaped
 * component. It makes the native editor of the component a valid target for
 * {@link addAriaProjector}.
 */
export function addAriaTarget(
  host: ControllerHost,
  config: AriaTargetConfig
): AriaTargetController {
  return new AriaTargetController(host, config);
}

/**
 * Creates an {@link AriaProjectorController} and adds it to a composite host.
 * It projects ARIA onto the native editor of the target component.
 */
export function addAriaProjector(
  host: ControllerHost,
  config: AriaProjectorConfig
): AriaProjectorController {
  return new AriaProjectorController(host, config);
}

export type { AriaProjectorController, AriaTargetController };

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

type ControllerHost = ReactiveControllerHost & LitElement;

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

type AriaTargetConfig = {
  /** Resolves the component's own `ElementInternals` labels. */
  labels: () => ReadonlyArray<Element> | null;
  /** Resolves the helper-text container, or `null` when there is none. */
  description: () => Element | null;
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
   * The same-root IDREF for the own description of the editor. It applies
   * while the host projects no description, so tooling that reads attributes
   * only, for example axe, still sees a content attribute.
   */
  describedByRef?: string;
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

function bindingsEqual(
  a: ResolvedARIABindings | undefined,
  b: ResolvedARIABindings
): boolean {
  return (
    a !== undefined &&
    a.role === b.role &&
    a.hasPopup === b.hasPopup &&
    a.expanded === b.expanded &&
    a.disabled === b.disabled &&
    a.label === b.label &&
    a.describedByRef === b.describedByRef &&
    a.activeDescendant === b.activeDescendant &&
    sameItems(a.controls, b.controls) &&
    sameItems(a.describedBy, b.describedBy) &&
    sameItems(a.labelledBy, b.labelledBy)
  );
}

/**
 * The receiving end of an ARIA projection. Every input-shaped component adds
 * it to hold the state that a composite host projects, and resolves that
 * state against its own ARIA.
 *
 * @remarks
 * Not a reactive controller: it needs only a host render when the projected
 * state changes.
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
   * Resolves the binding values for the native editor element.
   *
   * @remarks
   * A projected label wins over the own label of the component. The
   * description stays a same-root IDREF while the host projects none, and the
   * whole relation switches to element references afterwards, because an
   * attribute and a reflection cannot coexist. See
   * {@link ResolvedARIABindings.describedByRef}.
   */
  public resolveBindings(): ResolvedARIABindings {
    const projected = this._projected;
    const description = this._config.description();

    this._resolved = {
      role: projected.role,
      hasPopup: projected.hasPopup,
      expanded: projected.expanded,
      disabled: projected.disabled,
      label: projected.label,
      labelledBy: projected.labelledBy ?? this._config.labels(),
      controls: projected.controls ?? null,
      describedBy: projected.describedBy
        ? description
          ? [description, ...projected.describedBy]
          : projected.describedBy
        : null,
      describedByRef: projected.describedBy
        ? undefined
        : description?.id || undefined,
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
  ['describedByRef', 'aria-describedby'],
] as const;

/**
 * Applies {@link ResolvedARIABindings} onto the native editor element. It
 * applies a relation on every render, and a scalar only on a change.
 */
class AriaBindingsDirective extends Directive {
  private _previous?: ResolvedARIABindings;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        '`ariaBindings()` can only be used as an element expression.'
      );
    }
  }

  public override render(_: ResolvedARIABindings): unknown {
    return noChange;
  }

  public override update(
    part: ElementPart,
    [bindings]: DirectiveParameters<this>
  ): unknown {
    const element = part.element;
    const previous = this._previous;
    this._previous = bindings;

    // The relations run on every render: the browser drops an element
    // reference assigned while the editor is outside the document, and the
    // first render commits inside the template fragment. They come first, so
    // the scalar pass sees the attributes that a reflection property removed.
    element.ariaLabelledByElements = bindings.labelledBy;
    element.ariaControlsElements = bindings.controls;
    element.ariaDescribedByElements = bindings.describedBy;
    element.ariaActiveDescendantElement = bindings.activeDescendant;

    for (const [key, attribute] of scalarBindings) {
      const value = bindings[key];

      if (!previous || previous[key] !== value) {
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

  /** @internal */
  public hostUpdated(): void {
    const element = this._config.target();

    if (!element) {
      return;
    }

    const target = targets.get(element);

    if (target) {
      target.setProjected(this._config.state());
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

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

type ControllerHost = ReactiveControllerHost & LitElement;

/**
 * ARIA semantics a composite host projects onto the native editor of an
 * input-shaped component.
 *
 * The host cannot publish these itself: it delegates focus, so the native
 * editor inside the input component's shadow root is what assistive technology
 * lands on and reports. All relations travel as element references — an IDREF
 * cannot cross a shadow boundary, while ARIA element reflection resolves into
 * ancestor tree scopes.
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

/** Configuration for the {@link AriaTargetController}. */
type AriaTargetConfig = {
  /** Resolves the component's own `ElementInternals` labels. */
  labels: () => ReadonlyArray<Element> | null;
  /**
   * Resolves the component's own description element (its helper-text
   * container), or `null` when it currently renders no description content.
   */
  description: () => Element | null;
};

/**
 * Binding values for a native editor element, resolved from the projected
 * state merged with the editor's own ARIA. Applied onto the editor with the
 * {@link ariaBindings} directive: scalars bind as attributes, relations bind
 * through the ARIA element-reflection properties.
 */
export type ResolvedARIABindings = {
  role?: string;
  hasPopup?: string;
  expanded?: string;
  disabled?: string;
  label?: string;
  /**
   * Same-root IDREF for the editor's own description, applied while no
   * description is projected. Unlike element reflection, a content attribute
   * stays visible to tooling that only reads attributes (e.g. axe).
   */
  describedByRef?: string;
  labelledBy: ReadonlyArray<Element> | null;
  controls: ReadonlyArray<Element> | null;
  describedBy: ReadonlyArray<Element> | null;
  activeDescendant: Element | null;
};

/**
 * Internal registry resolving an input-shaped component to its ARIA target
 * controller, so composite hosts can project state without the component
 * exposing a public member for it.
 */
const targets = new WeakMap<Element, AriaTargetController>();

function elementsEqual(
  a: ReadonlyArray<Element> | null | undefined,
  b: ReadonlyArray<Element> | null | undefined
): boolean {
  if (a == null || b == null) {
    return a == null && b == null;
  }

  return a.length === b.length && a.every((element, i) => element === b[i]);
}

function projectionsEqual(a: ProjectedARIA, b: ProjectedARIA): boolean {
  return (
    a.role === b.role &&
    a.hasPopup === b.hasPopup &&
    a.expanded === b.expanded &&
    a.disabled === b.disabled &&
    a.label === b.label &&
    (a.activeDescendant ?? null) === (b.activeDescendant ?? null) &&
    elementsEqual(a.controls, b.controls) &&
    elementsEqual(a.describedBy, b.describedBy) &&
    elementsEqual(a.labelledBy, b.labelledBy)
  );
}

/**
 * The receiving end of an ARIA projection, added by every input-shaped
 * component. Holds the state a composite host currently projects and resolves
 * it against the component's own ARIA when the native editor is rendered.
 *
 * Not a reactive controller — it needs no lifecycle hooks, only a render
 * scheduled on the host when the projected state changes.
 */
class AriaTargetController {
  private readonly _host: ControllerHost;
  private readonly _config: AriaTargetConfig;
  private _projected: ProjectedARIA = {};

  constructor(host: ControllerHost, config: AriaTargetConfig) {
    this._host = host;
    this._config = config;
    targets.set(host, this);
  }

  /**
   * Replaces the projected state, scheduling a host render only when it
   * actually changed so projecting on every host update stays cheap.
   */
  public setProjected(state: ProjectedARIA): void {
    if (!projectionsEqual(this._projected, state)) {
      this._projected = state;
      this._reflectStylingHooks();
      this._host.requestUpdate();
    }
  }

  /**
   * Mirrors the projected `role`/`hasPopup` as `data-role`/`data-haspopup`
   * attributes on the component itself. The input themes style anchors of
   * composite widgets differently and key off these; the ARIA itself lives on
   * the native editor inside the shadow root, where `:host()` selectors
   * cannot observe it.
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
   * Resolves the binding values for the native editor element by merging the
   * projected state with the editor's own ARIA.
   *
   * Projected labels take precedence over the component's own. The editor's
   * description stays a same-root IDREF ({@link ResolvedARIABindings.describedByRef})
   * while nothing is projected; once a host projects a description, the whole
   * relation switches to element references — attribute and reflection cannot
   * coexist — with the editor's own description element joining the projected
   * ones.
   */
  public resolveBindings(): ResolvedARIABindings {
    const projected = this._projected;
    const description = this._config.description();

    return {
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
 * Applies {@link ResolvedARIABindings} onto the native editor element —
 * relations on every render, scalar attributes only when they changed.
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

    // Relations are re-asserted on every render: element references assigned
    // while the editor is detached (its first render commits inside the
    // template fragment) are dropped by the browser, so memoizing them here
    // would leave the associations permanently missing.
    // Assigning them first also means the scalar pass below always observes
    // the final state, since a reflection property detaches the corresponding
    // content attribute.
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
 * Binds resolved ARIA state onto a native editor element as a single element
 * expression, e.g. `<input ${ariaBindings(aria)} />`.
 */
export const ariaBindings = directive(AriaBindingsDirective);

/** Configuration for the {@link AriaProjectorController}. */
type AriaProjectorConfig = {
  /** Resolves the input-shaped component the ARIA state is projected onto. */
  target: () => Element | null | undefined;
  /** Computes the ARIA state to project. Invoked after every host update. */
  state: () => ProjectedARIA;
};

/**
 * The sending end of an ARIA projection, added by composite hosts
 * (e.g. `igc-select`). After every host update it pushes the computed ARIA
 * state onto the target component's {@link AriaTargetController}.
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

    // The target exists but has no controller yet - it is not upgraded on the
    // host's first render when definitions register late. Re-project once its
    // definition resolves.
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
 * Creates and adds an {@link AriaTargetController} to an input-shaped
 * component, making its native editor a valid target for
 * {@link addAriaProjector} — the editor is what assistive technology lands on
 * and reports once the component's host delegates focus to it.
 */
export function addAriaTarget(
  host: ControllerHost,
  config: AriaTargetConfig
): AriaTargetController {
  return new AriaTargetController(host, config);
}

/**
 * Creates and adds an {@link AriaProjectorController} to a composite host,
 * projecting ARIA semantics onto the native editor of the target component.
 */
export function addAriaProjector(
  host: ControllerHost,
  config: AriaProjectorConfig
): AriaProjectorController {
  return new AriaProjectorController(host, config);
}

export type { AriaProjectorController, AriaTargetController };

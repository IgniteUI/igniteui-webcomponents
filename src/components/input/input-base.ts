import { LitElement, nothing, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import type { SlotController } from '#internals/controllers/slot.js';
import { blazorDeepImport } from '#internals/decorators/blazorDeepImport.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import {
  nextInputId,
  renderInputShell,
  resolveInputPartNames,
} from '#internals/templates/input-shell.js';
import type { ThemingController } from '#theming/theming-controller.js';

/**
 * ARIA semantics a composite host can project onto the native input.
 *
 * @hidden @internal
 */
export type InputAriaProperties = {
  role?: string;
  hasPopup?: string;
  expanded?: string;
  controls?: ReadonlyArray<Element> | null;
};

export interface IgcInputComponentEventMap {
  /* alternateName: inputOcurred */
  igcInput: CustomEvent<string>;
  /* blazorSuppress */
  igcChange: CustomEvent<string>;
  // For analyzer meta only:
  /* skipWCPrefix */
  focus: FocusEvent;
  /* skipWCPrefix */
  blur: FocusEvent;
}

/* blazorIndirectRender */
/* blazorSupportsVisualChildren */
/* omitModule */
@blazorDeepImport
@shadowOptions({ delegatesFocus: true })
export abstract class IgcInputBaseComponent extends FormAssociatedRequiredMixin(
  EventEmitterMixin<IgcInputComponentEventMap, Constructor<LitElement>>(
    LitElement
  )
) {
  protected abstract readonly _themes: ThemingController;
  protected abstract readonly _slots: SlotController<any>;

  protected readonly _inputId = nextInputId();

  @query('input')
  protected readonly _input?: HTMLInputElement;

  /**
   * Externally supplied label elements forwarded by a composite host (e.g. `igc-select`)
   * so that the host's associated labels reach the inner native input. When set, these take
   * precedence over the component's own `ElementInternals` labels.
   *
   * @hidden @internal
   */
  @state()
  public _labelElements: ReadonlyArray<Element> | null = null;

  /**
   * Resolves the label elements applied to the native input as `aria-labelledby` targets,
   * preferring forwarded labels over the component's own `ElementInternals` labels.
   *
   * @hidden @internal
   */
  protected get _resolvedLabelElements(): ReadonlyArray<Element> | null {
    return this._labelElements ?? this._internals.labels;
  }

  /**
   * ARIA semantics forwarded by a composite host (e.g. `igc-select`) onto the
   * inner native input, which is the element assistive technology lands on and
   * reports once the host delegates focus to it. `controls` takes elements
   * rather than an id, as the target sits outside the input's shadow root.
   *
   * @hidden @internal
   */
  @state()
  public _ariaProperties: InputAriaProperties = {};

  /* blazorSuppress */
  /** The value of the control. */
  public abstract value: string;

  /**
   * Whether the control will have outlined appearance.
   *
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * The placeholder text of the control.
   * @attr
   */
  @property()
  public placeholder!: string;

  /**
   * The label for the control.
   * @attr
   */
  @property()
  public label!: string;

  /**
   * Resolves the part names for the container based on the current state.
   * Used to apply conditional styling via CSS parts.
   */
  protected _resolvePartNames(base: string) {
    return resolveInputPartNames(this._slots, base, !!this.value);
  }

  /** Selects all the text inside the input. */
  public select(): void {
    this._input?.select();
  }

  /* alternateName: focusComponent */
  /** Sets focus on the control. */
  public override focus(options?: FocusOptions): void {
    this._input?.focus(options);
  }

  /* alternateName: blurComponent */
  /** Removes focus from the control. */
  public override blur(): void {
    this._input?.blur();
  }

  protected abstract _renderInput(): TemplateResult;

  protected _renderFileParts(): TemplateResult | typeof nothing {
    return nothing;
  }

  protected override render() {
    return cache(
      renderInputShell(this, {
        theme: this._themes.theme,
        label: this.label,
        labelId: this._inputId,
        containerParts: this._resolvePartNames('container'),
        renderInput: this._renderInput,
        renderFileParts: this._renderFileParts,
      })
    );
  }
}

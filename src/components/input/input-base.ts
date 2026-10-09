import { LitElement, nothing, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import {
  addAriaTarget,
  helperText,
} from '#internals/controllers/aria-projection.js';
import type { SlotController } from '#internals/controllers/slot.js';
import { blazorDeepImport } from '#internals/decorators/blazorDeepImport.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '#internals/mixins/forms/associated-required.js';
import {
  nextInputId,
  renderInputShell,
  resolveInputPartFlags,
} from '#internals/templates/input-shell.js';
import type { ThemingController } from '#theming/theming-controller.js';

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

  /** Part flags of the current render, shared by the container and the input. */
  private _partFlags: Record<string, boolean> = {};

  @query('input')
  protected readonly _input?: HTMLInputElement;

  /**
   * Names and describes the native input, and applies the ARIA a composite
   * host projects. See {@link addAriaTarget}.
   */
  protected readonly _ariaTarget = addAriaTarget(this, () =>
    helperText(this, this._slots)
  );

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

  protected _resolvePartNames(base: string): Record<string, boolean> {
    return { [base]: true, ...this._partFlags };
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
    this._partFlags = resolveInputPartFlags(this._slots, !!this.value);

    return renderInputShell(this, {
      theme: this._themes.theme,
      label: this.label,
      labelId: this._inputId,
      containerParts: this._resolvePartNames('container'),
      renderInput: this._renderInput,
      renderFileParts: this._renderFileParts,
    });
  }
}

import { LitElement, nothing, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import type { ThemingController } from '../../theming/theming-controller.js';
import type { SlotController } from '../common/controllers/slot.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedRequiredMixin } from '../common/mixins/forms/associated-required.js';
import {
  nextInputId,
  renderInputShell,
} from '../common/templates/input-shell.js';

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

  /* blazorSuppress */
  /** The value attribute of the control. */
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
   * The placeholder attribute of the control.
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
    return {
      [base]: true,
      prefixed: this._slots.hasAssignedElements('prefix', {
        selector: '[slot="prefix"]:not([hidden])',
      }),
      suffixed: this._slots.hasAssignedElements('suffix', {
        selector: '[slot="suffix"]:not([hidden])',
      }),
      filled: !!this.value,
    };
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
        renderInput: () => this._renderInput(),
        renderFileParts: () => this._renderFileParts(),
      })
    );
  }
}

import {
  FileInputResourceStringsEN,
  type IFileInputResourceStrings,
} from 'igniteui-i18n-core';
import { html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ariaBindings } from '#internals/controllers/aria-projection.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addI18nController } from '#internals/i18n/i18n-controller.js';
import type { AbstractConstructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { FormValueFileListTransformers } from '#internals/mixins/forms/form-transformers.js';
import { createFormValueState } from '#internals/mixins/forms/form-value.js';
import { partMap } from '#internals/part-map.js';
import { hasFiles } from '#internals/utils/dom.js';
import { bindIf } from '#internals/utils/lit.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import {
  IgcInputBaseComponent,
  type IgcInputComponentEventMap,
} from '../input/input-base.js';
import { styles as baseStyle } from '../input/themes/input.base.css.js';
import { styles as shared } from '../input/themes/shared/input.common.css.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles } from './themes/file-input.base.css.js';
import { all } from './themes/themes.js';
import { fileValidators } from './validators.js';

/* blazorSuppress */
export interface IgcFileInputComponentEventMap extends Omit<
  IgcInputComponentEventMap,
  'igcChange' | 'igcInput'
> {
  igcCancel: CustomEvent<FileList>;
  igcChange: CustomEvent<FileList>;
}

const Slots = setSlots(
  'prefix',
  'suffix',
  'helper-text',
  'file-selector-text',
  'file-missing-text',
  'value-missing',
  'custom-error',
  'invalid'
);

/* blazorSuppress */
/**
 * @element igc-file-input
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot helper-text - Renders content below the input.
 * @slot file-selector-text - Renders content for the browse button when input type is file.
 * @slot file-missing-text - Renders content when input type is file and no file is chosen.
 * @slot value-missing - Renders content when the required validation fails.
 * @slot custom-error - Renders content when setCustomValidity(message) is set.
 * @slot invalid - Renders content when the component is in invalid state (validity.valid = false).
 *
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcCancel - Emitted when the control's file picker dialog is canceled.
 *
 * @csspart container - The main wrapper that holds all main input elements.
 * @csspart input - The native input element.
 * @csspart label - The native label element.
 * @csspart file-names - The file names wrapper when input type is 'file'.
 * @csspart file-selector-button - The browse button when input type is 'file'.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart helper-text - The helper text wrapper.
 */
export default class IgcFileInputComponent extends EventEmitterMixin<
  IgcFileInputComponentEventMap,
  AbstractConstructor<IgcInputBaseComponent>
>(IgcInputBaseComponent) {
  public static readonly tagName = 'igc-file-input';
  public static styles = [baseStyle, shared, styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcFileInputComponent,
      IgcValidationContainerComponent,
      IgcButtonComponent
    );
  }

  //#region Internal attributes and properties

  protected override readonly _themes = addThemingController(this, all);

  protected override readonly _slots = addSlotController(this, {
    slots: Slots,
  });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: null,
    transformers: FormValueFileListTransformers,
  });

  protected readonly _i18nController = addI18nController(this, {
    defaultEN: FileInputResourceStringsEN,
  });

  protected override get __validators() {
    return fileValidators;
  }

  private get _fileNames(): string | null {
    if (!hasFiles(this)) {
      return null;
    }

    return Array.from(this.files)
      .map((file) => file.name || 'unnamed')
      .join(', ');
  }

  /**
   * Indicates whether the file picker dialog is currently active.
   * Used to manage validation on blur.
   */
  @state()
  private _filePickerActive = false;

  //#endregion

  //#region Public attributes and properties

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the control.
   * Similar to native file input, this property is read-only and cannot be set programmatically.
   * @attr
   */
  @property()
  public set value(value: string) {
    if (value === '' && this._input) {
      this._input.value = value;
    }
  }

  public get value(): string {
    return this._input?.value ?? '';
  }

  /**
   * The resource strings for localization.
   */
  @property({ attribute: false })
  public set resourceStrings(value: IFileInputResourceStrings) {
    this._i18nController.resourceStrings = value;
  }

  public get resourceStrings(): IFileInputResourceStrings {
    return this._i18nController.resourceStrings;
  }

  /**
   * Gets/Sets the locale used for getting language, affecting resource strings.
   * @attr locale
   */
  @property()
  public set locale(value: string) {
    this._i18nController.locale = value;
  }

  public get locale(): string {
    return this._i18nController.locale;
  }

  /**
   * Whether the control allows the user to select more than one file.
   *
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public multiple = false;

  /**
   * The file types the control accepts, as a comma-separated list.
   * @attr
   */
  @property()
  public accept = '';

  /**
   * Whether the control should receive focus automatically.
   * @attr
   */
  @property({ type: Boolean })
  public override autofocus!: boolean;

  /** Returns the list of selected files. */
  public get files(): FileList {
    return this._input?.files ?? new DataTransfer().files;
  }

  //#endregion

  //#region Internal methods

  /**
   * A file input cannot have a default file list, so the `value` attribute
   * never contributes a default - otherwise its string would be stored as the
   * FileList default and submitted character-by-character after a form reset.
   */
  protected override _setDefaultValue(): void {
    this._formValue.defaultValue = null;
  }

  /**
   * Restores directly instead of through the `value` setter: the setter is
   * deliberately inert (read-only semantics) and never updates the form state.
   */
  protected override _restoreDefaultValue(): void {
    if (this._input) {
      this._input.value = '';
    }
    this._formValue.setValueAndFormState(this._formValue.defaultValue);
    this.requestUpdate();
  }

  //#endregion

  //#region Event Handlers

  private _handleChange(): void {
    this._filePickerActive = false;
    this._setTouchedState();
    this._formValue.setValueAndFormState(this.files);

    this.requestUpdate();
    this.emitEvent('igcChange', { detail: this.files });
  }

  private _handleCancel(): void {
    this._filePickerActive = false;
    this._setTouchedState();
    this._validate();

    this.emitEvent('igcCancel', { detail: this.files });
  }

  protected override _handleBlur(): void {
    this._filePickerActive ? this._validate() : super._handleBlur();
  }

  /* c8 ignore next 3 */
  protected _handleClick(): void {
    this._filePickerActive = true;
  }

  //#endregion

  protected override _renderFileParts() {
    const emptyText =
      this.placeholder ?? this.resourceStrings.file_input_placeholder;

    return html`
      <div part="file-parts">
        <div part="file-selector-button">
          <igc-button variant="flat" ?disabled=${this.disabled} tabindex="-1">
            <slot name="file-selector-text"
              >${this.resourceStrings.file_input_upload_button}</slot
            >
          </igc-button>
        </div>
        <div part="file-names">
          <span>
            ${
              this._fileNames ??
              html`<slot name="file-missing-text">${emptyText}</slot>`
            }
          </span>
        </div>
      </div>
    `;
  }

  protected override _renderInput() {
    const hasNegativeTabIndex = this.getAttribute('tabindex') === '-1';

    return html`
      <input
        ${ariaBindings(this._ariaTarget.resolveBindings())}
        id=${this._inputId}
        part=${partMap(this._resolvePartNames('input'))}
        type="file"
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?autofocus=${this.autofocus}
        ?multiple=${this.multiple}
        tabindex=${bindIf(hasNegativeTabIndex, -1)}
        accept=${bindIf(this.accept, this.accept)}
        @click=${this._handleClick}
        @change=${this._handleChange}
        @cancel=${this._handleCancel}
        @blur=${this._handleBlur}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-file-input': IgcFileInputComponent;
  }
}

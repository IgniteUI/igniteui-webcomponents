import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

import { themes } from '../../theming/theming-decorator.js';
import IgcButtonComponent from '../button/button.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  type FormValue,
  createFormValueState,
} from '../common/mixins/forms/form-value.js';
import { isEmpty, partNameMap } from '../common/util.js';
import { IgcInputBaseComponent } from '../input/input-base.js';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { styles } from './themes/base.css.js';
import { all } from './themes/themes.js';
import { fileValidators } from './validators.js';

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
 * @fires igcInput - Emitted when the control input receives user input.
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
@themes(all, { exposeController: true })
export default class IgcFileInputComponent extends IgcInputBaseComponent {
  public static readonly tagName = 'igc-file-input';
  public static override styles = [...super.styles, styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcFileInputComponent,
      IgcValidationContainerComponent,
      IgcButtonComponent
    );
  }

  protected override get __validators() {
    return fileValidators;
  }

  protected override _formValue: FormValue<string>;

  private get _fileNames(): string | null {
    if (!this.files || this.files.length === 0) return null;

    return Array.from(this.files)
      .map((file) => file.name)
      .join(', ');
  }

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The value of the control.
   * @attr
   */
  @property()
  public set value(value: string) {
    this._formValue.setValueAndFormState(value);
    this._validate();
  }

  public get value(): string {
    return this._formValue.value;
  }

  /**
   * The multiple attribute of the control.
   * Used to indicate that a file input allows the user to select more than one file.
   * @attr
   */
  @property({ type: Boolean })
  public multiple = false;

  /**
   * The accept attribute of the control.
   * Defines the file types as a list of comma-separated values that the file input should accept.
   * @attr
   */
  @property({ type: String })
  public accept = '';

  /**
   * The autofocus attribute of the control.
   * @attr
   */
  @property({ type: Boolean })
  public override autofocus!: boolean;

  /**
   * @internal
   */
  @property({ type: Number })
  public override tabIndex = 0;

  constructor() {
    super();
    this._formValue = createFormValueState(this, { initialValue: '' });
  }

  /** Returns the selected files when input type is 'file', otherwise returns null. */
  public get files(): FileList | null {
    if (!this.input) return null;
    return this.input.files;
  }

  private handleInput() {
    this.value = this.input.value;
    this.emitEvent('igcInput', { detail: this.value });
  }

  private handleChange() {
    this.value = this.input.value;
    this.emitEvent('igcChange', { detail: this.value });
  }

  private handleCancel() {
    this.emitEvent('igcCancel', {
      detail: {
        message: 'User canceled the file selection dialog',
        value: this.value,
      },
    });
  }

  protected handleFocus(): void {
    this._dirty = true;
  }

  protected handleBlur(): void {
    this._validate();
  }

  protected override renderFileParts() {
    const emptyText = this.placeholder ?? 'No file chosen';

    return html`
      <div part="file-parts">
        <div part="file-selector-button">
          <igc-button variant="flat" ?disabled=${this.disabled} tabindex="-1">
            <slot name="file-selector-text">Browse</slot>
          </igc-button>
        </div>
        <div part="file-names">
          ${this._fileNames ??
          html`<slot name="file-missing-text">${emptyText}</slot>`}
        </div>
      </div>
    `;
  }

  protected renderInput() {
    return html`
      <input
        id=${this.inputId}
        part=${partNameMap(this.resolvePartNames('input'))}
        name=${ifDefined(this.name)}
        type="file"
        .value=${live(this.value)}
        ?readonly=${this.readOnly}
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?autofocus=${this.autofocus}
        ?multiple=${this.multiple}
        tabindex=${this.tabIndex}
        accept=${ifDefined(this.accept === '' ? undefined : this.accept)}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        aria-describedby=${ifDefined(
          isEmpty(this._helperText) ? nothing : 'helper-text'
        )}
        @change=${this.handleChange}
        @input=${this.handleInput}
        @cancel=${this.handleCancel}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-file-input': IgcFileInputComponent;
  }
}

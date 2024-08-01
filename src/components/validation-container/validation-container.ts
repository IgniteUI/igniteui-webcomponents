import { LitElement, type TemplateResult, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerComponent } from '../common/definitions/register.js';
import type { FormAssociatedElementInterface } from '../common/mixins/form-associated.js';
import { partNameMap, toKebabCase } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import { styles } from './themes/validator.base.css.js';

type IgcFormControl = LitElement & FormAssociatedElementInterface;

interface ValidationContainerConfig {
  id?: string;
  slot?: string;
  part?: string;
  hasHelperText?: boolean;
}

function getValidationSlots(element: IgcValidationContainerComponent) {
  return element.renderRoot.querySelectorAll<HTMLSlotElement>(
    "slot:not([name='helper-text'])"
  );
}

function hasProjectedValidation(
  element: IgcValidationContainerComponent,
  slotName?: string
) {
  const config: AssignedNodesOptions = { flatten: true };
  const slots = Array.from(getValidationSlots(element));
  return slotName
    ? slots
        .filter((slot) => slot.name === slotName)
        .some((slot) => slot.assignedElements(config).length > 0)
    : slots.some((slot) => slot.assignedElements(config).length > 0);
}

/* blazorSuppress */
/**
 * @element - igc-validator
 *
 * @csspart helper-text - The base wrapper
 * @csspart validation-message - The validation error message container
 * @csspart validation-icon - The validation error icon
 */
export default class IgcValidationContainerComponent extends LitElement {
  public static readonly tagName = 'igc-validator';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcValidationContainerComponent, IgcIconComponent);
  }

  public static create(
    host: IgcFormControl,
    config: ValidationContainerConfig = {
      id: 'helper-text',
      hasHelperText: true,
    }
  ): TemplateResult {
    /// XXX: Yeah, don't like this
    const renderer = IgcValidationContainerComponent.prototype;
    return html`
      <igc-validator
        id=${ifDefined(config.id)}
        part=${ifDefined(config.part)}
        slot=${ifDefined(config.slot)}
        .target=${host}
        ?invalid=${host.invalid}
        exportparts="helper-text validation-message validation-icon"
      >
        ${config.hasHelperText
          ? html`<slot name="helper-text" slot="helper-text"></slot>`
          : nothing}
        ${renderer.renderValidationSlots(host.validity, true)}
      </igc-validator>
    `;
  }

  private _target!: IgcFormControl;

  @state()
  private _hasSlottedContent = false;

  @property({ type: Boolean })
  public invalid = false;

  @property({ attribute: false })
  public set target(value: IgcFormControl) {
    if (this._target === value) {
      return;
    }

    this._target?.removeEventListener('invalid', this);
    this._target = value;
    this._target.addEventListener('invalid', this);
  }

  public get target() {
    return this._target;
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', this);
    return root;
  }

  public handleEvent({ type }: Event) {
    const isInvalid = type === 'invalid';
    const isSlotChange = type === 'slotchange';

    if (isInvalid || isSlotChange) {
      this.invalid = isInvalid ? true : this.invalid;
      this._hasSlottedContent = hasProjectedValidation(this);
    }

    this.requestUpdate();
  }

  protected renderValidationMessage(slotName: string) {
    const icon = hasProjectedValidation(this, slotName)
      ? html`
          <igc-icon
            aria-hidden="true"
            name="validation_error"
            collection="default"
            part="validation-icon"
          ></igc-icon>
        `
      : null;

    const parts = partNameMap({
      'validation-message': true,
      empty: !icon,
    });

    return html`
      <div part=${parts}>
        ${icon}
        <slot name=${slotName}></slot>
      </div>
    `;
  }

  protected *renderValidationSlots(validity: ValidityState, projected = false) {
    for (const key in validity) {
      if (key === 'valid' && !validity[key]) {
        yield projected
          ? html`<slot name="invalid" slot="invalid"></slot>`
          : html`<slot name="invalid"></slot>`;
      } else if (validity[key as keyof ValidityState]) {
        const name = toKebabCase(key);

        yield projected
          ? html`<slot name=${name} slot=${name}></slot>`
          : this.renderValidationMessage(name);
      }
    }
  }

  protected renderHelper() {
    return this.invalid && this._hasSlottedContent
      ? nothing
      : html`<slot name="helper-text"></slot>`;
  }

  protected override render() {
    return html`
      <div part="helper-text">
        ${this.invalid
          ? this.renderValidationSlots(this.target.validity)
          : nothing}
        ${this.renderHelper()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-validator': IgcValidationContainerComponent;
  }
}

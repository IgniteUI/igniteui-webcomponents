import { LitElement, type TemplateResult, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import type { IgcFormControl } from '../common/mixins/forms/types.js';
import { partMap } from '../common/part-map.js';
import { isEmpty, toKebabCase } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import { styles as shared } from './themes/shared/validator.common.css.js';
import { all } from './themes/themes.js';
import { styles } from './themes/validator.base.css.js';

interface ValidationContainerConfig {
  /** The id attribute for the validation container. */
  id?: string;
  /** Project the validation container to the given slot inside the host shadow DOM. */
  slot?: string;
  /** Additional part(s) that should be bound to the validation container. */
  part?: string;
  /** Whether the validation container should expose a helper-text slot. */
  hasHelperText?: boolean;
}

function getValidationSlots(element: IgcValidationContainerComponent) {
  return element.renderRoot.querySelectorAll<HTMLSlotElement>(
    "slot:not([name='helper-text'])"
  );
}

function hasProjection(element: IgcValidationContainerComponent) {
  return Array.from(
    element.renderRoot.querySelectorAll<HTMLSlotElement>('slot')
  ).every((slot) => isEmpty(slot.assignedElements({ flatten: true })));
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
 * @element igc-validator
 *
 * @csspart helper-text - The base wrapper
 * @csspart validation-message - The validation error message container
 * @csspart validation-icon - The validation error icon
 */
@themes(all)
export default class IgcValidationContainerComponent extends LitElement {
  public static readonly tagName = 'igc-validator';
  public static override styles = [styles, shared];

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
    const { renderValidationSlots } = IgcValidationContainerComponent.prototype;
    const helperText = config.hasHelperText
      ? html`<slot name="helper-text" slot="helper-text"></slot>`
      : null;

    return html`
      <igc-validator
        id=${ifDefined(config.id)}
        part=${ifDefined(config.part)}
        slot=${ifDefined(config.slot)}
        .target=${host}
        ?invalid=${host.invalid}
        exportparts="helper-text validation-message validation-icon"
      >
        ${helperText}${renderValidationSlots(host.validity, true)}
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
            name="error"
            collection="default"
            part="validation-icon"
          ></igc-icon>
        `
      : null;

    return html`
      <div part=${partMap({ 'validation-message': true, empty: !icon })}>
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
          : this.renderValidationMessage('invalid');
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
      <div part=${partMap({ 'helper-text': true, empty: hasProjection(this) })}>
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

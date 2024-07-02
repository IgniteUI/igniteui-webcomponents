import { LitElement, type TemplateResult, css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerComponent } from '../common/definitions/register.js';
import type { FormAssociatedElementInterface } from '../common/mixins/form-associated.js';
import { toKebabCase } from '../common/util.js';

type IgcFormControl = LitElement & FormAssociatedElementInterface;

interface ValidationContainerConfig {
  id?: string;
  slot?: string;
  part?: string;
  hasHelperText?: boolean;
}

function getSlots(element: LitElement) {
  return element.renderRoot.querySelectorAll<HTMLSlotElement>(
    "slot:not([name='helper-text'])"
  );
}

function* renderValidationSlots(validity: ValidityState, projected = false) {
  for (const key in validity) {
    if (key === 'valid' && !validity[key]) {
      yield projected
        ? html`<slot name="invalid" slot="invalid"></slot>`
        : html`<slot name="invalid"></slot>`;
    } else if (validity[key as keyof ValidityState]) {
      const name = toKebabCase(key);
      yield projected
        ? html`<slot name=${name} slot=${name}></slot>`
        : html`<slot name=${name}></slot>`;
    }
  }
}

/* blazorSuppress */
/**
 * @element - igc-validator
 */
export default class IgcValidationContainerComponent extends LitElement {
  public static readonly tagName = 'igc-validator';

  public static override styles = css`
    :host {
      display: contents;
    }
  `;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcValidationContainerComponent);
  }

  public static create(
    host: IgcFormControl,
    config: ValidationContainerConfig = {
      id: 'helper-text',
      hasHelperText: true,
    }
  ): TemplateResult {
    return html`
      <igc-validator
        id=${ifDefined(config.id)}
        part=${ifDefined(config.part)}
        slot=${ifDefined(config.slot)}
        .target=${host}
        ?invalid=${host.invalid}
        exportparts="helper-text"
      >
        ${config.hasHelperText
          ? html`<slot name="helper-text" slot="helper-text"></slot>`
          : nothing}
        ${renderValidationSlots(host.validity, true)}
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

  private hasSlottedElements() {
    const slots = getSlots(this);

    for (const slot of slots) {
      if (slot.assignedElements({ flatten: true }).length > 0) {
        return true;
      }
    }

    return false;
  }

  public handleEvent(event: Event) {
    if (event.type === 'slotchange') {
      this._hasSlottedContent = this.hasSlottedElements();
    }

    if (event.type === 'invalid') {
      this.invalid = true;
      this._hasSlottedContent = this.hasSlottedElements();
    }

    this.requestUpdate();
  }

  protected renderHelper() {
    return this.invalid && this._hasSlottedContent
      ? nothing
      : html`<slot name="helper-text"></slot>`;
  }

  protected override render() {
    return html`
      <div part="helper-text">
        ${this.invalid ? renderValidationSlots(this.target.validity) : nothing}
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

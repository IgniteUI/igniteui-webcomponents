import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { createAbortHandle } from '../common/abort-handler.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  type IgcFormControl,
  InternalInvalidEvent,
  InternalResetEvent,
} from '../common/mixins/forms/types.js';
import { partMap } from '../common/part-map.js';
import { isEmpty, toKebabCase } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import { styles as shared } from './themes/shared/validator.common.css.js';
import { all } from './themes/themes.js';
import { styles } from './themes/validator.base.css.js';

/** Configuration for the validation container. */
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

const VALIDATION_SLOTS_SELECTOR = 'slot:not([name="helper-text"])';
const ALL_SLOTS_SELECTOR = 'slot';
const QUERY_CONFIG: AssignedNodesOptions = { flatten: true };

function getValidationSlots(
  element: IgcValidationContainerComponent
): NodeListOf<HTMLSlotElement> {
  return element.renderRoot.querySelectorAll<HTMLSlotElement>(
    VALIDATION_SLOTS_SELECTOR
  );
}

function hasProjection(element: IgcValidationContainerComponent): boolean {
  const allSlots =
    element.renderRoot.querySelectorAll<HTMLSlotElement>(ALL_SLOTS_SELECTOR);
  return Array.from(allSlots).every((slot) =>
    isEmpty(slot.assignedElements(QUERY_CONFIG))
  );
}

function hasProjectedValidation(
  element: IgcValidationContainerComponent,
  slotName?: string
): boolean {
  const slots = Array.from(getValidationSlots(element));

  if (slotName) {
    return slots
      .filter((slot) => slot.name === slotName)
      .some((slot) => !isEmpty(slot.assignedElements(QUERY_CONFIG)));
  }

  return slots.some((slot) => !isEmpty(slot.assignedElements(QUERY_CONFIG)));
}

/* blazorSuppress */
/**
 * @element igc-validator
 *
 * @csspart helper-text - The base wrapper
 * @csspart validation-message - The validation error message container
 * @csspart validation-icon - The validation error icon
 */
export default class IgcValidationContainerComponent extends LitElement {
  public static readonly tagName = 'igc-validator';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcValidationContainerComponent, IgcIconComponent);
  }

  public static create(
    host: IgcFormControl,
    config: ValidationContainerConfig = {
      id: 'helper-text',
      hasHelperText: true,
    }
  ): TemplateResult {
    const helperText = config.hasHelperText
      ? html`<slot name="helper-text" slot="helper-text"></slot>`
      : nothing;

    const validationSlots =
      IgcValidationContainerComponent.prototype._renderValidationSlots(
        host.validity,
        true
      );

    return html`
      <igc-validator
        id=${ifDefined(config.id)}
        part=${ifDefined(config.part)}
        slot=${ifDefined(config.slot)}
        ?invalid=${host.invalid}
        .target=${host}
        exportparts="helper-text validation-message validation-icon"
      >
        ${helperText}${validationSlots}
      </igc-validator>
    `;
  }

  private readonly _abortHandle = createAbortHandle();

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

    this._abortHandle.abort();
    const { signal } = this._abortHandle;

    this._target = value;
    this._target.addEventListener(InternalInvalidEvent, this, { signal });
    this._target.addEventListener(InternalResetEvent, this, { signal });
  }

  public get target(): IgcFormControl {
    return this._target;
  }

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', this);
    return root;
  }

  /** @internal */
  public handleEvent(event: Event): void {
    switch (event.type) {
      case InternalInvalidEvent:
        this.invalid = true;
        break;
      case InternalResetEvent:
        this.invalid = false;
        break;
      case 'slotchange': {
        const newHasSlottedContent = hasProjectedValidation(this);
        if (this._hasSlottedContent !== newHasSlottedContent) {
          this._hasSlottedContent = newHasSlottedContent;
        }
        break;
      }
    }

    this.requestUpdate();
  }

  protected _renderValidationMessage(slotName: string): TemplateResult {
    const hasProjectedIcon = hasProjectedValidation(this, slotName);
    const parts = { 'validation-message': true, empty: !hasProjectedIcon };
    const icon = hasProjectedIcon
      ? html`
          <igc-icon
            aria-hidden="true"
            name="error"
            part="validation-icon"
          ></igc-icon>
        `
      : nothing;

    return html`
      <div part=${partMap(parts)}>
        ${icon}
        <slot name=${slotName}></slot>
      </div>
    `;
  }

  protected *_renderValidationSlots(
    validity: ValidityState,
    projected = false
  ): Generator<TemplateResult> {
    if (!validity.valid) {
      yield projected
        ? html`<slot name="invalid" slot="invalid"></slot>`
        : this._renderValidationMessage('invalid');
    }

    for (const key in validity) {
      if (key !== 'valid' && validity[key as keyof ValidityState]) {
        const name = toKebabCase(key);
        yield projected
          ? html`<slot name=${name} slot=${name}></slot>`
          : this._renderValidationMessage(name);
      }
    }
  }

  protected _renderHelper(): TemplateResult | typeof nothing {
    return this.invalid && this._hasSlottedContent
      ? nothing
      : html`<slot name="helper-text"></slot>`;
  }

  protected override render(): TemplateResult {
    const slots = cache(
      this.invalid ? this._renderValidationSlots(this.target.validity) : nothing
    );

    return html`
      <div part=${partMap({ 'helper-text': true, empty: hasProjection(this) })}>
        ${slots}${this._renderHelper()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-validator': IgcValidationContainerComponent;
  }
}

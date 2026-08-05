import { html, isServer, LitElement, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
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
import { all as inputThemes } from '../input/themes/themes.js';
import { styles as shared } from './themes/shared/validator.common.css.js';
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

const ALL_SLOTS_SELECTOR = 'slot';
const QUERY_CONFIG: AssignedNodesOptions = { flatten: true };

/**
 * Validity flags rendered as validation message slots, in a stable order so the
 * generated slots are deterministic across browsers.
 */
const VALIDITY_KEYS: ReadonlyArray<keyof ValidityStateFlags> = [
  'badInput',
  'customError',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valueMissing',
];

/**
 * Yields the active validation slot names for the given validity state, in a
 * stable order (`invalid` first, then each failing constraint).
 */
function* activeValidationSlots(validity: ValidityState): Generator<string> {
  if (!validity.valid) {
    yield 'invalid';
  }

  for (const key of VALIDITY_KEYS) {
    if (validity[key]) {
      yield toKebabCase(key);
    }
  }
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

  /**
   * Creates a validation container for the given form control.
   *
   * The container will render validation messages based on the control's validity state
   * and projected content, and reflect the control's `invalid` state.
   */
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

    // `hasUpdated` is false during SSR and the host's hydrating render, so both
    // emit `nothing`. The real validation slots are projected post-hydration.
    const validationSlots = host.hasUpdated
      ? Iterator.from(activeValidationSlots(host.validity))
          .map((name) => html`<slot name=${name} slot=${name}></slot>`)
          .toArray()
      : nothing;

    return html`
      <igc-validator
        id=${ifDefined(config.id)}
        part=${ifDefined(config.part)}
        slot=${ifDefined(config.slot)}
        ?invalid=${host.invalid}
        .target=${host}
        exportparts="helper-text, validation-message, validation-icon"
      >
        ${helperText}${validationSlots}
      </igc-validator>
    `;
  }

  private readonly _abortHandle = createAbortHandle();
  private _target!: IgcFormControl;

  /**
   * Whether the container is in an invalid state.
   *
   * This is reflected from the target's `invalid` property,
   * and is used to determine whether to render the validation message slots.
   */
  @property({ type: Boolean })
  public invalid = false;

  /**
   * The form control whose validity state is being rendered. The target's `invalid`
   * property is reflected to the container, and its validity state is used to
   * determine which validation message slots to render.
   *
   * @remarks The target must be set for the container to function, and should be
   * set before the first update cycle for SSR compatibility. When using the
   * `create` method, the target is set automatically.
   */
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
    addThemingController(this, inputThemes);
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
    }

    this.requestUpdate();
  }

  /**
   * Collects the projection state of the container slots in a single DOM pass.
   *
   * @returns Whether every slot is empty and the set of non-empty validation
   * slot names (i.e. excluding `helper-text`).
   */
  private _collectProjectedSlots(): {
    isProjectionEmpty: boolean;
    validation: Set<string>;
  } {
    const validation = new Set<string>();

    if (isServer || !this.hasUpdated) {
      return { isProjectionEmpty: false, validation };
    }

    const slots = Array.from(
      this.renderRoot.querySelectorAll<HTMLSlotElement>(ALL_SLOTS_SELECTOR)
    );
    let isProjectionEmpty = true;

    for (const slot of slots) {
      if (isEmpty(slot.assignedElements(QUERY_CONFIG))) {
        continue;
      }

      isProjectionEmpty = false;
      if (slot.name && slot.name !== 'helper-text') {
        validation.add(slot.name);
      }
    }

    return { isProjectionEmpty, validation };
  }

  protected _renderValidationMessage(
    slotName: string,
    projectedSlots: ReadonlySet<string>
  ): TemplateResult {
    const hasProjectedIcon = projectedSlots.has(slotName);
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

    return html`<div part=${partMap(parts)}>
      ${icon}<slot name=${slotName}></slot>
    </div>`;
  }

  protected _renderHelper(
    hasValidationProjection: boolean
  ): TemplateResult | typeof nothing {
    return this.invalid && hasValidationProjection
      ? nothing
      : html`<slot name="helper-text"></slot>`;
  }

  protected override firstUpdated(): void {
    // The first render is intentionally neutral to match the SSR output during
    // hydration. Only reconcile when the field hydrated in an invalid state, and
    // do it off the current update cycle so we don't schedule an update as a side
    // effect of the one in progress, projecting the real validation messages now
    // that `hasUpdated` is true.
    if (this.invalid) {
      queueMicrotask(() => this.requestUpdate());
    }
  }

  protected override render(): TemplateResult {
    const { isProjectionEmpty, validation } = this._collectProjectedSlots();
    const messages =
      this.hasUpdated && this.invalid
        ? Iterator.from(activeValidationSlots(this.target.validity))
            .map((name) => this._renderValidationMessage(name, validation))
            .toArray()
        : nothing;

    return html`
      <div
        part=${partMap({ 'helper-text': true, empty: isProjectionEmpty })}
        aria-live="polite"
      >
        ${messages}${this._renderHelper(!isEmpty(validation))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-validator': IgcValidationContainerComponent;
  }
}

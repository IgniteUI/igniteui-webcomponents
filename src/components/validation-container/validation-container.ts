import { html, isServer, LitElement, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createAbortHandle } from '#internals/abort-handler.js';
import { registerComponent } from '#internals/definitions/register.js';
import {
  type IgcFormControl,
  InternalInvalidEvent,
  InternalResetEvent,
} from '#internals/mixins/forms/types.js';
import { partMap } from '#internals/part-map.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { toKebabCase } from '#internals/utils/strings.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcIconComponent from '../icon/icon.js';
import { all as inputThemes } from '../input/themes/themes.js';
import { styles as shared } from './themes/shared/validator.common.css.js';
import { styles } from './themes/validator.base.css.js';

/** Configuration for the validation container. */
export interface ValidationContainerConfig {
  /** The id attribute for the validation container. */
  id?: string;
  /** Project the validation container to the given slot inside the host shadow DOM. */
  slot?: string;
  /** Additional part(s) that should be bound to the validation container. */
  part?: string;
  /** Whether the validation container should expose a helper-text slot. */
  hasHelperText?: boolean;
}

/**
 * Validity flags and their slot names, in a stable order so the generated slots
 * are deterministic across browsers.
 */
const VALIDITY_SLOTS: ReadonlyArray<
  readonly [keyof ValidityStateFlags, string]
> = (
  [
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
  ] as const
).map((key) => [key, toKebabCase(key)] as const);

/**
 * Yields the active validation slot names for the given validity state:
 * `invalid` first, then each failing constraint.
 */
function* activeValidationSlots(validity: ValidityState): Generator<string> {
  if (!validity.valid) {
    yield 'invalid';
  }

  for (const [key, slot] of VALIDITY_SLOTS) {
    if (validity[key]) {
      yield slot;
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

    // `hasUpdated` is false during SSR and the hydrating render, so both emit
    // `nothing` and the slots are projected on the next host render (see
    // `firstUpdated` in the container).
    const validationSlots = host.hasUpdated
      ? Iterator.from(activeValidationSlots(host.validity))
          .map((name) => html`<slot name=${name} slot=${name}></slot>`)
          .toArray()
      : nothing;

    // `?invalid` tracks host re-renders; the internal invalid/reset events cover
    // a form reset, which restores the value without re-rendering the host.
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
   * The form control whose validity state is rendered.
   *
   * @remarks Must be set before the first update for SSR compatibility;
   * `create` sets it automatically.
   */
  @property({ attribute: false })
  public set target(value: IgcFormControl) {
    if (this._target === value) {
      return;
    }

    // Listeners are not removed on disconnect: the container lives in the
    // target's shadow root and shares its lifetime.
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
   * Collects which slots have assigned content.
   *
   * @remarks Reads the shadow DOM from the previous commit. On the render where
   * `invalid` flips on, the message slots do not exist yet, so every message is
   * `empty`; their `slotchange` schedules a second render before paint.
   */
  private _collectProjectedSlots(): {
    isProjectionEmpty: boolean;
    validation: Set<string>;
  } {
    const validation = new Set<string>();

    if (isServer || !this.hasUpdated) {
      return { isProjectionEmpty: false, validation };
    }

    let isProjectionEmpty = true;

    for (const slot of this.renderRoot.querySelectorAll('slot')) {
      if (isEmpty(slot.assignedElements({ flatten: true }))) {
        continue;
      }

      isProjectionEmpty = false;
      if (slot.name !== 'helper-text') {
        validation.add(slot.name);
      }
    }

    return { isProjectionEmpty, validation };
  }

  private _renderValidationMessage(
    slotName: string,
    projectedSlots: ReadonlySet<string>
  ): TemplateResult {
    const hasProjectedContent = projectedSlots.has(slotName);
    const parts = { 'validation-message': true, empty: !hasProjectedContent };
    const icon = hasProjectedContent
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

  private _renderHelper(
    projectedSlots: ReadonlySet<string>
  ): TemplateResult | typeof nothing {
    return this.invalid && projectedSlots.size > 0
      ? nothing
      : html`<slot name="helper-text"></slot>`;
  }

  protected override firstUpdated(): void {
    // `create` omits the validation slots until the host has updated. If the
    // host hydrated invalid, ask it to re-render so the slots are projected;
    // their `slotchange` then updates this container.
    if (this.invalid) {
      this.target.requestUpdate();
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
        ${messages}${this._renderHelper(validation)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-validator': IgcValidationContainerComponent;
  }
}

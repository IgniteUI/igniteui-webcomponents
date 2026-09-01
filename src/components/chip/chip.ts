import {
  ChipResourceStringsEN,
  type IChipResourceStrings,
} from 'igniteui-i18n-core';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { addKeybindings } from '#internals/controllers/key-bindings.js';
import {
  addSlotController,
  type InferSlotNames,
  setSlots,
} from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { I18nControllerConfig } from '#internals/i18n/i18n-controller.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { renderSlottedIcon } from '#internals/templates/slotted-icon.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcIconComponent from '../icon/icon.js';
import type { StyleVariant } from '../types.js';
import { styles } from './themes/chip.base.css.js';
import { styles as shared } from './themes/shared/chip.common.css.js';
import { all } from './themes/themes.js';

export interface IgcChipComponentEventMap {
  igcRemove: CustomEvent<void>;
  igcSelect: CustomEvent<boolean>;
}

const Slots = setSlots('start', 'prefix', 'suffix', 'end');

const i18n: I18nControllerConfig<IChipResourceStrings> = {
  defaultEN: ChipResourceStringsEN,
};

/**
 * Chips help people enter information, make selections, filter content, or trigger actions.
 *
 * @element igc-chip
 *
 * @slot - Renders content in the default slot of the chip.
 * @slot prefix - Renders content at the start of the chip, before the default content.
 * @slot start - Renders content at the start of the chip, before the prefix content.
 * @slot suffix - Renders content at the end of the chip after the default content.
 * @slot end - Renders content at the end of the chip, before the suffix content.
 * @slot select - Content to render when the chip in selected state.
 * @slot remove - Content to override the default remove chip icon.
 *
 * @fires igcRemove - Emits an event when the chip component is removed.
 * @fires igcSelect - Emits event when the chip component is selected/deselected and any related animations and transitions also end.
 *
 * @csspart base - The base wrapper of the chip.
 * @csspart action - The selection control of the chip, wrapping the chip content.
 * @csspart content - The wrapper element around the default slot of the chip.
 * @csspart prefix - The prefix container of the chip.
 * @csspart suffix - The suffix container of the chip.
 * @csspart remove - The container of the remove control of the chip.
 */
export default class IgcChipComponent extends I18nMixin(
  EventEmitterMixin<IgcChipComponentEventMap, Constructor<LitElement>>(
    LitElement
  ),
  i18n
) {
  public static readonly tagName = 'igc-chip';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcChipComponent, IgcIconComponent);
  }

  private readonly _removePartRef = createRef<HTMLSlotElement>();
  private readonly _slots = addSlotController(this, { slots: Slots });

  /**
   * Whether the chip is disabled or not.
   *
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Whether the chip is removable or not.
   *
   * @attr removable
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public removable = false;

  /**
   * Whether the chip is outlined or not.
   *
   * @attr outlined
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * Whether the chip is selectable or not.
   *
   * @attr selectable
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public selectable = false;

  /* @tsTwoWayProperty(true, "igcSelect", "detail", false) */
  /**
   * Whether the chip is selected or not.
   *
   * @attr selected
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * A property that sets the color variant of the chip component.
   *
   * @attr variant
   */
  @property({ reflect: true })
  public variant?: StyleVariant;

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      ref: this._removePartRef,
      skip: () => !this._removePartRef.value,
      bindingDefaults: { triggers: ['keyup'] },
    }).setActivateHandler(this._handleRemove);
  }

  private _hasSlotted(...slots: InferSlotNames<typeof Slots>[]): boolean {
    return slots.some((slot) => this._slots.hasAssignedElements(slot));
  }

  protected _handleSelect(): void {
    if (this.selectable) {
      this.selected = !this.selected;
      this.emitEvent('igcSelect', { detail: this.selected });
    }
  }

  protected _handleRemove(event: Event): void {
    event.stopPropagation();
    this.emitEvent('igcRemove');
  }

  protected _renderPrefix() {
    const showSelected = this.selectable && this.selected;

    return html`
      <span
        part="prefix"
        ?hidden=${!showSelected && !this._hasSlotted('start', 'prefix')}
      >
        ${
          showSelected
            ? renderSlottedIcon({ slot: 'select', icon: 'selected' })
            : nothing
        }
        <slot name="start"></slot>
        <slot name="prefix"></slot>
      </span>
    `;
  }

  protected _renderSuffix() {
    return html`
      <span part="suffix" ?hidden=${!this._hasSlotted('end', 'suffix')}>
        <slot name="end"></slot>
        <slot name="suffix"></slot>
      </span>
    `;
  }

  protected _renderRemove() {
    if (!this.removable || this.disabled) {
      return nothing;
    }

    return html`
      <span part="remove">
        <slot
          ${ref(this._removePartRef)}
          name="remove"
          @click=${this._handleRemove}
        >
          <igc-icon
            name="remove"
            collection="default"
            tabindex="0"
            role="button"
            aria-label=${this.resourceStrings.chip_remove}
          ></igc-icon>
        </slot>
      </span>
    `;
  }

  protected override render() {
    const ariaPressed = this.selectable ? this.selected.toString() : null;

    return html`
      <div part="base">
        <button
          part="action"
          type="button"
          .ariaPressed=${ariaPressed}
          ?disabled=${this.disabled}
          @click=${this._handleSelect}
        >
          ${this._renderPrefix()}
          <span part="content">
            <slot></slot>
          </span>
          ${this._renderSuffix()}
        </button>
        ${this._renderRemove()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chip': IgcChipComponent;
  }
}

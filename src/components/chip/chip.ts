import { ChipResourceStringsEN } from 'igniteui-i18n-core';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  ariaBindings,
  hostAria,
} from '#internals/controllers/aria-projection.js';
import { addKeybindings } from '#internals/controllers/key-bindings.js';
import {
  addSlotController,
  type InferSlotNames,
  setSlots,
} from '#internals/controllers/slot.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { renderSlottedIcon } from '#internals/templates/slotted-icon.js';
import { all } from '#themes/chip/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconComponent from '../icon/icon.js';
import type { StyleVariant } from '../types.js';
import { styles } from './themes/chip.base.css.js';
import { styles as shared } from './themes/shared/chip.common.css.js';

export interface IgcChipComponentEventMap {
  igcRemove: CustomEvent<void>;
  igcSelect: CustomEvent<boolean>;
}

const Slots = setSlots('start', 'prefix', 'suffix', 'end');

const i18n = {
  defaultEN: ChipResourceStringsEN,
};

/**
 * Chips help people enter information, make selections, filter content, or trigger actions.
 *
 * @element igc-chip
 *
 * @slot - Renders the label of the chip.
 * @slot prefix - Renders content at the start of the chip, before the default content.
 * @slot start - Renders content at the start of the chip, before the prefix content.
 * @slot suffix - Renders content at the end of the chip after the default content.
 * @slot end - Renders content at the end of the chip, after the suffix content.
 * @slot select - Renders content while a selectable chip is selected. It replaces the default selected icon.
 * @slot remove - Renders content that replaces the default remove icon.
 *
 * @fires igcRemove - Emitted when the user activates the remove control. The chip does not remove itself.
 * @fires igcSelect - Emitted when the user selects or deselects the chip. The detail is the new selected state.
 *
 * @csspart base - The base wrapper of the chip.
 * @csspart action - The selection control of the chip, wrapping the chip content.
 * @csspart content - The wrapper element around the default slot of the chip.
 * @csspart prefix - The prefix container of the chip.
 * @csspart suffix - The suffix container of the chip.
 * @csspart remove - The container of the remove control of the chip.
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcChipComponent extends I18nMixin(
  EventEmitterMixin<IgcChipComponentEventMap>(HostAriaMixin(LitElement)),
  i18n
) {
  public static readonly tagName = 'igc-chip';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcChipComponent, IgcIconComponent);
  }

  private readonly _removePartRef = createRef<HTMLSlotElement>();
  private readonly _slots = addSlotController(this, { slots: Slots });

  /**
   * Whether the chip is disabled.
   *
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Whether the chip shows a remove control. A disabled chip hides it.
   *
   * @attr removable
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public removable = false;

  /**
   * Whether the chip is outlined.
   *
   * @attr outlined
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public outlined = false;

  /**
   * Whether the chip can be selected.
   *
   * @attr selectable
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public selectable = false;

  /* @tsTwoWayProperty(true, "igcSelect", "detail", false) */
  /**
   * Whether the chip is selected.
   *
   * @attr selected
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * The color variant of the chip.
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
        <slot name="suffix"></slot>
        <slot name="end"></slot>
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
          ${ariaBindings(hostAria(this))}
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

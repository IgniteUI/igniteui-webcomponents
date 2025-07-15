import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addKeybindings } from '../common/controllers/key-bindings.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import IgcIconComponent from '../icon/icon.js';
import type { StyleVariant } from '../types.js';
import { styles } from './themes/chip.base.css.js';
import { styles as shared } from './themes/shared/chip.common.css.js';
import { all } from './themes/themes.js';

export interface IgcChipComponentEventMap {
  igcRemove: CustomEvent<boolean>;
  igcSelect: CustomEvent<boolean>;
}

/**
 * Chips help people enter information, make selections, filter content, or trigger actions.
 *
 * @element igc-chip
 *
 * @slot - Renders content in the default slot of the chip.
 * @slot prefix - Renders content at the start of the chip, before the default content.
 * @slot suffix - Renders content at the end of the chip after the default content.
 * @slot select - Content to render when the chip in selected state.
 * @slot remove - Content to override the default remove chip icon.
 *
 * @fires igcRemove - Emits an event when the chip component is removed. Returns the removed chip component.
 * @fires igcSelect - Emits event when the chip component is selected/deselected and any related animations and transitions also end.
 *
 * @csspart base - The base wrapper of the chip.
 * @csspart prefix - The prefix container of the chip.
 * @csspart suffix - The suffix container of the chip.
 */
export default class IgcChipComponent extends EventEmitterMixin<
  IgcChipComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-chip';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcChipComponent, IgcIconComponent);
  }

  private readonly _removePartRef = createRef<HTMLSlotElement>();

  private readonly _slots = addSlotController(this, {
    slots: setSlots('prefix', 'suffix', 'start', 'end', 'select', 'remove'),
  });

  /**
   * Sets the disabled state for the chip.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Defines if the chip is removable or not.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public removable = false;

  /**
   * Defines if the chip is selectable or not.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public selectable = false;

  /* @tsTwoWayProperty(true, "igcSelect", "detail", false) */
  /**
   * Defines if the chip is selected or not.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * A property that sets the color variant of the chip component.
   * @attr
   */
  @property({ reflect: true })
  public variant!: StyleVariant;

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      ref: this._removePartRef,
      bindingDefaults: { triggers: ['keyup'] },
    }).setActivateHandler(this._handleRemove);
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
    const isVisible =
      this._slots.hasAssignedElements('prefix') ||
      this._slots.hasAssignedElements('start');

    const selectSlot =
      this.selectable && this.selected
        ? html`
            <slot name="select">
              <igc-icon name="selected" collection="default"></igc-icon>
            </slot>
          `
        : nothing;

    return html`
      <span part="prefix" ?hidden=${!isVisible && !this.selected}>
        ${selectSlot}
        <slot name="start"></slot>
        <slot name="prefix"></slot>
      </span>
    `;
  }

  protected _renderSuffix() {
    const isVisible =
      this._slots.hasAssignedElements('suffix') ||
      this._slots.hasAssignedElements('end');

    const removeSlot =
      this.removable && !this.disabled
        ? html`
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
                aria-label="Remove"
              ></igc-icon>
            </slot>
          `
        : nothing;

    return html`
      <span part="suffix" ?hidden=${!isVisible && !this.removable}>
        <slot name="end"></slot>
        <slot name="suffix"></slot>
        ${removeSlot}
      </span>
    `;
  }

  protected override render() {
    const ariaPressed = this.selectable ? this.selected.toString() : null;

    return html`
      <button
        part="base"
        .ariaPressed=${ariaPressed}
        ?disabled=${this.disabled}
        @click=${this._handleSelect}
      >
        ${this._renderPrefix()}
        <slot></slot>
        ${this._renderSuffix()}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chip': IgcChipComponent;
  }
}

import { html, LitElement, nothing } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { addKeybindings } from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { isEmpty } from '../common/util.js';
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
 * @slot - Renders the chip data.
 * @slot prefix - Renders content before the data of the chip.
 * @slot suffix - Renders content after the data of the chip.
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
  public static register() {
    registerComponent(IgcChipComponent, IgcIconComponent);
  }

  private _removePartRef: Ref<HTMLSlotElement> = createRef();

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

  @queryAssignedElements({ slot: 'prefix' })
  protected prefixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'start' })
  protected contentStart!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  protected suffixes!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'end' })
  protected contentEnd!: Array<HTMLElement>;

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      ref: this._removePartRef,
      bindingDefaults: { triggers: ['keyup'] },
    }).setActivateHandler(this.handleRemove);
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  protected handleSelect() {
    if (this.selectable) {
      this.selected = !this.selected;
      this.emitEvent('igcSelect', { detail: this.selected });
    }
  }

  protected handleRemove(e: Event) {
    this.emitEvent('igcRemove');
    e.stopPropagation();
  }

  protected override render() {
    return html`
      <button
        part="base"
        .disabled=${this.disabled}
        aria-selected=${this.selected}
        aria-disabled=${this.disabled}
        @click=${this.handleSelect}
      >
        <span
          part="prefix"
          .hidden=${isEmpty(this.prefixes) &&
          isEmpty(this.contentStart) &&
          !this.selected}
        >
          ${this.selectable && this.selected
            ? html`<slot name="select">
                <igc-icon name="selected" collection="default"></igc-icon>
              </slot>`
            : nothing}
          <slot name="start"></slot>
          <slot name="prefix"></slot>
        </span>
        <slot></slot>
        <span
          part="suffix"
          .hidden=${isEmpty(this.suffixes) &&
          isEmpty(this.contentEnd) &&
          !this.removable}
        >
          <slot name="end"></slot>
          <slot name="suffix"></slot>
          ${this.removable && !this.disabled
            ? html`<slot
                ${ref(this._removePartRef)}
                @click=${this.handleRemove}
                name="remove"
              >
                <igc-icon
                  name="remove"
                  collection="default"
                  tabindex="0"
                  role="button"
                  aria-label="remove"
                ></igc-icon>
              </slot>`
            : nothing}
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chip': IgcChipComponent;
  }
}

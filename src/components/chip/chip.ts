import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './themes/chip.material.css';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { blazorTwoWayBind } from '../common/decorators';
import { ifDefined } from 'lit/directives/if-defined.js';

export interface IgcChipEventMap {
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
  IgcChipEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-chip';

  public static styles = [styles];

  /** Sets the disabled state for the chip. */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** 	Defines if the chip is removable or not. */
  @property({ type: Boolean, reflect: true })
  public removable = false;

  /**	Defines if the chip is selectable or not. */
  @property({ type: Boolean, reflect: true })
  public selectable = false;

  /**	Defines if the chip is selected or not. */
  @property({ type: Boolean, reflect: true })
  @blazorTwoWayBind('igcSelected', 'detail')
  public selected = false;

  /** A property that sets the size of the chip component. */
  @property({ reflect: true })
  public size: 'small' | 'medium' | 'large' = 'medium';

  /** A property that sets the color variant of the chip component. */
  @property({ reflect: true })
  public variant!:
    | 'none'
    | 'primary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info';

  protected handleSelect() {
    if (this.selectable) {
      this.selected = !this.selected;
      this.emitEvent('igcSelect', { detail: this.selected });
      console.log('igcSelect');
    }
  }

  protected handleRemove(e: Event) {
    document.getElementsByName('remove');
    this.emitEvent('igcRemove');
    console.log('igcRemove');
    e.stopPropagation();
  }

  protected override render() {
    return html`
      <button
        part="base"
        .disabled="${this.disabled}"
        variant="${ifDefined(this.variant)}"
        aria-selected="${this.selected ? 'true' : 'false'}"
        aria-disabled="${this.disabled ? 'true' : 'false'}"
        @click=${this.handleSelect}
      >
        <span part="prefix">
          ${this.selectable && this.selected
            ? html`<slot @slotchange=${this.slotChanges} name="select">
                <igc-icon size=${this.size} name="select"></igc-icon>
              </slot>`
            : ''}
          <slot name="start"></slot>
        </span>
        <slot></slot>
        <span part="suffix">
          <slot name="end"></slot>
          ${this.removable && !this.disabled
            ? html`<slot
                @slotchange=${this.slotChanges}
                @click=${this.handleRemove}
                name="remove"
              >
                <igc-icon size=${this.size} name="cancel"></igc-icon>
              </slot>`
            : ''}
        </span>
      </button>
    `;
  }

  protected slotChanges() {
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chip': IgcChipComponent;
  }
}

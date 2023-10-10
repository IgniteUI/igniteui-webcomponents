import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { blazorTwoWayBind } from '../common/decorators/blazorTwoWayBind.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { styles } from './themes/chip.base.css.js';
import { all } from './themes/themes.js';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcIconComponent from '../icon/icon.js';

defineComponents(IgcIconComponent);

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
@themes(all)
export default class IgcChipComponent extends SizableMixin(
  EventEmitterMixin<IgcChipEventMap, Constructor<LitElement>>(LitElement)
) {
  public static readonly tagName = 'igc-chip';

  public static styles = styles;

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

  /**
   * Defines if the chip is selected or not.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  @blazorTwoWayBind('igcSelect', 'detail')
  public selected = false;

  /**
   * A property that sets the color variant of the chip component.
   * @attr
   */
  @property({ reflect: true })
  public variant!: 'primary' | 'success' | 'danger' | 'warning' | 'info';

  constructor() {
    super();
    this.size = 'medium';
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

  protected handleKeyup(e: KeyboardEvent) {
    if (/\s|enter/i.test(e.key)) {
      this.handleRemove(e);
    }
  }

  protected override render() {
    return html`
      <button
        part="base"
        .disabled="${this.disabled}"
        aria-selected="${this.selected ? 'true' : 'false'}"
        aria-disabled="${this.disabled ? 'true' : 'false'}"
        @click=${this.handleSelect}
      >
        <span part="prefix">
          ${this.selectable && this.selected
            ? html`<slot @slotchange=${this.slotChanges} name="select">
                <igc-icon
                  size=${this.size}
                  name="chip_select"
                  collection="internal"
                ></igc-icon>
              </slot>`
            : nothing}
          <slot name="start"></slot>
          <slot name="prefix"></slot>
        </span>
        <slot></slot>
        <span part="suffix">
          <slot name="end"></slot>
          <slot name="suffix"></slot>
          ${this.removable && !this.disabled
            ? html`<slot
                @slotchange=${this.slotChanges}
                @click=${this.handleRemove}
                @keyup=${this.handleKeyup}
                name="remove"
              >
                <igc-icon
                  size=${this.size}
                  name="chip_cancel"
                  collection="internal"
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

  protected slotChanges() {
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chip': IgcChipComponent;
  }
}

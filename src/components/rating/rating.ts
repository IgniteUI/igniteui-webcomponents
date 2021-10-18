import { html, LitElement } from 'lit';
import { customElement, property, queryAll, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { SizableMixin } from '../common/mixins/sizable';
import IgcIconComponent from '../icon/icon';

export interface IgcRatingEventMap {
  igcChange: CustomEvent<void>;
}

/**
 * @element igc-rating
 *
 * @fires igcChange - Emitted when the value of the control changes.
 */
@customElement('igc-rating')
export default class igcRatingComponent extends SizableMixin(
  EventEmitterMixin<IgcRatingEventMap, Constructor<LitElement>>(LitElement)
) {
  @queryAll('igc-icon')
  protected icons!: NodeListOf<IgcIconComponent>;

  @state()
  protected hoverValue = -1;

  @state()
  protected hoverState = false;

  /**
   * The number of icons to render
   * @attr [length=5]
   * */
  @property({ type: Number })
  public length = 5;

  /** The unfilled symbol/icon to use */
  @property({ type: String })
  public icon = 'coronavirus';

  /** The filled symbol/icon to use */
  @property({ type: String })
  public filledIcon = 'diamond';

  /**
   * The current value of the component
   * @attr [value=0]
   */
  @property({ type: Number })
  public value = -1;

  /** Sets the disabled state of the component */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Sets hover preview behaviour for the component */
  @property({ type: Boolean, reflect: true })
  public hover = false;

  /** Sets the readonly state of the component */
  @property({ type: Boolean, reflect: true })
  public readonly = false;

  public render() {
    return this.hover
      ? html`
          <div
            part="base"
            tabindex=${ifDefined(this.readonly ? undefined : 0)}
            aria-valuemin="0"
            aria-valuenow=${this.value}
            aria-valuemax=${this.length}
            @mouseenter=${() => (this.hoverState = true)}
            @mouseleave=${() => (this.hoverState = false)}
            @mouseover=${this.handleMouseOver}
            @click=${this.handleClick}
          >
            ${this.renderIcons()}
          </div>
        `
      : html`
          <div
            part="base"
            tabindex=${ifDefined(this.readonly ? undefined : 0)}
            aria-valuemin="0"
            aria-valuenow=${this.value}
            aria-valuemax=${this.length}
            @click=${this.handleClick}
          >
            ${this.renderIcons()}
          </div>
        `;
  }

  protected *renderIcons() {
    for (let i = 0; i < this.length; i++) {
      yield html`<igc-icon
        .size=${this.size}
        .name=${this.bindValue(i)}
      ></igc-icon>`;
    }
  }

  protected handleClick(event: MouseEvent) {
    if (this.isIconElement(event.target) && !this.readonly) {
      this.value = [...this.icons].indexOf(event.target) + 1;
      this.emitEvent('igcChange');
    }
  }

  protected handleMouseOver(event: MouseEvent) {
    if (this.isIconElement(event.target) && !this.readonly) {
      this.hoverValue = [...this.icons].indexOf(event.target) + 1;
    }
  }

  private bindValue(index: number) {
    const value = this.hoverState ? this.hoverValue : this.value;
    return index < value ? this.filledIcon : this.icon;
  }

  private isIconElement(el: any): el is IgcIconComponent {
    return el.tagName.toLowerCase() === 'igc-icon';
  }
}

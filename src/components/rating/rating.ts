import { html, LitElement } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { SizableMixin } from '../common/mixins/sizable';
import IgcIconComponent from '../icon/icon';

export interface IgcRatingEventMap {
  igcChange: CustomEvent<number>;
}

/**
 * @element igc-rating
 *
 * @fires igcChange - Emitted when the value of the control changes.
 */
export default class igcRatingComponent extends SizableMixin(
  EventEmitterMixin<IgcRatingEventMap, Constructor<LitElement>>(LitElement)
) {
  /** @private */
  public static tagName = 'igc-rating';

  @queryAll('igc-icon')
  protected icons!: NodeListOf<IgcIconComponent>;

  @state()
  protected hoverValue = -1;

  @state()
  protected hoverState = false;

  protected navigationKeys = new Set([
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
  ]);

  /**
   * The number of icons to render
   * @attr [length=5]
   * */
  @property({ type: Number })
  public length = 5;

  /** The unfilled symbol/icon to use */
  @property()
  public icon = 'dollar-circled';

  /** The filled symbol/icon to use */
  @property()
  public filledIcon = 'apple';

  /** The name attribute of the control */
  @property()
  public name!: string;

  /** The label of the control. */
  @property()
  public label!: string;

  /**
   * The current value of the component
   * @attr [value=0]
   */
  @property({ type: Number })
  public value = -1;

  /** Sets the disabled state of the component */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Sets hover preview behavior for the component */
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
            aria-labelledby=${ifDefined(this.label)}
            aria-valuemin="0"
            aria-valuenow=${this.value}
            aria-valuemax=${this.length}
            @mouseenter=${() => (this.hoverState = true)}
            @mouseleave=${() => (this.hoverState = false)}
            @mouseover=${this.handleMouseOver}
            @keydown=${this.handleKeyDown}
            @click=${this.handleClick}
          >
            ${this.renderIcons()}
          </div>
        `
      : html`
          <div
            part="base"
            tabindex=${ifDefined(this.readonly ? undefined : 0)}
            aria-labelledby=${ifDefined(this.label)}
            aria-valuemin="0"
            aria-valuenow=${this.value}
            aria-valuemax=${this.length}
            @keydown=${this.handleKeyDown}
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
    if (this.isIconElement(event.target) && !(this.readonly || this.disabled)) {
      this.value = [...this.icons].indexOf(event.target) + 1;
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  protected handleMouseOver(event: MouseEvent) {
    if (this.isIconElement(event.target) && !(this.readonly || this.disabled)) {
      this.hoverValue = [...this.icons].indexOf(event.target) + 1;
    }
  }

  protected handleKeyDown(event: KeyboardEvent) {
    if (!this.navigationKeys.has(event.key)) {
      return;
    }
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        this.value += 1;
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        this.value -= 1;
        break;
      case 'Home':
        this.value = 1;
        break;
      case 'End':
        this.value = this.length;
        break;
      default:
        return;
    }
    this.emitEvent('igcChange', { detail: this.value });
  }

  private bindValue(index: number) {
    const value = this.hoverState ? this.hoverValue : this.value;
    return index < value ? this.filledIcon : this.icon;
  }

  private isIconElement(el: any): el is IgcIconComponent {
    return el.tagName.toLowerCase() === 'igc-icon';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-rating': igcRatingComponent;
  }
}

import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { EventEmitterMixin } from '../common//mixins/event-emitter.js';
import { alternateName, blazorSuppress } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { styles } from './button.material.css';

export interface IgcButtonEventMap {
  igcFocus: CustomEvent<void>;
  igcBlur: CustomEvent<void>;
}

export abstract class IgcButtonBaseComponent extends SizableMixin(
  EventEmitterMixin<IgcButtonEventMap, Constructor<LitElement>>(LitElement)
) {
  /**
   * @private
   */
  public static styles = [styles];

  /**
   * @private
   */
  @query('.native', true)
  private nativeElement!: HTMLElement;

  /**
   * Determines whether the button is disabled.
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Sets the variant of the button. */
  @property({ reflect: true })
  public variant: 'flat' | 'raised' | 'outlined' | 'fab' = 'flat';

  /** Sets focus in the button. */
  public focus(options?: FocusOptions) {
    this.nativeElement.focus(options);
  }

  /** Removes focus from the button. */
  public blur() {
    this.nativeElement.blur();
  }

  @alternateName('handleFocused')
  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  @alternateName('handleBlurred')
  protected handleBlur() {
    this.emitEvent('igcBlur');
  }

  protected get classes() {
    const { size, variant } = this;

    return {
      native: true,
      flat: variant === 'flat',
      outlined: variant === 'outlined',
      raised: variant === 'raised',
      fab: variant === 'fab',
      small: size === 'small',
      medium: size === 'medium',
      large: size === 'large',
      disabled: this.disabled,
    };
  }

  protected renderContent() {
    return html`
      <span part="prefix">
        <slot name="prefix"></slot>
      </span>
      <slot></slot>
      <span part="suffix">
        <slot name="suffix"></slot>
      </span>
    `;
  }
}

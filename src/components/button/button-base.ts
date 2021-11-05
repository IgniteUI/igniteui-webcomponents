import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { EventEmitterMixin } from '../common//mixins/event-emitter.js';
import { alternateName } from '../common/decorators';
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
   * The type of the button. Defaults to undefined.
   */
  @alternateName('displayType')
  @property()
  public type!: 'button' | 'reset' | 'submit';

  /** The URL the button points to. */
  @property()
  public href!: string;

  /** Prompts to save the linked URL instead of navigating to it. */
  @property()
  public download!: string;

  /** Where to display the linked URL, as the name for a browsing context. */
  @property()
  public target!: '_blank' | '_parent' | '_self' | '_top' | undefined;

  /**
   * The relationship of the linked URL.
   * See https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types
   */
  @property()
  public rel!: string;

  /**
   * Determines whether the button is disabled.
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Sets the variant of the button. */
  @property({ reflect: true })
  public variant: 'flat' | 'contained' | 'outlined' | 'fab' = 'flat';

  /** Sets focus in the button. */
  @alternateName('focusComponent')
  public focus(options?: FocusOptions) {
    this.nativeElement.focus(options);
  }

  /** Removes focus from the button. */
  @alternateName('blurComponent')
  public blur() {
    this.nativeElement.blur();
  }

  protected handleFocus() {
    this.emitEvent('igcFocus');
  }

  protected handleBlur() {
    this.emitEvent('igcBlur');
  }

  protected get classes() {
    const { size, variant } = this;

    return {
      native: true,
      flat: variant === 'flat',
      outlined: variant === 'outlined',
      contained: variant === 'contained',
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

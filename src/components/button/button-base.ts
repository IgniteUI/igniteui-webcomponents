import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { EventEmitterMixin } from '../common//mixins/event-emitter.js';
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
  static styles = [styles];

  /**
   * @private
   */
  @query('.native', true)
  nativeElement!: HTMLElement;

  /**
   * Determines whether the button is disabled.
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ reflect: true })
  variant: 'flat' | 'raised' | 'outlined' | 'fab' = 'flat';

  focus(options?: FocusOptions) {
    this.nativeElement.focus(options);
  }

  blur() {
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

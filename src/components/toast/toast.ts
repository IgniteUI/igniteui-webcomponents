import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { styles } from './toast.material.css';

export interface IgcToastEventMap {
  igcOpening: CustomEvent<any>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<any>;
  igcClosed: CustomEvent<void>;
}

/**
 * A toast component is used to show a notification
 *
 * @element igc-toast
 *
 * @fires igcOpening - Emitted when the toast is about to open.
 * @fires igcOpened - Emitted when the toast is opened.
 * @fires igcClosing - Emitted when the toast is about to close.
 * @fires igcClosed - Emitted when the toast is closed.
 *
 * @csspart base - The base wrapper of the toast.
 */
export default class IgcToastComponent extends EventEmitterMixin<
  IgcToastEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static tagName = 'igc-toast';

  /** @private */
  public static styles = [styles];

  /** The text of the toast. */
  @property()
  public message!: string;

  /** The position of the toast. */
  @(property()({ reflect: true }))
  public position!: 'top' | 'middle' | 'bottom';

  /** Determines whether the toast is opened. */
  @(property()({ type: Boolean, reflect: true }))
  public open = false;

  constructor() {
    super();
    this.open = false;
    this.message = 'Toast message';
    this.position = 'bottom';
  }

  /** Opens the toast. */
  public show() {
    if (this.open) {
      return;
    }

    if (!this.handleOpening()) {
      return;
    }

    this.open = true;
    this.emitEvent('igcOpened');
  }

  /** Closes the toast. */
  public hide() {
    if (!this.open) {
      return;
    }

    if (!this.handleClosing()) {
      return;
    }

    this.open = false;
    this.emitEvent('igcClosed');
  }

  /** Toggles the open state of the toast. */
  public toggle() {
    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  }

  private handleOpening() {
    const args = {
      detail: { cancel: false },
      cancelable: true,
    };
    this.emitEvent('igcOpening', args);

    if (args.detail.cancel) {
      this.open = false;
      return false;
    }

    return true;
  }

  private handleClosing() {
    const args = {
      detail: { cancel: false },
      cancelable: true,
    };
    this.emitEvent('igcClosing', args);

    if (args.detail.cancel) {
      this.open = true;
      return false;
    }

    return true;
  }

  protected render() {
    return html`
      <div class="container ${this.position}">
        <div part="base">${this.message}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-toast': IgcToastComponent;
  }
}

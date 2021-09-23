import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { styles } from './nav-drawer.material.css';

export interface IgcNavDrawerEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

/**
 * Represents a side navigation container that provides
 * quick access between views.
 *
 * @element igc-nav-drawer
 *
 * @slot - The default slot for the drawer.
 * @slot mini - The slot for the mini variant of the drawer.
 *
 * @fires igcOpening - Emitted when the navigation drawer is about to open.
 * @fires igcOpened - Emitted when the navigation drawer is opened.
 * @fires igcClosing - Emitted when the navigation drawer is about to close.
 * @fires igcClosed - Emitted when the navigation drawer is closed.
 *
 * @csspart base - The base wrapper of the navigation drawer.
 * @csspart main - The main container.
 * @csspart mini - The mini container.
 */
export class IgcNavDrawerComponent extends EventEmitterMixin<
  IgcNavDrawerEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  static styles = [styles];

  /** The position of the drawer. */
  @property({ reflect: true })
  position: 'start' | 'end' | 'top' | 'bottom' = 'start';

  /** Determines whether the drawer is opened. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Determines whether the drawer is pinned. */
  @property({ type: Boolean, reflect: true })
  pinned = false;

  /** Opens the drawer. */
  show() {
    if (this.open) {
      return;
    }

    const args = { cancel: false };

    if (!this.handleOpening(args)) {
      return;
    }

    this.open = true;
    this.emitEvent('igcOpened');
  }

  /** Closes the drawer. */
  hide() {
    if (!this.open) {
      return;
    }

    const args = { cancel: false };

    if (!this.handleClosing(args)) {
      return;
    }

    this.open = false;
    this.emitEvent('igcClosed');
  }

  /** Toggles the open state of the drawer. */
  toggle() {
    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  }

  private handleOpening(args: { cancel: boolean }) {
    this.emitEvent('igcOpening');
    if (args.cancel) {
      this.open = false;
      return false;
    }

    return true;
  }

  private handleClosing(args: { cancel: boolean }) {
    this.emitEvent('igcClosing');
    if (args.cancel) {
      this.open = true;
      return false;
    }

    return true;
  }

  render() {
    return html` <div part="base">
      <div part="main">
        <slot></slot>
      </div>

      <div part="mini">
        <slot name="mini"></slot>
      </div>
    </div>`;
  }
}

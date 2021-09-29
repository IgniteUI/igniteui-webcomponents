import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { partNameMap } from '../common/util';
import { styles } from './nav-drawer.material.css';

export interface IgcNavDrawerEventMap {
  igcOpening: CustomEvent<any>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<any>;
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
  public static styles = [styles];

  /** The position of the drawer. */
  @property({ reflect: true })
  public position: 'start' | 'end' | 'top' | 'bottom' = 'start';

  /** Determines whether the drawer is opened. */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /** Determines whether the drawer is pinned. */
  @property({ type: Boolean, reflect: true })
  public pinned = false;

  /** Opens the drawer. */
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

  /** Closes the drawer. */
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

  /** Toggles the open state of the drawer. */
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
    };
    this.emitEvent('igcClosing', args);

    if (args.detail.cancel) {
      this.open = true;
      return false;
    }

    return true;
  }

  private resolvePartNames(base: string) {
    const mini = document.querySelector('div[slot="mini"]');
    const hasChildren = mini !== null && mini.children.length > 0;

    return {
      [base]: true,
      hidden: !hasChildren,
    };
  }

  protected render() {
    return html` <div part="base">
      <div part="main">
        <slot></slot>
      </div>

      <div part="${partNameMap(this.resolvePartNames('mini'))}">
        <slot name="mini"></slot>
      </div>
    </div>`;
  }
}

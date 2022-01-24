import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { partNameMap } from '../common/util';
import { styles } from './nav-drawer.material.css';

/**
 * Represents a side navigation container that provides
 * quick access between views.
 *
 * @element igc-nav-drawer
 *
 * @slot - The default slot for the drawer.
 * @slot mini - The slot for the mini variant of the drawer.
 *
 * @csspart base - The base wrapper of the navigation drawer.
 * @csspart main - The main container.
 * @csspart mini - The mini container.
 */
export default class IgcNavDrawerComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-nav-drawer';

  /** @private */
  public static styles = [styles];

  /** The position of the drawer. */
  @property({ reflect: true })
  public position: 'start' | 'end' | 'top' | 'bottom' = 'start';

  /** Determines whether the drawer is opened. */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /** Opens the drawer. */
  public show() {
    if (this.open) {
      return;
    }

    this.open = true;
  }

  /** Closes the drawer. */
  public hide() {
    if (!this.open) {
      return;
    }

    this.open = false;
  }

  /** Toggles the open state of the drawer. */
  public toggle() {
    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
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

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer': IgcNavDrawerComponent;
  }
}

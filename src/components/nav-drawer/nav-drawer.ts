import { LitElement, html } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import { partNameMap } from '../common/util.js';
import IgcNavDrawerHeaderItemComponent from './nav-drawer-header-item.js';
import IgcNavDrawerItemComponent from './nav-drawer-item.js';
import { styles } from './themes/container.base.css.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/container/nav-drawer.common.css.js';

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
@themes(all)
export default class IgcNavDrawerComponent extends LitElement {
  public static readonly tagName = 'igc-nav-drawer';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      this,
      IgcNavDrawerHeaderItemComponent,
      IgcNavDrawerItemComponent
    );
  }

  @queryAssignedElements({ slot: 'mini' })
  private _miniSlotElements!: Array<HTMLElement>;

  /**
   * The position of the drawer.
   * @attr
   */
  @property({ reflect: true })
  public position: 'start' | 'end' | 'top' | 'bottom' | 'relative' = 'start';

  /**
   * Determines whether the drawer is opened.
   * @attr
   */
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
    return {
      [base]: true,
      hidden: this._miniSlotElements.length < 1,
    };
  }

  protected override render() {
    return html`
      <div part="overlay" @click=${this.hide}></div>

      <div part="base">
        <div part="main">
          <slot></slot>
        </div>
      </div>

      <div part="${partNameMap(this.resolvePartNames('mini'))}">
        <slot name="mini"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer': IgcNavDrawerComponent;
  }
}

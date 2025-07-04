import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import type { NavDrawerPosition } from '../types.js';
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
 * @slot - The default slot for the igc-navigation-drawer.
 * @slot mini - The slot for the mini variant of the igc-navigation-drawer.
 *
 * @csspart base - The base wrapper of the igc-navigation-drawer.
 * @csspart main - The main container of the igc-navigation-drawer.
 * @csspart mini - The mini container of the igc-navigation-drawer.
 */
export default class IgcNavDrawerComponent extends LitElement {
  public static readonly tagName = 'igc-nav-drawer';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcNavDrawerComponent,
      IgcNavDrawerHeaderItemComponent,
      IgcNavDrawerItemComponent
    );
  }

  private readonly _slots = addSlotController(this, {
    slots: setSlots('mini'),
  });

  /**
   * The position of the drawer.
   * @attr
   */
  @property({ reflect: true })
  public position: NavDrawerPosition = 'start';

  /**
   * Determines whether the drawer is opened.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  constructor() {
    super();
    addThemingController(this, all);
  }

  private _waitTransitions() {
    return new Promise<Event>((resolve) => {
      this.renderRoot.addEventListener('transitionend', resolve, {
        once: true,
      });
    });
  }

  /** Opens the drawer. */
  public async show(): Promise<boolean> {
    if (this.open) {
      return false;
    }

    this.open = true;
    await this._waitTransitions();

    return true;
  }

  /** Closes the drawer. */
  public async hide(): Promise<boolean> {
    if (!this.open) {
      return false;
    }

    this.open = false;
    await this._waitTransitions();

    return true;
  }

  /** Toggles the open state of the drawer. */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }

  protected override render() {
    return html`
      <div part="overlay" @click=${this.hide}></div>

      <div part="base" .inert=${!this.open}>
        <div part="main">
          <slot></slot>
        </div>
      </div>

      <div
        part=${partMap({
          mini: true,
          hidden: !this._slots.hasAssignedElements('mini'),
        })}
      >
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

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { DynamicTheme, theme } from '../../theming';
import { partNameMap } from '../common/util';

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
  public static readonly tagName = 'igc-nav-drawer';
  @theme({
    material: './nav-drawer/styles/material/nav-drawer.material.scss',
    bootstrap: './nav-drawer/styles/bootstrap/nav-drawer.bootstrap.scss',
    indigo: './nav-drawer/styles/indigo/nav-drawer.indigo.scss',
    fluent: './nav-drawer/styles/fluent/nav-drawer.fluent.scss',
  })
  protected theme!: DynamicTheme;

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

  protected override render() {
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

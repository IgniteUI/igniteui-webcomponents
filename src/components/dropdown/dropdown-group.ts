import { LitElement, html } from 'lit';
import { queryAssignedElements } from 'lit/decorators.js';

import type IgcDropdownItemComponent from './dropdown-item';
import { styles } from './themes/dropdown-group.base.css.js';
import { all } from './themes/group.js';
import { themes } from '../../theming/theming-decorator.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { registerComponent } from '../common/definitions/register.js';

/**
 * A container for a group of `igc-dropdown-item` components.
 *
 * @element igc-dropdown-group
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 *
 * @csspart label - The native label element.
 */
@themes(all)
export default class IgcDropdownGroupComponent extends LitElement {
  public static readonly tagName: string = 'igc-dropdown-group';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  private _internals: ElementInternals;

  /** All child `igc-dropdown-item`s. */
  @blazorSuppress()
  @queryAssignedElements({ flatten: true, selector: 'igc-dropdown-item' })
  public items!: Array<IgcDropdownItemComponent>;

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = 'group';
  }

  protected override render() {
    return html`
      <label part="label">
        <slot name="label"></slot>
      </label>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown-group': IgcDropdownGroupComponent;
  }
}

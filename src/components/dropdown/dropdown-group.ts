import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/dropdown-group.base.css.js';
import { styles as fluent } from './themes/light/dropdown-group.fluent.css.js';
import type IgcDropdownItemComponent from './dropdown-item';
import type IgcDropdownComponent from './dropdown';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';

/**
 * @element igc-dropdown-group - A container for a group of `igc-dropdown-item` components.
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 *
 * @csspart label - The native label element.
 */
@themes({ fluent })
export default class IgcDropdownGroupComponent extends LitElement {
  public static readonly tagName = 'igc-dropdown-group';

  public static override styles = styles;

  protected dropdown?: IgcDropdownComponent;

  /** All child `igc-dropdown-item`s. */
  @blazorSuppress()
  @queryAssignedElements({ flatten: true, selector: 'igc-dropdown-item' })
  public items!: Array<IgcDropdownItemComponent>;

  public override connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'group');
    this.dropdown = this.closest('igc-dropdown') as IgcDropdownComponent;
  }

  protected override render() {
    this.setAttribute('size', this.dropdown?.size ?? 'large');

    return html`
      <label part="label"><slot name="label"></slot></label>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown-group': IgcDropdownGroupComponent;
  }
}

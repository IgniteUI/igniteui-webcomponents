import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { registerComponent } from '../common/definitions/register.js';
import { SizableInterface } from '../common/mixins/sizable.js';
import type IgcDropdownItemComponent from './dropdown-item';
import { all } from './themes/group.js';
import { styles } from './themes/dropdown-group.base.css.js';

/**
 * @element igc-dropdown-group - A container for a group of `igc-dropdown-item` components.
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

  protected parent!: SizableInterface;

  /** All child `igc-dropdown-item`s. */
  @blazorSuppress()
  @queryAssignedElements({ flatten: true, selector: 'igc-dropdown-item' })
  public items!: Array<IgcDropdownItemComponent>;

  public override connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'group');
    this.parent = this.getParent();
  }

  protected getParent() {
    return this.closest('igc-dropdown')!;
  }

  protected override render() {
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

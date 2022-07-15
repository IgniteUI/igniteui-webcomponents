import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/dropdown-group.base.css.js';
import { styles as fluent } from './themes/light/dropdown-group.fluent.css.js';
import type IgcDropdownItemComponent from './dropdown-item';
import type IgcDropdownComponent from './dropdown';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';

export abstract class BaseDropdownGroupComponent<Parent> extends LitElement {
  /** The parent dropdown/element that owns this component */
  protected abstract parent: Parent;

  /** Implement this to return the parent element owning this component */
  protected abstract getParent(): Parent;

  public override connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'group');
    this.parent = this.getParent();
  }
}

/**
 * @element igc-dropdown-group - A container for a group of `igc-dropdown-item` components.
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 *
 * @csspart label - The native label element.
 */
@themes({ fluent })
export default class IgcDropdownGroupComponent extends BaseDropdownGroupComponent<IgcDropdownComponent> {
  public static readonly tagName = 'igc-dropdown-group';

  public static override styles = styles;
  protected parent!: IgcDropdownComponent;

  /** All child `igc-dropdown-item`s. */
  @blazorSuppress()
  @queryAssignedElements({ flatten: true, selector: 'igc-dropdown-item' })
  public items!: Array<IgcDropdownItemComponent>;

  protected getParent() {
    return this.closest('igc-dropdown')!;
  }

  protected override render() {
    this.setAttribute('size', this.parent?.size ?? 'large');

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

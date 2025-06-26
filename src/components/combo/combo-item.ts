import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcCheckboxComponent from '../checkbox/checkbox.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import { all } from '../dropdown/themes/item.js';
import { styles as shared } from '../dropdown/themes/shared/item/dropdown-item.common.css.js';
import { styles } from './themes/combo-item.base.css.js';

/* blazorSuppress */
export default class IgcComboItemComponent extends LitElement {
  public static readonly tagName: string = 'igc-combo-item';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcComboItemComponent, IgcCheckboxComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'option',
      ariaSelected: 'false',
    },
  });

  @property({ attribute: false })
  public index!: number;

  /**
   * Determines whether the item is selected.
   * @attr selected
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * Determines whether the item is active.
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  /**
   * Determines whether the item is active.
   * @attr hide-checkbox
   */
  @property({ type: Boolean, attribute: 'hide-checkbox' })
  public hideCheckbox = false;

  constructor() {
    super();
    addThemingController(this, all);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.role = 'option';
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('selected')) {
      this._internals.setARIA({ ariaSelected: this.selected.toString() });
    }
  }

  private renderCheckbox() {
    return html`
      <section part="prefix">
        <igc-checkbox
          .inert=${true}
          ?checked=${this.selected}
          exportparts="control: checkbox, indicator: checkbox-indicator, checked"
        ></igc-checkbox>
      </section>
    `;
  }

  protected override render() {
    return html`
      ${!this.hideCheckbox ? this.renderCheckbox() : nothing}
      <section id="content" part="content">
        <slot></slot>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo-item': IgcComboItemComponent;
  }
}

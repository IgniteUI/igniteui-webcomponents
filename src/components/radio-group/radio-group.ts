import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { isLTR } from '../common/util.js';
import IgcRadioComponent from '../radio/radio.js';
import { styles } from './radio-group.base.css.js';
import { styles as material } from './radio-group.material.css.js';
import { styles as fluent } from './radio-group.fluent.css.js';
import { themes } from '../../theming/theming-decorator.js';

defineComponents(IgcRadioComponent);

@themes({ material, fluent })
export default class IgcRadioGroupComponent extends LitElement {
  public static readonly tagName = 'igc-radio-group';

  public static override styles = styles;

  @queryAssignedElements({
    flatten: true,
    selector: 'igc-radio:not([disabled])',
  })
  private radios!: Array<IgcRadioComponent>;

  constructor() {
    super();
    this.addEventListener('keydown', this.handleKeydown);
    this.addEventListener('igcChange', this.updateRequiredState);
  }

  /**
   * Alignment of the radio controls inside this group.
   * @attr
   */
  @property({ reflect: true })
  public alignment: 'vertical' | 'horizontal' = 'vertical';

  private updateRequiredState() {
    const hasRequired = this.radios.some((r) => r.required);

    if (hasRequired) {
      this.radios.forEach((r) => (r.required = false));

      const hasChecked = this.radios.some((r) => r.checked);

      if (hasChecked) {
        this.radios.filter((r) => r.checked)[0].required = true;
      } else {
        this.radios[0].required = true;
      }
    }
  }

  private handleKeydown = (event: KeyboardEvent) => {
    const { key } = event;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      const checked = this.radios.find((radio) => radio.checked);
      let index = this.radios.indexOf(checked!);
      const ltr = isLTR(this);

      switch (key) {
        case 'ArrowUp':
          index += -1;
          break;
        case 'ArrowLeft':
          index += ltr ? -1 : 1;
          break;
        case 'ArrowRight':
          index += ltr ? 1 : -1;
          break;
        default:
          index += 1;
      }

      if (index < 0) index = this.radios.length - 1;
      if (index > this.radios.length - 1) index = 0;

      this.radios.forEach((radio) => (radio.checked = false));
      this.radios[index].focus();
      this.radios[index].checked = true;

      event.preventDefault();
    }
  };

  protected override render() {
    return html`<slot @slotchange=${this.updateRequiredState}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-radio-group': IgcRadioGroupComponent;
  }
}

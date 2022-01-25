import { html, LitElement } from 'lit';
import { property, queryAssignedNodes } from 'lit/decorators.js';
import { default as IgcRadioComponent } from '../radio/radio';
import { styles } from './radio-group.material.css';

export default class IgcRadioGroupComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-radio-group';

  /** @private */
  public static styles = styles;

  @queryAssignedNodes(undefined, true, 'igc-radio')
  private _slottedRadios!: NodeListOf<IgcRadioComponent>;

  private get radios() {
    return Array.from(this._slottedRadios).filter((radio) => !radio.disabled);
  }

  private get isLTR(): boolean {
    const styles = window.getComputedStyle(this);
    return styles.getPropertyValue('direction') === 'ltr';
  }

  constructor() {
    super();
    this.addEventListener('keydown', this.handleKeydown);
  }

  @property({ reflect: true })
  public alignment: 'vertical' | 'horizontal' = 'vertical';

  private setRequired() {
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

      switch (key) {
        case 'ArrowUp':
          index += -1;
          break;
        case 'ArrowLeft':
          index += this.isLTR ? -1 : 1;
          break;
        case 'ArrowRight':
          index += this.isLTR ? 1 : -1;
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

  protected render() {
    return html`<slot @slotchange=${this.setRequired}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-radio-group': IgcRadioGroupComponent;
  }
}

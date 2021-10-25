import { html, LitElement } from 'lit';
import { customElement, property, queryAssignedNodes } from 'lit/decorators.js';
import { default as IgcRadioComponent } from '../radio/radio';
import { styles } from './radio-group.css';

@customElement('igc-radio-group')
export default class IgcRadioGroupComponent extends LitElement {
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
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-radio-group': IgcRadioGroupComponent;
  }
}

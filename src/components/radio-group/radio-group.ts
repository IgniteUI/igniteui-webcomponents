import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { IgcRadioComponent } from '../radio/radio';
import { styles } from './radio-group.css';
import { watch } from '../common/decorators';

export class IgcRadioGroupComponent extends LitElement {
  static styles = styles;

  private _cachedRadios!: IgcRadioComponent[];

  private get _slottedRadios() {
    const slot = this.shadowRoot!.querySelector('slot');
    const childNodes = slot!.assignedNodes({ flatten: true });
    return Array.prototype.filter.call(childNodes, (node) => {
      return node.nodeName.toLowerCase() == 'igc-radio';
    }) as IgcRadioComponent[];
  }

  private get radios() {
    return this._slottedRadios.filter((radio) => !radio.disabled);
  }

  private get isLTR(): boolean {
    const styles = window.getComputedStyle(this);
    return styles.getPropertyValue('direction') === 'ltr';
  }

  constructor() {
    super();
    this.addEventListener('keydown', this.handleKeydown);
  }

  @property({ reflect: true, attribute: 'label-position' })
  labelPosition: 'before' | 'after' = 'after';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ reflect: true })
  alignment: 'vertical' | 'horizontal' = 'vertical';

  @watch('labelPosition', { waitUntilFirstUpdate: true })
  updateLabelPosition() {
    this._slottedRadios.forEach(
      (radio) => (radio.labelPosition = this.labelPosition)
    );
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  updateDisabled() {
    if (!this._cachedRadios) this._cachedRadios = this.radios;
    this._cachedRadios.forEach((radio) => (radio.disabled = this.disabled));
  }

  handleKeydown = (event: KeyboardEvent) => {
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

  render() {
    return html`<slot></slot>`;
  }
}

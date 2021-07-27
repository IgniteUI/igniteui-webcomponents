import { html, LitElement } from 'lit';
import { property, queryAssignedNodes } from 'lit/decorators.js';
import { IgcRadioComponent } from '../radio/radio';
import { styles } from './radio-group.css';
import { watch } from '../common/decorators';

export class IgcRadioGroupComponent extends LitElement {
  static styles = styles;

  @queryAssignedNodes()
  _slottedRadios!: IgcRadioComponent[];

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
    this._slottedRadios.forEach((radio) => {
      radio.disabled = this.disabled;
    });
  }

  render() {
    return html`<slot part="base"></slot>`;
  }
}

import { IgcButtonComponent } from './../button/button';
import { html, LitElement } from 'lit';
import { property, query, queryAssignedNodes } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './form.material.css';
import { IgcRadioGroupComponent } from '../radio-group/radio-group';
import { IgcRadioComponent } from '../radio/radio';

// @customElement('igc-form')
export class IgcFormComponent extends LitElement {
  static styles = styles;

  @queryAssignedNodes(undefined, true, 'igc-radio-group')
  _slottedRadioGroups!: NodeListOf<IgcRadioGroupComponent>;

  @query('.form', true)
  form!: HTMLElement;

  @property({ type: Boolean, reflect: true }) outlined = false;

  protected get classes() {
    return {
      outlined: this.outlined,
    };
  }

  getFormData() {
    const formData = new FormData();

    this._slottedRadioGroups.forEach((radioGroup) => {
      const radios =
        radioGroup.querySelectorAll<IgcRadioComponent>('igc-radio');
      radios.forEach((radio) => {
        if (radio.checked) {
          formData.append(radio.name, radio.value);
        }
      });
    });

    return formData;
  }

  handleClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (targetElement.tagName.toLocaleLowerCase() === 'igc-button') {
      const igcButton = targetElement as IgcButtonComponent;
      if (igcButton.type === 'submit') {
        const formData = this.getFormData();

        for (const pair of formData.entries()) {
          console.log(pair[0] + ', ' + pair[1]);
        }
      }
    }
  }

  render() {
    return html`
      <div
        part="base"
        class=${classMap(this.classes)}
        role="form"
        aria-label="form"
        @click="${this.handleClick}"
      >
        <slot></slot>
      </div>
    `;
  }
}

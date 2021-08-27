import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { Constructor } from '../common/mixins/constructor';

export interface IgcFormEventMap {
  igcSubmit: CustomEvent<FormData>;
  igcReset: CustomEvent;
}

// @customElement('igc-form')
export class IgcFormComponent extends EventEmitterMixin<
  IgcFormEventMap,
  Constructor<LitElement>
>(LitElement) {
  private _controlsWithChecked = [
    'input',
    'radio',
    'igc-radio',
    'igc-switch',
    'igc-checkbox',
  ];
  private _controlsWithValue = ['input', 'select', 'textarea'];
  private _controlsThatSubmit = ['input', 'button', 'igc-button'];

  @property({ type: Boolean, reflect: true }) novalidate = false;

  constructor() {
    super();

    this.addEventListener('click', this.handleClick);
  }

  connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'form');
    this.setAttribute('aria-label', 'form');
  }

  submit(): boolean {
    const formData = this.getFormData();

    const isValid = this.reportValidity();
    if (!this.novalidate && !isValid) {
      return false;
    }

    this.emitEvent('igcSubmit', { detail: formData });
    return true;
  }

  reset() {
    const formElements = this.getFormElements();
    formElements.forEach((element) => {
      element.value = element.defaultValue;
      element.checked = element.defaultChecked;

      if (
        (element.tagName.toLowerCase() === 'input' &&
          (element.type === 'checkbox' || element.type == 'radio')) ||
        (element.tagName.toLowerCase() !== 'input' &&
          this._controlsWithChecked.includes(element.tagName.toLowerCase()))
      ) {
        element.checked = element.defaultChecked;
      } else {
        element.value = element.defaultValue;
      }
    });

    this.emitEvent('igcReset');
  }

  private getFormElements(): any[] {
    const slot = this.shadowRoot?.querySelector('slot');
    const assignedElements = slot?.assignedElements({ flatten: true });
    const formElements = assignedElements || [];
    assignedElements?.forEach((element) => {
      const children = Array.from(element.getElementsByTagName('*'));
      formElements.push(...children);
    });

    return formElements;
  }

  getFormData() {
    const formData = new FormData();

    const formElements = this.getFormElements();
    formElements.forEach((element) => {
      if (
        (this._controlsWithChecked.includes(element.tagName.toLowerCase()) &&
          element.checked) ||
        (this._controlsWithValue.includes(element.tagName.toLowerCase()) &&
          element.type !== 'checkbox' &&
          element.type !== 'radio' &&
          element.type !== 'submit')
      ) {
        formData.append(element.name, element.value);
      }
    });

    return formData;
  }

  reportValidity(): boolean {
    const formElements = this.getFormElements();
    return !formElements.some(
      (element) =>
        typeof element.reportValidity === 'function' &&
        element.reportValidity() === false
    );
  }

  handleClick(event: MouseEvent) {
    const targetElement: any = event.target as HTMLElement;
    if (
      this._controlsThatSubmit.includes(targetElement.tagName.toLowerCase()) &&
      targetElement.type.toLowerCase() === 'submit'
    ) {
      const formData = this.getFormData();

      const isValid = this.reportValidity();
      if (!this.novalidate && !isValid) {
        return false;
      }

      this.emitEvent('igcSubmit', { detail: formData });
    }

    // TODO: is this needed?
    else if (targetElement.type?.toLowerCase() === 'reset') {
      this.reset();
    }

    return true;
  }

  render() {
    return html`<slot></slot>`;
  }
}

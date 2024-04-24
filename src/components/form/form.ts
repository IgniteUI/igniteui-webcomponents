import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';

import { alternateName } from '../common/decorators/alternateName.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';

export interface IgcFormEventMap {
  igcSubmit: CustomEvent<FormData>;
  igcReset: CustomEvent;
}

/**
 * The form is a component used to collect user input from
 * interactive controls.
 *
 * @element igc-form
 *
 * @slot - Default slot for the form.
 *
 * @fires igcSubmit - Emitted when the form is submitted.
 * @fires igcReset - Emitted when the form is reset.
 *
 * @deprecated since version 4.4.0. Use the native `<form>` element instead.
 */
export default class IgcFormComponent extends EventEmitterMixin<
  IgcFormEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-form';

  public static styles = css`
    :host {
      display: block;
    }
  `;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcFormComponent);
  }

  private _controlsWithChecked = [
    'input',
    'radio',
    'igc-radio',
    'igc-switch',
    'igc-checkbox',
  ];
  private _controlsWithValue = [
    'input',
    'igc-input',
    'igc-mask-input',
    'textarea',
    'igc-rating',
    'igc-select',
    'igc-combo',
    'igc-date-time-input',
  ];
  private _controlsThatSubmit = [
    'input',
    'button',
    'igc-button',
    'igc-icon-button',
  ];

  /** Specifies if form data validation should be skipped on submit. */
  @property({ type: Boolean, reflect: true }) public novalidate = false;

  constructor() {
    super();

    this.addEventListener('click', this.handleClick);
  }

  /** Submits the form. */
  @alternateName('performSubmit')
  public submit(): boolean {
    const formData = this.getFormData();
    if (!this.novalidate && !this.reportValidity()) {
      return false;
    }

    this.emitEvent('igcSubmit', { detail: formData });
    return true;
  }

  /** Resets the form. */
  @alternateName('performReset')
  public reset() {
    const formElements = this.getFormElements();
    formElements.forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'select') {
        for (let i = 0; i < element.options.length; i++) {
          const option = element.options[i];
          option.selected = option.defaultSelected;
        }
      } else if (
        (tagName === 'input' &&
          (element.type === 'checkbox' || element.type === 'radio')) ||
        (tagName !== 'input' && this._controlsWithChecked.includes(tagName))
      ) {
        element.checked = element.hasAttribute('checked');
      } else if (
        tagName === 'igc-input' ||
        tagName === 'igc-rating' ||
        tagName === 'igc-mask-input' ||
        tagName === 'igc-date-time-input'
      ) {
        element.value = element.getAttribute('value');
      } else if (this._controlsWithValue.includes(tagName)) {
        element.value = element.defaultValue;
      }
    });

    this.emitEvent('igcReset');
  }

  private getFormElements(): any[] {
    const slot = this.shadowRoot?.querySelector('slot');
    const assignedElements = slot?.assignedElements({ flatten: true });
    const formElements: any[] = [];
    assignedElements?.forEach((element: any) => {
      if (!element.disabled) {
        formElements.push(element);
      }
      const children = Array.from(element.getElementsByTagName('*')).filter(
        (element: any) => !element.disabled
      );
      formElements.push(...children);
    });

    return formElements;
  }

  //suppressing in blazor for now due to an issue, bringing it back later
  /** Retrieves the data from the form in the format of a FormData object. */
  @blazorSuppress()
  public getFormData() {
    const formData = new FormData();

    const formElements = this.getFormElements();
    formElements.forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'select') {
        for (let i = 0; i < element.options.length; i++) {
          const option = element.options[i];
          if (option.selected) {
            formData.append(element.name, option.value);
          }
        }
      } else if (
        this._controlsWithChecked.includes(tagName) &&
        element.checked
      ) {
        formData.append(element.name, element.value || 'on');
      } else if (
        this._controlsWithValue.includes(tagName) &&
        element.type !== 'checkbox' &&
        element.type !== 'radio' &&
        element.type !== 'submit'
      ) {
        formData.append(element.name, element.value);
      }
    });

    return formData;
  }

  /** Checks for validity of the form. */
  public reportValidity(): boolean {
    const formElements = this.getFormElements();
    return !formElements.some(
      (element) =>
        typeof element.reportValidity === 'function' &&
        element.reportValidity() === false
    );
  }

  private handleClick(event: MouseEvent) {
    const targetElement: any = event.target as HTMLElement;
    if (
      this._controlsThatSubmit.includes(targetElement.tagName.toLowerCase()) &&
      targetElement.type?.toLowerCase() === 'submit'
    ) {
      this.submit();
    } else if (targetElement.type?.toLowerCase() === 'reset') {
      this.reset();
    }

    return true;
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-form': IgcFormComponent;
  }
}

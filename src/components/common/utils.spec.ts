import { expect, fixture, html } from '@open-wc/testing';
import { TemplateResult } from 'lit';
import type { FormAssociatedElementInterface } from './mixins/form-associated';

export class FormAssociatedTestBed<
  T extends FormAssociatedElementInterface & Element
> {
  private _element!: T;
  private _form!: HTMLFormElement;

  /**
   * The form associated component for the test bed.
   */
  public get element() {
    return this._element;
  }

  /**
   * The form element from the test bed.
   */
  public get form() {
    return this._form;
  }

  public get valid() {
    return this.element.checkValidity() && !this.element.invalid;
  }

  constructor(private template: TemplateResult) {}

  /**
   * Creates the fixture.
   *
   * @remarks
   * Called in the async `beforeEach` test hook callback. Pass in the
   * query selector for the component.
   */
  public async setup(qs: string) {
    this._form = await fixture<HTMLFormElement>(
      html`<form><fieldset>${this.template}</fieldset></form>`
    );
    this._element = this._form.querySelector(qs) as unknown as T;
  }

  public setAncestorDisabledState(state: boolean) {
    this.form.querySelector('fieldset')?.toggleAttribute('disabled', state);
  }

  /** Resets the form controls. */
  public reset() {
    this.form.reset();
  }

  /**
   * Attempts to submit the form element.
   * If constraint validation passes returns the form data, otherwise `undefined`.
   */
  public submit(): FormData | undefined {
    let data!: FormData;

    this.form.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        data = new FormData(this.form);
      },
      { once: true }
    );
    this.form.requestSubmit();
    return data;
  }

  public submitValidates(msg?: string) {
    expect(this.submit(), msg).not.to.be.undefined;
    expect(this.valid).to.be.true;
  }

  public submitFails(msg?: string) {
    expect(this.submit(), msg).to.be.undefined;
    expect(this.valid).to.be.false;
  }
}

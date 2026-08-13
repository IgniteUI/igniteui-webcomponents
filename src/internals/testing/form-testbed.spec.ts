import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import type { IgcFormControl } from '../mixins/forms/types.js';
import { isFocused } from './helpers.spec.js';
import { simulateClick } from './simulate.spec.js';

export function createFormAssociatedTestBed<T extends IgcFormControl>(
  template: TemplateResult
): FormAssociatedTestBed<T> {
  return new FormAssociatedTestBed<T>(template);
}

const initialFormData = Object.freeze(new FormData());

class FormAssociatedTestBed<T extends IgcFormControl> {
  private _element!: T;
  private _template: TemplateResult;
  private _form!: HTMLFormElement;

  /**
   * The form associated component for the test bed.
   */
  public get element(): T {
    return this._element;
  }

  /**
   * The form element from the test bed.
   */
  public get form(): HTMLFormElement {
    return this._form;
  }

  public get formData(): FormData {
    return new FormData(this._form);
  }

  public get valid(): boolean {
    return this.element.checkValidity();
  }

  constructor(template: TemplateResult) {
    this._template = template;
  }

  /**
   * Creates the fixture.
   *
   * @remarks
   * Called in the async `beforeEach` test hook callback. Pass in the
   * query selector for the component.
   */
  public async setup(qs: string): Promise<void> {
    this._form = await fixture(
      html`<form><fieldset>${this._template}</fieldset></form>`
    );
    this._element = this._form.querySelector<T>(qs)!;
  }

  public setAncestorDisabledState(state: boolean): void {
    this.form.querySelector('fieldset')?.toggleAttribute('disabled', state);
  }

  /** Resets the form controls. */
  public reset(): void {
    this.form.reset();
  }

  /**
   * Attempts to submit the form element.
   * If constraint validation passes returns the form data, otherwise returns a
   * default `initialFormData` sentinel value.
   */
  public submit(): FormData {
    let data = initialFormData;

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

  /**
   * Simulates pressing the `Enter` key while the focus is on the given target element (or the component itself if no target is provided).
   * If the component is inside a form, this will attempt to submit the form.
   * Returns whether the form submission was triggered.
   */
  public submitWithEnter(target?: HTMLElement | null): boolean {
    let called = false;
    const element = target ?? this.element;
    const handler = (event: SubmitEvent) => {
      event.preventDefault();
      called = true;
    };

    this.form.addEventListener('submit', handler, { once: true });
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      })
    );
    return called;
  }

  /**
   * Assigns properties to the element and optionally waits for the update.
   *
   * This function takes an object of properties to assign to the element.
   * It then uses `Object.assign` to merge these properties into the element's properties.
   * If the `waitForUpdate` parameter is `true`, the function waits for the element to be updated before returning.
   */
  public async setProperties(
    props: { [K in keyof T]?: T[K] | string },
    waitForUpdate = false
  ): Promise<void> {
    Object.assign(this.element, props);
    if (waitForUpdate) {
      await elementUpdated(this.element);
    }
  }

  /**
   * Sets attributes on the element and optionally waits for the update.
   *
   * This function takes an object of attributes to set on the element.
   * It iterates over each attribute and its value, and uses the `setAttribute` method to set the attribute on the element.
   * If the `waitForUpdate` parameter is `true`, the function waits for the element to be updated before returning.
   */
  public async setAttributes(
    attributes: { [K in keyof T]?: T[K] | string },
    waitForUpdate = false
  ): Promise<void> {
    for (const [attr, value] of Object.entries(attributes)) {
      this.element.setAttribute(attr, `${value}`);
    }
    if (waitForUpdate) {
      await elementUpdated(this.element);
    }
  }

  /**
   * Whether the form is submitted and contains the given 'value'
   * in its form data.
   */
  public assertSubmitHasValue(value: unknown, msg?: string): void {
    expect(this.submit().get(this.element.name), msg).to.eql(value);
  }

  /**
   * Whether the form is submitted and contains the given 'value'
   * in its form data.
   */
  public assertSubmitHasValues(value: unknown, msg?: string): void {
    expect(this.submit().getAll(this.element.name), msg).to.eql(value);
  }

  /**
   * Whether the form is submitted and contains the given 'key'-'value' pair
   * in its form data.
   */
  public assertSubmitHasKeyValue = (
    key: string,
    value: unknown,
    msg?: string
  ) => {
    expect(this.submit().get(key), msg).to.eql(value);
  };

  /**
   * Whether the form fails to submit.
   * The component will be in invalid state and the form data will be empty.
   */
  public assertSubmitFails(msg?: string): void {
    expect(this.submit() === initialFormData, msg).to.be.true;
    expect(this.valid, msg).to.be.false;
  }

  /**
   * Whether the form submits.
   * The component will be in valid state and the form data will include the
   * component name and value.
   */
  public assertSubmitPasses(msg?: string): void {
    expect(this.submit() === initialFormData, msg).to.be.false;
    expect(this.valid, msg).to.be.true;
  }

  /**
   * Whether the form element is in 'pristine' state.
   */
  public assertIsPristine(msg?: string): void {
    // biome-ignore lint/complexity/useLiteralKeys: Pristine state test
    expect(this.element['_pristine'], msg).to.be.true;
  }
}

export interface ExternalLabelAssociationConfig {
  /** The host custom element tag name (e.g. `igc-select`). */
  tagName: string;
  /**
   * Locates the AT-exposed native form control (`<input>`/`<textarea>`) that should
   * receive the forwarded `aria-labelledby` association within the given host element.
   */
  getNativeInput: (host: HTMLElement) => HTMLInputElement | HTMLTextAreaElement;
  /** Optional additional attributes to set on the rendered host element. */
  hostAttributes?: string;
}

/**
 * Shared test suite asserting that a form associated component is correctly linked to an
 * external `<label>` element, both through an `IDREF` (`<label for>`) and by nesting the
 * component inside the `<label>`.
 *
 * The association is verified through:
 * - the forwarded `aria-labelledby` element reference on the inner native input, and
 * - focus state, since accessibility tooling does not currently resolve `ElementInternals`
 *   based labelling across shadow roots.
 */
export function runExternalLabelAssociationTests(
  config: ExternalLabelAssociationConfig
): void {
  const { tagName, getNativeInput, hostAttributes = '' } = config;

  describe('External label association', () => {
    async function createLabelledFixture(nested: boolean) {
      const container = await fixture<HTMLElement>(html`<div></div>`);

      container.innerHTML = nested
        ? `<label>External label <${tagName} ${hostAttributes}></${tagName}></label>`
        : `<label for="labelled-host">External label</label><${tagName} id="labelled-host" ${hostAttributes}></${tagName}>`;

      const label = container.querySelector('label')!;
      const host = container.querySelector<HTMLElement>(tagName)!;

      await elementUpdated(host);
      await nextFrame();

      return { label, host };
    }

    it('links an external label through an IDREF (`for` attribute)', async () => {
      const { label, host } = await createLabelledFixture(false);
      const native = getNativeInput(host);

      expect(native.ariaLabelledByElements).to.have.lengthOf(1);
      expect(native.ariaLabelledByElements?.[0]).to.equal(label);

      simulateClick(label);
      await elementUpdated(host);

      expect(document.activeElement).to.equal(host);
      expect(isFocused(native)).to.be.true;
    });

    it('links an external label by nesting the component inside it', async () => {
      const { label, host } = await createLabelledFixture(true);
      const native = getNativeInput(host);

      expect(native.ariaLabelledByElements).to.have.lengthOf(1);
      expect(native.ariaLabelledByElements?.[0]).to.equal(label);

      simulateClick(label);
      await elementUpdated(host);

      expect(document.activeElement).to.equal(host);
      expect(isFocused(native)).to.be.true;
    });
  });
}

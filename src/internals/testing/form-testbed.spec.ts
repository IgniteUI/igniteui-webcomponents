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
  /**
   * Whether clicking the label is asserted to move focus onto the native
   * control. Defaults to `true`; opt out for controls the browser does not
   * label-focus like text editors (e.g. `<input type="file">`).
   */
  assertFocus?: boolean;
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
  const {
    tagName,
    getNativeInput,
    hostAttributes = '',
    assertFocus = true,
  } = config;

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

    async function assertLabelAssociation(nested: boolean) {
      const { label, host } = await createLabelledFixture(nested);
      const native = getNativeInput(host);

      expect(native.ariaLabelledByElements).to.eql([label]);

      simulateClick(label);
      await elementUpdated(host);

      expect(document.activeElement).to.equal(host);

      if (assertFocus) {
        expect(isFocused(native)).to.be.true;
      }
    }

    it('links an external label through an IDREF (`for` attribute)', () =>
      assertLabelAssociation(false));

    it('links an external label by nesting the component inside it', () =>
      assertLabelAssociation(true));
  });
}

export interface AriaProjectionTestConfig {
  /** The host custom element tag name (e.g. `igc-select`). */
  tagName: string;
  /** Optional additional attributes to set on the rendered host element. */
  hostAttributes?: string;
  /**
   * Locates the AT-exposed native editor (`<input>`/`<textarea>`) that
   * receives the projected ARIA state within the given host element.
   */
  getNativeInput: (host: HTMLElement) => HTMLInputElement | HTMLTextAreaElement;
  /** The scalar ARIA state expected on the native editor. */
  expected: {
    role?: string;
    hasPopup?: string;
  };
  /** Locates the expected `aria-controls` targets within the host. */
  getControls?: (host: HTMLElement) => Element[];
  /** Locates the expected `aria-describedby` targets within the host. */
  getDescription?: (host: HTMLElement) => Element[];
  /** A boolean property toggling the popup, asserted against `aria-expanded`. */
  openProperty?: string;
}

/**
 * Shared test suite asserting that a composite host projects its ARIA
 * semantics onto the native editor of its inner input component — the element
 * assistive technology lands on and reports when the host delegates focus.
 *
 * Relations are asserted by element-identity readback
 * (e.g. `input.ariaControlsElements[0] === list`), never by content attribute:
 * they are published through ARIA element reflection, since an IDREF cannot
 * cross the shadow boundary between the editor and the host, and reflection
 * blanks the content attribute by spec.
 */
export function runAriaProjectionTests(config: AriaProjectionTestConfig): void {
  const {
    tagName,
    hostAttributes = '',
    getNativeInput,
    expected,
    getControls,
    getDescription,
    openProperty,
  } = config;

  describe('ARIA projection', () => {
    async function createProjectionFixture() {
      const container = await fixture<HTMLElement>(html`<div></div>`);
      container.innerHTML = `<${tagName} ${hostAttributes}></${tagName}>`;

      const host = container.querySelector<HTMLElement>(tagName)!;

      await elementUpdated(host);
      await nextFrame();

      return host;
    }

    it('projects the host semantics onto the native editor', async () => {
      const host = await createProjectionFixture();
      const native = getNativeInput(host);

      // The input component wrapping the native editor. It carries the
      // projected `role`/`hasPopup` as `data-role`/`data-haspopup` styling
      // hooks for the input themes.
      const anchor = (native.getRootNode() as ShadowRoot).host;

      if (expected.role) {
        expect(native.role).to.equal(expected.role);
        expect(anchor.getAttribute('data-role')).to.equal(expected.role);
      }

      if (expected.hasPopup) {
        expect(native.getAttribute('aria-haspopup')).to.equal(
          expected.hasPopup
        );
        expect(anchor.getAttribute('data-haspopup')).to.equal(
          expected.hasPopup
        );
      }

      if (getControls) {
        expect(native.ariaControlsElements).to.eql(getControls(host));
      }

      if (getDescription) {
        const description = getDescription(host);
        for (const element of description) {
          expect(native.ariaDescribedByElements).to.contain(element);
        }
      }
    });

    if (openProperty) {
      it('reflects the open state of the host onto the native editor', async () => {
        const host = await createProjectionFixture();
        const native = getNativeInput(host);

        expect(native.getAttribute('aria-expanded')).to.equal('false');

        (host as unknown as Record<string, boolean>)[openProperty] = true;
        await elementUpdated(host);

        expect(native.getAttribute('aria-expanded')).to.equal('true');

        (host as unknown as Record<string, boolean>)[openProperty] = false;
        await elementUpdated(host);

        expect(native.getAttribute('aria-expanded')).to.equal('false');
      });
    }
  });
}

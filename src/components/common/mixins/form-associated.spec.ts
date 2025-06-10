import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { StaticValue } from 'lit/static-html.js';
import {
  type Validator,
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
} from '../validators.js';
import { FormAssociatedRequiredMixin } from './forms/associated-required.js';
import { type FormValueOf, createFormValueState } from './forms/form-value.js';
import type {
  FormAssociatedElementInterface,
  FormRequiredInterface,
} from './forms/types.js';

type FormAssociatedTestProps = {
  value?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
};

type FormAssociatedTestInstance = LitElement &
  FormAssociatedElementInterface &
  FormRequiredInterface &
  FormAssociatedTestProps;

describe('Form associated mixin tests', () => {
  const message = 'Super invalid';
  let tag: string;
  let tagName: StaticValue;
  let instance: FormAssociatedTestInstance;

  before(() => {
    tag = defineCE(
      class Foo extends FormAssociatedRequiredMixin(LitElement) {
        static override properties = {
          value: { type: String },
          minLength: { type: Number },
          maxLength: { type: Number },
        };

        protected override get __validators(): Validator<this>[] {
          return [requiredValidator, minLengthValidator, maxLengthValidator];
        }

        protected override _formValue: FormValueOf<string> =
          createFormValueState(this, { initialValue: '' });

        private _minLength!: number;
        private _maxLength!: number;

        public set minLength(value: number) {
          this._minLength = value;
          this._updateValidity();
        }

        public get minLength() {
          return this._minLength;
        }

        public set maxLength(value: number) {
          this._maxLength = value;
          this._updateValidity();
        }

        public get maxLength() {
          return this._maxLength;
        }

        public set value(value: string) {
          this._formValue.setValueAndFormState(value);
          this._updateValidity();
        }

        public get value() {
          return this._formValue.value;
        }

        public override connectedCallback() {
          super.connectedCallback();
          this._updateValidity();
        }

        protected override render() {
          return html``;
        }
      }
    );

    tagName = unsafeStatic(tag);
  });

  async function createFixture(props?: FormAssociatedTestProps) {
    instance = await fixture(
      html`<${tagName}
        ?required=${props?.required}
        value=${ifDefined(props?.value)}
        minlength=${ifDefined(props?.minLength)}
        maxlength=${ifDefined(props?.maxLength)}>
      </${tagName}>`
    );
  }

  it('initial valid state when no constraints', async () => {
    await createFixture({ value: '123' });
    expect(instance.checkValidity()).to.be.true;
  });

  it('initial invalid with constraints', async () => {
    await createFixture({ minLength: 3, value: 'a' });

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'tooShort')).to.be.true;
  });

  it('required + other constraints', async () => {
    // `valueMissing` should override all other flags except for `customError`
    await createFixture({ minLength: 3, required: true });

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'valueMissing')).to.be.true;

    // Validate `valueMissing` bringing back `tooShort`
    instance.value = '1';

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'tooShort')).to.be.true;
  });

  it('setCustomValidity()', async () => {
    await createFixture();

    expect(instance.checkValidity()).to.be.true;

    instance.setCustomValidity(message);

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'customError')).to.be.true;
    expect(instance.validationMessage).to.equal(message);

    instance.setCustomValidity('');

    expect(instance.checkValidity()).to.be.true;
    expect(hasValidityFlags(instance, 'valid')).to.be.true;
    expect(instance.validationMessage).to.not.equal(message);
  });

  it('setCustomValidity() + other constraints', async () => {
    await createFixture();

    // Set `customError` and `valueMissing`.
    instance.setCustomValidity(message);
    instance.required = true;

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'customError', 'valueMissing')).to.be
      .true;
    expect(instance.validationMessage).to.equal(message);

    // Validate `valueMissing` leaving `customError`
    instance.value = '123';

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'customError')).to.be.true;
    expect(instance.validationMessage).to.equal(message);

    // Bring back `valueMissing`; validation message should not change
    instance.value = '';

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'customError', 'valueMissing')).to.be
      .true;
    expect(instance.validationMessage).to.equal(message);

    // Remove `customError`; validation message should change to the requiredValidator one
    instance.setCustomValidity('');

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'valueMissing')).to.be.true;
    expect(instance.validationMessage).to.equal(requiredValidator.message);
  });
});

function hasValidityFlags(
  instance: FormAssociatedTestInstance,
  ...flags: Array<keyof ValidityState>
) {
  const validity = instance.validity;

  for (const key in validity) {
    if (
      validity[key as keyof ValidityState] &&
      !flags.includes(key as keyof ValidityState)
    ) {
      return false;
    }
  }
  return true;
}

import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import {
  registerI18n,
  setCurrentI18n,
  ValidationResourceStringsEN,
} from 'igniteui-i18n-core';
import { ValidationResourceStringsBG } from 'igniteui-i18n-resources';
import { LitElement } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { StaticValue } from 'lit/static-html.js';
import { formatString } from '../utils/strings.js';
import {
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
  type Validator,
} from '../validators.js';
import { FormAssociatedRequiredMixin } from './forms/associated-required.js';
import { FormAssociatedMixin } from './forms/associated.js';
import { createFormValueState } from './forms/form-value.js';
import {
  type FormAssociatedElementInterface,
  type FormRequiredInterface,
  InternalInvalidEvent,
} from './forms/types.js';
import { I18nMixin } from './i18n.js';

type FormAssociatedTestProps = {
  value?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  alwaysFailingValidator?: boolean;
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

        public alwaysFailingValidator = false;

        protected override get __validators(): Validator<this>[] {
          const validators: Validator<this>[] = [
            requiredValidator,
            minLengthValidator,
            maxLengthValidator,
          ];

          if (this.alwaysFailingValidator) {
            validators.push({
              key: 'badInput',
              message: 'Always failing',
              isValid: () => false,
            });
          }

          return validators;
        }

        protected override _formValue = createFormValueState(this, {
          initialValue: '',
        });

        private _minLength!: number;
        private _maxLength!: number;

        public set minLength(value: number) {
          this._minLength = value;
          this._validate();
        }

        public get minLength() {
          return this._minLength;
        }

        public set maxLength(value: number) {
          this._maxLength = value;
          this._validate();
        }

        public get maxLength() {
          return this._maxLength;
        }

        public set value(value: string) {
          this._formValue.setValueAndFormState(value);
        }

        public get value() {
          return this._formValue.value;
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

  let form: HTMLFormElement;
  let submitEvents = 0;
  let internalInvalidEvents = 0;

  async function createFormFixture(props?: FormAssociatedTestProps) {
    form = await fixture(
      html`<form>
        <${tagName}
          name="test"
          ?required=${props?.required}
          value=${ifDefined(props?.value)}>
        </${tagName}>
      </form>`
    );
    instance = form.querySelector<FormAssociatedTestInstance>(tag)!;

    submitEvents = 0;
    internalInvalidEvents = 0;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitEvents++;
    });
    instance.addEventListener(InternalInvalidEvent, () => {
      internalInvalidEvents++;
    });
  }

  /** Requests a form submission and returns whether it went through. */
  function requestSubmit(): boolean {
    const count = submitEvents;
    form.requestSubmit();
    return submitEvents > count;
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
    // `valueMissing` overrides all other flags except `customError`.
    await createFixture({ minLength: 3, required: true });

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'valueMissing')).to.be.true;

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

  it('setCustomValidity("") does not swallow the next failed submission', async () => {
    // Clearing a custom message must not latch the internal validation flag,
    // or the next failed submit counts as internal.
    await createFormFixture({ required: true });

    instance.setCustomValidity('Custom');
    instance.setCustomValidity('');

    const submitted = requestSubmit();

    expect(submitted).to.be.false;
    expect(internalInvalidEvents).to.equal(1);
    expect(instance.matches(':state(ig-invalid)')).to.be.true;
  });

  it('form reset clears a developer-set invalid state', async () => {
    await createFormFixture();

    instance.invalid = true;
    expect(instance.matches(':state(ig-invalid)')).to.be.true;

    form.reset();

    expect(instance.invalid).to.be.false;
    expect(instance.matches(':state(ig-invalid)')).to.be.false;
  });

  it('moving the element in the DOM preserves touched state and invalid styles', async () => {
    await createFormFixture({ required: true });

    // A failed submit makes the control touched and shows invalid styles.
    requestSubmit();
    expect(instance.matches(':state(ig-invalid)')).to.be.true;

    // Re-parent the control within the form (framework list reorder and the like).
    const container = document.createElement('div');
    form.appendChild(container);
    container.appendChild(instance);
    await instance.updateComplete;

    expect(instance.matches(':state(ig-invalid)')).to.be.true;
  });

  it('pressing Enter in an invalid control surfaces validation feedback', async () => {
    await createFormFixture({ required: true });

    instance['_handleEnterKeydown'](
      new KeyboardEvent('keydown', { key: 'Enter' })
    );

    expect(submitEvents).to.equal(0);
    expect(internalInvalidEvents).to.equal(1);
    expect(instance.matches(':state(ig-invalid)')).to.be.true;

    instance.value = '123';

    instance['_handleEnterKeydown'](
      new KeyboardEvent('keydown', { key: 'Enter' })
    );

    expect(submitEvents).to.equal(1);
  });

  it('valueMissing reports the required validator message over later failing validators', async () => {
    // The message must follow the flags when they collapse to `valueMissing`.
    await createFixture();
    instance.alwaysFailingValidator = true;
    instance.required = true;

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'valueMissing')).to.be.true;
    expect(instance.validationMessage).to.equal('This field is required');
  });

  it('setCustomValidity() + other constraints', async () => {
    await createFixture();

    instance.setCustomValidity(message);
    instance.required = true;

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'customError', 'valueMissing')).to.be
      .true;
    expect(instance.validationMessage).to.equal(message);

    instance.value = '123';

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'customError')).to.be.true;
    expect(instance.validationMessage).to.equal(message);

    instance.value = '';

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'customError', 'valueMissing')).to.be
      .true;
    expect(instance.validationMessage).to.equal(message);

    instance.setCustomValidity('');

    expect(instance.checkValidity()).to.be.false;
    expect(hasValidityFlags(instance, 'valueMissing')).to.be.true;
    expect(instance.validationMessage).to.equal('This field is required');
  });
});

describe('Form associated mixin without a value property', () => {
  it('does not commit a value or emit an event', async () => {
    const tag = unsafeStatic(
      defineCE(
        class extends FormAssociatedMixin(LitElement) {
          protected override _formValue = createFormValueState(this, {
            initialValue: '',
          });
        }
      )
    );
    const element = await fixture<LitElement>(html`<${tag}></${tag}>`);
    const events: Event[] = [];
    element.addEventListener('igcChange', (event) => events.push(event));

    const committed = (
      element as unknown as {
        _commitValue(value: unknown, eventName: string): boolean;
      }
    )._commitValue('next', 'igcChange');

    expect(committed).to.be.false;
    expect(events).to.be.empty;
    expect('value' in element).to.be.false;
  });
});

describe('Form associated mixin validation messages', () => {
  const BG = ValidationResourceStringsBG;
  const EN = ValidationResourceStringsEN;

  class ControlElement extends FormAssociatedRequiredMixin(LitElement) {
    public minLength?: number;

    protected override _formValue = createFormValueState(this, {
      initialValue: '',
    });

    protected override get __validators(): Validator<this>[] {
      return [requiredValidator, minLengthValidator];
    }

    public set value(value: string) {
      this._formValue.setValueAndFormState(value);
    }

    public get value(): string {
      return this._formValue.value;
    }
  }

  type Control = ControlElement & { locale?: string };
  type LocaleHost = LitElement & { locale: string };

  let control: StaticValue;
  let localeHost: StaticValue;
  let localizedControl: StaticValue;

  before(() => {
    registerI18n(BG, 'bg');
    control = unsafeStatic(defineCE(ControlElement));
    localeHost = unsafeStatic(
      defineCE(class extends I18nMixin(LitElement, { defaultEN: {} }) {})
    );
    localizedControl = unsafeStatic(
      defineCE(class extends I18nMixin(ControlElement, { defaultEN: {} }) {})
    );
  });

  afterEach(() => setCurrentI18n('en'));

  it('takes the messages of the global locale', async () => {
    setCurrentI18n('bg');
    const element = await fixture<Control>(
      html`<${control} required></${control}>`
    );

    expect(element.validationMessage).to.equal(BG.required_validation_error);

    element.required = false;
    element.minLength = 3;
    element.value = 'ab';

    expect(element.validationMessage).to.equal(
      formatString(BG.min_length_validation_error!, 3)
    );
  });

  it('follows a change of the global locale', async () => {
    const element = await fixture<Control>(
      html`<${control} required></${control}>`
    );

    expect(element.validationMessage).to.equal(EN.required_validation_error);

    setCurrentI18n('bg');

    expect(element.validationMessage).to.equal(BG.required_validation_error);
  });

  it('follows the strings registered for the current locale', async () => {
    setCurrentI18n('de');
    const element = await fixture<Control>(
      html`<${control} required></${control}>`
    );

    expect(element.validationMessage).to.equal(EN.required_validation_error);

    registerI18n({ required_validation_error: 'Pflichtfeld' }, 'de');

    expect(element.validationMessage).to.equal('Pflichtfeld');
  });

  it('takes the locale of an ancestor component', async () => {
    const host = await fixture<LocaleHost>(
      html`<${localeHost} locale="bg">
        <${control} required></${control}>
      </${localeHost}>`
    );
    const element = host.firstElementChild as Control;

    expect(element.validationMessage).to.equal(BG.required_validation_error);

    host.locale = 'en';

    expect(element.validationMessage).to.equal(EN.required_validation_error);
  });

  it('takes the own locale of a localized control', async () => {
    setCurrentI18n('bg');
    const element = await fixture<Control>(
      html`<${localizedControl} required locale="en"></${localizedControl}>`
    );

    expect(element.validationMessage).to.equal(EN.required_validation_error);

    element.locale = 'foo_bar';

    expect(element.validationMessage).to.equal(BG.required_validation_error);
  });

  it('takes the English message for a key that the locale lacks', async () => {
    registerI18n(
      {
        required_validation_error: 'Champ obligatoire',
        min_length_validation_error: '',
      },
      'fr'
    );
    setCurrentI18n('fr');
    const element = await fixture<Control>(html`<${control}></${control}>`);

    element.minLength = 3;
    element.value = 'ab';

    expect(element.validationMessage).to.equal(
      formatString(EN.min_length_validation_error!, 3)
    );
  });

  it('keeps a custom message on a change of the locale', async () => {
    const element = await fixture<Control>(
      html`<${control} required></${control}>`
    );

    element.setCustomValidity('Custom');
    setCurrentI18n('bg');

    expect(element.validationMessage).to.equal('Custom');
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

import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { spy } from 'sinon';

import {
  type IgcDateTimeInputComponent,
  type IgcFormComponent,
  type IgcMaskInputComponent,
  type IgcRadioComponent,
  type IgcRatingComponent,
  defineAllComponents,
} from '../../index.js';

describe('Form', () => {
  before(() => {
    defineAllComponents();
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<IgcFormComponent>(html`<igc-form></igc-form>`);

    await expect(el).shadowDom.to.be.accessible();
  });

  it('displays content', async () => {
    const content = 'Title';
    const el = await fixture<IgcFormComponent>(
      html`<igc-form>${content}</igc-form>`
    );

    expect(el).dom.to.have.text(content);
  });

  it('renders slot successfully', async () => {
    const el = await fixture<IgcFormComponent>(html`<igc-form></igc-form>`);

    expect(el).shadowDom.to.equal(`<slot></slot>`);
  });

  it('displays the elements defined in the slot', async () => {
    const el = await fixture<IgcFormComponent>(
      html`<igc-form>
        <label for="fname">First name:</label><br />
        <input type="text" id="fname" name="fname" />
        <igc-button type="submit">Submit</igc-button>
      </igc-form>`
    );

    expect(el).dom.to.have.descendant('label');
    expect(el).dom.to.have.descendant('input');
    expect(el).dom.to.have.descendant('igc-button');
  });

  it('sets novalidate property successfully', async () => {
    const el = await createEmptyFormComponent();
    el.novalidate = true;
    expect(el.novalidate).to.be.true;
    await elementUpdated(el);
    expect(el).dom.to.equal(`<igc-form novalidate></igc-form>`);
  });

  it('should emit igcSubmit event when the form is submitted', async () => {
    const el = await createFormComponent();
    const eventSpy = spy(el, 'emitEvent');
    el.submit();
    await elementUpdated(el);

    const spyCall = eventSpy.getCall(0);
    expect(spyCall).not.to.be.undefined;
    expect(spyCall.args[0]).to.equal('igcSubmit');
  });

  it('should emit igcReset event when the form is reset', async () => {
    const el = await createEmptyFormComponent();
    const eventSpy = spy(el, 'emitEvent');
    el.reset();

    await elementUpdated(el);
    expect(eventSpy).calledWithExactly('igcReset');
  });

  it('should collect the form data correctly', async () => {
    const el = await createFormComponent();
    await elementUpdated(el);

    const expectedValues = new Map<string, any>();
    expectedValues.set('textarea', 'textareaValue');
    expectedValues.set('inputText', 'inputTextValue');
    expectedValues.set('igcRating', '3');
    expectedValues.set('igcMasked', 'abcd');
    expectedValues.set(
      'igcDateTimeInput',
      new Date('2020-10-11T22:00:00.000Z').toString()
    );
    let formData = el.getFormData();
    verifyFormDataValues(formData, expectedValues);

    const inputCheckbox = el.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;
    inputCheckbox.checked = true;
    const igcRadio = el.querySelector('igc-radio') as IgcRadioComponent;
    igcRadio.checked = true;
    await elementUpdated(el);

    expectedValues.set('inputCheckbox', 'inputCheckboxValue');
    expectedValues.set('igcRadio', 'igcRadioValue');
    formData = el.getFormData();
    verifyFormDataValues(formData, expectedValues);
  });

  it('should reset the form correctly', async () => {
    const el = await createFormComponent();
    await elementUpdated(el);

    const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'updated textareaValue';
    const inputText = el.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    inputText.value = 'updated inputTextValue';
    const inputCheckbox = el.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;
    inputCheckbox.checked = true;
    const igcRadio = el.querySelector('igc-radio') as IgcRadioComponent;
    igcRadio.checked = true;
    const rating = el.querySelector('igc-rating') as IgcRatingComponent;
    rating.value = 5;
    const masked = el.querySelector('igc-mask-input') as IgcMaskInputComponent;
    masked.value = 'wxyz';
    const dateTimeInput = el.querySelector(
      'igc-date-time-input'
    ) as IgcDateTimeInputComponent;
    dateTimeInput.value = new Date(2020, 2, 3);
    await elementUpdated(el);
    el.reset();
    await elementUpdated(el);

    const expectedValues = new Map<string, any>();
    expectedValues.set('textarea', 'textareaValue');
    expectedValues.set('inputText', 'inputTextValue');
    expectedValues.set('igcRating', '3');
    expectedValues.set('igcMasked', 'abcd');
    expectedValues.set(
      'igcDateTimeInput',
      new Date('2020-10-11T22:00:00.000Z').toString()
    );
    const formData = el.getFormData();
    verifyFormDataValues(formData, expectedValues);
  });

  it('should honor novalidate', async () => {
    const el = await createNovalidateFormComponent();
    await elementUpdated(el);

    const inputEmail = el.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement;
    inputEmail.value = 'invalid.mail';

    const eventSpy = spy(el, 'emitEvent');
    el.submit();
    await elementUpdated(el);

    let spyCall = eventSpy.getCall(0);
    expect(spyCall).not.to.be.undefined;
    expect(spyCall.args[0]).to.equal('igcSubmit');

    el.novalidate = false;
    expect(el.novalidate).to.be.false;
    await elementUpdated(el);

    el.submit();
    await elementUpdated(el);
    spyCall = eventSpy.getCall(1);
    expect(spyCall).to.be.null;
  });

  const createEmptyFormComponent = (template = `<igc-form></igc-form>`) => {
    return fixture<IgcFormComponent>(html`${unsafeStatic(template)}`);
  };

  const createFormComponent = (
    template = `
      <igc-form>
        <textarea name="textarea">textareaValue</textarea>
        <input type="text" name="inputText" value="inputTextValue">
        <input type="checkbox" name="inputCheckbox" value="inputCheckboxValue">
        <igc-radio name="igcRadio" value="igcRadioValue"></igc-radio>
        <igc-button type="submit">Submit</igc-button>
        <igc-rating name="igcRating" value="3"></igc-rating>
        <igc-mask-input name="igcMasked" value="abcd"></igc-mask-input>
        <igc-date-time-input name="igcDateTimeInput" value="2020-10-11T22:00:00.000Z"></igc-date-time-input>
      </igc-form>
    `
  ) => {
    return fixture<IgcFormComponent>(html`${unsafeStatic(template)}`);
  };

  const createNovalidateFormComponent = (
    template = `
      <igc-form novalidate>
        <input type="email" name="email">
      </igc-form>
    `
  ) => {
    return fixture<IgcFormComponent>(html`${unsafeStatic(template)}`);
  };
});

function verifyFormDataValues(
  formData: FormData,
  expectedValues: Map<string, any>
) {
  for (const pair of formData.entries()) {
    const key = pair[0];
    const value = pair[1];
    expect(expectedValues.has(key)).to.be.true;
    expect(value).to.equal(expectedValues.get(key));
  }
}

import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import type { Validator } from '../validators.js';
import { EventEmitterMixin } from './event-emitter.js';
import { FormAssociatedMixin } from './forms/associated.js';
import type { FormValueTransformers } from './forms/form-transformers.js';
import { createFormValueState } from './forms/form-value.js';
import type { FormValueType } from './forms/types.js';

/** Fails for a value in the `bad` mode. Throws when it runs in the constructor. */
const modeValidator: Validator<SubmissionHost> = {
  key: 'badInput',
  message: 'bad',
  isValid: (host) => {
    if (!host.constructed) {
      throw new Error('A validator ran in the constructor.');
    }

    return !(host.value && host.mode === 'bad');
  },
};

class SubmissionHost extends FormAssociatedMixin(
  EventEmitterMixin<{ igcChange: CustomEvent<unknown> }>(LitElement)
) {
  public static override properties = {
    value: { type: String },
    mode: { type: String },
    label: { type: String },
  };

  private static readonly _transformers: Partial<
    FormValueTransformers<string>
  > = {
    reads: ['name', 'mode'],
    setFormValue: (value, host) => {
      const { name, mode } = host as unknown as SubmissionHost;

      if (!(value && name)) {
        return null;
      }

      const data = new FormData();
      data.append(name, mode === 'upper' ? value.toUpperCase() : value);
      return data;
    },
  };

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
    transformers: SubmissionHost._transformers,
  });

  /** A property that the submission reads, with a field initializer after the form value. */
  public mode = 'plain';

  /** A property that the submission does not read. */
  public label = '';

  /** The last field initializer sets it. */
  public readonly constructed: boolean = true;

  /** The number of form value pushes. */
  public submissions = 0;

  /** The `igcChange` details, in order. */
  public readonly reports: unknown[] = [];

  protected override get __validators(): Validator<this>[] {
    return [modeValidator];
  }

  public set value(value: string) {
    this._formValue.setValueAndFormState(value);
  }

  public get value(): string {
    return this._formValue.value;
  }

  public get pristine(): boolean {
    return this._isPristine;
  }

  constructor() {
    super();
    this.addEventListener('igcChange', (event) =>
      this.reports.push((event as CustomEvent).detail)
    );
  }

  protected override _setFormValue(
    value: FormValueType,
    state?: FormValueType
  ): void {
    this.submissions++;
    super._setFormValue(value, state);
  }

  protected override render() {
    return html``;
  }
}

describe('Form submission reads', () => {
  let tag: string;
  let host: SubmissionHost;
  let form: HTMLFormElement;

  before(() => {
    tag = defineCE(class extends SubmissionHost {});
  });

  function submitted(): [string, FormDataEntryValue][] {
    return Array.from(new FormData(form));
  }

  async function createHost(attributes: string): Promise<SubmissionHost> {
    form = await fixture<HTMLFormElement>(
      html`<form>
        <${unsafeStatic(tag)}
          ${unsafeStatic(attributes)}
        ></${unsafeStatic(tag)}>
      </form>`
    );
    return form.querySelector<SubmissionHost>(tag)!;
  }

  function createElement(): SubmissionHost {
    return document.createElement(tag) as SubmissionHost;
  }

  beforeEach(async () => {
    host = await createHost('name="field" value="a"');
  });

  it('submits again at once when a property that it reads changes', () => {
    host.name = 'renamed';
    expect(submitted()).to.eql([['renamed', 'a']]);

    host.mode = 'upper';
    expect(submitted()).to.eql([['renamed', 'A']]);
  });

  it('does not submit again for a property that it does not read', () => {
    const count = host.submissions;

    host.label = 'other';

    expect(host.submissions).to.equal(count);
  });

  it('does not submit again for a property set to the same value', () => {
    const count = host.submissions;

    host.name = 'field';
    host.mode = 'plain';

    expect(host.submissions).to.equal(count);
  });

  it('validates the new submission at once', () => {
    host.mode = 'bad';
    expect(host.validity.badInput).to.be.true;

    host.mode = 'plain';
    expect(host.validity.badInput).to.be.false;
  });

  it('keeps the pristine state and the reported value', () => {
    host.mode = 'upper';
    host['_reportChange'](host.value);

    expect(host.pristine).to.be.true;
    expect(host.reports).to.eql([]);
  });

  it('keeps a change that waits for a report', () => {
    host['_writeFrom']('user', () => {
      host.value = 'b';
    });
    host.mode = 'upper';
    host['_reportChange'](host.value);

    expect(host.reports).to.eql(['b']);
  });

  it('submits the attributes of an upgrade in any order', async () => {
    await createHost('value="a" mode="upper" name="field"');

    expect(submitted()).to.eql([['field', 'A']]);
  });

  it('submits at the first connect what was set before it', () => {
    const element = createElement();
    element.value = 'a';
    element.mode = 'upper';
    element.name = 'field';

    form.replaceChildren(element);

    expect(submitted()).to.eql([['field', 'A']]);
  });

  it('does not submit again before the first connect', () => {
    const element = createElement();
    element.value = 'a';
    const count = element.submissions;

    element.mode = 'upper';
    element.name = 'field';

    expect(element.submissions).to.equal(count);
  });

  it('submits again while disconnected', () => {
    host.remove();
    const count = host.submissions;

    host.name = 'renamed';
    expect(host.submissions).to.equal(count + 1);

    form.append(host);
    expect(submitted()).to.eql([['renamed', 'a']]);
  });

  it('runs no validator in the constructor', () => {
    expect(createElement).not.to.throw();
  });
});

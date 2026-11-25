import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement, type PropertyDeclarations } from 'lit';
import { attributeWrites } from '../testing/helpers.spec.js';
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

/** A control whose string value the form submits under the `name` attribute. */
class ValueHost extends FormAssociatedMixin(
  EventEmitterMixin<{ igcChange: CustomEvent<unknown> }>(LitElement)
) {
  public static override properties: PropertyDeclarations = {
    value: { type: String },
  };

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
  });

  public set value(value: string) {
    this._formValue.setValueAndFormState(value);
  }

  public get value(): string {
    return this._formValue.value;
  }

  protected override render() {
    return html``;
  }
}

class SubmissionHost extends ValueHost {
  public static override properties: PropertyDeclarations = {
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
}

function submitted(form: HTMLFormElement): [string, FormDataEntryValue][] {
  return Array.from(new FormData(form));
}

describe('Form submission reads', () => {
  let tag: string;
  let host: SubmissionHost;
  let form: HTMLFormElement;

  before(() => {
    tag = defineCE(class extends SubmissionHost {});
  });

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
    expect(submitted(form)).to.eql([['renamed', 'a']]);

    host.mode = 'upper';
    expect(submitted(form)).to.eql([['renamed', 'A']]);
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

    expect(submitted(form)).to.eql([['field', 'A']]);
  });

  it('submits at the first connect what was set before it', () => {
    const element = createElement();
    element.value = 'a';
    element.mode = 'upper';
    element.name = 'field';

    form.replaceChildren(element);

    expect(submitted(form)).to.eql([['field', 'A']]);
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
    expect(submitted(form)).to.eql([['renamed', 'a']]);
  });

  it('runs no validator in the constructor', () => {
    expect(createElement).not.to.throw();
  });
});

describe('Form submission name', () => {
  let tag: string;
  let host: ValueHost;
  let form: HTMLFormElement;

  before(() => {
    tag = defineCE(class extends ValueHost {});
  });

  beforeEach(async () => {
    form = await fixture<HTMLFormElement>(
      html`<form>
        <${unsafeStatic(tag)} name="field"></${unsafeStatic(tag)}>
      </form>`
    );
    host = form.querySelector<ValueHost>(tag)!;
    host.value = 'a';
  });

  it('keys a string submission by a new name at once', () => {
    host.name = 'renamed';

    expect(host.getAttribute('name')).to.equal('renamed');
    expect(submitted(form)).to.eql([['renamed', 'a']]);
  });

  /** Sets `name` from code and returns the number of attribute writes. */
  function setName(value: unknown): number {
    return attributeWrites(host, 'name', () => {
      host.name = value as string;
    });
  }

  it('removes the attribute at once for null and undefined', () => {
    for (const empty of [null, undefined]) {
      host.name = 'field';

      expect(setName(empty)).to.equal(1);
      expect(host.name).to.equal(empty);
      expect(setName(empty)).to.equal(0);
      expect(host.hasAttribute('name')).to.be.false;
      expect(submitted(form)).to.eql([]);
    }
  });

  it('keeps an empty name as an empty attribute', () => {
    host.name = '';

    expect(host.getAttribute('name')).to.equal('');
    expect(submitted(form)).to.eql([]);
  });

  it('writes the attribute only for a different name', () => {
    expect(setName('field')).to.equal(0);
    expect(setName('renamed')).to.equal(1);
  });

  it('writes a number name once and keeps the number', () => {
    expect(setName(5)).to.equal(1);
    expect(host.name).to.equal(5);
    expect(setName(5)).to.equal(0);
    expect(host.getAttribute('name')).to.equal('5');
  });

  it('follows a change of the attribute', () => {
    expect(
      attributeWrites(host, 'name', () => host.setAttribute('name', 'renamed'))
    ).to.equal(1);
    expect(host.name).to.equal('renamed');

    expect(
      attributeWrites(host, 'name', () => host.removeAttribute('name'))
    ).to.equal(1);
    expect(host.name).to.be.null;
  });

  it('writes the attribute before the first connect', () => {
    const element = document.createElement(tag) as ValueHost;
    element.name = 'other';
    element.value = 'b';

    expect(element.getAttribute('name')).to.equal('other');

    form.replaceChildren(element);
    expect(submitted(form)).to.eql([['other', 'b']]);
  });
});

import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import { ValidityHelpers } from '../testing/validity-helpers.spec.js';
import { requiredValidator, type Validator } from '../validators.js';
import { EventEmitterMixin } from './event-emitter.js';
import { FormAssociatedRequiredMixin } from './forms/associated-required.js';
import { createFormValueState } from './forms/form-value.js';
import type { IgcFormControl, WriteOrigin } from './forms/types.js';

class WriteOriginHost extends FormAssociatedRequiredMixin(
  EventEmitterMixin<{ igcChange: CustomEvent<unknown> }>(LitElement)
) {
  public static override properties = {
    value: { type: String },
  };

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: '',
  });

  protected override get __validators(): Validator<this>[] {
    return [requiredValidator];
  }

  public set value(value: string) {
    this._formValue.setValueAndFormState(value);
  }

  public get value(): string {
    return this._formValue.value;
  }

  public writeAs(origin: WriteOrigin, value: string): void {
    this._writeFrom(origin, () => {
      this.value = value;
    });
  }

  public get pristine(): boolean {
    return this._isPristine;
  }

  public get touched(): boolean {
    return (this as unknown as { _touched: boolean })._touched;
  }

  /** The `igcChange` details, in order. */
  public readonly reports: unknown[] = [];

  /** Reports the value and returns whether an `igcChange` was emitted. */
  public report(force?: boolean): boolean {
    const count = this.reports.length;
    this._reportChange(this.value, force);
    return this.reports.length > count;
  }

  constructor() {
    super();
    this.addEventListener('igcChange', (event) =>
      this.reports.push((event as CustomEvent).detail)
    );
  }

  protected override render() {
    return html``;
  }
}

type Expected = {
  pristine: boolean;
  touched: boolean;
  /** Whether a write that fails validation styles the control at once. */
  styled: boolean;
};

const origins: Array<[WriteOrigin, Expected]> = [
  ['user', { pristine: false, touched: true, styled: true }],
  ['edit', { pristine: false, touched: false, styled: false }],
  ['code', { pristine: false, touched: false, styled: false }],
  ['normalize', { pristine: true, touched: false, styled: false }],
  ['default', { pristine: true, touched: false, styled: false }],
];

/** Whether a write of the origin waits for a report, from a value that was reported. */
const reportedLater: Record<WriteOrigin, boolean> = {
  user: true,
  edit: true,
  code: false,
  normalize: false,
  default: false,
};

describe('Form value write origins', () => {
  let tag: string;
  let host: WriteOriginHost;

  before(() => {
    tag = defineCE(class extends WriteOriginHost {});
  });

  async function createHost(attributes = ''): Promise<WriteOriginHost> {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <${unsafeStatic(tag)}
          name="field"
          ${unsafeStatic(attributes)}
        ></${unsafeStatic(tag)}>
      </form>`
    );
    return form.querySelector<WriteOriginHost>(tag)!;
  }

  beforeEach(async () => {
    host = await createHost();
  });

  it('sets the value and the submission for each origin', () => {
    for (const [origin] of origins) {
      host.writeAs(origin, origin);

      expect(host.value).to.equal(origin);
      expect(new FormData(host.form!).get('field')).to.equal(origin);
    }
  });

  for (const [origin, expected] of origins) {
    describe(`a ${origin} write`, () => {
      // The states need no form.
      beforeEach(async () => {
        host = await fixture<WriteOriginHost>(
          html`<${unsafeStatic(tag)}></${unsafeStatic(tag)}>`
        );
      });

      it(`leaves a pristine control ${expected.pristine ? 'pristine' : 'dirty'}`, () => {
        host.writeAs(origin, 'a');

        expect(host.pristine).to.equal(expected.pristine);
        expect(host.touched).to.equal(expected.touched);
      });

      it('keeps a dirty control dirty', () => {
        host.value = 'dirty';
        host.writeAs(origin, 'a');

        expect(host.pristine).to.be.false;
      });

      it(`${reportedLater[origin] ? 'waits for' : 'needs no'} a report`, () => {
        host.writeAs(origin, 'a');

        expect(host.report()).to.equal(reportedLater[origin]);
        expect(host.report()).to.be.false;
        expect(host.reports).to.eql(reportedLater[origin] ? ['a'] : []);
      });

      it(`${expected.styled ? 'styles' : 'does not style'} a failed validation at once`, () => {
        host.required = true;
        host.writeAs(origin, '');

        expect(host.validity.valueMissing).to.be.true;
        ValidityHelpers.hasInvalidStyles(
          host as unknown as IgcFormControl
        ).to.equal(expected.styled);
      });
    });
  }

  it('takes a write outside of `_writeFrom` as a write from code', () => {
    host.value = 'a';

    expect(host.pristine).to.be.false;
    expect(host.touched).to.be.false;
  });

  it('restores the outer origin after a nested write', () => {
    host['_writeFrom']('normalize', () => {
      host.writeAs('user', 'a');
      host.value = 'b';
    });

    expect(host.value).to.equal('b');
    // The nested user write made the control dirty, the outer write keeps it.
    expect(host.pristine).to.be.false;
  });

  it('restores the origin when the write throws', () => {
    expect(() =>
      host['_writeFrom']('normalize', () => {
        throw new Error('write failed');
      })
    ).to.throw('write failed');

    host.value = 'a';
    expect(host.pristine).to.be.false;
  });

  describe('the value attribute', () => {
    it('sets the value and the default and keeps a pristine control pristine', () => {
      host.setAttribute('value', 'a');

      expect(host.value).to.equal('a');
      expect(host.defaultValue).to.equal('a');
      expect(host.pristine).to.be.true;

      host.defaultValue = 'b';
      expect(host.value).to.equal('b');
    });

    it('keeps a dirty control dirty', () => {
      host.value = 'dirty';
      host.setAttribute('value', 'a');

      expect(host.pristine).to.be.false;
    });
  });

  describe('the default value', () => {
    it('sets the value of a pristine control', () => {
      host.defaultValue = 'a';

      expect(host.value).to.equal('a');
      expect(host.pristine).to.be.true;
    });

    it('does not change the value of a dirty control', () => {
      host.value = 'dirty';
      host.defaultValue = 'a';

      expect(host.value).to.equal('dirty');
    });
  });

  describe('a form reset', () => {
    it('restores the default and makes the control pristine and untouched', () => {
      host.defaultValue = 'a';
      host.writeAs('user', 'b');

      host.form!.reset();

      expect(host.value).to.equal('a');
      expect(host.pristine).to.be.true;
      expect(host.touched).to.be.false;
    });
  });

  describe('the reported value', () => {
    it('starts as the value at the first connect', async () => {
      const withValue = await createHost('value="a"');

      expect(withValue.report()).to.be.false;
      expect(withValue.reports).to.eql([]);
    });

    it('takes a set from code outside of `_writeFrom`', () => {
      host.writeAs('user', 'a');
      host.value = 'b';

      expect(host.report()).to.be.false;
    });

    it('takes a set from code that keeps the value', () => {
      host.writeAs('edit', 'a');
      host['_writeFrom']('code', () => {});

      expect(host.report()).to.be.false;
    });

    it('does not report a change back to the reported value', () => {
      host.writeAs('user', 'a');
      host.writeAs('user', '');

      expect(host.report()).to.be.false;
    });

    it('keeps a change that waits for a report through a rewrite', () => {
      host.writeAs('user', 'a');
      host.writeAs('normalize', 'A');

      expect(host.report()).to.be.true;
      expect(host.reports).to.eql(['A']);
    });

    it('reports with `force`, also without a change', () => {
      expect(host.report(true)).to.be.true;
      expect(host.reports).to.eql(['']);
    });

    it('takes the default on a form reset', () => {
      host.defaultValue = 'a';
      host.writeAs('user', 'b');

      host.form!.reset();

      expect(host.value).to.equal('a');
      expect(host.report()).to.be.false;
    });

    it('reads as the last reported value while a change waits for a report', () => {
      host.value = 'a';
      host.writeAs('user', 'b');

      expect(host['_reportedValue']).to.equal('a');

      host.report();

      expect(host['_reportedValue']).to.equal('b');
    });
  });

  describe('a same-value write that changes nothing', () => {
    it('keeps the pristine state inside a default or normalize write', () => {
      for (const origin of ['default', 'normalize'] as const) {
        host['_writeFrom'](origin, () => host['_recordSameValueWrite']());
      }

      expect(host.pristine).to.be.true;
    });

    it('marks the control dirty', () => {
      host['_recordSameValueWrite']();

      expect(host.pristine).to.be.false;
      expect(host.touched).to.be.false;
    });
  });
});

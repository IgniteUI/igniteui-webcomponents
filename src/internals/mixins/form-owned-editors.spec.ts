import { defineCE, elementUpdated, expect, fixture } from '@open-wc/testing';
import {
  LitElement,
  type PropertyDeclarations,
  type TemplateResult,
} from 'lit';
import { html, unsafeStatic } from 'lit/static-html.js';
import { ValidityHelpers } from '../testing/validity-helpers.spec.js';
import { requiredValidator, type Validator } from '../validators.js';
import { FormAssociatedRequiredMixin } from './forms/associated-required.js';
import { createFormValueState } from './forms/form-value.js';

class TestControl extends FormAssociatedRequiredMixin(LitElement) {
  public static override properties: PropertyDeclarations = {
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

  public userBlur(): void {
    this._handleBlur();
  }

  protected override render(): TemplateResult {
    return html``;
  }
}

class EditorControl extends TestControl {}

const editorTag = unsafeStatic(defineCE(EditorControl));

/** A composite that renders one owned editor, `#first` or `#second`. */
class OwnerControl extends TestControl {
  // A new `value` entry would hide the accessor of the base class.
  public static override properties: PropertyDeclarations = {
    second: { type: Boolean },
  };

  public second = false;

  public get editor(): EditorControl {
    return this._ownedEditors[0]!;
  }

  protected override get _ownedEditors(): (EditorControl | undefined)[] {
    return [
      this.renderRoot?.querySelector<EditorControl>('[data-editor]') ??
        undefined,
    ];
  }

  protected override render(): TemplateResult {
    // Two templates, so a switch renders a new editor.
    return this.second
      ? html`<div>
          <${editorTag}
            data-editor
            id="second"
            ?required=${this.required}
            .value=${this.value}
          ></${editorTag}>
        </div>`
      : html`<${editorTag}
          data-editor
          id="first"
          ?required=${this.required}
          .value=${this.value}
        ></${editorTag}>`;
  }
}

const ownerName = defineCE(OwnerControl);
const ownerTag = unsafeStatic(ownerName);

describe('Form owned editors', () => {
  let form: HTMLFormElement;
  let owner: OwnerControl;

  beforeEach(async () => {
    form = await fixture<HTMLFormElement>(
      html`<form><${ownerTag} name="owner"></${ownerTag}></form>`
    );
    owner = form.querySelector<OwnerControl>(ownerName)!;
    await elementUpdated(owner);
  });

  describe('Invalid state', () => {
    it('an editor shows no invalid state of its own', async () => {
      owner.required = true;
      await elementUpdated(owner);

      owner.editor.userBlur();

      expect(owner.editor.validity.valueMissing).to.be.true;
      ValidityHelpers.hasInvalidStyles(owner).to.be.false;
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.false;
      expect(owner.editor.invalid).to.be.false;
    });

    it('an editor shows the invalid state of its owner at once', async () => {
      owner.required = true;
      await elementUpdated(owner);

      owner.userBlur();

      ValidityHelpers.hasInvalidStyles(owner).to.be.true;
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.true;
      expect(owner.editor.invalid).to.be.true;

      owner.value = 'filled';

      ValidityHelpers.hasInvalidStyles(owner).to.be.false;
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.false;
    });

    it('an editor follows the invalid property of its owner at once', () => {
      owner.invalid = true;
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.true;

      owner.invalid = false;
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.false;
    });

    it('an editor of a disabled owner shows no invalid state', async () => {
      owner.required = true;
      await elementUpdated(owner);
      owner.userBlur();
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.true;

      owner.disabled = true;

      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.false;
    });

    it('a new editor after a render shows the invalid state of its owner', async () => {
      owner.invalid = true;
      const first = owner.editor;

      owner.second = true;
      await elementUpdated(owner);

      expect(owner.editor).not.to.equal(first);
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.true;
    });
  });

  describe('Form reset', () => {
    it('clears the invalid state of an editor at once', async () => {
      owner.required = true;
      await elementUpdated(owner);

      expect(form.checkValidity()).to.be.false;
      form.requestSubmit();
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.true;

      form.reset();

      ValidityHelpers.hasInvalidStyles(owner).to.be.false;
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.false;
    });

    it('clears an invalid state that the owner set from code', () => {
      owner.invalid = true;
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.true;

      form.reset();

      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.false;
    });

    it('keeps an editor of a touched owner clean after the reset', async () => {
      owner.required = true;
      await elementUpdated(owner);
      owner.editor.userBlur();
      owner.userBlur();

      form.reset();
      owner.editor.userBlur();

      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.false;
    });
  });

  describe('Validity', () => {
    it('an editor reports the validity of its owner', async () => {
      owner.required = true;
      await elementUpdated(owner);

      // The editor alone is valid.
      owner.editor.required = false;

      expect(owner.editor.checkValidity()).to.be.false;
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.false;

      expect(owner.editor.reportValidity()).to.be.false;
      ValidityHelpers.hasInvalidStyles(owner).to.be.true;
      ValidityHelpers.hasInvalidStyles(owner.editor).to.be.true;

      owner.value = 'filled';

      expect(owner.editor.checkValidity()).to.be.true;
      expect(owner.editor.reportValidity()).to.be.true;
    });

    it('an editor sends no invalid event of its own', async () => {
      owner.required = true;
      await elementUpdated(owner);

      const events: EventTarget[] = [];
      for (const target of [owner, owner.editor]) {
        target.addEventListener('invalid', (event) =>
          events.push(event.target!)
        );
      }

      owner.editor.checkValidity();

      expect(events).to.eql([owner]);
    });
  });
});

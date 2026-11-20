import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  nextFrame,
  unsafeStatic,
} from '@open-wc/testing';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { html as staticHtml } from 'lit/static-html.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import {
  allowMotion,
  finishAnimationsFor,
  painted,
} from '#internals/testing/helpers.spec.js';
import { transitionsIn } from '#internals/testing/value-state.spec.js';
import {
  addValueStateMotion,
  isUserChange,
  markUserChange,
} from './value-state.js';

/** A control whose base fades its color on a change of `on`. */
class TestControl extends LitElement {
  public static override styles = css`
    [part='base'] {
      transition: background-color 1s linear;
      background-color: rgb(0, 0, 0);
    }

    :host([on]) [part='base'] {
      background-color: rgb(255, 255, 255);
    }

    [data-instant] {
      transition: none !important;
    }
  `;

  @property({ type: Boolean, reflect: true })
  public on = false;

  /** A value whose change always shows at once. */
  @property({ type: Boolean })
  public locked = false;

  public settledCount = 0;

  public readonly motion = addValueStateMotion(this, {
    target: () => this.base,
    watch: () => [this.on],
    instant: () => [this.locked],
    settled: () => this.settledCount++,
  });

  public get base(): HTMLElement {
    return this.renderRoot.querySelector('[part="base"]')!;
  }

  /** Toggles `on` as the user does. */
  public toggle(): void {
    markUserChange(this);
    this.on = !this.on;
  }

  protected override render() {
    return html`<div part="base"></div>`;
  }
}

/** A control whose host fades its color, so the mark is on the host. */
class TestHostControl extends LitElement {
  public static override styles = css`
    :host {
      display: block;
      transition: background-color 1s linear;
      background-color: rgb(0, 0, 0);
    }

    :host([on]) {
      background-color: rgb(255, 255, 255);
    }

    :host(:state(ig-instant)) {
      transition: none !important;
    }
  `;

  @property({ type: Boolean, reflect: true })
  public on = false;

  constructor() {
    super();
    addInternalsController(this);
    addValueStateMotion(this, {
      target: () => this,
      watch: () => [this.on],
    });
  }
}

/** An owner that renders a control in its shadow root. */
class TestOwner extends LitElement {
  @property({ type: Boolean })
  public on = false;

  public get control(): TestControl {
    return this.renderRoot.querySelector(controlTag)!;
  }

  /** Changes the control as the result of a user action on the owner. */
  public toggle(): void {
    markUserChange(this);
    this.on = !this.on;
  }

  protected override render() {
    return staticHtml`<${unsafeStatic(controlTag)} ?on=${this.on}></${unsafeStatic(controlTag)}>`;
  }
}

const controlTag = defineCE(TestControl);
const hostControlTag = defineCE(TestHostControl);
const ownerTag = defineCE(TestOwner);

async function createControl(): Promise<TestControl> {
  const control = await fixture<TestControl>(
    staticHtml`<${unsafeStatic(controlTag)}></${unsafeStatic(controlTag)}>`
  );
  await painted();
  return control;
}

describe('Value state motion', () => {
  allowMotion();

  describe('User changes', () => {
    it('ends a mark that no update takes with the frame', async () => {
      const control = await createControl();

      markUserChange(control);
      expect(isUserChange(control)).to.be.true;

      await nextFrame();
      expect(isUserChange(control)).to.be.false;
    });

    it('takes the mark in the next update', async () => {
      const control = await createControl();

      control.toggle();
      await elementUpdated(control);

      expect(isUserChange(control)).to.be.false;
    });

    it('counts a change inside the shadow root of a marked owner', async () => {
      const owner = await fixture<TestOwner>(
        staticHtml`<${unsafeStatic(ownerTag)}></${unsafeStatic(ownerTag)}>`
      );
      await painted();

      markUserChange(owner);
      expect(isUserChange(owner.control)).to.be.true;
    });
  });

  describe('Animation', () => {
    it('animates a change by the user', async () => {
      const control = await createControl();

      control.toggle();
      await elementUpdated(control);

      expect(control.base.hasAttribute('data-instant')).to.be.false;
      expect(control.motion.userAnimating).to.be.true;
      expect(transitionsIn(control)).to.not.be.empty;
    });

    it('animates a change that a marked owner applies', async () => {
      const owner = await fixture<TestOwner>(
        staticHtml`<${unsafeStatic(ownerTag)}></${unsafeStatic(ownerTag)}>`
      );
      await painted();

      owner.toggle();
      await elementUpdated(owner);
      await elementUpdated(owner.control);

      expect(transitionsIn(owner.control)).to.not.be.empty;
    });

    it('calls settled when the transitions of a user change end', async () => {
      const control = await createControl();

      control.toggle();
      await elementUpdated(control);
      finishAnimationsFor(control.shadowRoot!);
      await nextFrame();

      expect(control.motion.userAnimating).to.be.false;
      expect(control.settledCount).to.equal(1);
    });

    it('joins a change from code that comes during a user change', async () => {
      const control = await createControl();

      control.toggle();
      await elementUpdated(control);
      await painted();

      // An app that reverts the change.
      control.on = false;
      await elementUpdated(control);

      expect(control.base.hasAttribute('data-instant')).to.be.false;
      expect(transitionsIn(control)).to.not.be.empty;
    });

    it('shows a change of an instant value at once, also during a user change', async () => {
      const control = await createControl();

      control.toggle();
      await elementUpdated(control);

      control.locked = true;
      control.on = false;
      await elementUpdated(control);

      expect(control.motion.userAnimating).to.be.false;

      expect(control.base.hasAttribute('data-instant')).to.be.true;
      expect(transitionsIn(control)).to.eql([]);
    });
  });

  describe('Changes from code', () => {
    it('shows the first render at once', async () => {
      const control = await fixture<TestControl>(
        staticHtml`<${unsafeStatic(controlTag)} on></${unsafeStatic(controlTag)}>`
      );
      await painted();

      expect(control.base.hasAttribute('data-instant')).to.be.false;
      expect(transitionsIn(control)).to.eql([]);
    });

    it('shows a change from code at once', async () => {
      const control = await createControl();

      control.on = true;
      await elementUpdated(control);

      expect(control.base.hasAttribute('data-instant')).to.be.true;
      expect(transitionsIn(control)).to.eql([]);
    });

    it('turns the transitions on again in the first frame without a change from code', async () => {
      const control = await createControl();

      // A virtualized list that changes the control in each frame.
      for (let i = 0; i < 3; i++) {
        control.on = !control.on;
        await elementUpdated(control);
        await nextFrame();
        expect(control.base.hasAttribute('data-instant'), `frame ${i}`).to.be
          .true;
      }

      await painted();
      expect(control.base.hasAttribute('data-instant')).to.be.false;
    });

    it('marks a host with the custom state', async () => {
      const control = await fixture<TestHostControl>(
        staticHtml`<${unsafeStatic(hostControlTag)}></${unsafeStatic(hostControlTag)}>`
      );
      await painted();

      control.on = true;
      await elementUpdated(control);

      expect(control.matches(':state(ig-instant)')).to.be.true;
      expect(control.hasAttribute('data-instant')).to.be.false;
      expect(transitionsIn(control)).to.eql([]);

      await painted();
      expect(control.matches(':state(ig-instant)')).to.be.false;
    });

    it('clears the mark of a control that leaves the document', async () => {
      const control = await createControl();
      const base = control.base;

      control.on = true;
      await elementUpdated(control);
      control.remove();

      expect(base.hasAttribute('data-instant')).to.be.false;
    });
  });
});

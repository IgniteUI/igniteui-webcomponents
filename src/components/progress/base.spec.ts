import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement, css } from 'lit';
import { clamp, formatString } from '../common/util.js';

describe('IgcProgressDerivedComponent', () => {
  let tag: string;
  let instance: LitElement & {
    value: number;
    max: number;
    indeterminate: boolean;
    labelFormat: string;
  };

  before(() => {
    // Define a new component that extends LitElement for testing purposes
    tag = defineCE(
      class extends LitElement {
        static override styles = css`
          [part='test'] {
            background-color: lightgray;
          }
        `;

        static override get properties() {
          return {
            value: { type: Number },
            max: { type: Number },
            indeterminate: { type: Boolean },
            labelFormat: { type: String },
          };
        }

        public value = 0;
        public max = 100;
        public indeterminate = false;
        public labelFormat = '';

        constructor() {
          super();
          this.value = 0;
          this.max = 100;
          this.indeterminate = false;
          this.labelFormat = '';
        }

        override updated(changedProperties: Map<string, unknown>) {
          if (changedProperties.has('value')) {
            this._clampValue();
          }
          super.updated(changedProperties);
        }

        private _clampValue(): void {
          this.value = clamp(this.value, 0, this.max);
        }

        protected renderLabelFormat() {
          return formatString(this.labelFormat, this.value, this.max);
        }

        protected override render() {
          return html`
            <div part="test">${this.renderLabel()}</div>
            <slot></slot>
          `;
        }

        protected renderLabel() {
          if (this.labelFormat) {
            return html`<span part="value">${this.renderLabelFormat()}</span>`;
          }
          return html`<span part="value">${this.value}</span>`;
        }
      }
    );
  });

  beforeEach(async () => {
    const tagName = unsafeStatic(tag);
    instance = (await fixture(
      html`<${tagName}></${tagName}>`
    )) as LitElement & {
      value: number;
      max: number;
      indeterminate: boolean;
      labelFormat: string;
    };
  });

  describe('Shared Logic', () => {
    it('clamps value to max and min correctly', async () => {
      const cases = [
        { value: 200, max: 100, expected: 100 },
        { value: -50, max: 100, expected: 0 },
        { value: 75, max: 50, expected: 50 },
      ];

      for (const { value, max, expected } of cases) {
        instance.value = value;
        instance.max = max;
        await elementUpdated(instance);
        expect(instance.value).to.equal(expected);
      }
    });

    it('applies custom label format', async () => {
      instance.labelFormat = 'Step {0} of {1}';
      instance.value = 5;
      instance.max = 10;

      await elementUpdated(instance);
      const label = instance.shadowRoot?.querySelector('[part~="value"]');
      expect(label?.textContent).to.equal('Step 5 of 10');
    });
  });

  describe('Indeterminate State', () => {
    it('resets ARIA attributes when indeterminate', async () => {
      instance.indeterminate = true;
      await elementUpdated(instance);

      expect(instance.getAttribute('aria-valuenow')).to.be.null;
      expect(instance.getAttribute('aria-valuetext')).to.be.null;

      instance.indeterminate = false;
      instance.value = 30;
      await elementUpdated(instance);

      expect(instance.getAttribute('aria-valuenow')).to.equal('30');
    });
  });

  describe('Fractional Progress', () => {
    it('sets fractional progress correctly', async () => {
      instance.value = 25.55;
      instance.max = 100;

      await elementUpdated(instance);

      const base = instance.shadowRoot?.querySelector('[part="base"]');
      const styles = getComputedStyle(base as HTMLElement);

      expect(styles.getPropertyValue('--_progress-whole').trim()).to.equal(
        '25.55'
      );
      expect(styles.getPropertyValue('--_progress-integer').trim()).to.equal(
        '25'
      );
      expect(styles.getPropertyValue('--_progress-fraction').trim()).to.equal(
        '55'
      );
    });

    it('adds "fraction" part when fraction value is present', async () => {
      instance.value = 25.55;
      instance.max = 100;

      await elementUpdated(instance);

      const label = instance.shadowRoot?.querySelector('[part~="value"]');
      expect(label?.getAttribute('part')).to.contain('fraction');
    });

    it('does not add "fraction" part when no fraction value', async () => {
      instance.value = 25;
      instance.max = 100;

      await elementUpdated(instance);

      const label = instance.shadowRoot?.querySelector('[part~="value"]');
      expect(label?.getAttribute('part')).not.to.contain('fraction');
    });
  });

  describe('Slots and Rendering', () => {
    it('renders slot content', async () => {
      const slot = instance.shadowRoot?.querySelector('slot');
      expect(slot).to.exist;
    });
  });
});

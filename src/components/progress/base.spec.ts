import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { IgcProgressBaseComponent } from './base.js';

class TestProgressBaseComponent extends IgcProgressBaseComponent {
  protected override render() {
    return html`<div part="test">${this.renderDefaultSlot()}</div>`;
  }
}

customElements.define('test-progress-base', TestProgressBaseComponent);

describe('IgcProgressBaseComponent', () => {
  let component: TestProgressBaseComponent;

  beforeEach(async () => {
    component = await fixture<TestProgressBaseComponent>(
      html`<test-progress-base></test-progress-base>`
    );
  });

  describe('Shared Logic', () => {
    it('clamps value to max and min correctly', async () => {
      component.value = 200; // Exceeds max
      component.max = 100;
      await elementUpdated(component);

      expect(component.value).to.equal(100); // Value clamped to max

      component.value = -50; // Below min
      await elementUpdated(component);

      expect(component.value).to.equal(0); // Value clamped to min
    });

    it('updates value when max is reduced below current value', async () => {
      component.value = 75;
      component.max = 50;
      await elementUpdated(component);

      expect(component.value).to.equal(50); // Adjusted to max
    });

    it('does not update value when max is increased', async () => {
      component.value = 50;
      component.max = 150;
      await elementUpdated(component);

      expect(component.value).to.equal(50); // Remains unchanged
    });

    it('does not update ARIA attributes when indeterminate is true', async () => {
      component.indeterminate = true;
      await elementUpdated(component);

      expect(component.getAttribute('aria-valuenow')).to.be.null;
      expect(component.getAttribute('aria-valuetext')).to.be.null;
    });
  });

  describe('Lifecycle Behavior', () => {
    it('correctly sets ARIA attributes on connectedCallback', async () => {
      const element = document.createElement('test-progress-base');
      document.body.appendChild(element);

      await elementUpdated(element);

      expect(element.getAttribute('aria-valuenow')).to.equal('0');
      expect(element.getAttribute('aria-valuemax')).to.equal('100');

      document.body.removeChild(element);
    });
  });

  describe('CSS Variables', () => {
    it('updates CSS variables correctly based on value and max', async () => {
      component.value = 50;
      component.max = 200;
      await elementUpdated(component);

      const styles = getComputedStyle(component);
      expect(styles.getPropertyValue('--_progress-whole').trim()).to.equal(
        '25'
      ); // 50 / 200 * 100
      expect(styles.getPropertyValue('--_progress-integer').trim()).to.equal(
        '25'
      );
    });
  });

  describe('Slots and Rendering', () => {
    it('renders the default slot', async () => {
      const slot = component.shadowRoot?.querySelector('slot');
      expect(slot).to.exist;
    });

    it('hides the label when hideLabel is true', async () => {
      component.hideLabel = true;
      await elementUpdated(component);

      const label = component.shadowRoot?.querySelector('[part~="label"]');
      expect(label).to.be.null;
    });
  });
});

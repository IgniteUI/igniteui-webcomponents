import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type { LitElement, TemplateResult } from 'lit';
import { setOrRemoveAttribute } from '../utils/dom.js';

export interface HostAriaTestConfig {
  /** Tag name of the component under test. Queried from the rendered fixture. */
  tagName: string;
  /** Fixture content with one instance of the component, plus any context it needs. */
  template: TemplateResult;
  /** Locates the element that receives the host name and description. */
  getTarget: (host: LitElement) => Element;
  /** The axe rules that the audit skips. */
  ignoredRules?: string[];
}

/**
 * Tests that a component forwards its host `aria-label`, `aria-labelledby` and
 * `aria-describedby` to the element in its shadow root that has the role or
 * the focus. The specs check the relations by element identity.
 */
export function runHostAriaTests(config: HostAriaTestConfig): void {
  describe('Host ARIA', () => {
    let host: LitElement;
    let name: HTMLElement;
    let hint: HTMLElement;

    async function update(attribute: string, value: string | null) {
      setOrRemoveAttribute(host, attribute, value);
      await elementUpdated(host);
    }

    beforeEach(async () => {
      const container = await fixture<HTMLElement>(html`
        <div>
          <span id="host-aria-name">Referenced name</span>
          <span id="host-aria-hint">Referenced hint</span>
          ${config.template}
        </div>
      `);

      host = container.querySelector<LitElement>(config.tagName)!;
      name = container.querySelector('#host-aria-name')!;
      hint = container.querySelector('#host-aria-hint')!;
      await elementUpdated(host);
    });

    it('names the target by the host `aria-label` and follows its change', async () => {
      await update('aria-label', 'Host name');
      expect(config.getTarget(host).getAttribute('aria-label')).to.equal(
        'Host name'
      );

      await update('aria-label', null);
      expect(config.getTarget(host).hasAttribute('aria-label')).to.be.false;
    });

    it('names the target by the host `aria-labelledby`', async () => {
      await update('aria-labelledby', name.id);
      expect(config.getTarget(host).ariaLabelledByElements).to.eql([name]);

      await update('aria-labelledby', null);
      expect(config.getTarget(host).hasAttribute('aria-labelledby')).to.be
        .false;
    });

    it('describes the target by the host `aria-describedby`', async () => {
      await update('aria-describedby', hint.id);
      expect(config.getTarget(host).ariaDescribedByElements).to.eql([hint]);

      await update('aria-describedby', null);
      expect(config.getTarget(host).hasAttribute('aria-describedby')).to.be
        .false;
    });

    it('passes an a11y audit with a host `aria-label`', async () => {
      const { ignoredRules } = config;

      await update('aria-label', 'Host name');
      await expect(host).shadowDom.to.be.accessible({ ignoredRules });
      await expect(host).to.be.accessible({ ignoredRules });
    });
  });
}

import {
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
  waitUntil,
} from '@open-wc/testing';
import sinon from 'sinon';

import { IgcExpansionPanelComponent, defineComponents } from '../../index.js';

const SLOTS = {
  indicator: 'slot[name="indicator"]',
  title: 'slot[name="title"]',
  subtitle: 'slot[name="subtitle"]',
};

const PARTS = {
  header: 'div[part="header"]',
  title: 'div[part="title"]',
  subtitle: 'div[part="subtitle"]',
  content: 'div[part="content"]',
  indicator: 'div[part="indicator"]',
};

describe('Expansion Panel', () => {
  before(() => {
    defineComponents(IgcExpansionPanelComponent);
  });

  let panel: IgcExpansionPanelComponent;
  let eventSpy: any;

  describe('', () => {
    beforeEach(async () => {
      panel = await createExpansionPanelComponent(testTemplate);
      eventSpy = sinon.spy(panel, 'emitEvent');
    });

    it('Passes the a11y audit', async () => {
      await expect(panel).shadowDom.to.be.accessible();
    });

    it('Should render proper role and attributes for the expansion panel header and content', async () => {
      const header = panel.shadowRoot?.querySelector(PARTS.header);
      const content = panel.shadowRoot?.querySelector(PARTS.content);
      const headerId = header?.getAttribute('id');
      const contentId = content?.getAttribute('id');

      expect(header).not.to.be.null;
      expect(content).not.to.be.null;

      expect(header).to.have.attribute('role', 'button');
      expect(header).to.have.attribute('aria-disabled', 'false');
      expect(header).to.have.attribute('aria-expanded', 'false');
      expect(header).to.have.attribute('aria-controls', contentId?.toString());

      expect(content).to.have.attribute('role', 'region');
      expect(content).to.have.attribute(
        'aria-labelledby',
        headerId?.toString()
      );
    });

    it('Verify panel slots are rendered successfully', async () => {
      expect(panel).to.exist;
      let key: keyof typeof SLOTS;
      for (key in SLOTS) {
        const slot = panel.shadowRoot!.querySelector(
          SLOTS[key]
        ) as HTMLSlotElement;
        expect(slot).not.to.be.null;
      }
    });

    it('Should accept custom slot for the panel expansion indicator', async () => {
      const indSlot = panel.shadowRoot!.querySelector(
        SLOTS.indicator
      ) as HTMLSlotElement;
      expect(indSlot).not.to.be.null;

      const elements = indSlot.assignedElements();
      expect(elements.length).to.equal(1);
      expect(elements[0].tagName).to.equal('IGC-ICON');
      expect(elements[0]).to.have.attribute('name', 'select');
    });

    it('Should accept custom slot for the panel title', async () => {
      const titleSlot = panel.shadowRoot!.querySelector(
        SLOTS.title
      ) as HTMLSlotElement;
      expect(titleSlot).not.to.be.null;

      const elements = titleSlot.assignedElements();
      expect(elements.length).to.equal(1);
      expect(elements[0].tagName).to.equal('SPAN');
      expect((elements[0] as HTMLElement).innerText).to.equal(
        'Sample header text'
      );
    });

    it('Should accept custom slot for the panel sub-title', async () => {
      const subtitleSlot = panel.shadowRoot!.querySelector(
        SLOTS.subtitle
      ) as HTMLSlotElement;
      expect(subtitleSlot).not.to.be.null;

      const elements = subtitleSlot.assignedElements();
      expect(elements.length).to.equal(1);
      expect(elements[0].tagName).to.equal('DIV');
      expect((elements[0] as HTMLElement).innerText).to.equal(
        'Sample subtitle'
      );
    });

    it('Should accept custom slot for the panel content', async () => {
      // the default slot contains the panel content
      const contentSlot = getDefaultSlot(panel);
      expect(contentSlot).not.to.be.null;

      const elements = contentSlot.assignedElements();
      expect(elements.length).to.equal(1);
      expect(elements[0].tagName).to.equal('P');
      expect((elements[0] as HTMLElement).innerText).to.equal('Sample content');
    });

    it('Should set indicator position properly', async () => {
      panel = await createExpansionPanelComponent();
      panel.indicatorPosition = 'start';
      await elementUpdated(panel);
      expect(panel).dom.to.equal(
        `<igc-expansion-panel indicator-position="start"></igc-expansion-panel>`
      );

      panel.indicatorPosition = 'end';
      await elementUpdated(panel);
      expect(panel).dom.to.equal(
        `<igc-expansion-panel indicator-position="end"></igc-expansion-panel>`
      );

      panel.indicatorPosition = 'none';
      await elementUpdated(panel);
      expect(panel).dom.to.equal(
        `<igc-expansion-panel indicator-position="none"></igc-expansion-panel>`
      );
    });

    it('Should render default indicator for expansion properly depending on panel state', async () => {
      panel = await createExpansionPanelComponent();
      const indSlot = panel.shadowRoot!.querySelector(
        SLOTS.indicator
      ) as HTMLSlotElement;
      expect(indSlot).not.to.be.null;

      let elements = indSlot.assignedElements({ flatten: true });
      expect(elements[0].tagName).to.equal('IGC-ICON');
      expect(panel.open).to.be.false;
      expect(elements[0]).to.have.attribute('name', 'keyboard_arrow_down');

      panel.show();
      await elementUpdated(panel);

      elements = indSlot.assignedElements({ flatten: true });
      expect(elements[0].tagName).to.equal('IGC-ICON');
      expect(panel.open).to.be.true;
      expect(elements[0]).to.have.attribute('name', 'keyboard_arrow_up');
    });

    it('Should get expanded/collapsed on using the API toggle() method', async () => {
      expect(panel.open).to.be.false;

      let content = panel.shadowRoot!.querySelector(PARTS.content);
      expect(content?.ariaHidden).to.equal('true');

      panel.toggle();
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      content = panel.shadowRoot!.querySelector(PARTS.content);
      expect(content?.ariaHidden).to.equal('false');

      expect(eventSpy).not.to.have.been.called;
    });

    it('Should get expanded/collapsed on using the API show/hide methods', async () => {
      expect(panel.open).to.be.false;

      panel.show();
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      let content = panel.shadowRoot!.querySelector(PARTS.content);
      expect(content?.ariaHidden).to.equal('false');

      expect(eventSpy).not.to.have.been.called;

      panel.hide();
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      content = panel.shadowRoot!.querySelector(PARTS.content);
      expect(content?.ariaHidden).to.equal('true');

      expect(eventSpy).not.to.have.been.called;
    });

    it("Should get expanded/collapsed on setting component's open property", async () => {
      expect(panel.open).to.be.false;

      panel.open = true;
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      let content = panel.shadowRoot!.querySelector(PARTS.content);
      expect(content?.ariaHidden).to.equal('false');

      expect(eventSpy).not.to.have.been.called;

      panel.open = false;
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      content = panel.shadowRoot!.querySelector(PARTS.content);
      expect(content?.ariaHidden).to.equal('true');

      expect(eventSpy).not.to.have.been.called;
    });

    it('Should get expanded/collapsed on header clicking', async () => {
      const header = panel.shadowRoot?.querySelector(PARTS.header);

      expect(panel.open).to.be.false;

      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await waitUntil(() => eventSpy.calledWith('igcOpened'));

      expect(panel.open).to.be.true;

      // Verify events are called
      expect(eventSpy.callCount).to.equal(2);

      const openingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcOpening', openingArgs);

      const openedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcOpened', openedArgs);

      eventSpy.resetHistory();

      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await waitUntil(() => eventSpy.calledWith('igcClosed'));

      expect(panel.open).to.be.false;
      expect(eventSpy.callCount).to.equal(2);

      const closingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcClosing', closingArgs);

      const closedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcClosed', closedArgs);
    });

    it('Should get expanded/collapsed on expand/collapse indicator clicking', async () => {
      const indicator = panel.shadowRoot?.querySelector(PARTS.indicator);
      expect(indicator).not.to.be.null;

      expect(panel.open).to.be.false;

      indicator?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await waitUntil(() => eventSpy.calledWith('igcOpened'));

      expect(panel.open).to.be.true;

      let content = panel.shadowRoot!.querySelector(PARTS.content);
      expect(content?.ariaHidden).to.equal('false');

      // Verify events are called
      expect(eventSpy.callCount).to.equal(2);

      const openingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcOpening', openingArgs);

      const openedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcOpened', openedArgs);

      eventSpy.resetHistory();

      indicator?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await waitUntil(() => eventSpy.calledWith('igcClosed'));

      expect(panel.open).to.be.false;

      content = panel.shadowRoot!.querySelector(PARTS.content);
      expect(content?.ariaHidden).to.equal('true');
      expect(eventSpy.callCount).to.equal(2);

      const closingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcClosing', closingArgs);

      const closedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcClosed', closedArgs);
    });

    it('Should get expanded/collapsed on arrowdown/arrowup', async () => {
      const header = panel.shadowRoot?.querySelector(PARTS.header);
      triggerKeydown(header as HTMLElement, 'arrowdown');
      await waitUntil(() => eventSpy.calledWith('igcOpened'));

      expect(panel.open).to.be.true;

      // Verify events are called
      expect(eventSpy.callCount).to.equal(2);

      const openingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcOpening', openingArgs);

      const openedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcOpened', openedArgs);

      eventSpy.resetHistory();

      triggerKeydown(header as HTMLElement, 'arrowup');
      await waitUntil(() => eventSpy.calledWith('igcClosed'));

      expect(panel.open).to.be.false;
      expect(eventSpy.callCount).to.equal(2);

      const closingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcClosing', closingArgs);

      const closedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcClosed', closedArgs);
    });

    it('Should get expanded/collapsed on space/enter', async () => {
      const header = panel.shadowRoot?.querySelector(PARTS.header);
      triggerKeydown(header as HTMLElement, ' ', false);
      await waitUntil(() => eventSpy.calledWith('igcOpened'));

      expect(panel.open).to.be.true;

      // Verify events are called
      expect(eventSpy.callCount).to.equal(2);

      const openingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcOpening', openingArgs);

      const openedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcOpened', openedArgs);

      eventSpy.resetHistory();

      triggerKeydown(header as HTMLElement, 'enter', false);
      await waitUntil(() => eventSpy.calledWith('igcClosed'));

      expect(panel.open).to.be.false;
      expect(eventSpy.callCount).to.equal(2);

      const closingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcClosing', closingArgs);

      const closedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcClosed', closedArgs);
    });

    it('Should not get expanded/collapsed when disabled', async () => {
      const header = panel.shadowRoot?.querySelector(
        PARTS.header
      ) as HTMLElement;

      panel.disabled = true;
      await elementUpdated(panel);
      expect(panel.open).to.be.false;

      const style = getComputedStyle(header);
      expect(style.pointerEvents).to.equal('none');

      //arrodown keypress
      triggerKeydown(header as HTMLElement, 'arrowdown');
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      // Verify events are called
      expect(eventSpy.callCount).to.equal(0);

      //enter keypress
      triggerKeydown(header as HTMLElement, 'enter');
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      // Verify events are called
      expect(eventSpy.callCount).to.equal(0);
    });

    it('Should not get expanded/collapsed when ing events are canceled', async () => {
      //cancel opening event
      const header = panel.shadowRoot?.querySelector(PARTS.header);

      expect(panel.open).to.be.false;

      panel.addEventListener('igcOpening', (event) => {
        event.preventDefault();
      });

      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      // Verify ed event is not called
      const openingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy).calledOnceWith('igcOpening', openingArgs);

      eventSpy.resetHistory();

      //cancel closing event
      panel.show();
      await elementUpdated(panel);

      panel.addEventListener('igcClosing', (event) => {
        event.preventDefault();
      });

      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      // Verify ed event is not called
      const closingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy).calledOnceWith('igcClosing', closingArgs);
    });

    const createExpansionPanelComponent = (
      template = `<igc-expansion-panel></igc-expansion-panel>`
    ) => {
      return fixture<IgcExpansionPanelComponent>(
        html`${unsafeStatic(template)}`
      );
    };
  });
});

const triggerKeydown = (
  header: HTMLElement,
  eventKey: string,
  altKeyFlag = true
): void => {
  header.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: eventKey,
      bubbles: true,
      altKey: altKeyFlag,
      cancelable: true,
    })
  );
};

const getDefaultSlot = (panel: IgcExpansionPanelComponent): HTMLSlotElement => {
  const slots = panel.shadowRoot!.querySelectorAll('slot');
  const defaultSlot = Array.from(slots).filter(
    (s) => s.name === ''
  )[0] as HTMLSlotElement;
  return defaultSlot;
};

const testTemplate = `<igc-expansion-panel>
    <span slot="title">
      <span>Sample header text</span>
    </span>
    <div slot="subtitle">Sample subtitle</div>
    <igc-icon slot="indicator" name='select'></igc-icon>
    <p>Sample content</p>
</igc-expansion-panel>`;

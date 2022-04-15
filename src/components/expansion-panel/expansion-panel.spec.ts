import {
  html,
  fixture,
  expect,
  unsafeStatic,
  elementUpdated,
} from '@open-wc/testing';
import sinon from 'sinon';
import { defineComponents, IgcExpansionPanelComponent } from '../../index';

const SLOTS = {
  indicator: 'slot[name="indicator"',
  title: 'slot[name="title"',
  subTitle: 'slot[name="subTitle"',
  content: 'slot[name="content"',
};

const PARTS = {
  header: 'div[part="header"]',
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
      const subTitleSlot = panel.shadowRoot!.querySelector(
        SLOTS.subTitle
      ) as HTMLSlotElement;
      expect(subTitleSlot).not.to.be.null;

      const elements = subTitleSlot.assignedElements();
      expect(elements.length).to.equal(1);
      expect(elements[0].tagName).to.equal('DIV');
      expect((elements[0] as HTMLElement).innerText).to.equal(
        'Sample subtitle'
      );
    });

    it('Should accept custom slot for the panel content', async () => {
      const contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).not.to.be.null;

      const elements = contentSlot.assignedElements();
      expect(elements.length).to.equal(1);
      expect(elements[0].tagName).to.equal('P');
      expect((elements[0] as HTMLElement).innerText).to.equal('Sample content');
    });

    it('Should set indicator alignment properly', async () => {
      panel = await createExpansionPanelComponent();
      panel.indicatorAlignment = 'start';
      await elementUpdated(panel);
      expect(panel).dom.to.equal(
        `<igc-expansion-panel indicator-alignment="start"></igc-expansion-panel>`
      );

      panel.indicatorAlignment = 'end';
      await elementUpdated(panel);
      expect(panel).dom.to.equal(
        `<igc-expansion-panel indicator-alignment="end"></igc-expansion-panel>`
      );
    });

    it('Should get expanded/collapsed on using the API toggle() method', async () => {
      expect(panel.open).to.be.false;

      let contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).to.have.attribute('hidden');

      panel.toggle();
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).not.to.have.attribute('hidden');

      expect(eventSpy).not.to.have.been.called;
    });

    it('Should get expanded/collapsed on using the API show()/hide() methods', async () => {
      expect(panel.open).to.be.false;

      panel.show();
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      let contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).not.to.have.attribute('hidden');

      expect(eventSpy).not.to.have.been.called;

      panel.hide();
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).to.have.attribute('hidden');

      expect(eventSpy).not.to.have.been.called;
    });

    it("Should get expanded/collapsed on setting component's open property", async () => {
      expect(panel.open).to.be.false;

      panel.open = true;
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      let contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).not.to.have.attribute('hidden');

      expect(eventSpy).not.to.have.been.called;

      panel.open = false;
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).to.have.attribute('hidden');

      expect(eventSpy).not.to.have.been.called;
    });

    it('Should get expanded/collapsed on header clicking', async () => {
      const header = panel.shadowRoot?.querySelector(PARTS.header);
      expect(header).not.to.be.null;

      expect(panel.open).to.be.false;

      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      let contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).not.to.have.attribute('hidden');

      // Verify events are called
      expect(eventSpy.callCount).to.equal(2);

      const openingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcContentOpening', openingArgs);

      const openedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcContentOpened', openedArgs);

      eventSpy.resetHistory();

      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).to.have.attribute('hidden');

      expect(eventSpy.callCount).to.equal(2);

      const closingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcContentClosing', closingArgs);

      const closedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcContentClosed', closedArgs);
    });

    it('Should get expanded/collapsed on expand/collapse indicator clicking', async () => {
      const header = panel.shadowRoot?.querySelector(PARTS.indicator);
      expect(header).not.to.be.null;

      expect(panel.open).to.be.false;

      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      let contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).not.to.have.attribute('hidden');

      // Verify events are called
      expect(eventSpy.callCount).to.equal(2);

      const openingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcContentOpening', openingArgs);

      const openedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcContentOpened', openedArgs);

      eventSpy.resetHistory();

      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).to.have.attribute('hidden');

      expect(eventSpy.callCount).to.equal(2);

      const closingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcContentClosing', closingArgs);

      const closedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcContentClosed', closedArgs);
    });

    it('Should get expanded/collapsed on arrowdown/arrowup', async () => {
      setFocusAndTriggerKeydown(panel, 'arrowdown');
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      let contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).not.to.have.attribute('hidden');

      // Verify events are called
      expect(eventSpy.callCount).to.equal(2);

      const openingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcContentOpening', openingArgs);

      const openedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcContentOpened', openedArgs);

      eventSpy.resetHistory();

      setFocusAndTriggerKeydown(panel, 'arrowup');
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).to.have.attribute('hidden');

      expect(eventSpy.callCount).to.equal(2);

      const closingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcContentClosing', closingArgs);

      const closedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcContentClosed', closedArgs);
    });

    it('Should get expanded/collapsed on space/enter', async () => {
      setFocusAndTriggerKeydown(panel, ' ', false);
      await elementUpdated(panel);

      expect(panel.open).to.be.true;

      let contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).not.to.have.attribute('hidden');

      // Verify events are called
      expect(eventSpy.callCount).to.equal(2);

      const openingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcContentOpening', openingArgs);

      const openedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcContentOpened', openedArgs);

      eventSpy.resetHistory();

      setFocusAndTriggerKeydown(panel, 'enter', false);
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      contentSlot = panel.shadowRoot!.querySelector(
        SLOTS.content
      ) as HTMLSlotElement;
      expect(contentSlot).to.have.attribute('hidden');

      expect(eventSpy.callCount).to.equal(2);

      const closingArgs = {
        cancelable: true,
        detail: panel,
      };
      expect(eventSpy.firstCall).calledWith('igcContentClosing', closingArgs);

      const closedArgs = {
        detail: panel,
      };
      expect(eventSpy.secondCall).calledWith('igcContentClosed', closedArgs);
    });

    it('Should not get expanded/collapsed when disabled', async () => {
      //click on header
      let header = panel.shadowRoot?.querySelector(PARTS.header);
      expect(header).not.to.be.null;

      panel.disabled = true;
      await elementUpdated(panel);
      expect(panel.open).to.be.false;

      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      // Verify events are not called
      expect(eventSpy.callCount).to.equal(0);

      //click on indicator
      header = panel.shadowRoot?.querySelector(PARTS.indicator);
      expect(header).not.to.be.null;

      expect(panel.open).to.be.false;

      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      // Verify events are not called
      expect(eventSpy.callCount).to.equal(0);

      //arrodown keypress
      setFocusAndTriggerKeydown(panel, 'arrowdown');
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      // Verify events are called
      expect(eventSpy.callCount).to.equal(0);

      //enter keypress
      setFocusAndTriggerKeydown(panel, 'enter');
      await elementUpdated(panel);

      expect(panel.open).to.be.false;

      // Verify events are called
      expect(eventSpy.callCount).to.equal(0);
    });

    it('Should not get expanded/collapsed when ing events are canceled', async () => {
      //cancel opening event
      const header = panel.shadowRoot?.querySelector(PARTS.header);
      expect(header).not.to.be.null;

      expect(panel.open).to.be.false;

      panel.addEventListener('igcContentOpening', (event) => {
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
      expect(eventSpy).calledOnceWith('igcContentOpening', openingArgs);

      eventSpy.resetHistory();

      //cancel closing event
      panel.show();
      await elementUpdated(panel);

      panel.addEventListener('igcContentClosing', (event) => {
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
      expect(eventSpy).calledOnceWith('igcContentClosing', closingArgs);
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

const setFocusAndTriggerKeydown = (
  expansionPanel: IgcExpansionPanelComponent,
  eventKey: string,
  altKeyFlag = true
): void => {
  //expansionPanel.dispatchEvent(new Event('focus'));
  //expect(tree.navService.focusedItem).to.equal(item);
  expansionPanel.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: eventKey,
      bubbles: true,
      altKey: altKeyFlag,
      cancelable: true,
    })
  );
};

const testTemplate = `<igc-expansion-panel>
    <span slot="title">
      <span>Sample header text</span> 
    </span>
    <div slot="subTitle">Sample subtitle</div>
    <igc-icon slot="indicator" name='select'></igc-icon>
    <p slot="content">Sample content</p> 
</igc-expansion-panel>`;

import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { spy } from 'sinon';
import { CalendarDay } from '../calendar/model.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import type { CustomDateRange } from './date-range-picker.js';
import IgcPredefinedRangesAreaComponent from './predefined-ranges-area.js';

describe('Divider', () => {
  before(() => {
    defineComponents(IgcPredefinedRangesAreaComponent);
  });

  const today = CalendarDay.from(new Date());
  const previousThreeMonthsStart = new Date(
    today.native.getFullYear(),
    today.native.getMonth() - 3,
    1
  );
  const previousThreeMonthsEnd = new Date(
    today.native.getFullYear(),
    today.native.getMonth(),
    0
  );
  const nextThreeMonthsStart = new Date(
    today.native.getFullYear(),
    today.native.getMonth() + 1,
    1
  );
  const nextThreeMonthsEnd = new Date(
    today.native.getFullYear(),
    today.native.getMonth() + 4,
    0
  );

  const customRanges: CustomDateRange[] = [
    {
      label: 'Previous Three Months',
      dateRange: {
        start: previousThreeMonthsStart,
        end: previousThreeMonthsEnd,
      },
    },
    {
      label: 'Next Three Months',
      dateRange: {
        start: nextThreeMonthsStart,
        end: nextThreeMonthsEnd,
      },
    },
  ];

  const createDefaultComponent = () => html`
    <igc-predefined-ranges-area></igc-predefined-ranges-area>
  `;

  const createComponentWithCustomRanges = () => html`
    <igc-predefined-ranges-area
      use-predefined-ranges
      .customRanges=${customRanges}
    ></igc-predefined-ranges-area>
  `;

  let component: IgcPredefinedRangesAreaComponent;

  beforeEach(async () => {
    component = await fixture<IgcPredefinedRangesAreaComponent>(
      createDefaultComponent()
    );
  });

  describe('Predefined Area Component Tests', () => {
    it('passes the a11y audit', async () => {
      await expect(component).to.be.accessible();
      await expect(component).shadowDom.to.be.accessible();
    });

    it('is correctly initialized and rendered with its default component state', () => {
      expect(component).dom.to.equal(
        ' <igc-predefined-ranges-area></igc-predefined-ranges-area>'
      );
      expect((component as any)._allRanges.length).to.equal(0);
    });

    it('is correctly initialized and rendered with predefined ranges', async () => {
      component.usePredefinedRanges = true;
      await elementUpdated(component);

      expect(component).dom.to.equal(
        ' <igc-predefined-ranges-area use-predefined-ranges></igc-predefined-ranges-area>'
      );

      const predefinedRanges = (component as any)._predefinedRanges;
      const chips = component.renderRoot.querySelectorAll('igc-chip');

      expect((component as any)._allRanges.length).to.equal(chips.length);

      for (let i = 0; i < chips.length; i++) {
        expect(chips[i].innerText).to.equal(predefinedRanges[i].label);
      }
    });

    it('is correctly initialized and rendered with predefined ranges and custom ranges', async () => {
      component = await fixture<IgcPredefinedRangesAreaComponent>(
        createComponentWithCustomRanges()
      );

      const allRanges = (component as any)._allRanges;
      const chips = component.renderRoot.querySelectorAll('igc-chip');

      expect(allRanges.length).to.equal(chips.length);

      for (let i = 0; i < chips.length; i++) {
        expect(chips[i].innerText).to.equal(allRanges[i].label);
      }
    });

    it('correctly provides details about the chip that has been clicked on', async () => {
      component = await fixture<IgcPredefinedRangesAreaComponent>(
        createComponentWithCustomRanges()
      );

      const eventSpy = spy();
      component.addEventListener('range-select', eventSpy);
      const allRanges = (component as any)._allRanges;
      const chips = component.renderRoot.querySelectorAll('igc-chip');

      expect(allRanges.length).to.equal(chips.length);

      for (let i = 0; i < chips.length; i++) {
        expect(chips[i].innerText).to.equal(allRanges[i].label);

        chips[i].click();
        await elementUpdated(component);

        expect(eventSpy.calledWithMatch({ detail: allRanges[i] })).to.be.true;
      }
    });
  });
});

/* Paste from existing tests; TODO: rework according to new implementations;
add tests for rendering of component to the common tests.
describe('Selection via the range selection chips', () => {
      //const previousThreeDaysStart = CalendarDay.today.add('day', -3).native;
      //const nextThreeDaysEnd = CalendarDay.today.add('day', 3).native;

      // const customRanges: CustomDateRange[] = [
      //   {
      //     label: 'Previous Three Days',
      //     dateRange: {
      //       start: previousThreeDaysStart,
      //       end: today.native,
      //     },
      //   },
      //   {
      //     label: 'Next Three Days',
      //     dateRange: {
      //       start: today.native,
      //       end: nextThreeDaysEnd,
      //     },
      //   },
      // ];

      it('should not render any chips when usePredefinedRanges is false and there are no custom ranges added', async () => {
        picker.open = true;
        await elementUpdated(picker);

        const chips = picker.renderRoot.querySelectorAll('igc-chip');
        expect(chips.length).to.equal(0);
      });

      it('should render all predefined ranges and content in the actions slot', async () => {
        picker = await fixture<IgcDateRangePickerComponent>(
          html`<igc-date-range-picker use-predefined-ranges>
            <span slot="actions">Actions Slot</span>
          </igc-date-range-picker>`
        );

        picker.open = true;
        const predefinedRanges = (picker as any)._predefinedRanges;
        await elementUpdated(picker);

        const chips = picker.renderRoot.querySelectorAll('igc-chip');
        const slot = picker.renderRoot.querySelector(
          `slot[name="actions"]`
        ) as HTMLSlotElement;
        const elements = slot.assignedElements();

        expect(elements.length).to.equal(1);
        expect(elements[0].tagName).to.equal('SPAN');
        expect(elements[0].innerHTML).to.equal('Actions Slot');

        for (let i = 0; i < chips.length; i++) {
          expect(chips[i].innerText).to.equal(predefinedRanges[i].label);
        }
      });

      // it('should emit igcChange when the chips are clicked and should be closed - dropdown mode', async () => {
      //   const eventSpy = spy(picker, 'emitEvent');
      //   const popover = picker.renderRoot.querySelector('igc-popover');

      //   const predefinedRanges = [
      //     ...(picker as any)._predefinedRanges,
      //     ...customRanges,
      //   ];
      //   picker.usePredefinedRanges = true;
      //   picker.customRanges = customRanges;

      //   picker.open = true;
      //   await elementUpdated(picker);

      //   const allRangesLength = (picker as any)._allRanges.length;
      //   const chips = picker.renderRoot.querySelectorAll('igc-chip');
      //   expect(chips.length).to.equal(allRangesLength);

      //   for (let i = 0; i < chips.length; i++) {
      //     picker.open = true;
      //     await elementUpdated(picker);

      //     expect(chips[i].innerText).to.equal(predefinedRanges[i].label);

      //     chips[i].click();
      //     await elementUpdated(picker);

      //     expect(eventSpy).calledWith('igcChange');
      //     expect(picker.activeDate).to.deep.equal(
      //       predefinedRanges[i].dateRange.start
      //     );

      //     checkSelectedRange(picker, {
      //       start: predefinedRanges[i].dateRange.start,
      //       end: predefinedRanges[i].dateRange.end,
      //     });
      //     expect(popover?.hasAttribute('open')).to.equal(false);
      //     eventSpy.resetHistory();
      //   }
      // });

      // it('should emit igcChange on committing the new selection through chips - dialog mode', async () => {
      //   const eventSpy = spy(picker, 'emitEvent');
      //   picker.mode = 'dialog';

      //   const predefinedRanges = [
      //     ...(picker as any)._predefinedRanges,
      //     ...customRanges,
      //   ];
      //   picker.usePredefinedRanges = true;
      //   picker.customRanges = customRanges;

      //   picker.open = true;
      //   await elementUpdated(picker);

      //   let dialog = picker.renderRoot.querySelector('igc-dialog');
      //   const allRangesLength = (picker as any)._allRanges.length;
      //   const chips = picker.renderRoot.querySelectorAll('igc-chip');
      //   expect(chips.length).to.equal(allRangesLength);

      //   for (let i = 0; i < chips.length; i++) {
      //     picker.open = true;
      //     await elementUpdated(picker);
      //     dialog = picker.renderRoot.querySelector('igc-dialog');
      //     expect(chips[i].innerText).to.equal(predefinedRanges[i].label);

      //     chips[i].click();
      //     await elementUpdated(picker);

      //     expect(eventSpy).not.calledWith('igcChange');
      //     expect(picker.activeDate).to.deep.equal(
      //       predefinedRanges[i].dateRange.start
      //     );

      //     checkSelectedRange(picker, {
      //       start: predefinedRanges[i].dateRange.start,
      //       end: predefinedRanges[i].dateRange.end,
      //     });
      //     expect(dialog?.hasAttribute('open')).to.equal(true);

      //     const doneBtn = picker.shadowRoot!.querySelector(
      //       'igc-button[slot="footer"]:last-of-type'
      //     ) as HTMLButtonElement;
      //     doneBtn?.click();
      //     await elementUpdated(picker);

      //     expect(eventSpy).calledWith('igcChange');
      //     expect(eventSpy).calledWith('igcClosing');
      //     expect(eventSpy).calledWith('igcClosed');
      //     expect(dialog?.hasAttribute('open')).to.equal(false);
      //     eventSpy.resetHistory();
      //   }
      // });

      // it('should render only custom chips, when usePredefinedRanges is false and emit igcChange when chips are clicked', async () => {
      //   const eventSpy = spy(picker, 'emitEvent');
      //   const popover = picker.renderRoot.querySelector('igc-popover');

      //   picker.customRanges = customRanges;
      //   picker.open = true;
      //   await elementUpdated(picker);

      //   const chips = picker.renderRoot.querySelectorAll('igc-chip');
      //   expect(chips.length).to.equal(picker.customRanges.length);

      //   expect(chips[0].innerText).to.equal('Previous Three Days');
      //   expect(chips[1].innerText).to.equal('Next Three Days');

      //   chips[0].click();
      //   await elementUpdated(picker);

      //   expect(eventSpy).calledWith('igcChange');
      //   expect(picker.activeDate).to.deep.equal(previousThreeDaysStart);

      //   checkSelectedRange(picker, {
      //     start: previousThreeDaysStart,
      //     end: today.native,
      //   });

      //   expect(popover?.hasAttribute('open')).to.equal(false);

      //   picker.open = true;
      //   await elementUpdated(picker);
      //   chips[1].click();
      //   await elementUpdated(picker);

      //   expect(eventSpy).calledWith('igcChange');
      //   expect(picker.activeDate).to.deep.equal(today.native);

      //   checkSelectedRange(picker, {
      //     start: today.native,
      //     end: nextThreeDaysEnd,
      //   });

      //   expect(popover?.hasAttribute('open')).to.equal(false);
      // });
    });
*/

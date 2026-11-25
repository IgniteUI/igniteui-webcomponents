import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { isFocused } from '#internals/testing/helpers.spec.js';
import { simulateBackspaceOver } from '#internals/testing/simulate.spec.js';
import type { PickerEditor } from '../date-picker/date-picker.base.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import type { DateRangeValue } from '../types.js';
import IgcDateRangeInputComponent, {
  typedPosition,
} from './date-range-input.js';
import { DateRangePosition } from './date-range-mask-parser.js';
import { typeAt } from './date-range-picker.utils.spec.js';
import { rangeEditors } from './range-editors.js';

const start = new Date(2025, 0, 10);
const end = new Date(2025, 2, 20);
const june10 = new Date(2025, 5, 10);

interface Layout {
  name: string;
  useTwoInputs: boolean;
  template: TemplateResult;
  count: number;
  /** Whether the focus after a pick selects the text of the start editor. */
  selectsText: boolean;
  setValue(root: HTMLElement, value: DateRangeValue): void;
}

const layouts: Layout[] = [
  {
    name: 'single input',
    useTwoInputs: false,
    template: html`<div>
      <igc-date-range-input input-format="MM/dd/yyyy"></igc-date-range-input>
    </div>`,
    count: 1,
    selectsText: false,
    setValue: (root, value) => {
      root.querySelector(IgcDateRangeInputComponent.tagName)!.value = value;
    },
  },
  {
    name: 'two inputs',
    useTwoInputs: true,
    template: html`<div>
      <igc-date-time-input input-format="MM/dd/yyyy"></igc-date-time-input>
      <igc-date-time-input input-format="MM/dd/yyyy"></igc-date-time-input>
    </div>`,
    count: 2,
    selectsText: true,
    setValue: (root, value) => {
      const [first, second] = root.querySelectorAll(
        IgcDateTimeInputComponent.tagName
      );
      first.value = value.start;
      second.value = value.end;
    },
  },
];

function nativeInput(editor: PickerEditor): HTMLInputElement {
  return editor.renderRoot.querySelector('input')!;
}

describe('Range picker editors', () => {
  before(() =>
    defineComponents(IgcDateRangeInputComponent, IgcDateTimeInputComponent)
  );

  describe('Range editors', () => {
    for (const layout of layouts) {
      describe(layout.name, () => {
        let root: HTMLElement;
        let editors: PickerEditor[];

        const subject = () => rangeEditors(root, layout.useTwoInputs);

        beforeEach(async () => {
          root = await fixture<HTMLElement>(layout.template);
          layout.setValue(root, { start, end });
          editors = subject().editors();
          await Promise.all(editors.map((editor) => elementUpdated(editor)));
        });

        it('lists the editors, the start editor first', () => {
          expect(editors).lengthOf(layout.count);
          expect(editors[0]).to.equal(root.firstElementChild);
        });

        it('gives no editors for a root without them', () => {
          const empty = document.createElement('div');
          expect(rangeEditors(empty, layout.useTwoInputs).editors()).to.be
            .empty;
        });

        it('gives the range of the editors', () => {
          expect(subject().committed()).to.eql({ start, end });
          expect(subject().typed()).to.eql({ start, end });
        });

        it('gives the typed range and the typed date during an edit of the start', async () => {
          editors[0].focus();
          await elementUpdated(editors[0]);

          typeAt(nativeInput(editors[0]), '6', 1);
          await elementUpdated(editors[0]);

          expect(subject().typed()).to.eql({ start: june10, end });
          expect(subject().typedDate(editors[0])).to.eql(june10);
          expect(subject().committed()).to.eql({ start, end });
        });

        it('gives the range of the editors as the edit without an edit', () => {
          expect(subject().edit({ start: june10, end: june10 })).to.eql({
            start,
            end,
          });
        });

        it('gives an edit that keeps the typed order, the previous end while incomplete and no end while blank', async () => {
          const august1 = new Date(2025, 7, 1);
          const previous = { start: august1, end: august1 };
          const input = nativeInput(editors[0]);

          editors[0].focus();
          await elementUpdated(editors[0]);

          // June 10 is after the end.
          typeAt(input, '6', 1);
          await elementUpdated(editors[0]);
          expect(subject().edit(null)).to.eql({ start: june10, end });

          // The year of the start.
          await simulateBackspaceOver(editors[0], 6, 10);
          expect(subject().edit(previous)).to.eql({ start: august1, end });
          expect(subject().edit(null)).to.eql({ start: null, end });

          await simulateBackspaceOver(editors[0], 0, 10);
          expect(subject().edit(previous)).to.eql({ start: null, end });
        });

        it('gives the focus to the start editor after a pick', () => {
          subject().focusAfterPick();

          const input = nativeInput(editors[0]);
          expect(isFocused(input)).to.be.true;
          expect(
            input.selectionStart === 0 &&
              input.selectionEnd === input.value.length
          ).to.equal(layout.selectsText);
        });
      });
    }

    describe('end at the caret of the single input', () => {
      let root: HTMLElement;
      let editor: IgcDateRangeInputComponent;
      let input: HTMLInputElement;

      beforeEach(async () => {
        root = await fixture<HTMLElement>(layouts[0].template);
        editor = root.querySelector(IgcDateRangeInputComponent.tagName)!;
        editor.value = { start, end };
        editor.focus();
        await elementUpdated(editor);
        input = nativeInput(editor);
      });

      it('names the end at the caret, also at the edge of a part', () => {
        const cases = [
          [0, DateRangePosition.Start],
          [10, DateRangePosition.Start],
          [11, undefined],
          [12, undefined],
          [13, DateRangePosition.End],
          [23, DateRangePosition.End],
        ] as const;

        expect(input.value).to.equal('01/10/2025 - 03/20/2025');

        for (const [caret, position] of cases) {
          input.setSelectionRange(caret, caret);
          expect(typedPosition(editor), `caret at ${caret}`).to.equal(position);
        }
      });

      it('gives the end at the caret as the typed date, and nothing in the separator', () => {
        const editors = rangeEditors(root, false);

        input.setSelectionRange(13, 13);
        expect(editors.typedDate(editor)).to.eql(end);

        input.setSelectionRange(11, 11);
        expect(editors.typedDate(editor)).to.be.null;
      });
    });

    it('gives the date of each editor as the typed date with two inputs', async () => {
      const root = await fixture<HTMLElement>(layouts[1].template);
      layouts[1].setValue(root, { start, end });
      const editors = rangeEditors(root, true);
      const [first, second] = editors.editors();

      expect(editors.typedDate(first)).to.eql(start);
      expect(editors.typedDate(second)).to.eql(end);
    });
  });
});

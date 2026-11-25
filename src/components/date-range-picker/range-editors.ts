import { firstOf } from '#internals/utils/arrays.js';
import type { PickerEditor } from '../date-picker/date-picker.base.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import type { DateRangeValue } from '../types.js';
import IgcDateRangeInputComponent, {
  typedPosition,
} from './date-range-input.js';

/** The editors of the active range picker layout. Each instance reads its render root once. */
export interface RangeEditors {
  /** The editors, the start editor first. */
  editors(): PickerEditor[];
  /** The range as the user types it. A single input gives `null` until both ends are complete. */
  typed(): DateRangeValue | null;
  /** The date that the user types in `target`; in a range input, the end at the caret. */
  typedDate(target: PickerEditor): Date | null;
  /**
   * The range that the calendar selects while the user types. An incomplete end keeps the end of `previous`, a blank
   * end is `null`. The ends keep the typed order.
   */
  edit(previous: DateRangeValue | null): DateRangeValue | null;
  /** The range that the editors hold. */
  committed(): DateRangeValue | null;
  /** Gives the focus back to the start editor after a calendar pick. */
  focusAfterPick(): void;
}

class SingleInputEditors implements RangeEditors {
  private readonly _input: IgcDateRangeInputComponent | null;

  constructor(root: ParentNode) {
    this._input = root.querySelector(IgcDateRangeInputComponent.tagName);
  }

  public editors(): PickerEditor[] {
    const input = this._input;
    return input ? [input] : [];
  }

  public typed(): DateRangeValue | null {
    return this._input?._uncommittedValue ?? null;
  }

  public typedDate(): Date | null {
    const input = this._input;
    if (!input) return null;

    const position = typedPosition(input);
    return position ? (input._uncommittedValue?.[position] ?? null) : null;
  }

  public edit(previous: DateRangeValue | null): DateRangeValue | null {
    return this._input?._parseEdit(previous) ?? null;
  }

  public committed(): DateRangeValue | null {
    return this._input?.value ?? null;
  }

  public focusAfterPick(): void {
    this._input?.focus();
  }
}

class TwoInputEditors implements RangeEditors {
  private readonly _inputs: IgcDateTimeInputComponent[];

  constructor(root: ParentNode) {
    this._inputs = Array.from(
      root.querySelectorAll(IgcDateTimeInputComponent.tagName)
    );
  }

  private _readEnds(
    read: (
      input: IgcDateTimeInputComponent,
      end: keyof DateRangeValue
    ) => Date | null
  ): DateRangeValue {
    const [start, end] = this._inputs;
    return {
      start: start ? read(start, 'start') : null,
      end: end ? read(end, 'end') : null,
    };
  }

  public editors(): PickerEditor[] {
    return this._inputs;
  }

  /** Without a previous range, the edit of a date-time input is its strict parse. */
  public typed(): DateRangeValue {
    return this.edit(null);
  }

  public typedDate(target: PickerEditor): Date | null {
    return (
      this._inputs.find((input) => input === target)?._uncommittedValue ?? null
    );
  }

  public edit(previous: DateRangeValue | null): DateRangeValue {
    return this._readEnds((input, end) =>
      input._parseEdit(previous?.[end] ?? null)
    );
  }

  public committed(): DateRangeValue {
    return this._readEnds((input) => input.value);
  }

  public focusAfterPick(): void {
    firstOf(this._inputs)?.select();
  }
}

/** The editors in `root` of the layout that `useTwoInputs` selects. */
export function rangeEditors(
  root: ParentNode,
  useTwoInputs: boolean
): RangeEditors {
  return useTwoInputs
    ? new TwoInputEditors(root)
    : new SingleInputEditors(root);
}

import { firstOf } from '#internals/utils/arrays.js';
import type { PickerEditor } from '../date-picker/date-picker.base.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import type { DateRangeValue } from '../types.js';
import IgcDateRangeInputComponent, {
  typedPosition,
} from './date-range-input.js';

/**
 * The editors of one layout of the range picker in its render root, which holds the editors of the active layout
 * only: a single range input, or a start and an end input.
 */
export interface RangeEditors {
  /** The editors, the start editor first. */
  editors(): PickerEditor[];
  /** The range as the user types it. */
  typed(): DateRangeValue | null;
  /** The date that the user types in `target`; in a range input, the end at the caret. */
  typedDate(target: PickerEditor): Date | null;
  /** The range that the editors hold. */
  committed(): DateRangeValue | null;
  /** Gives the focus back to the start editor after a calendar pick. */
  focusAfterPick(): void;
}

class SingleInputEditors implements RangeEditors {
  private readonly _root: ParentNode;

  constructor(root: ParentNode) {
    this._root = root;
  }

  private get _input(): IgcDateRangeInputComponent | null {
    return this._root.querySelector(IgcDateRangeInputComponent.tagName);
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

  public committed(): DateRangeValue | null {
    return this._input?.value ?? null;
  }

  public focusAfterPick(): void {
    this._input?.focus();
  }
}

class TwoInputEditors implements RangeEditors {
  private readonly _root: ParentNode;

  constructor(root: ParentNode) {
    this._root = root;
  }

  private get _inputs(): IgcDateTimeInputComponent[] {
    return Array.from(
      this._root.querySelectorAll(IgcDateTimeInputComponent.tagName)
    );
  }

  private _readEnds(
    read: (input: IgcDateTimeInputComponent) => Date | null
  ): DateRangeValue {
    const [start, end] = this._inputs;
    return {
      start: start ? read(start) : null,
      end: end ? read(end) : null,
    };
  }

  public editors(): PickerEditor[] {
    return this._inputs;
  }

  public typed(): DateRangeValue {
    return this._readEnds((input) => input._uncommittedValue);
  }

  public typedDate(target: PickerEditor): Date | null {
    return (
      this._inputs.find((input) => input === target)?._uncommittedValue ?? null
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

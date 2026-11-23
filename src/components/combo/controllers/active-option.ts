import type { ReactiveController } from 'lit';
import type IgcComboComponent from '../combo.js';
import type { ComboRecord } from '../types.js';
import type { DataState } from './data.js';

/** The fields of the combo that the active option reads. */
export type ActiveOptionHost<T extends object> = Pick<
  IgcComboComponent<T>,
  'addController' | 'requestUpdate' | 'open' | 'singleSelect'
>;

/**
 * The option of the list that the keyboard acts on. In each update, after the
 * records: a closed list or a `singleSelect` change has none, a pending search
 * takes the first option, and otherwise it follows its record.
 */
export class ComboActiveOption<T extends object> implements ReactiveController {
  //#region Internal state

  private readonly _host: ActiveOptionHost<T>;
  private readonly _state: DataState<T>;
  private readonly _onChange: () => void;
  private _index = -1;
  /** The record at {@link _index} when it was set. */
  private _anchor?: ComboRecord<T>;
  private _searching = false;
  private _moved = false;
  private _singleSelect?: boolean;

  //#endregion

  /** The index of the active option in the records, or -1. */
  public get active(): number {
    return this._index;
  }

  /** The record of the active option. */
  public get record(): ComboRecord<T> | undefined {
    return this._state.dataState[this._index];
  }

  /** Whether the last update moved the active option with its record. */
  public get moved(): boolean {
    return this._moved;
  }

  /**
   * Adds itself to the host.
   * @param onChange Called on each write, to render the rows again.
   */
  constructor(
    host: ActiveOptionHost<T>,
    state: DataState<T>,
    onChange: () => void
  ) {
    this._host = host;
    this._state = state;
    this._onChange = onChange;
    this._host.addController(this);
  }

  // Not on disconnect, which would render the detached host.
  public hostConnected(): void {
    this.reset();
  }

  public hostUpdate(): void {
    const { open, singleSelect } = this._host;
    const modeChanged =
      this._singleSelect !== undefined && this._singleSelect !== singleSelect;
    const searching = this._searching;

    this._singleSelect = singleSelect;
    this._searching = false;
    this._moved = false;

    if (!open || modeChanged) {
      if (this._index !== -1) {
        this.set(-1);
      }
    } else if (searching) {
      // Remote results come later, so no option of the old results becomes active.
      this.set(
        this._state.filteringOptions.mode === 'remote'
          ? -1
          : this._state.firstOptionIndex
      );
    } else {
      this._follow();
    }
  }

  //#region Intents

  /** Makes the option at `index` active, or none for -1. */
  public set(index: number): void {
    const previous = this._index;

    this._index = index;
    this._anchor = this._state.dataState[index];
    this._onChange();

    if (previous !== index) {
      this._host.requestUpdate();
    }
  }

  public first(): void {
    this.set(this._state.firstOptionIndex);
  }

  /** Makes the last record active, which can be a placeholder. */
  public last(): void {
    this.set(this._state.dataState.length - 1);
  }

  /**
   * Makes the next option in the direction of `delta` active.
   * @returns Whether such an option exists.
   */
  public step(delta: -1 | 1): boolean {
    const records = this._state.dataState;

    for (
      let i = this._index + delta;
      i >= 0 && i < records.length;
      i += delta
    ) {
      if (this._state.isOption(records[i])) {
        this.set(i);
        return true;
      }
    }

    return false;
  }

  /**
   * The next update takes the first option, also over earlier intents. It
   * requests the update, as `disableFiltering` keeps the records.
   */
  public search(): void {
    this._searching = true;
    this._host.requestUpdate();
  }

  public reset(): void {
    this.set(-1);
  }

  //#endregion

  /** A placeholder keeps its index for the item that loads there. */
  private _follow(): void {
    const anchor = this._anchor;
    const records = this._state.dataState;

    if (!anchor || records[this._index] === anchor) {
      return;
    }

    const index =
      anchor.kind === 'placeholder'
        ? this._index
        : this._state.indexOfRecord(anchor);
    const next = records[index];
    // A header without group selection, or a place past the end, is no option.
    const active = next && this._state.isOption(next) ? index : -1;

    this._moved = active > -1 && active !== this._index;
    this.set(active);
  }
}

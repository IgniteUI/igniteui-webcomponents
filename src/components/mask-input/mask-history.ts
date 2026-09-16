/** A snapshot of the editor state as it was *before* an edit was applied. */
type MaskHistoryState = {
  value: string;
  start: number;
  end: number;
};

/**
 * The granularity an edit contributes to the history.
 *
 * The three granular kinds coalesce, so a run of typed characters or of deletions
 * collapses into a single step. Everything else - paste, drop, cut, composition,
 * auto-fill, spinning a date part, `setRangeText` - is `atomic` and gets its own step.
 */
type MaskEditKind = 'insert' | 'delete-backward' | 'delete-forward' | 'atomic';

/** Resolves the identity of the mask pattern the snapshots were taken against. */
type MaskSignature = () => string;

const MAX_HISTORY_SIZE = 100;

/**
 * The undo/redo history of a masked editor.
 *
 * Masked text is rendered through `.value=${live(...)}`, so every edit reassigns the
 * native input's value - which wipes the browser's own undo stack. This replaces it.
 *
 * It holds no timers: a run is coalesced purely from the caret geometry, so the same
 * sequence of edits always produces the same sequence of steps.
 *
 * The history is self-invalidating rather than instrumented. Anything that moves the
 * masked text without going through it - a programmatic `value`, `clear()`, a form reset -
 * is caught by comparing against the text it last observed, and a changed mask pattern is
 * caught by the signature. That is why no call site has to announce those changes.
 *
 * @hidden
 */
class MaskHistory {
  private readonly _signature: MaskSignature;
  private readonly _undoStack: MaskHistoryState[] = [];
  private readonly _redoStack: MaskHistoryState[] = [];

  private _lastKind: MaskEditKind | null = null;
  private _lastCaret = -1;
  private _lastValue = '';
  private _pattern = '';

  /**
   * The state the most recent traversal restored.
   *
   * Holding `Ctrl + Z` fires faster than the caret can be written back to the DOM, so the
   * live selection is not a trustworthy counterpart entry for the opposite stack. The
   * state we know we just restored is.
   */
  private _lastRestored: MaskHistoryState | null = null;

  constructor(signature: MaskSignature) {
    this._signature = signature;
  }

  public get canUndo(): boolean {
    return this._undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this._redoStack.length > 0;
  }

  /**
   * A run continues only while the caret stays where the previous edit left it, which is
   * what makes a click or an arrow key break it without any extra hook. Replacing a
   * selection is always a deliberate edit of its own.
   */
  private _shouldCoalesce(
    kind: MaskEditKind,
    state: MaskHistoryState
  ): boolean {
    if (
      kind === 'atomic' ||
      kind !== this._lastKind ||
      !this.canUndo ||
      state.start !== state.end
    ) {
      return false;
    }

    return kind === 'insert'
      ? state.start === this._lastCaret
      : state.end === this._lastCaret;
  }

  private _clear(): void {
    this._undoStack.length = 0;
    this._redoStack.length = 0;
    this._lastKind = null;
    this._lastCaret = -1;
    this._lastRestored = null;
  }

  /**
   * Drops everything the history holds when the mask pattern changed or the text moved
   * behind our back. Returns whether the snapshots are still usable.
   */
  private _validate(value: string): boolean {
    const pattern = this._signature();
    const stale =
      pattern !== this._pattern || (this.canUndo && value !== this._lastValue);

    if (stale) {
      this._pattern = pattern;
      this._clear();
      this._lastValue = value;
    }

    return !stale;
  }

  /**
   * Records the state an edit is about to overwrite. Must be called *before* the mask is
   * mutated, and only once the edit is known to change something.
   */
  public record(kind: MaskEditKind, state: MaskHistoryState): void {
    this._validate(state.value);
    this._redoStack.length = 0;
    this._lastRestored = null;

    if (!this._shouldCoalesce(kind, state)) {
      this._undoStack.push({ ...state });

      if (this._undoStack.length > MAX_HISTORY_SIZE) {
        this._undoStack.shift();
      }
    }

    this._lastKind = kind;
  }

  /**
   * Reports the state an edit settled on, so that the next {@link record} can tell
   * whether it continues the run.
   */
  public settle(value: string, caret: number): void {
    this._lastValue = value;
    this._lastCaret = caret;
  }

  /**
   * Reconciles the history with the editor's current text, typically on focus where a
   * date editor swaps the display format back for the input format. An unchanged
   * document keeps its history, a changed one drops it, and either way the run ends.
   */
  public resync(value: string): void {
    this._validate(value);

    this._lastValue = value;
    this._lastKind = null;
    this._lastCaret = -1;
    this._lastRestored = null;
  }

  /** Steps one edit back, handing `current` to the redo stack. */
  public undo(current: MaskHistoryState): MaskHistoryState | null {
    return this._step(this._undoStack, this._redoStack, current);
  }

  /** Steps one edit forward, handing `current` back to the undo stack. */
  public redo(current: MaskHistoryState): MaskHistoryState | null {
    return this._step(this._redoStack, this._undoStack, current);
  }

  private _step(
    from: MaskHistoryState[],
    to: MaskHistoryState[],
    current: MaskHistoryState
  ): MaskHistoryState | null {
    // Traversing a history whose document has moved on would restore text belonging to a
    // value the component no longer holds.
    if (!this._validate(current.value)) {
      return null;
    }

    const state = from.pop();

    if (!state) {
      return null;
    }

    to.push(this._lastRestored ?? { ...current });

    // Typing after an undo must not extend the step that was just restored.
    this._lastKind = null;
    this._lastValue = state.value;
    this._lastCaret = state.start;
    this._lastRestored = { ...state };

    return state;
  }
}

/**
 * Creates a {@link MaskHistory} for a masked editor.
 *
 * @param signature - resolves the identity of the mask pattern the snapshots are taken
 * against. A callback rather than a value because the history is created by the mask
 * behavior mixin, whose fields initialize *before* the parser of the concrete component.
 *
 * @example
 * ```ts
 * const history = createMaskHistory(() => `${parser.mask} ${parser.prompt}`);
 * ```
 */
export function createMaskHistory(signature: MaskSignature): MaskHistory {
  return new MaskHistory(signature);
}

export type { MaskEditKind, MaskHistory, MaskHistoryState, MaskSignature };

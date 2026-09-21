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
 * The undo and redo history of a masked editor.
 *
 * @remarks
 * `.value=${live(...)}` renders the masked text, so each edit assigns the value
 * of the native input again and clears the undo stack of the browser. This
 * history replaces that stack.
 *
 * It holds no timers. The caret geometry alone groups a run, so the same edits
 * always give the same steps.
 *
 * The history invalidates itself. It compares against the text it last saw to
 * find a change that did not go through it, such as a `value` from code,
 * `clear()` or a form reset, and the signature finds a changed mask pattern. No
 * call site must report those changes.
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
   * The state that the last traversal restored.
   *
   * @remarks
   * A held `Ctrl + Z` repeats faster than the caret reaches the DOM, so the live
   * selection is not a reliable entry for the opposite stack. This state holds
   * the value and the caret that the traversal wrote, so it pushes the correct
   * entry.
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
   * A run continues only while the caret stays where the last edit left it, so a
   * click or an arrow key breaks it with no extra hook. A replaced selection is
   * always its own edit.
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
   * Drops all the history if the mask pattern changed, or if the text moved
   * from outside. Returns whether the snapshots are still usable.
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

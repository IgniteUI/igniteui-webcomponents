import type { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  createMaskHistory,
  type MaskEditKind,
  type MaskHistory,
  type MaskHistoryState,
} from '../../mask-input/mask-history.js';
import type { MaskParser } from '../../mask-input/mask-parser.js';
import type {
  RangeTextSelectMode,
  SelectionRangeDirection,
} from '../../types.js';
import {
  addKeybindings,
  ctrlKey,
  metaKey,
  shiftKey,
} from '../controllers/key-bindings.js';
import type { AbstractConstructor } from './constructor.js';

export type MaskSelection = {
  start: number;
  end: number;
};

/**
 * The `inputType` values the mask editor models, mapped to their undo granularity.
 *
 * Anything absent is a native mutation we do not model - auto-fill is the empty-string
 * entry, `deleteWordBackward` and friends are simply not handled.
 */
const MaskEditKinds = new Map<string, MaskEditKind>([
  ['insertText', 'insert'],
  ['deleteContentBackward', 'delete-backward'],
  ['deleteContentForward', 'delete-forward'],
  ['deleteByCut', 'atomic'],
  ['insertFromPaste', 'atomic'],
  ['insertFromDrop', 'atomic'],
  ['', 'atomic'],
]);

/**
 * Public + protected interface contributed by {@link MaskBehaviorMixin}.
 * Declared as a `declare class` so consumers can see protected members through
 * the cast return type (mirrors the pattern used by the form-associated mixins).
 */
export declare class MaskBehaviorElementInterface {
  //#region Required from host

  protected readonly _input?: HTMLInputElement;
  protected readonly _parser: MaskParser;

  /** Reflects the current parser state into the host's public value. */
  protected _syncValueFromMask(): void;

  /** Delegates Enter-key handling to the form-associated base. */
  protected _handleEnterKeydown(event: KeyboardEvent): void;

  //#endregion

  //#region Internal state

  protected _maskSelection: MaskSelection;
  protected _compositionStart: number;
  protected _focused: boolean;
  protected _maskedValue: string;
  protected readonly _history: MaskHistory;

  protected get _inputSelection(): MaskSelection;
  protected get _isEmptyMask(): boolean;
  protected get _historyText(): string;

  //#endregion

  //#region Public attributes and properties

  /**
   * Makes the control a readonly field.
   * @attr readonly
   * @default false
   */
  public readOnly: boolean;

  /**
   * The mask pattern of the component.
   * @attr
   */
  public get mask(): string;
  public set mask(value: string);

  /**
   * The prompt symbol to use for unfilled parts of the mask pattern.
   * @attr
   * @default '_'
   */
  public get prompt(): string;
  public set prompt(value: string);

  //#endregion

  //#region Event handlers

  protected _handleInput(event: InputEvent): Promise<void>;
  protected _handleBeforeInput(event: InputEvent): void;
  protected _updateInput(text: string, range: MaskSelection): Promise<void>;
  protected _commitMaskedValue(value: string): void;
  protected _emitInputEvent(): void;
  protected _setMaskSelection(event: Event): void;
  protected _handleCompositionStart(): void;
  protected _handleCompositionEnd(event: CompositionEvent): void;
  protected _handleClick(): void;

  //#endregion

  //#region Undo/redo

  protected _recordHistory(
    kind: MaskEditKind,
    next: string,
    caret: number,
    selection?: MaskSelection
  ): void;

  protected _historyStep(direction: 'undo' | 'redo'): Promise<void>;
  protected _historyResync(): void;

  //#endregion

  //#region Public methods

  /** Sets the text selection range of the control. */
  public setSelectionRange(
    start?: number,
    end?: number,
    direction?: SelectionRangeDirection
  ): void;

  /** Replaces the selected text in the control and re-applies the mask. */
  public setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectMode?: RangeTextSelectMode
  ): void;

  //#endregion
}

/**
 * Adds masked-input behavior (parser-driven editing, selection tracking,
 * composition handling, range text replacement) to a LitElement-derived class.
 *
 * The host class is expected to provide:
 * - `_input`            – the native `<input>` element (typically via `@query('input')`).
 * - `_parser`           – a {@link MaskParser} (or subclass) instance.
 * - `_setTouchedState`  – from `FormAssociatedMixin`.
 * - `emitEvent`         – from `EventEmitterMixin`.
 * - `select`            – from the host base.
 *
 * The host class must implement `_syncValueFromMask` to bridge the masked
 * text back into its public `value`. It is called by the default
 * `_commitMaskedValue` implementation.
 */
export function MaskBehaviorMixin<T extends AbstractConstructor<LitElement>>(
  superClass: T
): AbstractConstructor<MaskBehaviorElementInterface> & T {
  abstract class MaskBehaviorElement extends superClass {
    //#region Required from host

    protected abstract readonly _input?: HTMLInputElement;
    protected abstract readonly _parser: MaskParser;
    protected abstract _setTouchedState(): void;
    public abstract select(): void;
    public abstract emitEvent(name: string, init?: CustomEventInit): boolean;

    protected abstract _syncValueFromMask(): void;
    protected abstract _handleEnterKeydown(event: KeyboardEvent): void;

    //#endregion

    //#region Internal state

    protected _maskSelection: MaskSelection = { start: 0, end: 0 };
    protected _compositionStart = 0;

    /**
     * The signature is the source pattern rather than the escaped one: the date parsers
     * convert a date format into mask flags, so `MM/dd/yyyy` and `dd/MM/yyyy` share an
     * escaped mask of `00/00/0000` while meaning entirely different things.
     */
    protected readonly _history = createMaskHistory(
      () => `${this._parser.mask} ${this._parser.prompt}`
    );

    @state()
    protected _focused = false;

    @state()
    protected _maskedValue = '';

    protected get _inputSelection(): MaskSelection {
      return {
        start: this._input?.selectionStart || 0,
        end: this._input?.selectionEnd || 0,
      };
    }

    /** Indicates whether the current mask value is empty. */
    protected get _isEmptyMask(): boolean {
      return this._maskedValue === this._parser.emptyMask;
    }

    /**
     * The masked text as the undo history sees it. `igc-mask-input` blanks it on blur and
     * restores the empty mask on focus; both spell the same empty document, so without
     * this normalization every focus of an empty editor would look like a foreign change.
     */
    protected get _historyText(): string {
      return this._maskedValue || this._parser.emptyMask;
    }

    //#endregion

    //#region Lifecycle

    constructor(...args: any[]) {
      super(...args);

      // Assigning `input.value` - which every masked edit does - clears the browser's
      // own undo stack, so the standard shortcuts have to be served from `_history`.
      // The IME owns the text until `compositionend`, hence the `isComposing` guard.
      const step =
        (direction: 'undo' | 'redo') =>
        (event: KeyboardEvent): void => {
          if (!event.isComposing) {
            this._historyStep(direction);
          }
        };

      addKeybindings(this, {
        skip: () => this.readOnly,
        bindingDefaults: { repeat: true },
      })
        .set([ctrlKey, 'z'], step('undo'))
        .set([metaKey, 'z'], step('undo'))
        .set([ctrlKey, 'y'], step('redo'))
        .set([ctrlKey, shiftKey, 'z'], step('redo'))
        .set([metaKey, shiftKey, 'z'], step('redo'));
    }

    //#endregion

    //#region Public attributes and properties

    /**
     * Makes the control a readonly field.
     *
     * @attr readonly
     * @default false
     */
    @property({ type: Boolean, reflect: true })
    public readOnly = false;

    /**
     * The mask pattern of the component.
     *
     * @attr
     */
    @property()
    public set mask(value: string) {
      this._parser.mask = value;
    }

    public get mask(): string {
      return this._parser.mask;
    }

    /**
     * The prompt symbol to use for unfilled parts of the mask pattern.
     *
     * @attr
     * @default '_'
     */
    @property()
    public set prompt(value: string) {
      this._parser.prompt = value;
    }

    public get prompt(): string {
      return this._parser.prompt;
    }

    //#endregion

    //#region Event handlers

    protected async _handleInput({
      inputType,
      isComposing,
    }: InputEvent): Promise<void> {
      const value = this._input?.value ?? '';
      const { start, end } = this._maskSelection;
      const deletePosition = this._parser.getNextNonLiteralPosition(end) + 1;

      // Reachable only where `beforeinput` is not cancelable - normally the browser's
      // history commands are intercepted before they ever mutate the input.
      if (inputType === 'historyUndo' || inputType === 'historyRedo') {
        return this._historyStep(inputType === 'historyUndo' ? 'undo' : 'redo');
      }

      // A composing backspace is handled by the composition events instead.
      if (inputType === 'deleteContentBackward' && isComposing) {
        return;
      }

      const kind = MaskEditKinds.get(inputType ?? '');

      if (kind === undefined) {
        // A non-modeled mutation has already changed the input's DOM value, so re-render
        // to let the `live()` binding roll it back to the masked text. Never mid-IME
        // though - `insertCompositionText` fires repeatedly there and resetting the value
        // underneath the browser breaks composition outright.
        if (!isComposing) {
          this.requestUpdate();
        }
        return;
      }

      this._setTouchedState();

      switch (inputType) {
        case 'deleteContentForward': {
          await this._updateInput('', { start, end: deletePosition }, kind);
          this._input?.setSelectionRange(deletePosition, deletePosition);
          // `_updateInput` settled on the parser's cursor, but the caret actually ends up
          // past the deleted character - record that so a run of deletes coalesces.
          this._history.settle(this._historyText, deletePosition);
          return;
        }

        case 'deleteContentBackward':
          return this._updateInput(
            '',
            {
              start: this._parser.getPreviousNonLiteralPosition(
                this._inputSelection.start + 1
              ),
              end,
            },
            kind
          );

        case 'deleteByCut':
          return this._updateInput('', this._maskSelection, kind);

        case 'insertText':
          return this._updateInput(
            value.substring(start, this._inputSelection.end),
            this._maskSelection,
            kind
          );

        case 'insertFromPaste':
          return this._updateInput(
            value.substring(start, this._inputSelection.end),
            {
              start,
              end: this._inputSelection.start,
            },
            kind
          );

        case 'insertFromDrop':
          // An external drop is preceded by no `dragstart`, so `_maskSelection` is stale.
          return this._updateInput(
            value.substring(
              this._inputSelection.start,
              this._inputSelection.end
            ),
            { ...this._inputSelection },
            kind,
            {
              start: this._inputSelection.start,
              end: this._inputSelection.start,
            }
          );

        // Potential browser auto-fill behavior
        case undefined:
        case '':
          return this._updateInput(
            this._parser.parse(
              value.substring(start, this._inputSelection.end)
            ),
            {
              start,
              end: this._inputSelection.end,
            },
            kind,
            { start, end: start }
          );
      }
    }

    /**
     * Default mask-update routine. Re-applies the parser, commits the result through
     * {@link MaskBehaviorElementInterface._commitMaskedValue} and emits an input event
     * when the edit is not at the trailing mask boundary.
     */
    protected async _updateInput(
      text: string,
      range: MaskSelection,
      kind: MaskEditKind = 'atomic',
      caretBefore?: MaskSelection
    ): Promise<void> {
      const { value, end } = this._parser.replace(
        this._maskedValue,
        text,
        range.start,
        range.end
      );

      this._recordHistory(kind, value, end, caretBefore ?? this._maskSelection);
      this._commitMaskedValue(value);
      this.requestUpdate();

      if (range.start !== this._parser.mask.length) {
        this._emitInputEvent();
      }

      await this.updateComplete;
      this._input?.setSelectionRange(end, end);
    }

    /**
     * Writes a fully-formed masked text into the component's value pipeline.
     *
     * This is the one step where the leaves genuinely differ - `igc-mask-input` commits
     * straight to its form value, while the date editors keep the text as a draft until
     * blur - so it is also the only thing undo/redo has to delegate.
     */
    protected _commitMaskedValue(value: string): void {
      this._maskedValue = value;
      this._syncValueFromMask();
    }

    /**
     * Emits an `igcInput` event with the current masked value as detail.
     * Override to emit a different payload (e.g. the parsed value).
     */
    protected _emitInputEvent(): void {
      this._setTouchedState();
      this.emitEvent('igcInput', { detail: this._maskedValue });
    }

    protected _setMaskSelection(event: Event): void {
      this._maskSelection = this._inputSelection;
      if (event instanceof KeyboardEvent) {
        this._handleEnterKeydown(event);
      }
    }

    protected _handleCompositionStart(): void {
      this._compositionStart = this._inputSelection.start;
    }

    protected _handleCompositionEnd({ data }: CompositionEvent): void {
      // The whole composed sequence is one undo step, anchored where it began.
      this._updateInput(
        data,
        { start: this._compositionStart, end: this._inputSelection.end },
        'atomic',
        { start: this._compositionStart, end: this._compositionStart }
      );
    }

    protected _handleClick(): void {
      const { selectionStart: start, selectionEnd: end } = this._input ?? {
        selectionStart: 0,
        selectionEnd: 0,
      };

      // Clicking at the end of the input field will select the entire mask
      if (start === end && start === this._maskedValue.length) {
        this.select();
      }
    }

    /**
     * Intercepts the browser's own history commands - the Edit and context menus, and
     * the software keyboard on mobile - which never reach the key bindings. The native
     * stack is empty anyway, so letting one through would only de-sync the input's DOM
     * value from the masked text.
     */
    protected _handleBeforeInput(event: InputEvent): void {
      const { inputType } = event;

      if (inputType !== 'historyUndo' && inputType !== 'historyRedo') {
        return;
      }

      event.preventDefault();

      if (!this.readOnly) {
        this._historyStep(inputType === 'historyUndo' ? 'undo' : 'redo');
      }
    }

    //#endregion

    //#region Undo/redo

    /**
     * Snapshots the current masked text before `next` replaces it, then reports where the
     * caret ends up. Must be called *before* the text is committed.
     *
     * Only a real change earns an undo step: a character the mask rejects, a backspace at
     * position zero or a spin that hit a boundary would otherwise leave behind a step
     * that appears to do nothing when undone.
     */
    protected _recordHistory(
      kind: MaskEditKind,
      next: string,
      caret: number,
      selection: MaskSelection = this._inputSelection
    ): void {
      const previous = this._historyText;

      if (next !== previous) {
        this._history.record(kind, { value: previous, ...selection });
      }

      this._history.settle(next, caret);
    }

    /** Reconciles the history with the current masked text. */
    protected _historyResync(): void {
      this._history.resync(this._historyText);
    }

    /** Restores the neighboring history state in the given direction. */
    protected async _historyStep(direction: 'undo' | 'redo'): Promise<void> {
      if (this.readOnly) {
        return;
      }

      const current: MaskHistoryState = {
        value: this._historyText,
        ...this._inputSelection,
      };

      const state =
        direction === 'undo'
          ? this._history.undo(current)
          : this._history.redo(current);

      if (!state) {
        return;
      }

      this._setTouchedState();
      this._commitMaskedValue(state.value);
      this.requestUpdate();

      // Native inputs announce an undo as an `input` event, and the composite hosts
      // (`igc-date-picker`, `igc-date-range-picker`) read the draft value from ours.
      this._emitInputEvent();

      await this.updateComplete;

      // Through the mixin method, since the input's own keydown handler has already
      // overwritten `_maskSelection` with the caret as it was before the restore.
      this.setSelectionRange(state.start, state.end);
    }

    //#endregion

    //#region Public methods

    /* blazorSuppress */
    /** Sets the text selection range of the control */
    public setSelectionRange(
      start?: number,
      end?: number,
      direction: SelectionRangeDirection = 'none'
    ): void {
      this._input?.setSelectionRange(start ?? null, end ?? null, direction);
      this._maskSelection = { start: start ?? 0, end: end ?? 0 };
    }

    /* blazorSuppress */
    /** Replaces the selected text in the control and re-applies the mask */
    public setRangeText(
      replacement: string,
      start?: number,
      end?: number,
      selectMode?: RangeTextSelectMode
    ): void {
      const current = this._inputSelection;
      const _start = start ?? current.start;
      const _end = end ?? current.end;

      const result = this._parser.replace(
        this._maskedValue || this._parser.emptyMask,
        replacement,
        _start,
        _end
      );
      const next = this._parser.apply(this._parser.parse(result.value));

      this._recordHistory('atomic', next, _start, current);
      this._commitMaskedValue(next);

      this.updateComplete.then(() => {
        switch (selectMode) {
          case 'select':
            this.setSelectionRange(_start, _end);
            break;
          case 'start':
            this.setSelectionRange(_start, _start);
            break;
          case 'end':
            this.setSelectionRange(_end, _end);
            break;
          default:
            this.setSelectionRange(current.start, current.end);
        }
      });
    }

    //#endregion
  }

  return MaskBehaviorElement as unknown as AbstractConstructor<MaskBehaviorElementInterface> &
    T;
}

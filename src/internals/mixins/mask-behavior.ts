import type { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  createMaskHistory,
  type MaskEditKind,
  type MaskHistory,
  type MaskHistoryState,
} from '../../components/mask-input/mask-history.js';
import type { MaskParser } from '../../components/mask-input/mask-parser.js';
import type {
  RangeTextSelectMode,
  SelectionRangeDirection,
} from '../../components/types.js';
import {
  addKeybindings,
  ctrlKey,
  metaKey,
  shiftKey,
} from '../controllers/key-bindings.js';
import type { AbstractConstructor } from './constructor.js';
import type { BaseFormAssociatedElement } from './forms/types.js';

export type MaskSelection = {
  start: number;
  end: number;
};

/**
 * Maps an `inputType` to its undo granularity. An absent value is a native
 * mutation that the editor does not model; the empty string is auto-fill.
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
 * The interface that {@link MaskBehaviorMixin} adds. A `declare class`, so the
 * cast return type still exposes the protected members.
 */
export declare class MaskBehaviorElementInterface {
  //#region Required from host

  protected readonly _input?: HTMLInputElement;
  protected readonly _parser: MaskParser;

  /** Writes the parser state into the public value of the host. */
  protected _syncValueFromMask(): void;

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
   * The prompt symbol for the unfilled parts of the mask pattern.
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
 * Adds parser-driven editing, selection tracking, composition handling and
 * text-range replacement to a form-associated element.
 */
export function MaskBehaviorMixin<
  T extends AbstractConstructor<LitElement & BaseFormAssociatedElement>,
>(superClass: T): AbstractConstructor<MaskBehaviorElementInterface> & T {
  abstract class MaskBehaviorElement extends superClass {
    //#region Required from host

    protected abstract readonly _input?: HTMLInputElement;
    protected abstract readonly _parser: MaskParser;
    public abstract select(): void;
    protected abstract _syncValueFromMask(): void;

    //#endregion

    //#region Internal state

    protected _maskSelection: MaskSelection = { start: 0, end: 0 };
    protected _compositionStart = 0;

    /**
     * The signature uses the source pattern, not the escaped one:
     * `MM/dd/yyyy` and `dd/MM/yyyy` both escape to `00/00/0000`.
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

    protected get _isEmptyMask(): boolean {
      return this._maskedValue === this._parser.emptyMask;
    }

    /**
     * The masked text as the undo history sees it. `igc-mask-input` blanks
     * it on blur, so without this each focus looks like a foreign change.
     */
    protected get _historyText(): string {
      return this._maskedValue || this._parser.emptyMask;
    }

    //#endregion

    //#region Lifecycle

    constructor(...args: any[]) {
      super(...args);

      // Assigning `input.value` clears the native undo stack, so the
      // shortcuts read `_history`. Skip while an IME composition owns it.
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
     * The prompt symbol for the unfilled parts of the mask pattern.
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

      // Reachable only where `beforeinput` is not cancelable; otherwise
      // `_handleBeforeInput` intercepts these first.
      if (inputType === 'historyUndo' || inputType === 'historyRedo') {
        return this._historyStep(inputType === 'historyUndo' ? 'undo' : 'redo');
      }

      // The composition events handle a composing backspace instead.
      if (inputType === 'deleteContentBackward' && isComposing) {
        return;
      }

      const kind = MaskEditKinds.get(inputType ?? '');

      if (kind === undefined) {
        // An unmodeled mutation already changed the DOM value; a re-render
        // lets `live()` restore it. Skip during a composition, which it
        // would abort.
        if (!isComposing) {
          this.requestUpdate();
        }
        return;
      }

      this._setTouchedState();

      switch (inputType) {
        case 'deleteContentForward': {
          const deletePosition =
            this._parser.getNextNonLiteralPosition(end) + 1;

          await this._updateInput('', { start, end: deletePosition }, kind);
          this._input?.setSelectionRange(deletePosition, deletePosition);
          // Record the caret past the deleted character so deletes coalesce.
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
          // An external drop sends no `dragstart`; `_maskSelection` is stale.
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

        // Browser auto-fill sends an empty `inputType`.
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
     * Applies the parser to the text, commits the result, and emits an input
     * event unless the edit is at the trailing mask boundary.
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
     * Writes a complete masked text into the value pipeline. The one leaf
     * override: `igc-mask-input` commits to its form value, the date editors
     * keep a draft until blur.
     */
    protected _commitMaskedValue(value: string): void {
      this._maskedValue = value;
      this._syncValueFromMask();
    }

    /** Emits `igcInput` with the masked value. Override for another payload. */
    protected _emitInputEvent(): void {
      this._emitTouchedEvent('igcInput', { detail: this._maskedValue });
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
      // One undo step for the whole sequence, anchored where it began.
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

      // A click at the end of the input field selects the whole mask.
      if (start === end && start === this._maskedValue.length) {
        this.select();
      }
    }

    /**
     * Intercepts the browser history commands from the Edit menu, the context
     * menu and the software keyboard, which never reach the key bindings. The
     * native undo stack is empty, so letting one pass desyncs the input.
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
     * Records the current masked text before `next` replaces it. Call this
     * *before* you commit; only a real change adds a step.
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

      // Native inputs announce an undo as an `input` event; the date picker
      // hosts read their draft value from it.
      this._emitInputEvent();

      await this.updateComplete;

      // Use the mixin method: the keydown handler already overwrote
      // `_maskSelection` with the pre-restore caret.
      this.setSelectionRange(state.start, state.end);
    }

    //#endregion

    //#region Public methods

    /* blazorSuppress */
    /** Sets the text selection range of the control. */
    public setSelectionRange(
      start?: number,
      end?: number,
      direction: SelectionRangeDirection = 'none'
    ): void {
      this._input?.setSelectionRange(start ?? null, end ?? null, direction);
      this._maskSelection = { start: start ?? 0, end: end ?? 0 };
    }

    /* blazorSuppress */
    /** Replaces the selected text in the control and re-applies the mask. */
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

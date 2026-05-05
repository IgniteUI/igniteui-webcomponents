import type { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { MaskParser } from '../../mask-input/mask-parser.js';
import type {
  RangeTextSelectMode,
  SelectionRangeDirection,
} from '../../types.js';
import type { AbstractConstructor } from './constructor.js';

export type MaskSelection = {
  start: number;
  end: number;
};

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

  protected get _inputSelection(): MaskSelection;
  protected get _isEmptyMask(): boolean;

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
  protected _updateInput(text: string, range: MaskSelection): Promise<void>;
  protected _emitInputEvent(): void;
  protected _setMaskSelection(event: Event): void;
  protected _handleCompositionStart(): void;
  protected _handleCompositionEnd(event: CompositionEvent): void;
  protected _handleClick(): void;

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
 * `_updateInput` implementation and by `setRangeText`.
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
      this._setTouchedState();

      switch (inputType) {
        case 'deleteContentForward':
          this._updateInput('', { start, end: deletePosition });
          await this.updateComplete;
          return this._input?.setSelectionRange(deletePosition, deletePosition);

        case 'deleteContentBackward':
          if (isComposing) return;
          return this._updateInput('', {
            start: this._parser.getPreviousNonLiteralPosition(
              this._inputSelection.start + 1
            ),
            end,
          });

        case 'deleteByCut':
          return this._updateInput('', this._maskSelection);

        case 'insertText':
          return this._updateInput(
            value.substring(start, this._inputSelection.end),
            this._maskSelection
          );

        case 'insertFromPaste':
          return this._updateInput(
            value.substring(start, this._inputSelection.end),
            {
              start,
              end: this._inputSelection.start,
            }
          );

        case 'insertFromDrop':
          return this._updateInput(
            value.substring(
              this._inputSelection.start,
              this._inputSelection.end
            ),
            { ...this._inputSelection }
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
            }
          );
      }
    }

    /**
     * Default mask-update routine. Re-applies the parser, syncs the leaf's
     * value via {@link MaskBehaviorElementInterface._syncValueFromMask} and
     * emits an input event when the edit is not at the trailing mask boundary.
     *
     * Leaves with bespoke commit semantics (e.g. `igc-mask-input`) override this.
     */
    protected async _updateInput(
      text: string,
      range: MaskSelection
    ): Promise<void> {
      const { value, end } = this._parser.replace(
        this._maskedValue,
        text,
        range.start,
        range.end
      );

      this._maskedValue = value;
      this._syncValueFromMask();
      this.requestUpdate();

      if (range.start !== this._parser.mask.length) {
        this._emitInputEvent();
      }

      await this.updateComplete;
      this._input?.setSelectionRange(end, end);
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
      this._updateInput(data, {
        start: this._compositionStart,
        end: this._inputSelection.end,
      });
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
      this._maskedValue = this._parser.apply(this._parser.parse(result.value));
      this._syncValueFromMask();

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
